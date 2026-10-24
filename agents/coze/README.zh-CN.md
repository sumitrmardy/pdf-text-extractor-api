# Coze (扣子) 插件配置指南

将 [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor) 作为插件导入 Coze (扣子) 平台。

## 配置步骤

1. 在 Coze 个人空间或团队空间中点击 **创建插件**。
2. 插件元数据设置：
   - 插件名称: `pdf_text_extractor`
   - 描述: `从 PDF 链接中提取清洗后的文本、按页拆分和扫描件 OCR 结果。`
3. 导入 OpenAPI 规范：上传 `openapi/openapi.yaml`。
4. 鉴权配置选择 **Bearer Token** 并填入 Apify API Token。
5. 在 Bot 编排流程中引入该插件工具。
