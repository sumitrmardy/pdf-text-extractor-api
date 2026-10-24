# Status and Sub-Status Reference

The PDF Text Extractor returns flat, schema-stable records. Every record contains `status`, `subStatus`, and `error`.

## Status values

- `ok`: Text was successfully extracted (from the digital text layer, OCR, or both).
- `no_text`: The PDF is valid but contains no extractable text. Scanned pages were found but OCR was disabled or did not detect text.
- `failed`: The document could not be processed (e.g. invalid URL, HTTP 404, corrupted header).

## Sub-status details

- `text_layer`: Native digital text extracted directly via PDFium.
- `ocr_recovered`: Scanned page images recognized and recovered via Tesseract OCR.
- `scanned_ocr_off`: Scanned pages detected, but `ocrMode` was set to `off`.
- `budget_incomplete`: Document exceeded the per-run compute/loss budget; partial text returned up to `pagesExtracted`.
- `invalid_url`: Provided URL does not begin with `http://` or `https://`.
- `not_a_pdf`: Downloaded stream does not contain the `%PDF-` magic header within the first kilobyte.

See [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor) on Apify.
