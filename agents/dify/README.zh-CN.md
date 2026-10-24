# Dify 自定义工具配置指南

在 Dify 中创建自定义工具以集成 [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor)。

## 配置步骤

1. 在 Dify 工作空间中进入 **工具** → **自定义工具** → **创建自定义工具**。
2. 填入 OpenAPI 规范：导入本仓库的 `openapi/openapi.yaml`。
3. 认证方式选择 **API Key**：
   - Header: `Authorization`
   - Value: `Bearer YOUR_APIFY_TOKEN`
4. 在 Agent 或 Chatflow 中添加该工具节点，即可自动解析用户传入的 PDF 链接并进行问答。
