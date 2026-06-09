// SPDX-License-Identifier: MIT

import { $, on, setText as setElementText } from "../core/dom.js";
import { ensureDialog } from "../core/dialog.js";
import { getLang, markI18nReady, setLang, t, translateStaticText } from "../locales/i18n.js";

const state = {
  roots: [],
  keywords: [],
  excludes: [],
  candidates: [],
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
  const els = getIndexElements();
  if (!els.workspace) return undefined;

  ensureDialog();
  translateStaticText();
  bindInputEvents(els);
  bindAddList(els.rootInput, els.addRootButton, state.roots, els);
  bindAddList(els.keywordInput, els.addKeywordButton, state.keywords, els);
  bindAddList(els.excludeInput, els.addExcludeButton, state.excludes, els);
  bindLanguageSwitch(els);
  bindIndexEvents(els);

  loadConditionsConfig(els).finally(() => {
    updateView(els);
    markI18nReady();
  });

  return { els };
}

function getIndexElements() {
  return {
    workspace: $("#investigationWorkspace"),
    titleInput: $("#titleInput"),
    rootInput: $("#rootInput"),
    addRootButton: $("#addRootButton"),
    rootList: $("#rootList"),
    keywordInput: $("#keywordInput"),
    addKeywordButton: $("#addKeywordButton"),
    keywordList: $("#keywordList"),
    excludeInput: $("#excludeInput"),
    addExcludeButton: $("#addExcludeButton"),
    excludeList: $("#excludeList"),
    extensionsInput: $("#extensionsInput"),
    caseSensitiveInput: $("#caseSensitiveInput"),
    contextLinesInput: $("#contextLinesInput"),
    outputDirInput: $("#outputDirInput"),
    outputPrefixInput: $("#outputPrefixInput"),
    saveConditionsButton: $("#saveConditionsButton"),
    copyCommandButton: $("#copyCommandButton"),
    runInvestigationButton: $("#runInvestigationButton"),
    runTopButton: $("#runTopButton"),
    runStatus: $("#runStatus"),
    commandPreview: $("#commandPreview"),
    rootCount: $("#rootCount"),
    keywordCount: $("#keywordCount"),
    changeTextInput: $("#changeTextInput"),
    generateCandidatesButton: $("#generateCandidatesButton"),
    candidateList: $("#candidateList"),
    aiStatus: $("#aiStatus"),
    resultCard: $("#resultCard"),
    textFilesScanned: $("#textFilesScanned"),
    excelFilesScanned: $("#excelFilesScanned"),
    totalResults: $("#totalResults"),
    errorResults: $("#errorResults"),
    reportPath: $("#reportPath"),
    languageSelect: $("#languageSelect"),
  };
}

async function loadConditionsConfig(els) {
  const response = await fetch("/api/workbench/investigation-conditions");
  if (!response.ok) return;

  const data = await response.json();
  if (!data.ok || !data.conditions) return;

  applyConditionsConfig(els, data.conditions);
}

function applyConditionsConfig(els, conditions) {
  state.roots = Array.isArray(conditions.roots) ? conditions.roots : [];
  state.keywords = Array.isArray(conditions.keywords) ? conditions.keywords : [];
  state.excludes = Array.isArray(conditions.excludes) ? conditions.excludes : [];

  if (els.titleInput) els.titleInput.value = conditions.title || "";
  if (els.extensionsInput) els.extensionsInput.value = conditions.includeExtensions || "";
  if (els.caseSensitiveInput) els.caseSensitiveInput.checked = Boolean(conditions.caseSensitive);
  if (els.contextLinesInput) els.contextLinesInput.value = String(conditions.contextLines ?? 1);
  if (els.outputDirInput) els.outputDirInput.value = conditions.outputDir || "";
  if (els.outputPrefixInput) els.outputPrefixInput.value = conditions.outputPrefix || "";
}

function bindInputEvents(els) {
  INPUT_IDS.map((id) => els[id]).forEach((input) => {
    on(input, "input", () => updateView(els));
    on(input, "change", () => updateView(els));
  });
}

