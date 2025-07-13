#!/usr/bin/env node

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";

async function main() {
  // Create the server
  const server = createServer();
  
  // Create Express app
  const app = express();
  const port = process.env.PORT || 3000;
  
  // Server-side connections
  const connections = new Map();
  
  // Add CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // Handle SSE connections
  app.get("/sse", async (req, res) => {
    // Generate a unique connection ID (UUID format)
    const sessionId = req.query.sessionId as string || 
                     `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    try {
      // Create a new SSE transport
      const transport = new SSEServerTransport(`/messages?sessionId=${sessionId}`, res);
      connections.set(sessionId, transport);
      
      console.log(`Client ${sessionId} connected`);
      
      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
      }, 30000);
      
      // Connect the server to this transport
      await server.connect(transport);
      
      // Handle client disconnect
      req.on("close", () => {
        if (connections.has(sessionId)) {
          connections.delete(sessionId);
          console.log(`Client ${sessionId} disconnected`);
          clearInterval(keepAlive);
        }
      });
    } catch (error: any) {
      console.error('Error establishing SSE connection:', error);
      if (!res.headersSent) {
        res.status(500).end(`Server error: ${error.message || 'Unknown error'}`);
      }
    }
  });
  
  // Handle messages from client
  app.post("/messages", express.json(), async (req, res) => {
    try {
      // Extract sessionId from query parameters
      const sessionId = req.query.sessionId as string;
      
      if (!sessionId || !connections.has(sessionId)) {
        return res.status(400).json({ error: "No active connection for this session" });
      }
      
      // Use the specific connection for this session
      const transport = connections.get(sessionId);
      await transport.handlePostMessage(req, res, req.body);
    } catch (error: any) {
      console.error('Error handling message:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
      }
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Hello World MCP Server running on http://localhost:${port}`);
    console.log(`- Connect to /sse for server-sent events`);
    console.log(`- Send messages to /messages endpoint`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});