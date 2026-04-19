# MCP Server Example — TypeScript

Funkční ukázka MCP (Model Context Protocol) serveru v TypeScriptu. Součást [aidevelopers.cz](https://aidevelopers.cz).

## Co je MCP?

MCP (Model Context Protocol) je otevřený protokol od Anthropic, který umožňuje AI modelům (Claude, GPT atd.) bezpečně přistupovat k externím nástrojům a datům.

Funguje jako most mezi AI a tvým lokálním prostředím nebo API.

## Tento server umí

| Nástroj | Popis |
|---------|-------|
| `read_file` | Přečte lokální soubor |
| `list_directory` | Vypíše obsah adresáře |
| `fetch_url` | Načte obsah z URL |
| `get_weather` | Získá počasí přes wttr.in |

## Instalace a spuštění

```bash
git clone https://github.com/aidevelopers-cz/mcp-server-example.git
cd mcp-server-example
npm install
npm start
```

## Připojení do Claude Desktop

Přidej do `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "aidevelopers-example": {
      "command": "node",
      "args": ["/absolutni/cesta/mcp-server-example/node_modules/.bin/tsx", "/absolutni/cesta/mcp-server-example/src/index.ts"]
    }
  }
}
```

Restartuj Claude Desktop — server se automaticky připojí.

## Jak napsat vlastní MCP server

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server({ name: 'muj-server', version: '1.0.0' }, { capabilities: { tools: {} } })

// Definuj nástroje
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: 'muj_nastroj', description: '...', inputSchema: {...} }]
}))

// Implementuj nástroje
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // Tvá logika
  return { content: [{ type: 'text', text: 'výsledek' }] }
})

const transport = new StdioServerTransport()
await server.connect(transport)
```

## Více o MCP

- [Oficiální dokumentace](https://modelcontextprotocol.io)
- [MCP SDK na npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Článek na aidevelopers.cz](https://aidevelopers.cz/clanky/)

---

[aidevelopers.cz](https://aidevelopers.cz) — komunita českých vývojářů programujících s AI
