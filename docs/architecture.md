# ZeroTraceSource Architecture

Date: 2026-06-09

## Development Baseline

ZeroTraceSource starts as a local change impact investigation tool.

The first architecture should prioritize a reliable engine over a rich interface. The engine must be usable from the command line before it is connected to the page.

## First Version Scope

The first version should implement:

- Text and code keyword search
- Excel workbook cell search
- Unified search result records
- Excel investigation report output
- A simple investigation page that calls the engine and displays results
- A local Python web service that serves the page and exposes the engine

The first version should not implement:

- AI chat
- Vector search
- Notebook-style feature panels
- Automatic impact judgment
- PDF or Word parsing
- Code symbol graph

## Repository Layout

Recommended structure:

```text
ZeroTraceSource/
  engine/
    __init__.py
    runner.py
    models.py
    config.py
    search/
      __init__.py
      file_walker.py
      encoding.py
      text_searcher.py
      excel_searcher.py
    report/
      __init__.py
      excel_writer.py
  core/
    routers/
      ai_router.py
      index_router.py
      investigation_router.py
    services/
      ai_service.py
      investigation_service.py
  app.py
  start.ps1
  static/
    index.html
    css/
      style.css
    js/
      app.js
      pages/
        index-page.js
        investigation-page.js
      services/
        investigation-api.js
      components/
        keyword-list.js
        result-table.js
        source-picker.js
  docs/
    ai-collaboration-design.md
    architecture.md
    engine-first-design.md
    page-first-design.md
    project-principles.md
  samples/
    impact_investigation/
      README.md
      code/
      excel/
      build_sample_workbooks.mjs
```

## Engine Layer

The engine owns all investigation behavior.

Responsibilities:

- Accept an investigation request
- Normalize keywords
- Walk search folders
- Detect searchable files
- Search text and code files
- Search Excel workbook cells
- Build unified result records
- Write the Excel investigation report

The engine should not depend on browser state or page components.

## Search Request

The request model should contain:

```text
title
roots
keywords
file_kinds
include_extensions
exclude_patterns
case_sensitive
context_lines
output_path
```

The command line runner and FastAPI route should accept the same request shape.

For page-driven runs, the API may receive `outputDir` and `outputPrefix` instead of a full `outputPath`. The backend should generate:

```text
<prefix>_YYYYMMDD_HHMMSS.xlsx
```

## Result Model

All searchers should return the same record shape so the report writer does not care where the result came from.

Fields:

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

Text search fills line, column, encoding, matched text, and optional context.

Excel search fills sheet name, cell address, and cell value.

Unused fields stay empty.

## Text Search

Text search should cover source code, SQL, configuration files, and plain documents.

Initial extensions:

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

For each keyword match, record:

- File path
- Line number
- Column number
- Encoding
- Matched line
- Previous line if configured
- Next line if configured

This should be close to Sakura Editor grep output, but stored as structured rows.

## Excel Search

Excel search should cover:

```text
.xlsx
.xlsm
```

For each matching cell, record:

- File path
- File name
- Sheet name
- Cell address
- Cell value
- Keyword

Hidden sheets should be included in the first version because investigation should prefer complete evidence.

Formula cells should use cached values when available. If cached values are not available, record the formula text.

## Report Writer

The report writer should generate one Excel workbook.

Suggested sheets:

```text
Summary
SearchResults
Keywords
SearchRoots
```

`SearchResults` is the main sheet and uses the unified result model.

`Summary` should include:

- Investigation title
- Created time
- Search roots
- Keyword count
- Total hit count
- Text hit count
- Excel hit count

## Page Layer

Page logic should live under:

```text
static/js/pages/investigation-page.js
```

The page should own:

- Investigation title input
- Keyword list UI
- Search root list UI
- Search options UI
- Result table display
- Selected result detail display
- Export button state

The page should not own:

- File walking
- Text matching
- Excel parsing
- Report generation
- Keyword expansion rules

## Service Layer

Calls from the page to the engine should live under:

```text
static/js/services/investigation-api.js
```

This layer should hide whether the engine is called through:

- A local FastAPI route
- A later desktop wrapper
- A later packaged runtime

The page should call service functions, not engine internals.

## Component Layer

Reusable UI pieces can live under:

```text
static/js/components/
```

Initial candidates:

- `keyword-list.js`
- `source-picker.js`
- `result-table.js`

Components should stay display-focused.

## Tooling Policy

The first implementation does not depend on bundled command line tools.

Python owns the main search path:

- Text scanning is implemented in Python.
- Excel scanning is implemented with `openpyxl`.
- Report output is implemented with `openpyxl`.

## Development Order

Recommended order:

1. Create `engine/models.py`.
2. Create `engine/search/file_walker.py`.
3. Implement text search.
4. Implement Excel search.
5. Implement Excel report output.
6. Add command line runner.
7. Verify with a small sample folder.
8. Add investigation page.
9. Add page service bridge.
10. Add local FastAPI endpoint for running investigations.

## Sample Data

The first engine should be verified against:

```text
samples/impact_investigation/
```

This sample set is artificial and safe to keep in the repository. It includes:

- Code files with UI labels, variables, SQL fields, and configuration keys
- Excel workbooks with Japanese business terms, English variable names, database fields, formulas, and a hidden sheet
- A README that lists expected keywords and expected match coverage

Use this sample set before testing with real customer or work documents.

## Acceptance Criteria

The first version is acceptable when:

- It runs without opening the page.
- It accepts multiple keywords.
- It searches one or more folders.
- It finds text/code matches with file path, line number, column number, and matched line.
- It finds Excel matches with file path, sheet name, cell address, and cell value.
- It exports one investigation Excel workbook.
- Empty search results still produce a valid workbook.

## Architecture Rule

Keep the boundary simple:

```text
Engine searches.
Report writer exports.
Page displays.
User decides.
```
