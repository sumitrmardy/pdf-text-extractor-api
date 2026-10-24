[English](README.md) | 简体中文

# PDF Text Extractor API — 适用于 n8n、AI Agent 与 MCP

批量提取 PDF 文档中的全文、排版结构、逐页内容与 OCR 扫描文字：PDFium 超高速数字文本层解析 (每页 1–8 ms) + Tesseract 5 扫描件智能识别。原生支持直链、Google Drive、Dropbox 和 arXiv 论文摘要链接。

[![n8n 模板](https://img.shields.io/badge/n8n-4%20templates-EA4B71)](workflows/zh-CN)
[![支持 MCP](https://img.shields.io/badge/MCP-ready-7C3AED)](agents/mcp)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539)](openapi/openapi.yaml)
[![定价详情](https://img.shields.io/badge/pricing-pay%20per%20extracted%20pdf-0A66C2)](https://apify.com/sumitr_mardy/pdf-text-extractor/pricing)
[![开源协议](https://img.shields.io/badge/license-MIT-black)](LICENSE)

### ➜ [在 Apify 上体验](https://apify.com/sumitr_mardy/pdf-text-extractor)

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

## 核心特性

1. **损坏文件与失败链接完全免费。** 链接失效、404 或无文本内容的空 PDF 不产生费用，仅对成功返回文本的 PDF 收费。
2. **极速解析。** 采用 Chromium 核心的 PDFium 引擎，数字层解析仅需 1–8 ms/页。838 页图书提取耗时仅约 18 秒。
3. **按需智能 OCR。** 仅对无文本层的纯图片扫描页触发 OCR，扫描页每页收费 $0.005；原生数字页永不触发 OCR，省钱省时。
4. **原生支持 RAG 分块。** 传入 `chunkSize` 和 `chunkOverlap` 参数即可获得自带 `pageStart` 与 `pageEnd` 元数据的语义切片，确保 RAG 检索精准溯源至原页码。

---

## n8n 开源模板

可在 [workflows/zh-CN](workflows/zh-CN) 导入使用：

- **T1 Google Drive 转 Google 表格**: 监控云端文件夹新 PDF，自动提取文本并追加至表格。
- **T2 向量数据库入库 (RAG)**: 带页码元数据与切片的向量化工作流（支持 Qdrant / Pinecone）。
- **T3 PDF 转文本 Webhook 接口**: 为企业内部系统提供实时的 PDF 文本提取微服务。
- **T4 AI Agent 工具**: 为大模型 Agent 赋予精准阅读 PDF 的工具能力。

---

## Agent 与 MCP 集成

- **Claude Desktop 与 Cursor**: 配置文件位于 [agents/mcp](agents/mcp)。
- **Dify 与 Coze (扣子)**: 自定义工具配置说明位于 [agents/dify](agents/dify) 和 [agents/coze](agents/coze)。
- **函数调用 (Tool Call)**: Anthropic Tool 与 OpenAI Function 定义位于 [agents/tool-definitions](agents/tool-definitions)。

---

## 计费方式

基于 Apify Pay-Per-Event (按事件收费) 模式：
- `pdf-extracted`: 成功提取文本的 PDF 每份 $0.002（千份起价 $2.00）。
- `ocr-page`: 成功识别的扫描件每页 $0.005。
- 支持 Apify Bronze、Silver、Gold 阶梯折扣。

在 [定价页面](https://apify.com/sumitr_mardy/pdf-text-extractor/pricing) 查看详情。

## 开源协议

MIT © Sumitr Mardy
