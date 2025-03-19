import { google } from "@ai-sdk/google";
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
You are a helpful assistant that can create, edit, and display flowcharts using draw.io through xml strings.
You can use the following tools:
---Tool1---
tool name: display_flow_chart
description: write a xml and display it on draw.io
parameters: {
  xml: string
}
---Tool2---
tool name: fetch_flow_chart
description: Get the current flowchart XML from draw.io
parameters: {}
---End of tools---

When you need to modify the flowchart, you need fetch the current flowchart XML from draw.io and then modify it and display it again.
here is a guide for the XML format: ${guide}
You can use the tools to create and manipulate flowcharts.
You can also answer questions and provide explanations.
If user want you to draw something rather than flowchart, you can use the combination of the shape to draw it.
  `;

  // Add system message if only user message is provided
  const enhancedMessages = messages.length === 1
    ? [{ role: "system", content: systemMessage }, ...messages]
    : messages;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages: enhancedMessages,
    tools: {
      // Client-side tool that will be executed on the client
      display_flow_chart: {
        description: "Display a flowchart on draw.io",
        parameters: z.object({
          xml: z.string().describe("XML string to be displayed on draw.io")
        })
      },
      // Client-side tool that will be executed on the client
      fetch_flow_chart: {
        description: "Get the current flowchart XML from draw.io",
        parameters: z.object({})
      }
    },
    temperature: 0,
  });

  return result.toDataStreamResponse();
}
