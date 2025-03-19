# Hello World MCP Server

A simple MCP server with one resource, one prompt, and one tool.

## Features

- **Resource**: Provides a "Hello World" message when called
- **Prompt**: Simple prompt that says "You are a helpful assistant"
- **Tool**: Echo tool that returns "Hello" plus your input

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Clean

```bash
npm run clean
```

## Run

### Using STDIO

```bash
npm run start
```

### Using HTTP with SSE

```bash
npm run start:http
```

## Using the Server

You can connect to this server using any MCP client, such as Claude Desktop, or build your own client.

### Claude Desktop Configuration

To use this server with Claude Desktop, add the following to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "hello-world": {
      "command": "node",
      "args": ["<path-to-repo>/py-mcp-amp/build/stdio.js"]
    }
  }
}
```

Replace `<path-to-repo>` with the absolute path to this repository.