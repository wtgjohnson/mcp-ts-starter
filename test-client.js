#!/usr/bin/env node

/**
 * Simple test client to demonstrate MCP server functionality
 * This sends JSON-RPC messages to test the server capabilities
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the MCP server process
const serverProcess = spawn('node', [join(__dirname, 'build/stdio.js')], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let messageId = 1;

function sendMessage(method, params = {}) {
  const message = {
    jsonrpc: "2.0",
    id: messageId++,
    method: method,
    params: params
  };
  
  console.log('\n📤 Sending:', JSON.stringify(message, null, 2));
  serverProcess.stdin.write(JSON.stringify(message) + '\n');
}

// Handle server responses
serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('📥 Received:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('📥 Raw output:', line);
    }
  });
});

// Test sequence
async function runTests() {
  console.log('🚀 Starting MCP Server Tests...\n');
  
  // Wait a moment for server to start
  setTimeout(() => {
    // 1. Initialize the connection
    console.log('=== Test 1: Initialize ===');
    sendMessage('initialize', {
      protocolVersion: "1.0.0",
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      },
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    });
    
    setTimeout(() => {
      // 2. List resources
      console.log('\n=== Test 2: List Resources ===');
      sendMessage('resources/list');
      
      setTimeout(() => {
        // 3. Get a static resource
        console.log('\n=== Test 3: Get Static Resource ===');
        sendMessage('resources/read', {
          uri: "hello://world"
        });
        
        setTimeout(() => {
          // 4. Get a dynamic resource
          console.log('\n=== Test 4: Get Dynamic Resource ===');
          sendMessage('resources/read', {
            uri: "greeting://Alice"
          });
          
          setTimeout(() => {
            // 5. List tools
            console.log('\n=== Test 5: List Tools ===');
            sendMessage('tools/list');
            
            setTimeout(() => {
              // 6. Use echo tool
              console.log('\n=== Test 6: Use Echo Tool ===');
              sendMessage('tools/call', {
                name: "echo",
                arguments: {
                  message: "MCP Testing!"
                }
              });
              
              setTimeout(() => {
                // 7. Use debug tool
                console.log('\n=== Test 7: Use Debug Tool ===');
                sendMessage('tools/call', {
                  name: "debug",
                  arguments: {}
                });
                
                setTimeout(() => {
                  // 8. List prompts
                  console.log('\n=== Test 8: List Prompts ===');
                  sendMessage('prompts/list');
                  
                  setTimeout(() => {
                    // 9. Get a prompt
                    console.log('\n=== Test 9: Get Prompt ===');
                    sendMessage('prompts/get', {
                      name: "helpful-assistant"
                    });
                    
                    setTimeout(() => {
                      console.log('\n✅ All tests completed!');
                      serverProcess.kill();
                      process.exit(0);
                    }, 1000);
                  }, 1000);
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

// Handle errors
serverProcess.on('error', (error) => {
  console.error('❌ Server error:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`\n🔚 Server process exited with code ${code}`);
});

// Start the tests
runTests();
