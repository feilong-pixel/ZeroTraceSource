// SPDX-License-Identifier: MIT

import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = path.resolve("samples/impact_investigation");
const outputDir = path.join(rootDir, "excel");

await fs.mkdir(outputDir, { recursive: true });

function styleHeader(sheet, rangeAddress) {
  const range = sheet.getRange(rangeAddress);
  range.format = {
    fill: "#1F2937",
    font: { bold: true, color: "#FFFFFF" },
  };
}

function styleTable(sheet, rangeAddress) {
  const range = sheet.getRange(rangeAddress);
  range.format.borders = { preset: "all", style: "thin", color: "#D5DAE3" };
  range.format.wrapText = true;
}

async function saveWorkbook(workbook, fileName) {
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(path.join(outputDir, fileName));
}

async function buildScreenSpec() {
  const workbook = Workbook.create();
  const overview = workbook.worksheets.add("画面一覧");
  overview.getRange("A1:E1").values = [["画面ID", "画面名", "項目ID", "表示名", "備考"]];
  overview.getRange("A2:E7").values = [
    ["SCR-001", "安全設定", "safetyStrategy", "安全方針", "Safety Strategy label is shown on the main panel."],
    ["SCR-001", "安全設定", "archiveFlag", "アーカイブ状態", "archiveFlag が有効な場合は検索結果から除外する。"],
    ["SCR-002", "承認一覧", "approveStatus", "承認状態", "承認状態によってボタン表示を切り替える。"],
    ["SCR-003", "利用者詳細", "userStatus", "利用者状態", ""],
    ["SCR-004", "監査ログ", "safety_strategy", "安全策略", "Chinese label sample for safety strategy."],
    ["SCR-005", "検索", "freeText", "自由入力", "No target keyword here."],
  ];
  styleHeader(overview, "A1:E1");
  styleTable(overview, "A1:E7");
  overview.getRange("A:E").format.autofitColumns();

  const detail = workbook.worksheets.add("安全設定詳細");
  detail.getRange("A1:F1").values = [["No", "分類", "項目", "値", "確認観点", "影響"]];
  detail.getRange("A2:F8").values = [
    [1, "表示", "safetyStrategy", "Safety Strategy", "英語ラベル変更時の表示確認", "UI"],
    [2, "表示", "安全方針", "安全方針", "日本語ラベル変更時の表示確認", "UI"],
    [3, "DB", "safety_strategy", "safety_strategy", "登録値との対応確認", "DB"],
    [4, "制御", "approveStatus", "承認状態", "承認状態ごとの活性制御", "Logic"],
    [5, "制御", "archiveFlag", "archiveFlag", "非表示条件の確認", "Logic"],
    [6, "計算", "対象件数", null, "Formula sample", "Report"],
    [7, "メモ", "", "", "Blank cell row for scanner check", ""],
  ];
  detail.getRange("D7").formulas = [["=COUNTA(C2:C6)"]];
  styleHeader(detail, "A1:F1");
  styleTable(detail, "A1:F8");
  detail.getRange("A:F").format.autofitColumns();

  const hidden = workbook.worksheets.add("HiddenMemo");
  hidden.getRange("A1:B3").values = [
    ["Key", "Value"],
    ["safetyStrategy", "Hidden sheet should also be searched."],
    ["安全方針", "Hidden Japanese memo."],
  ];
  hidden.visibility = "hidden";

  await saveWorkbook(workbook, "screen_spec.xlsx");
}

