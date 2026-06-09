# ZeroTraceSource

ZeroTraceSource is a local change impact investigation assistant for code and Excel documents.

It helps users collect evidence when a customer gives a rough change request and the actual modification scope must be investigated. The goal is not to let AI make decisions, but to help users locate evidence faster.

## Purpose

Many projects contain information scattered across source code, SQL files, configuration files, and Excel specifications.

Searching these materials manually often requires repeated keyword guessing, directory switching, script execution, and result Organize. ZeroTraceSource is designed to reduce that work.

A user should be able to enter investigation keywords and folders, then get:

- Matching files
- Matching keywords
- Source snippets and Excel cell values
- File paths
- Line numbers or Excel sheet/cell locations
- Context around each match

## What It Is

ZeroTraceSource is a local search support system.

It uses AI only to assist with search planning, keyword expansion, and result organization. The actual facts must come from local indexed sources.

The basic workflow is:

```text
Customer change description
↓
User confirms search directories and keywords
↓
Local code and Excel search
↓
Excel investigation report
↓
User reviews the evidence
```

## What It Is Not

ZeroTraceSource is not an AI decision-making system.

It does not aim to replace human judgment.

It does not:

- Decide whether a design is correct
- Decide whether code is wrong
- Claim the final impact scope of a feature
- Generate conclusions without source evidence
- Pretend to fully understand an entire project
- Provide unsupported recommendations

Its job is to help users find sources, not to judge them.

## Planned Features

Current first-version scope:

- Text and code keyword search
- Excel workbook cell search
- Search root, keyword, filter, and output configuration
- Local workbench page
- Saved investigation condition configuration
- Ollama-backed AI keyword candidates with rule-based fallback
- Keyword-based search

Later scope:

- PDF and Word text extraction
- Project vocabulary extraction
- Source-backed result summaries
- Optional project dictionaries

## Engine Prototype

The first engine prototype searches text/code files and Excel workbooks, then exports a structured investigation report.

Example:

```powershell
python -m engine.runner `
  --title "Sample Impact Investigation" `
  --root "E:\AI\apps\ZeroTraceSource\samples\impact_investigation\excel" `
  --root "E:\AI\apps\ZeroTraceSource\samples\impact_investigation\code" `
  --keywords "safetyStrategy,安全方針,archive_flag,approve_status" `
  --out-dir "E:\AI\apps\ZeroTraceSource\outputs" `
  --prefix sample-impact-investigation
```

The report contains:

- `Summary`
- `SearchResults`
- `Keywords`
- `SearchRoots`

Install runtime dependencies from:

```powershell
~\.virtualenvs\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Local Web Service

Run the local page and API with:

```powershell
.\start.ps1
```

Then open:

```text
http://127.0.0.1:8765/
```

The page calls `/api/investigations/run` and writes the investigation report through the same engine used by the command line runner.

The editable workbench defaults are stored in:

```text
config/investigation-conditions.json
```

Paths in this file should be full paths. The page reads and saves them as entered, without converting relative paths.

## Local AI Keyword Candidates

The AI assistance panel calls Ollama for keyword candidates and falls back to rule-based extraction if Ollama is unavailable.

Default settings:

```text
ZT_AI_PROVIDER=ollama
ZT_OLLAMA_MODEL=qwen3:8b
ZT_OLLAMA_URL=http://127.0.0.1:11434
```

For Qwen3, the backend sends `think: false` and asks for JSON-only keyword candidates.

## Design Principle

ZeroTraceSource should always keep a clear boundary:

> AI helps search.  
> Local sources provide evidence.  
> Users make the final judgment.

## License

MIT License.
