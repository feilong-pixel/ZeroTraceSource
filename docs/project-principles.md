# Project Principles

Date: 2026-06-09

## Purpose

ZeroTraceSource is a local change impact investigation assistant.

Its first job is to help collect evidence for software and document change investigations. It should support the practical workflow where a customer gives a rough change request, and the user needs to search code, database terms, Japanese business words, and Excel specification documents before deciding the actual modification scope.

The project should stay local-first. Source files, Excel documents, search results, and investigation reports should remain on the user's machine unless the user explicitly exports or shares them.

## Product Direction

The system should begin as an investigation engine, not as a general AI notebook.

The first valuable workflow is:

```text
Change request
↓
Investigation keywords
↓
Search code and Excel documents
↓
Collect matched locations and source snippets
↓
Export an investigation Excel report
↓
User reviews and decides the change scope
```

The page is only a workbench for this flow. It should not become the source of truth for search logic.

## Evidence First

ZeroTraceSource should be evidence-first.

It may help organize results, but it should not pretend to know the final impact scope without visible evidence.

The boundary is:

```text
Search finds evidence.
Report organizes evidence.
User decides the impact scope.
```

## First Practical Use Case

The first use case is change impact investigation across:

- Source code
- SQL files
- Configuration files
- Plain text documents
- Markdown notes
- Excel workbooks

Typical keywords may include:

- Japanese business terms
- Chinese notes
- English UI labels
- Code variable names
- Database field names
- API names
- Configuration keys

The system should accept all of these as plain investigation keywords.

## Excel Matters

Excel is a first-class input and output format.

Many investigation documents and customer specifications live in Excel. A text-only report is not enough because Excel hits need workbook context:

- File path
- File name
- Sheet name
- Cell address
- Cell value

The output report should also be Excel because it is easy to filter, annotate, review, and hand back as investigation evidence.

## AI Position

AI is optional in the first version.

The first AI use is limited to:

- Suggesting additional keywords

AI may become useful later for:

- Grouping search results
- Drafting a source-backed summary
- Explaining why certain hits may be related

AI should not replace deterministic search. Search and report generation must work without AI, and keyword candidates must be added only after user confirmation.

## Not A Notebook Clone

ZeroTraceSource should not copy a large NotebookLM-style button set.

Notebook-style information architecture can inspire the workbench layout, but the first product should fit the user's real investigation flow:

- Define investigation
- Enter keywords
- Select folders
- Search
- Review hits
- Export Excel

The UI should stay quiet, direct, and task-focused.

## Long-Term Direction

After the first engine is stable, the project can grow toward a broader local source investigation system:

- Saved investigation projects
- Project dictionaries
- Code symbol extraction
- Word and PDF text extraction
- AI-assisted keyword expansion
- Source-backed summaries

These should be added only after the deterministic search and Excel report pipeline is reliable.
