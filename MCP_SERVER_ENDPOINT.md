# MCP Server Endpoint and API Details

Your MCP server is now running and can be accessed by agentic clients or tools. Here are the details you need to provide to any agent or client that wants to connect:

## Base URL

- `http://localhost:3000`

## Endpoints

### 1. Server-Sent Events (SSE)
- **Endpoint:** `/sse?sessionId=YOUR_SESSION_ID`
- **Method:** GET
- **Description:** Establishes a persistent connection for receiving events from the server.

### 2. Messages
- **Endpoint:** `/messages?sessionId=YOUR_SESSION_ID`
- **Method:** POST
- **Content-Type:** `application/json`
- **Description:** Send messages to the server for processing. The sessionId must match the one used for the SSE connection.

## Session Management
- Each client should generate a unique `sessionId` (can be a UUID or any unique string).
- Use the same `sessionId` for both `/sse` and `/messages` endpoints to maintain the session.

## Example Usage

### Connect to SSE
```http
GET http://localhost:3000/sse?sessionId=abc123
```

### Send a Message
```http
POST http://localhost:3000/messages?sessionId=abc123
Content-Type: application/json

{
  "tool": "echo",
  "params": { "message": "world" }
}
```

## Available Tools and Methods
- Use the `debug` tool to list all available tools and methods:
  - Send a message with `{ "tool": "debug", "params": {} }`

## CORS
- CORS is enabled for all origins, so you can connect from any client.

## Authentication
- No authentication is required by default. Add as needed.

---

**Share this file with any agent or client that needs to connect to your MCP server.**
