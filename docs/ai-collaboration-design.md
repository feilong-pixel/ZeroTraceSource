# AI Collaboration Design

Date: 2026-06-09

## Position

AI should assist investigation, not control it.

The deterministic investigation flow remains:

```text
User chooses folders
User confirms keywords
Engine searches local files
Excel report records evidence
User decides the impact scope
```

AI can help before and after this flow, but it should not replace evidence search or final human judgment.

## First AI Scope

The first AI-related feature should be keyword candidate generation.

Input:

- Customer change description
- Existing confirmed keywords

Output:

- Candidate keywords

The candidates are not automatically searched. The user must add them manually.

## First Implementation

The first implementation may be rule-based and does not need to call a real local model.

API:

```text
POST /api/ai/keyword-candidates
```

Request:

```json
{
  "changeText": "安全方針の表示文言を変更し、承認状態によって制御を変える",
  "existingKeywords": ["safetyStrategy"]
}
```

Response:

```json
{
  "ok": true,
  "candidates": ["安全方針", "表示文言", "承認状態", "制御"]
}
```

## UI Placement

Do not create a separate AI page for the first version.

The current workbench should keep three columns:

- Left: investigation conditions
- Center: run command and result
- Right: AI assistance

The AI panel should contain:

- Change description text area
- Generate keyword candidates button
- Candidate list
- Add button for each candidate

## Boundary

AI must not:

- Run the investigation automatically
- Add keywords automatically
- Claim final impact scope
- Produce unsupported conclusions

AI may:

- Suggest keyword candidates
- Later draft a source-backed result summary from generated Excel results

## Later Scope

After the keyword candidate flow is useful, a second feature can summarize search results.

That summary must be based on the generated `SearchResults` sheet and should be labeled as a draft.
