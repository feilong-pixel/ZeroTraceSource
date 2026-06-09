# ZeroTraceSource

ZeroTraceSource is a local source search and citation assistant for documents, notes, and code.

It helps users search local materials with natural language, find related files and text snippets, and trace every result back to its original source. The goal is not to let AI make decisions, but to help users locate evidence faster.

## Purpose

Many projects contain information scattered across Markdown files, PDFs, Word documents, source code, SQL files, configuration files, and notes.

Searching these materials manually often requires repeated keyword guessing, directory switching, script execution, and result Organize. ZeroTraceSource is designed to reduce that work.

A user should be able to ask one question, and the system should help find:

- Related files
- Matching keywords
- Source snippets
- File paths
- Line numbers or document sections
- Context around each match

## What It Is

ZeroTraceSource is a local search support system.

It uses AI only to assist with search planning, keyword expansion, and result organization. The actual facts must come from local indexed sources.

The basic workflow is:

```text
User question
↓
Search plan and keyword expansion
↓
Local document and code search
↓
Source snippets and citations
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

Initial scope:

- Local notebook / source collection management
- Markdown and TXT indexing
- Source path and snippet search
- Keyword-based search
- Basic natural language query support
- Source-backed answers
- Citation and context display

Later scope:

- PDF and Word text extraction
- Code file indexing
- SQL and configuration file indexing
- Project vocabulary extraction
- Keyword expansion across business terms and code terms
- Multi-language search support for English, Chinese, and Japanese

## Design Principle

ZeroTraceSource should always keep a clear boundary:

> AI helps search.  
> Local sources provide evidence.  
> Users make the final judgment.

## License

MIT License.