async function buildDbDefinition() {
  const workbook = Workbook.create();
  const tables = workbook.worksheets.add("テーブル定義");
  tables.getRange("A1:G1").values = [["テーブル名", "物理名", "論理名", "型", "NULL", "初期値", "備考"]];
  tables.getRange("A2:G8").values = [
    ["sample_policy", "id", "ID", "INTEGER", "NO", "", "Primary key"],
    ["sample_policy", "safety_strategy", "安全方針", "VARCHAR(32)", "NO", "", "safetyStrategy と画面表示に対応"],
    ["sample_policy", "archive_flag", "アーカイブフラグ", "INTEGER", "YES", 0, "archiveFlag の永続化"],
    ["sample_policy", "approve_status", "承認状態", "VARCHAR(32)", "YES", "", "approveStatus と対応"],
    ["sample_policy", "updated_at", "更新日時", "TIMESTAMP", "YES", "", ""],
    ["sample_audit", "event_name", "イベント名", "VARCHAR(128)", "NO", "", ""],
    ["sample_audit", "payload", "ペイロード", "TEXT", "YES", "", "安全策略 text sample"],
  ];
  styleHeader(tables, "A1:G1");
  styleTable(tables, "A1:G8");
  tables.getRange("A:G").format.autofitColumns();

  const indexes = workbook.worksheets.add("インデックス");
  indexes.getRange("A1:D1").values = [["IndexName", "TableName", "ColumnName", "Notes"]];
  indexes.getRange("A2:D4").values = [
    ["idx_sample_policy_safety_strategy", "sample_policy", "safety_strategy", "安全方針検索用"],
    ["idx_sample_policy_approve_status", "sample_policy", "approve_status", "承認状態検索用"],
    ["idx_sample_policy_archive_flag", "sample_policy", "archive_flag", "Archive filter sample"],
  ];
  styleHeader(indexes, "A1:D1");
  styleTable(indexes, "A1:D4");
  indexes.getRange("A:D").format.autofitColumns();

  await saveWorkbook(workbook, "db_definition.xlsx");
}

async function buildMessageList() {
  const workbook = Workbook.create();
  const messages = workbook.worksheets.add("メッセージ一覧");
  messages.getRange("A1:E1").values = [["MessageId", "Language", "Key", "Message", "Memo"]];
  messages.getRange("A2:E8").values = [
    ["MSG-001", "ja", "main.safetyStrategy", "安全方針", "Screen label"],
    ["MSG-002", "en", "main.safetyStrategy", "Safety Strategy", "Screen label"],
    ["MSG-003", "zh", "main.safetyStrategy", "安全策略", "Screen label"],
    ["MSG-004", "ja", "main.approveStatus", "承認状態", "Approval status label"],
    ["MSG-005", "ja", "main.archiveFlag", "アーカイブ状態", "Archive flag label"],
    ["MSG-006", "en", "error.safetyStrategy.invalid", "Safety Strategy is invalid.", ""],
    ["MSG-007", "ja", "error.approveStatus.invalid", "承認状態が不正です。", ""],
  ];
  styleHeader(messages, "A1:E1");
  styleTable(messages, "A1:E8");
  messages.getRange("A:E").format.autofitColumns();

  await saveWorkbook(workbook, "message_list.xlsx");
}

async function buildInterfaceSpec() {
  const workbook = Workbook.create();
  const api = workbook.worksheets.add("API仕様");
  api.getRange("A1:G1").values = [["API", "Method", "Field", "Type", "Required", "Description", "Related"]];
  api.getRange("A2:G7").values = [
    ["/api/safety-strategy", "GET", "safetyStrategy", "string", "YES", "Return current safety strategy.", "safety_strategy"],
    ["/api/safety-strategy", "POST", "safetyStrategy", "string", "YES", "Update 安全方針.", "安全方針"],
    ["/api/policy/archive", "POST", "archiveFlag", "boolean", "NO", "Update archive flag.", "archive_flag"],
    ["/api/policy/approval", "POST", "approveStatus", "string", "YES", "Update 承認状態.", "approve_status"],
    ["/api/policy/approval", "GET", "approve_status", "string", "NO", "Database field returned for approval.", "承認状態"],
    ["/api/policy/search", "GET", "keyword", "string", "NO", "Generic search endpoint.", ""],
  ];
  styleHeader(api, "A1:G1");
  styleTable(api, "A1:G7");
  api.getRange("A:G").format.autofitColumns();

  const sample = workbook.worksheets.add("サンプルJSON");
  sample.getRange("A1:B1").values = [["Name", "JSON"]];
  sample.getRange("A2:B5").values = [
    ["Safety Request", '{"safetyStrategy":"enabled","approveStatus":"approved"}'],
    ["Archive Request", '{"archiveFlag":true,"archive_flag":1}'],
    ["DB Response", '{"safety_strategy":"enabled","approve_status":"approved"}'],
    ["Chinese Label", '{"label":"安全策略"}'],
  ];
  styleHeader(sample, "A1:B1");
  styleTable(sample, "A1:B5");
  sample.getRange("A:B").format.autofitColumns();

  await saveWorkbook(workbook, "interface_spec.xlsx");
}

await buildScreenSpec();
await buildDbDefinition();
await buildMessageList();
await buildInterfaceSpec();
