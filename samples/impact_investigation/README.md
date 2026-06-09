# Impact Investigation Sample Set

This folder contains artificial files for testing the first ZeroTraceSource engine.

The sample set is intentionally small. It exists to verify that the engine can search code, text, SQL, configuration files, and Excel workbooks without using customer data.

## Test Keywords

Use these keywords for the first search tests:

```text
safetyStrategy
安全方針
安全策略
safety_strategy
archiveFlag
archive_flag
承認状態
approveStatus
approve_status
```

## Expected Coverage

`safetyStrategy` should match:

- `code/static/index.html`
- `code/services/safety_service.py`
- `code/config/app.properties`
- `excel/screen_spec.xlsx`
- `excel/interface_spec.xlsx`

`安全方針` should match:

- `code/static/index.html`
- `code/services/safety_service.py`
- `excel/screen_spec.xlsx`
- `excel/message_list.xlsx`

`archive_flag` should match:

- `code/db/schema.sql`
- `excel/db_definition.xlsx`

`approve_status` should match:

- `code/db/schema.sql`
- `excel/db_definition.xlsx`
- `excel/interface_spec.xlsx`

## Excel Search Expectations

The engine should capture:

- Workbook path
- Sheet name
- Cell address
- Cell value
- Keyword

The sample workbooks include multiple sheets, mixed Japanese and English text, formulas, blank cells, and a hidden sheet.

## Code Search Expectations

The engine should capture:

- File path
- Line number
- Column number
- Encoding
- Matched line
- Optional previous and next line

The expected text search output should be close to Sakura Editor grep output, but exported as structured rows.
