// SPDX-License-Identifier: MIT

import { $ } from "../core/dom.js";

const state = {
  roots: [
    "samples/impact_investigation/excel",
    "samples/impact_investigation/code",
  ],
  keywords: ["safetyStrategy", "安全方針", "archive_flag", "approve_status"],
  excludes: [],
  baseDir: "",
};

const INPUT_IDS = [
  "titleInput",
  "caseSensitiveInput",
  "contextLinesInput",
  "outputDirInput",
  "outputPrefixInput",
  "extensionsInput",
];

export function initIndexPage() {
  const workspace = $("#investigationWorkspace");
  if (!workspace) return;

  INPUT_IDS.forEach((id) => {
    const input = $(`#${id}`);
    if (!input) return;
    input.addEventListener("input", updateView);
    input.addEventListener("change", updateView);
  });

  bindAddList("rootInput", "addRootButton", state.roots);
  bindAddList("keywordInput", "addKeywordButton", state.keywords);
  bindAddList("excludeInput", "addExcludeButton", state.excludes);

  $("#copyCommandButton")?.addEventListener("click", copyCommand);
  $("#runInvestigationButton")?.addEventListener("click", runInvestigation);
  $("#runTopButton")?.addEventListener("click", runInvestigation);
  $("#generateCandidatesButton")?.addEventListener("click", generateKeywordCandidates);

  loadAppInfo().finally(updateView);
}

async function loadAppInfo() {
  const response = await fetch("/api/app-info");
  if (!response.ok) return;

  const data = await response.json();
  state.baseDir = data.base_dir || "";
  state.roots = state.roots.map((root) => toAbsolutePath(root));
  const outputDir = $("#outputDirInput");
  if (outputDir) outputDir.value = toAbsolutePath(outputDir.value);
}

function bindAddList(inputId, buttonId, target) {
  const input = $(`#${inputId}`);
  const button = $(`#${buttonId}`);
  if (!input || !button) return;

  button.addEventListener("click", () => addItemsFromInput(input, target));
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addItemsFromInput(input, target);
  });
}

function addItemsFromInput(input, target) {
  const items = splitItems(input.value).map((item) => (target === state.roots ? toAbsolutePath(item) : item));
  items.forEach((item) => addUnique(target, item));
  input.value = "";
  updateView();
}

function updateView() {
  renderList("rootList", state.roots, "root");
  renderList("keywordList", state.keywords, "keyword");
  renderList("excludeList", state.excludes, "exclude");
  updateCommandPreview();
}

function renderList(listId, items, type) {
  const list = $(`#${listId}`);
  if (!list) return;

  list.innerHTML = items
    .map(
      (item, index) => `
        <div class="list-item" title="${escapeHtml(item)}">
          <span>${escapeHtml(displayValue(item, type))}</span>
          <button type="button" data-type="${type}" data-index="${index}" aria-label="删除">×</button>
        </div>
      `,
    )
    .join("");

  list.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = getTargetList(button.dataset.type);
      target.splice(Number(button.dataset.index), 1);
      updateView();
    });
  });
}

function renderCandidates(candidates) {
  const list = $("#candidateList");
  if (!list) return;

  list.innerHTML = candidates
    .map(
      (candidate) => `
        <div class="candidate-item">
          <span>${escapeHtml(candidate)}</span>
          <button type="button" data-candidate="${escapeHtml(candidate)}">追加</button>
        </div>
      `,
    )
    .join("");

  list.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      addUnique(state.keywords, button.dataset.candidate || "");
      updateView();
    });
  });
}

function updateCommandPreview() {
  const command = buildCommand();
  const preview = $("#commandPreview");
  if (preview) preview.textContent = command;

  setText("rootCount", state.roots.length);
  setText("keywordCount", state.keywords.length);
}

function buildCommand() {
  const title = getValue("titleInput");
  const outputDir = getValue("outputDirInput");
  const outputPrefix = getValue("outputPrefixInput");
  const contextLines = getValue("contextLinesInput") || "1";
  const extensions = getExtensions();
  const caseSensitive = $("#caseSensitiveInput")?.checked;

  const lines = [
    "python -m engine.runner `",
    `  --title ${quotePowerShell(title)} ` + "`",
    ...state.roots.map((root) => `  --root ${quotePowerShell(root)} ` + "`"),
    `  --keywords ${quotePowerShell(state.keywords.join(","))} ` + "`",
    ...state.excludes.map((pattern) => `  --exclude ${quotePowerShell(pattern)} ` + "`"),
    ...extensions.map((extension) => `  --include-extension ${quotePowerShell(extension)} ` + "`"),
    `  --context-lines ${quotePowerShell(contextLines)} ` + "`",
  ];

  if (caseSensitive) {
    lines.push("  --case-sensitive `");
  }

  lines.push(`  --out-dir ${quotePowerShell(toAbsolutePath(outputDir))} ` + "`");
  lines.push(`  --prefix ${quotePowerShell(outputPrefix)}`);
  return lines.join("\n");
}

