import os
from apify_client import ApifyClient

client = ApifyClient(os.getenv("APIFY_TOKEN"))

run_input = {
    "urls": ["https://arxiv.org/pdf/1706.03762"],
    "ocrMode": "auto",
}

run = client.actor("sumitr_mardy/pdf-text-extractor").call(run_input=run_input)
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(f"Status: {item['status']} | Pages: {item['pageCount']} | Chars: {item['charCount']}")
    print(f"Preview: {item['text'][:150]}...")