function bindIndexEvents(els) {
  on(els.saveConditionsButton, "click", () => saveConditionsConfig(els));
  on(els.copyCommandButton, "click", () => copyCommand(els));
  on(els.runInvestigationButton, "click", () => runInvestigation(els));
  on(els.runTopButton, "click", () => runInvestigation(els));
  on(els.generateCandidatesButton, "click", () => generateKeywordCandidates(els));
}

function bindAddList(input, button, target, els) {
  if (!input || !button) return;

  on(button, "click", () => addItemsFromInput(input, target, els));
  on(input, "keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addItemsFromInput(input, target, els);
  });
}

function addItemsFromInput(input, target, els) {
  const items = splitItems(input.value);
  items.forEach((item) => addUnique(target, item));
  input.value = "";
  updateView(els);
}

function updateView(els) {
  renderList(els.rootList, state.roots, "root", els);
  renderList(els.keywordList, state.keywords, "keyword", els);
  renderList(els.excludeList, state.excludes, "exclude", els);
  updateCommandPreview(els);
}

function renderList(list, items, type, els) {
  if (!list) return;

  list.innerHTML = items
    .map(
      (item, index) => `
        <div class="list-item" title="${escapeHtml(item)}">
          <span>${escapeHtml(displayValue(item, type))}</span>
          <button type="button" data-type="${type}" data-index="${index}" aria-label="Remove">×</button>
        </div>
      `,
    )
    .join("");

  list.querySelectorAll("button").forEach((button) => {
    on(button, "click", () => {
      const target = getTargetList(button.dataset.type);
      target.splice(Number(button.dataset.index), 1);
      updateView(els);
    });
  });
}

function renderCandidates(els, candidates) {
  const list = els.candidateList;
  if (!list) return;

  state.candidates = candidates;
  list.innerHTML = candidates
    .map(
      (candidate) => `
        <div class="candidate-item">
          <span>${escapeHtml(candidate)}</span>
          <button type="button" data-candidate="${escapeHtml(candidate)}">${escapeHtml(t("page.ai.add"))}</button>
        </div>
      `,
    )
    .join("");

  list.querySelectorAll("button").forEach((button) => {
    on(button, "click", () => {
      addUnique(state.keywords, button.dataset.candidate || "");
      updateView(els);
    });
  });
}

function updateCommandPreview(els) {
  setElementText(els.commandPreview, buildCommand(els));

  setElementText(els.rootCount, state.roots.length);
  setElementText(els.keywordCount, state.keywords.length);
}

function buildCommand(els) {
  const title = getValue(els.titleInput);
  const outputDir = getValue(els.outputDirInput);
  const outputPrefix = getValue(els.outputPrefixInput);
  const contextLines = getValue(els.contextLinesInput) || "1";
  const extensions = getExtensions(els);
  const caseSensitive = els.caseSensitiveInput?.checked;

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

  lines.push(`  --out-dir ${quotePowerShell(outputDir)} ` + "`");
  lines.push(`  --prefix ${quotePowerShell(outputPrefix)}`);
  return lines.join("\n");
}

function getValue(input) {
  return input?.value.trim() || "";
}

function getExtensions(els) {
  return splitItems(getValue(els.extensionsInput)).map((extension) =>
    extension.startsWith(".") ? extension : `.${extension}`,
  );
}

function buildPayload(els) {
  return {
    title: getValue(els.titleInput),
    roots: state.roots,
    keywords: state.keywords,
    excludePatterns: state.excludes,
    includeExtensions: getExtensions(els),
    outputDir: getValue(els.outputDirInput),
    outputPrefix: getValue(els.outputPrefixInput),
    fileKinds: ["text", "excel"],
    caseSensitive: Boolean(els.caseSensitiveInput?.checked),
    contextLines: Number(getValue(els.contextLinesInput) || 0),
  };
}

