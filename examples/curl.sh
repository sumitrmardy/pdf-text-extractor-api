#!/usr/bin/env bash
set -euo pipefail

# Extract text from a PDF URL synchronously using Apify
curl -s -X POST "https://api.apify.com/v2/acts/sumitr_mardy~pdf-text-extractor/run-sync-get-dataset-items" \
  -H "Authorization: Bearer ${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://arxiv.org/pdf/1706.03762"],
    "ocrMode": "auto"
  }' | jq '.[0] | {fileName, status, pageCount, charCount, text: .text[0:200]}'
