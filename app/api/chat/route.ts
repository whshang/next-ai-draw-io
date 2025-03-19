import { google } from "@ai-sdk/google";
import { Message } from "ai/react";
import { streamText } from "ai";
import { z } from "zod";
export const maxDuration = 30;

// Define tool interfaces
interface DisplayFlowChartArgs {
  xml: string;
}

interface ToolContext {
  getCurrentXML: () => string;
  displayChart: (xml: string) => void;
}

export async function POST(req: Request) {
  let { messages } = await req.json();
  const systemMessage = `
  You are a helpful assistant that can create, edit, and display flowcharts using draw.io.
  You can use the following tools:
  - display_flow_chart: Display a flowchart on draw.io.
  - fetch_flow_chart: Get the current flowchart XML from draw.io.
  You can use the tools to create and manipulate flowcharts.
  You can also answer questions and provide explanations.
  `;
  if (messages.length === 1) {
    messages = [
      {
        "role": "system",
        "content": systemMessage,
      },
      ...messages,
    ];
  }
  const response = streamText({
    model: google("gemini-2.0-flash"),
    messages,
    tools: {
      display_flow_chart: {
        description: "Display a flowchart on draw.io",
        parameters: z.object(
          {
            xml: z.string().describe("XML string to be displayed on draw.io"),
          },
        )
      },
      fetch_flow_chart: {
        description: "Get the current flowchart XML from draw.io",
        parameters: z.object({}),
      }
    },
    temperature: 0,
  });

  return response.toDataStreamResponse();
}
