# PDF Text Extractor MCP 服务配置

将 [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor) 接入 Claude Desktop、Cursor 及任意支持 Model Context Protocol (MCP) 的客户端。

## Claude Desktop 配置

编辑 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "pdf-text-extractor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.apify.com?tools=sumitr_mardy/pdf-text-extractor",
        "--header",
        "Authorization: Bearer YOUR_APIFY_TOKEN"
      ]
    }
  }
}
```

## Cursor 配置

将 `cursor.json` 中的内容添加到 `.cursor/mcp.json` 中并重启 Cursor。
