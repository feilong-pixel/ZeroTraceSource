# Investigation Page First Design

Date: 2026-06-09

## Position

The first page is not an AI chat page.

It is a small workbench for the local investigation engine. Its job is to collect the same inputs that the command line runner and FastAPI route already accept, then run the engine through the local Web service.

The page should stay close to the user's real work:

```text
Investigation title
Search directories
Keywords
Skipped path substrings
Optional include extensions
Search options
Output directory
Output file prefix
```

## First Page Scope

The first page should support:

- Investigation title input
- Search directory add-list
- Keyword add-list
- Skipped path substring add-list
- Optional include extension input
- Case-sensitive toggle
- Context line input
- Output path input
- Output directory input
- Output file prefix input
- Generated command preview
- Copy command action
- Run investigation action through the local FastAPI service
- Run result summary
- Static preview of expected report sheets
- Saved investigation condition defaults
- AI keyword candidate generation and manual add actions

The first page should not support:

- AI result summary
- Direct file picker integration
- Notebook-style chat
- Result editing inside the browser

The page should call the local FastAPI service, and the service should call the engine.

## User Flow

```text
User fills investigation title
↓
User adds search folders
↓
User adds keywords
↓
User optionally adds skipped path substrings or include extensions
↓
Page generates the engine command for transparency
↓
User starts the search
↓
Engine exports the investigation Excel report
```

## Simple Filtering

Default system filters should stay inside the engine. The page should not show internal defaults such as `.git`, `node_modules`, `dist`, `build`, `target`, or Python cache folders.

User filtering should stay simple:

- Add path substrings to skip matching paths.
- Optionally enter extensions to include, such as `.java,.sql,.xlsx`.

If the extension field is empty, the engine uses its default searchable extensions. If the user enters extensions, the engine tries only those extensions. The page should not display the full default extension list.

## Output Naming

The page should ask for an output directory and a file prefix, not a complete output file name.

The backend should create the final report name:

```text
<prefix>_YYYYMMDD_HHMMSS.xlsx
```

Search directories and output directories should be passed to the engine as entered. For the saved configuration, use full paths to avoid ambiguity.

## Saved Conditions

The `Investigation Conditions` panel should load its editable values from:

```text
config/investigation-conditions.json
```

The page should not hard-code default title, search directories, keywords, filters, output settings, or search options in JavaScript or HTML. On startup, the page should call:

```text
GET /api/workbench/investigation-conditions
```

When the user clicks save, the page should write the current form state through:

```text
POST /api/workbench/investigation-conditions
```

Saved paths should be full paths. The page should display exactly what is read from the JSON file and save exactly what the user entered. Do not convert relative paths to full paths during load or save.

## Layout

Use a three-column workbench:

- Left: investigation inputs
- Center: generated command and run summary
- Right: output report notes and engine boundary
- Right: AI keyword candidate assistance

Long search paths should be shown as complete paths. They may wrap inside the list item, but they should not stretch the page layout.

## Page Ownership

The page owns display, request composition, and result rendering only.

It does not own:

- File walking
- Text matching
- Excel parsing
- Report writing
- AI keyword expansion

## Localization

Base HTML and JavaScript UI text should be written in English.

User-facing labels, placeholders, button text, and status messages should use the locale modules under:

```text
static/js/locales/
```

Do not hard-code Chinese or Japanese UI text in `static/index.html` or page scripts. Business sample values such as default search keywords may still include Japanese or Chinese when they are test data rather than UI labels.

## Implementation Files

Use:

```text
static/index.html
static/css/style.css
static/js/pages/index-page.js
```

Later, if page code grows, move backend calls into:

```text
static/js/services/investigation-api.js
```

The first Web service should follow the same broad structure as ZeroTraceEngine:

```text
app.py
core/routers/
core/services/
static/
```

## Acceptance Criteria

The first page is acceptable when:

- It opens through the local FastAPI service.
- It shows fields for title, search directories, keywords, skipped path substrings, optional extensions, options, output directory, and output prefix.
- It generates a valid `python -m engine.runner` command for transparency.
- It updates the command when inputs change.
- It offers a copy command action.
- It can call `/api/investigations/run`.
- It can call `/api/ai/keyword-candidates` and require manual confirmation before adding candidates.
- It displays text file count, Excel file count, total result count, error count, and report path.
- It can load and save investigation condition defaults through the local configuration API.
