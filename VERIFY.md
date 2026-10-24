# Verification Checklist

Before publishing or linking workflows in community posts, verify each step:

1. [x] Valid JSON Schemas in `schema/input.schema.json` and `schema/output.schema.json`
2. [x] Recorded real responses in `test/fixtures/expected/*.json` validate against output schema
3. [x] No secrets committed anywhere in the repository
4. [x] Single source of truth for Apify URLs and prices (`config/links.json`)
5. [x] All 4 n8n workflows built for English and Chinese (`workflows/en/`, `workflows/zh-CN/`)
6. [x] Workflows have non-default node names, proper connections, and no hardcoded tokens
7. [x] `npm run check` passes cleanly

## n8n gate (2026-10-24)

All 4 English workflows were imported into **n8n 2.44.6** (Node 24) with `n8n import:workflow`, then run
with `n8n execute` against a local stand-in for `api.apify.com` that answers with the recorded real
responses in `test/fixtures/expected/`. For the runs, external triggers were swapped for a Manual Trigger
plus a sample item, and nodes that need third-party accounts were disabled. Everything between the
trigger and the side effect ran for real: the Apify request (body and `Authorization` header checked on
the stand-in), and the Set, Code and Filter logic.

Fixed before this gate: Set 3.4 and Filter 2 nodes written in the old v1 parameter format; workflows
with no trigger node; workflow-specific issues listed below.

| Template | Imported | Executed up to the side effect | Not exercised here |
|---|---|---|---|
| T1 Drive → Sheets | yes | yes (Drive sample item → Apify → row) | Drive trigger polling, Sheets append |
| T2 RAG → Qdrant | yes | yes (chunks carry `pageStart`/`pageEnd`) | Qdrant insert, OpenAI embeddings, data loader |
| T3 Webhook | yes | yes (body.url → Apify → response JSON) | the HTTP webhook itself, Respond to Webhook |
| T4 AI agent tool | yes | no | needs an OpenAI key |

Workflow-specific fixes: T2 Qdrant was missing its Embeddings and Document Loader sub-nodes, and used `collectionName` instead of the `qdrantCollection` locator; T1 now states that Drive files must be shared "anyone with the link".

Still open before a community post links these templates:
- [ ] One run of each template against the **live** Actor with a real Apify token
- [ ] Import into one older n8n minor (1.x) as well
- [ ] The side-effect nodes above, with real accounts
