# ZeroTraceSource Engine First Design

Date: 2026-06-09

## Position

ZeroTraceSource should start as a local change impact investigation tool.

The first practical target is not a NotebookLM-style knowledge product. The first target is closer to the user's daily work:

```text
Customer gives a rough change request
User prepares investigation keywords
System searches code and Excel documents
System exports structured investigation results to Excel
User reviews the evidence and decides the change scope
```

The system should help collect evidence. It should not decide the final impact scope.

## First Scope

The first version should support two search paths:

- Text and code search
- Excel cell search

The result should be exported to an Excel investigation report.

Code search can stay simple. If a line matches a keyword, output the file path, line number, column number, encoding, and matched line.

Excel search needs special handling because normal text grep cannot preserve workbook context. For Excel files, the system should output the file path, workbook name, sheet name, cell address, and cell value.

## Not In First Scope

Do not implement these in the first engine version:

- NotebookLM-style large button set
- AI chat
- Vector database
- PDF or Word parsing
- Code symbol graph
- Automatic final impact judgment
- Browser automation
- Complex project dictionary

These can be added later after the search and report pipeline is stable.

## Recommended Directory Structure

```text
ZeroTraceSource/
  engine/
    __init__.py
    runner.py
    models.py
    config.py
    search/
      __init__.py
      text_searcher.py
      excel_searcher.py
      file_walker.py
      encoding.py
    report/
      __init__.py
      excel_writer.py
  static/
    index.html
    css/
      style.css
    js/
      app.js
      pages/
        index-page.js
      core/
        dialog.js
        dom.js
      locales/
        en.js
        ja.js
        zh.js
  docs/
    architecture.md
    engine-first-design.md
    page-first-design.md
    project-principles.md
```

## Engine Ownership

The engine owns investigation logic.

It should be usable without the web page, from a command line or future desktop wrapper.

The engine should own:

- Search request model
- Keyword normalization
- File walking
- Text file matching
- Excel cell matching
- Result model
- Excel report output
- Optional use of bundled command line tools

The page should not implement search logic. It should only collect user input, call the engine through an API or command bridge, and display results.

## Page Ownership

The page owns interaction and display.

Page logic should live under:

```text
static/js/pages/index-page.js
```

Shared UI helpers live under:

```text
static/js/core/
```

Locale modules live under:

```text
static/js/locales/
```

This keeps the browser code from becoming the real search system.

## First Page Flow

The first real page should be an investigation workspace:

```text
Investigation title
Keyword list
Search roots
File type options
Start search
Preview results
Export Excel report
```

The first practical page should be optimized for investigation work:

- Left: investigation settings and keyword list
- Center: result table
- Right: selected result detail and context

## Search Request Model

The engine should accept a request like this:

```text
title: 安全方針変更影響調査
roots:
  - D:\project\source
  - D:\project\docs
keywords:
  - safetyStrategy
  - 安全方針
  - 安全策略
file_kinds:
  - text
  - excel
case_sensitive: false
include_context_lines: 1
output_path: D:\project\serach_rusult_20260609.xlsx
```

Later this can become JSON.

## Unified Result Model

Every searcher should return the same result shape.

Suggested fields:

```text
No
InvestigationTitle
Keyword
Category
FilePath
FileName
Extension
SheetName
CellAddress
LineNumber
ColumnNumber
Encoding
MatchedText
BeforeText
AfterText
ConfirmStatus
Notes
```

Text results fill line and column fields.

Excel results fill sheet and cell fields.

Unused fields stay empty.

## Text Search Behavior

Text search should target source code, SQL, configuration, and plain documents.

Initial extension list:

```text
.txt
.md
.java
.cs
.js
.ts
.py
.sql
.xml
.json
.yaml
.yml
.properties
.ini
.html
.css
```

For each match, record:

- Keyword
- File path
- File name
- Extension
- Line number
- Column number
- Encoding
- Matched line
- Previous line if configured
- Next line if configured

The output should be close to Sakura Editor's grep result, but structured for Excel.

Example source line:

```text
D:\project\static\index.html(38,29) [UTF-8]: <h2 data-i18n="main.safetyStrategy">Safety Strategy</h2>
```

Structured output:

```text
Category: Code
Keyword: safetyStrategy
FilePath: D:\project\static\index.html
LineNumber: 38
ColumnNumber: 29
Encoding: UTF-8
MatchedText: <h2 data-i18n="main.safetyStrategy">Safety Strategy</h2>
```

## Excel Search Behavior

Excel search should target:

```text
.xlsx
.xlsm
```

For each matching cell, record:

- Keyword
- File path
- File name
- Sheet name
- Cell address
- Cell value

Formula cells should use the displayed or cached value if available. If not available, record the formula text.

Merged cells should record the visible value and the top-left cell address when practical.

Hidden sheets can be included in the first version because investigation work should prefer complete evidence over UI filtering.

## Report Output

The report should be an Excel workbook.

Suggested sheets:

```text
Summary
SearchResults
Keywords
SearchRoots
```

`SearchResults` is the main sheet.

`Summary` should include:

- Investigation title
- Created time
- Search roots
- Keyword count
- Total hit count
- Text hit count
- Excel hit count

`Keywords` should list every keyword exactly as searched.

`SearchRoots` should list the searched folders.

## Tool Policy

The first version does not depend on bundled command line tools.

Python should own the main flow:

- Text and code scanning
- Excel cell scanning
- Unified result records
- Excel report output

This keeps the engine portable and avoids parsing external grep output.

## Current First-Version Additions

After the deterministic engine became stable, the first page added:

- Local FastAPI service integration
- Saved workbench configuration in `config/investigation-conditions.json`
- Full-path defaults for search roots and output directory
- Local Ollama keyword candidate assistance with rule-based fallback
- English-based static UI text with locale modules for English, Chinese, and Japanese

## Future Extensions

After the first version works, the system can grow in this order:

1. Save and reload investigation projects.
2. Add include and exclude patterns.
3. Add `.xls` support if needed.
4. Add Word and PDF text extraction.
5. Add project dictionary suggestions.
6. Add optional symbol extraction if real investigations require it.
7. Improve AI-assisted keyword expansion.
8. Add source-backed summary generation.

AI should remain optional. Deterministic search and Excel report generation must continue to work without AI.

## Development Order

Recommended implementation order:

1. Create engine data models.
2. Implement text searcher.
3. Implement Excel searcher.
4. Implement report writer.
5. Add command line runner.
6. Test with a small sample folder.
7. Add investigation page.
8. Connect page to engine through a local API or command bridge.

This keeps the hardest and most useful part independent from the UI.

## Acceptance Criteria For First Engine Version

The first engine version is acceptable when:

- It can search one or more folders.
- It accepts multiple keywords.
- It finds text/code matches with file path, line number, column number, and matched line.
- It finds Excel matches with file path, sheet name, cell address, and cell value.
- It exports one Excel investigation workbook.
- Empty result sets still produce a valid report.
- The engine can run without opening the web page.

## Design Boundary

ZeroTraceSource should stay evidence-first:

```text
Search finds evidence.
Report organizes evidence.
User decides the impact scope.
```

The system should not pretend to know the final answer unless the evidence is visible in the report.
