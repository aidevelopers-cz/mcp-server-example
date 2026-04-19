#!/usr/bin/env node
/**
 * Ukázkový MCP server — čte lokální soubory a volá veřejné API
 * Součást aidevelopers.cz
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs'
import path from 'path'

const server = new Server(
  { name: 'aidevelopers-example', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// Definice nástrojů
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'read_file',
      description: 'Přečte obsah souboru z lokálního filesystému',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolutní nebo relativní cesta k souboru' },
        },
        required: ['path'],
      },
    },
    {
      name: 'list_directory',
      description: 'Vypíše obsah adresáře',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Cesta k adresáři' },
        },
        required: ['path'],
      },
    },
    {
      name: 'fetch_url',
      description: 'Načte obsah z URL (pouze veřejné API)',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL k načtení' },
        },
        required: ['url'],
      },
    },
    {
      name: 'get_weather',
      description: 'Získá aktuální počasí pro město (přes wttr.in)',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Název města (anglicky)' },
        },
        required: ['city'],
      },
    },
  ],
}))

// Implementace nástrojů
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'read_file': {
        const filePath = path.resolve(args?.path as string)
        if (!fs.existsSync(filePath)) {
          return { content: [{ type: 'text', text: `Soubor nenalezen: ${filePath}` }], isError: true }
        }
        const content = fs.readFileSync(filePath, 'utf-8')
        return { content: [{ type: 'text', text: content }] }
      }

      case 'list_directory': {
        const dirPath = path.resolve(args?.path as string)
        if (!fs.existsSync(dirPath)) {
          return { content: [{ type: 'text', text: `Adresář nenalezen: ${dirPath}` }], isError: true }
        }
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        const list = entries
          .map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`)
          .join('\n')
        return { content: [{ type: 'text', text: list }] }
      }

      case 'fetch_url': {
        const url = args?.url as string
        const response = await fetch(url)
        const text = await response.text()
        return { content: [{ type: 'text', text: text.slice(0, 5000) }] }
      }

      case 'get_weather': {
        const city = encodeURIComponent(args?.city as string)
        const response = await fetch(`https://wttr.in/${city}?format=3`)
        const text = await response.text()
        return { content: [{ type: 'text', text: text }] }
      }

      default:
        return { content: [{ type: 'text', text: `Neznámý nástroj: ${name}` }], isError: true }
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Chyba: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    }
  }
})

// Spuštění přes stdio (pro Claude Desktop)
const transport = new StdioServerTransport()
await server.connect(transport)
console.error('MCP server spuštěn')
