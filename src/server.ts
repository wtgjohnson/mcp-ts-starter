import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Creates and configures a Hello World MCP server
 * with one resource, one prompt, and one tool
 */
export function createServer() {
  // Create an MCP server
  const server = new McpServer({
    name: "hello-world",
    version: "1.0.0",
  });

  // Add a static resource
  server.resource("hello", "hello://world", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: "Hello, World from the resource!",
      },
    ],
  }));

  // Add a dynamic resource with parameters
  server.resource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    async (uri, { name }) => ({
      contents: [
        {
          uri: uri.href,
          text: `Hello, ${name} from the resource!`,
        },
      ],
    })
  );

  // Add a prompt
  server.prompt(
    "helpful-assistant",
    "A helpful assistant prompt", // Add description as second parameter
    () => ({
      messages: [
        {
          role: "assistant", // Changed from "system" to "assistant"
          content: {
            type: "text",
            text: "You are a helpful assistant.",
          },
        },
      ],
    })
  );

  // Add an echo tool
  server.tool(
    "echo",
    "Echoes back a message with 'Hello' prefix",
    { message: z.string().describe("The message to echo") },
    async ({ message }) => ({
      content: [
        {
          type: "text",
          text: `Hello ${message}`,
        },
      ],
    })
  );

  // Add a Sourcegraph search tool
  server.tool(
    "sg_search",
    "Searches across repositories using the Sourcegraph API",
    { query: z.string().describe("The search query") },
    async ({ query }) => {
      try {
        // Get the Sourcegraph token from environment
        const SG_TOKEN = process.env.SOURCEGRAPH_TOKEN;
        const SG_URL = process.env.SOURCEGRAPH_URL || "https://sourcegraph.com";

        if (!SG_TOKEN) {
          return {
            content: [
              {
                type: "text",
                text: "Error: SOURCEGRAPH_TOKEN environment variable is not set.",
              },
            ],
          };
        }

        // Construct the GraphQL query
        const graphqlQuery = {
          query: `query Search($query: String!) {
            search(query: $query) {
              results {
                matchCount
                results {
                  ... on FileMatch {
                    file { path }
                    repository { name }
                    lineMatches {
                      lineNumber
                      preview
                    }
                  }
                }
              }
            }
          }`,
          variables: { query },
        };

        // Call the Sourcegraph API
        const response = await fetch(`${SG_URL}/.api/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${SG_TOKEN}`,
          },
          body: JSON.stringify(graphqlQuery),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Format the results
        const results = data.data?.search?.results?.results || [];
        const formattedResults = results
          .map((result: { repository: { name: any; }; file: { path: any; }; lineMatches: any[]; }) => {
            if (result.repository && result.file) {
              return (
                `Repo: ${result.repository.name}, File: ${result.file.path}\n` +
                (result.lineMatches
                  ?.map((match) => `Line ${match.lineNumber}: ${match.preview}`)
                  .join("\n") || "")
              );
            }
            return "";
          })
          .filter(Boolean)
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: formattedResults || "No results found",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error performing search: ${Response.error}`,
            },
          ],
        };
      }
    }
  );

  return server;
}