function getValue(id) {
  return $(`#${id}`)?.value.trim() || "";
}

function getExtensions() {
  return splitItems(getValue("extensionsInput")).map((extension) =>
    extension.startsWith(".") ? extension : `.${extension}`,
  );
}

function buildPayload() {
  return {
    title: getValue("titleInput"),
    roots: state.roots,
    keywords: state.keywords,
    excludePatterns: state.excludes,
    includeExtensions: getExtensions(),
    outputDir: toAbsolutePath(getValue("outputDirInput")),
    outputPrefix: getValue("outputPrefixInput"),
    fileKinds: ["text", "excel"],
    caseSensitive: Boolean($("#caseSensitiveInput")?.checked),
    contextLines: Number(getValue("contextLinesInput") || 0),
  };
}

function splitItems(value) {
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function addUnique(target, value) {
  if (!value || target.includes(value)) return;
  target.push(value);
}

function getTargetList(type) {
  if (type === "root") return state.roots;
  if (type === "keyword") return state.keywords;
  return state.excludes;
}

function displayValue(value, type) {
  return value;
}

function toAbsolutePath(value) {
  if (!value) return "";
  if (/^[A-Za-z]:[\\/]/.test(value) || value.startsWith("\\\\")) return value;
  if (!state.baseDir) return value;
  return `${state.baseDir}\\${value}`.replaceAll("/", "\\");
}

function quotePowerShell(value) {
  return `"${String(value).replaceAll('"', '`"')}"`;
}

async function copyCommand() {
  const command = buildCommand();
  const status = $("#runStatus");

  try {
    await navigator.clipboard.writeText(command);
    if (status) status.textContent = "命令已复制。";
  } catch {
    if (status) status.textContent = "复制失败，请手动选择命令文本。";
  }
}

async function runInvestigation() {
  const status = $("#runStatus");
  const runButton = $("#runInvestigationButton");
  const topButton = $("#runTopButton");

  setRunning(true, runButton, topButton);
  setStatus("搜索中，请稍候。", status);

  try {
    const response = await fetch("/api/investigations/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.detail || data.error || "搜索失败。");
    }

    renderResult(data.result);
    setStatus("搜索完成，报告已生成。", status);
  } catch (error) {
    setStatus(error.message || "搜索失败。请确认本地 Web 服务已经启动。", status);
  } finally {
    setRunning(false, runButton, topButton);
  }
}

async function generateKeywordCandidates() {
  const status = $("#aiStatus");
  const button = $("#generateCandidatesButton");
  const changeText = getValue("changeTextInput");

  if (!changeText) {
    setStatus("请输入客户变更内容。", status);
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "生成中";
  }
  setStatus("正在生成候选关键词。", status);

  try {
    const response = await fetch("/api/ai/keyword-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changeText,
        existingKeywords: state.keywords,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.detail || data.error || "生成失败。");
    }
    renderCandidates(data.candidates || []);
    setStatus(`生成了 ${(data.candidates || []).length} 个候选关键词。`, status);
  } catch (error) {
    setStatus(error.message || "生成失败。", status);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "生成关键词候选";
    }
  }
}

function renderResult(result) {
  const card = $("#resultCard");
  if (card) card.hidden = false;

  setText("textFilesScanned", result.text_files_scanned);
  setText("excelFilesScanned", result.excel_files_scanned);
  setText("totalResults", result.total_results);
  setText("errorResults", result.error_results);
  setText("reportPath", result.report_path);
}

function setText(id, value) {
  const element = $(`#${id}`);
  if (element) element.textContent = String(value ?? "");
}

function setStatus(message, element) {
  if (element) element.textContent = message;
}

function setRunning(isRunning, ...buttons) {
  buttons.forEach((button) => {
    if (!button) return;
    button.disabled = isRunning;
    button.textContent = isRunning ? "搜索中" : "开始搜索";
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
