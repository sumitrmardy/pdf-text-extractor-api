# MCP Configuration for PDF Text Extractor

Connect the [PDF Text Extractor](https://apify.com/sumitr_mardy/pdf-text-extractor) to Claude Desktop, Cursor, and any Model Context Protocol client.

## Claude Desktop

Open `claude_desktop_config.json` and add:

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

## Cursor

Add the snippet from `cursor.json` to `.cursor/mcp.json`.
