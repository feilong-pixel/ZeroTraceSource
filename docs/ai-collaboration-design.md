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

The first implementation should call local Ollama first and fall back to rule-based candidates if Ollama is unavailable or returns invalid JSON.

Default local model:

```text
qwen3:8b
```

Ollama endpoint:

```text
http://127.0.0.1:11434/api/chat
```

Qwen3 should run without thinking output for this task:

```json
{
  "think": false
}
```

The prompt should also begin the user message with:

```text
/no_think
```

The backend should remove any `<think>...</think>` block before parsing the model response.

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

## Configuration

Environment variables:

```text
ZT_AI_PROVIDER=ollama
ZT_OLLAMA_MODEL=qwen3:8b
ZT_OLLAMA_URL=http://127.0.0.1:11434
```

If these variables are not set, the backend uses the defaults above.

If `ZT_AI_PROVIDER` is not `ollama`, the backend skips Ollama and uses the rule-based fallback.

## Prompt Contract

The Ollama prompt must keep the output narrow:

```text
You are a local change impact investigation assistant.
Generate keyword candidates for searching source code and Excel specification documents.
Return only a JSON array of strings. Do not explain.
Include Japanese business terms, possible English variable names, and possible snake_case database field names.
Do not judge impact scope. Do not output conclusions. Limit to 20 items.
```

Expected model output:

```json
[
  "安全方針",
  "表示文言",
  "承認状態",
  "制御",
  "safetyStrategy",
  "safety_strategy",
  "approveStatus",
  "approve_status"
]
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
