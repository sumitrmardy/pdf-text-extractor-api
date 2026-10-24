English | [简体中文](README.zh-CN.md)

# PDF Text Extractor API — for n8n, AI Agents & MCP

Extract full text, layout structure, page-by-page content, and OCR from PDF documents in bulk: fast PDFium text layer parsing (1–8 ms/page) + Tesseract 5 OCR for scanned pages. Direct URLs, Google Drive, Dropbox, and arXiv abstract pages are accepted natively.

[![n8n templates](https://img.shields.io/badge/n8n-4%20templates-EA4B71)](workflows/en)
[![MCP ready](https://img.shields.io/badge/MCP-ready-7C3AED)](agents/mcp)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539)](openapi/openapi.yaml)
[![Pricing](https://img.shields.io/badge/pricing-pay%20per%20extracted%20pdf-0A66C2)](https://apify.com/sumitr_mardy/pdf-text-extractor/pricing)
[![License](https://img.shields.io/badge/license-MIT-black)](LICENSE)

### ➜ [Try it on Apify](https://apify.com/sumitr_mardy/pdf-text-extractor)

```json
{
  "url": "https://arxiv.org/pdf/1706.03762",
  "status": "ok",
  "subStatus": "text_layer",
  "pageCount": 15,
  "pagesExtracted": 15,
  "ocrPages": 0,
  "charCount": 39420,
  "title": "Attention Is All You Need",
  "text": "Attention Is All You Need\nAshish Vaswani...",
  "pages": [
    { "pageNumber": 1, "text": "Attention Is All You Need...", "charCount": 3120, "ocr": false }
  ]
}
```

---

## Why pipelines like it

Most PDF tools are written for interactive viewing or slow full-document OCR. This API is designed as a pipeline primitive:

1. **Broken files and failures are free.** If a link is dead, 404s, or contains no extractable text, you are not charged. You only pay for PDFs that return text.
2. **Speed & Efficiency.** The native text layer is extracted using Chromium's PDFium engine in 1–8 ms per page. An 838-page book takes ~18 seconds end to end.
3. **Smart OCR.** Only scanned or photographic pages without a text layer trigger OCR. Scanned pages are charged $0.005 per page; digital pages are never OCRed.
4. **Built-in RAG Chunking.** Pass `chunkSize` and `chunkOverlap` to get pre-split chunks with `pageStart` and `pageEnd` metadata, ensuring citations link to the exact page.

---

## n8n Templates

Importable workflows in [workflows/en](workflows/en):

- **T1 Google Drive to Google Sheets**: Monitor a Drive folder for new PDFs and append text to Sheets.
- **T2 Vector Store Ingestion (RAG)**: Ingest PDFs with semantic chunks and page citations into Qdrant/Pinecone.
- **T3 Webhook PDF-to-Text API**: Provide a real-time extraction endpoint for your internal apps.
- **T4 AI Agent Tool**: Equip an LLM Agent with a "Read PDF" tool.

---

## Agents & MCP

- **Claude Desktop & Cursor**: MCP configuration files in [agents/mcp](agents/mcp).
- **Dify & Coze**: Tool import guides in [agents/dify](agents/dify) and [agents/coze](agents/coze).
- **Function Calling**: Pre-built schemas for Anthropic Tools and OpenAI Functions in [agents/tool-definitions](agents/tool-definitions).

---

## Pricing

Pay-per-event pricing on Apify:
- `pdf-extracted`: $0.002 per successful PDF (from $2.00 per 1,000).
- `ocr-page`: $0.005 per recovered scanned page.
- Tiered discounts available on Apify Bronze, Silver, and Gold plans.

Check the live rates on the [Pricing page](https://apify.com/sumitr_mardy/pdf-text-extractor/pricing).

## License

MIT © Sumitr Mardy
