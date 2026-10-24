# Pricing & Pay-Per-Event Model

The [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor) is billed per event emitted:

- **`pdf-extracted`**: $0.002 per successfully extracted PDF. Failed downloads, 404s, and empty PDFs are free.
- **`ocr-page`**: $0.005 per scanned page recovered via OCR. Pages with existing text layers are never OCRed and never billed.
- **`apify-actor-start`**: Apify standard start event ($0.0025 per GB).

See current pricing and tiered volume discounts on the [Pricing page](https://apify.com/sumitr_mardy/pdf-text-extractor/pricing).
