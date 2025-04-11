# Hello World MCP Server

A simple Model Context Protocol (MCP) server implementation built with TypeScript. This server demonstrates basic MCP functionality including resources, prompts, and tools.

## Features

- SSE and STDIO transport support
- Resource handling with static and dynamic resources
- Sample prompt implementation
- Example tool that echoes messages
- Debug tool for server introspection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

## Running the Server

### HTTP/SSE Transport (Web Browsers)

```bash
npm run start:http
```

This starts the server on http://localhost:3000 with:
- SSE endpoint at `/sse`
- Message endpoint at `/messages`

### STDIO Transport (Command Line)

```bash
npm run start
```

This runs the server in stdio mode for command-line integrations.

## Testing the Server

### Testing with cURL

1. Start the HTTP server:
   ```bash
   npm run start:http
   ```

2. In a terminal window, connect to the SSE endpoint:
   ```bash
   curl -N http://localhost:3000/sse
   ```
   You should see a response like:
   ```
   event: endpoint
   data: /messages?sessionId=YOUR_SESSION_ID
   ```

3. In another terminal window, send a request to invoke the echo tool:
   ```bash
   curl -X POST \
     "http://localhost:3000/messages?sessionId=YOUR_SESSION_ID" \
     -H 'Content-Type: application/json' \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "tools/invoke",
       "params": {
         "name": "echo",
         "parameters": {
           "message": "Testing the MCP server!"
         }
       }
     }'
   ```

4. You should see a response in the SSE terminal window:
   ```
   event: message
   data: {"jsonrpc":"2.0","id":1,"result":{"content":[{"type":"text","text":"Hello Testing the MCP server!"}]}}
   ```

5. Try the debug tool to see available server methods:
   ```bash
   curl -X POST \
     "http://localhost:3000/messages?sessionId=YOUR_SESSION_ID" \
     -H 'Content-Type: application/json' \
     -d '{
       "jsonrpc": "2.0",
       "id": 2,
       "method": "tools/invoke",
       "params": {
         "name": "debug",
         "parameters": {}
       }
     }'
   ```

### Testing with MCP Inspector

For a visual interface, you can use the MCP Inspector tool:

1. Connect to http://localhost:3000/sse in the MCP Inspector
2. Browse available resources and tools
3. Invoke tools interactively

![MCP Inspector HTTP Mode](https://github.com/user/repo/raw/main/screenshots/mcp-inspector-http.png)

![MCP Inspector STDIO Mode](https://github.com/user/repo/raw/main/screenshots/mcp-inspector-stdio.png)

## Server API

### Resources

- `hello://world` - A static hello world resource
- `greeting://{name}` - A dynamic greeting with a name parameter

### Tools

- `echo` - Echoes back a message with "Hello" prefix
- `debug` - Lists all available tools and methods

### Prompts

- `helpful-assistant` - A basic helpful assistant prompt

## Troubleshooting

- If you get "Headers already sent" errors, make sure you're not manually setting headers
- Session ID handling is crucial for proper message routing
- Check the server console for debugging information

## License

MIT