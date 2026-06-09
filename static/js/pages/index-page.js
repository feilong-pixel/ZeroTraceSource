// SPDX-License-Identifier: MIT

import { $, $$, on } from "../core/dom.js";

const DEMO_SOURCES = [
  {
    id: "design",
    type: "MD",
    name: "Project Principles",
    path: "docs/project-principles.md",
    meta: "项目边界 · 本地优先",
  },
  {
    id: "readme",
    type: "MD",
    name: "ZeroTraceSource README",
    path: "README.md",
    meta: "项目定位 · 66 行",
  },
  {
    id: "notes",
    type: "TXT",
    name: "资料库问答边界记录",
    path: "notebooks/local-search/boundary-notes.txt",
    meta: "计划资料 · 24 行",
  },
  {
    id: "api",
    type: "SQL",
    name: "source_index 草案",
    path: "drafts/source_index_schema.sql",
    meta: "后续接入 · 12 行",
  },
];

const KEYWORDS = [
  "归档",
  "archive",
  "storage_status",
  "ArchiveService",
  "资料词典",
  "本地索引",
  "出处",
];

const EVIDENCE = [
  {
    id: "ev-1",
    title: "AI 负责理解问题，索引系统负责提供事实",
    path: "docs/project-principles.md:47",
    snippet: "Search finds evidence. Report organizes evidence. User decides the impact scope.",
    highlighted: true,
  },
  {
    id: "ev-2",
    title: "用户用自然语言提问，系统找到真实依据",
    path: "docs/architecture.md:146",
    snippet: "Text search should cover source code, SQL, configuration files, and plain documents.",
  },
  {
    id: "ev-3",
    title: "第一版用 SQLite 和关键词检索跑通体验",
    path: "docs/architecture.md:269",
    snippet: "The first implementation should prefer Python scanning for the main text search path so text and Excel results share one data model.",
  },
  {
    id: "ev-4",
    title: "项目目标不是替代判断",
    path: "README.md:30",
    snippet: "Its job is to help users find sources, not to judge them.",
  },
];

export function initIndexPage() {
  const workspace = $("#sourceWorkspace");
  if (!workspace) return;

  renderSources(DEMO_SOURCES);
  renderKeywords(KEYWORDS);
  renderEvidence(EVIDENCE);
  renderInitialChat();

  on($("#askForm"), "submit", (event) => {
    event.preventDefault();
    renderAskedQuestion($("#questionInput")?.value || "这份资料主要讲什么？");
  });

  on($("#sourceSearch"), "input", (event) => {
    const keyword = event.target.value.trim().toLowerCase();
    renderSources(
      DEMO_SOURCES.filter((source) =>
        [source.name, source.path, source.meta].some((value) => value.toLowerCase().includes(keyword)),
      ),
    );
  });
}

function renderSources(sources) {
  const list = $("#sourceList");
  if (!list) return;

  list.innerHTML = sources
    .map(
      (source, index) => `
        <article class="source-item ${index === 0 ? "is-active" : ""}">
          <div class="source-icon">${source.type}</div>
          <div>
            <div class="source-name">${source.name}</div>
            <div class="source-path">${source.path}</div>
            <div class="source-meta">${source.meta}</div>
          </div>
          <div class="source-check">✓</div>
        </article>
      `,
    )
    .join("");

  const count = $("#selectedSourceCount");
  if (count) count.textContent = `${sources.length} 个资料源`;
}

function renderKeywords(keywords) {
  const list = $("#keywordList");
  if (!list) return;

  list.innerHTML = keywords.map((keyword) => `<span class="keyword">${keyword}</span>`).join("");
}

function renderEvidence(items) {
  const list = $("#evidenceList");
  if (!list) return;

  list.innerHTML = items
    .map(
      (item) => `
        <article class="citation-card ${item.highlighted ? "is-highlighted" : ""}" data-evidence-id="${item.id}">
          <h2 class="citation-title">${item.title}</h2>
          <div class="citation-path">${item.path}</div>
          <div class="citation-snippet">${item.snippet}</div>
        </article>
      `,
    )
    .join("");
}

function renderInitialChat() {
  const chat = $("#chatScroll");
  if (!chat) return;

  chat.innerHTML = `
    <article class="message assistant">
      <div class="bubble">
        <p>这个原型先验证最小闭环：问题会被转换成搜索计划，右侧展示真实出处和原文片段。</p>
        <p class="answer-note">当前是静态演示数据。下一步可以把 Markdown / TXT 导入 SQLite，再把这些卡片换成真实检索结果。</p>
      </div>
      <div class="answer-actions">
        <button class="answer-action" type="button">保存为笔记</button>
        <button class="answer-action" type="button">复制出处</button>
      </div>
    </article>
  `;
}

function renderAskedQuestion(question) {
  const chat = $("#chatScroll");
  if (!chat) return;

  chat.insertAdjacentHTML(
    "beforeend",
    `
      <article class="message user">
        <div class="bubble">${escapeHtml(question)}</div>
      </article>
      <article class="message assistant">
        <div class="bubble">
          <p>我会先把问题拆成关键词，再从本地索引中找出处。当前命中的核心方向是：本地索引、资料词典、引用片段、搜索计划。</p>
          <p>右侧列出了 4 条示例出处。第一版后端接入以后，这里只整理真实搜索结果，不输出没有来源支撑的结论。</p>
        </div>
        <div class="answer-actions">
          <button class="answer-action" type="button">保存为笔记</button>
          <button class="answer-action" type="button">复制出处</button>
        </div>
      </article>
    `,
  );

  $$(".citation-card").forEach((card, index) => {
    card.classList.toggle("is-highlighted", index === 0);
  });

  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
