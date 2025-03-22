import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Read the XML guide from file

const guide = readFileSync(resolve('./app/api/chat/xml_guide.md'), 'utf8');

export async function POST(req: Request) {
  const { messages } = await req.json();


  // Read and escape the guide content
  const systemMessage = `
You are a helpful assistant that can create, edit, and display diagram using draw.io through xml strings.
You can use the following tools:
---Tool1---
tool name: display_diagram
description: Display a diagram on draw.io
parameters: {
  xml: string
}
---End of tools---

Here is a guide for the XML format:
"""md
${guide}
"""
You can use the tools to create and manipulate diagrams.
You can also answer questions and provide explanations.
Note that:
- If the user wants you to draw something rather than a diagram, you can use the combination of the shapes to draw it.
- Consider the layout of the diagram and the shapes used to avoid overlapping.
- Ensure that the XML strings are well-formed and valid.
  `;

  // Add system message if only user message is provided
  const enhancedMessages = messages.length === 1
    ? [{ role: "system", content: systemMessage }, ...messages]

    : messages;

  const result = streamText({
    // model: google("gemini-2.0-flash"),
    model: openai("gpt-4o"),
    toolCallStreaming: true,
    messages: enhancedMessages,
    tools: {
      // Client-side tool that will be executed on the client
      display_diagram: {
        description: "Display a diagram on draw.io",
        parameters: z.object({
          xml: z.string().describe("XML string to be displayed on draw.io")
        })
      },
    },
    temperature: 0,
  });

  return result.toDataStreamResponse();
}