function buildConditionsConfig(els) {
  return {
    title: getValue(els.titleInput),
    roots: state.roots,
    keywords: state.keywords,
    excludes: state.excludes,
    includeExtensions: getValue(els.extensionsInput),
    caseSensitive: Boolean(els.caseSensitiveInput?.checked),
    contextLines: Number(getValue(els.contextLinesInput) || 0),
    outputDir: getValue(els.outputDirInput),
    outputPrefix: getValue(els.outputPrefixInput),
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

function quotePowerShell(value) {
  return `"${String(value).replaceAll('"', '`"')}"`;
}

async function copyCommand(els) {
  try {
    await navigator.clipboard.writeText(buildCommand(els));
    setStatus(t("page.status.copied"), els.runStatus);
  } catch {
    setStatus(t("page.status.copyFailed"), els.runStatus);
  }
}

async function saveConditionsConfig(els) {
  const button = els.saveConditionsButton;

  if (button) {
    button.disabled = true;
    button.textContent = t("page.actions.saving");
  }
  setStatus(t("page.status.savingConditions"), els.runStatus);

  try {
    const response = await fetch("/api/workbench/investigation-conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildConditionsConfig(els)),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.detail || data.error || t("page.status.saveConditionsFailed"));
    }

    applyConditionsConfig(els, data.conditions);
    updateView(els);
    setStatus(t("page.status.conditionsSaved"), els.runStatus);
  } catch (error) {
    setStatus(error.message || t("page.status.saveConditionsFailed"), els.runStatus);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = t("page.actions.saveConditions");
    }
  }
}

async function runInvestigation(els) {
  setRunning(true, els.runInvestigationButton, els.runTopButton);
  setStatus(t("page.status.running"), els.runStatus);

  try {
    const response = await fetch("/api/investigations/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(els)),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.detail || data.error || t("page.status.runFailed"));
    }

    renderResult(els, data.result);
    setStatus(t("page.status.success"), els.runStatus);
  } catch (error) {
    setStatus(error.message || t("page.status.runFailed"), els.runStatus);
  } finally {
    setRunning(false, els.runInvestigationButton, els.runTopButton);
  }
}

async function generateKeywordCandidates(els) {
  const changeText = getValue(els.changeTextInput);

  if (!changeText) {
    setStatus(t("page.ai.requireText"), els.aiStatus);
    return;
  }

  if (els.generateCandidatesButton) {
    els.generateCandidatesButton.disabled = true;
    els.generateCandidatesButton.textContent = t("page.ai.generating");
  }
  setStatus(t("page.ai.generating"), els.aiStatus);

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
      throw new Error(data.detail || data.error || t("dialog.title.error"));
    }
    renderCandidates(els, data.candidates || []);
    setStatus(t("page.ai.generated", (data.candidates || []).length), els.aiStatus);
  } catch (error) {
    setStatus(error.message || t("dialog.title.error"), els.aiStatus);
  } finally {
    if (els.generateCandidatesButton) {
      els.generateCandidatesButton.disabled = false;
      els.generateCandidatesButton.textContent = t("page.ai.generate");
    }
  }
}

function renderResult(els, result) {
  if (els.resultCard) els.resultCard.hidden = false;

  setElementText(els.textFilesScanned, result.text_files_scanned);
  setElementText(els.excelFilesScanned, result.excel_files_scanned);
  setElementText(els.totalResults, result.total_results);
  setElementText(els.errorResults, result.error_results);
  setElementText(els.reportPath, result.report_path);
}

function setStatus(message, element) {
  setElementText(element, message);
}

function setRunning(isRunning, ...buttons) {
  buttons.forEach((button) => {
    if (!button) return;
    button.disabled = isRunning;
    button.textContent = isRunning ? t("page.actions.running") : t("page.actions.run");
  });
}

function bindLanguageSwitch(els) {
  const select = els.languageSelect;
  if (!select) return;

  select.value = getLang();
  on(select, "change", () => {
    setLang(select.value);
    translateStaticText();
    updateView(els);
    renderCandidates(els, state.candidates);
    setStatus(t("page.status.ready"), els.runStatus);
    setStatus(t("page.ai.ready"), els.aiStatus);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
