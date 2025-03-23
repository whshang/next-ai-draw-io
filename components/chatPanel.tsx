"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import Image from "next/image"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useChat } from '@ai-sdk/react';
import { ChatInput } from "@/components/chat-input"
import { convertToLegalXml } from "@/lib/utils"
interface ChatPanelProps {
    onDisplayChart: (xml: string) => void;
    onFetchChart: () => Promise<string>;
}

export default function ChatPanel({ onDisplayChart, onFetchChart }: ChatPanelProps) {
    // Add a step counter to track updates
    const stepCounterRef = useRef<number>(0);
    // Add state for file attachments
    const [files, setFiles] = useState<FileList | undefined>(undefined);

    // Remove the currentXmlRef and related useEffect
    const { messages, input, handleInputChange, handleSubmit, status, error, setInput, setMessages, data } = useChat({
        maxSteps: 5,
        async onToolCall({ toolCall }) {
            console.log("Tool call:", toolCall);
            console.log("Tool call name:", toolCall.toolName);
            console.log("Tool call arguments:", toolCall.args);
            if (toolCall.toolName === "display_diagram") {
                const { xml } = toolCall.args as { xml: string };
                onDisplayChart(xml);
                return "Successfully displayed the flowchart.";
            }
        },
        onError: (error) => {
            console.error("Chat error:", error);
        }
    })
    const messagesEndRef = useRef<HTMLDivElement>(null)
    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
        console.log("Data updated:", data);
    }, [messages])

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim() && status !== "streaming") {
            try {
                // Fetch chart data before setting input
                const chartXml = await onFetchChart();

                // Now use the fetched data to set input
                setInput(
                    `
                    Current diagram XML:
                    """xml
                    ${chartXml}
                    """
                    User input:
                    """md
                    ${input}
                    """
                    `
                )
                handleSubmit(e, {
                    experimental_attachments: files,
                })

                // Clear files after submission
                setFiles(undefined);
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        }
    }

    // Helper function to handle file changes
    const handleFileChange = (newFiles: FileList | undefined) => {
        setFiles(newFiles);
    }

    // Helper function to render tool invocations
    const renderToolInvocation = (toolInvocation: any) => {
        const callId = toolInvocation.toolCallId;

        switch (toolInvocation.toolName) {
            case 'display_diagram': {
                switch (toolInvocation.state) {
                    case 'partial-call': {
                        const currentXml = toolInvocation.args?.xml || "";

                        // Increment the step counter
                        stepCounterRef.current += 1;
                        // Log the current step

                        // Determine whether to show details based on a simple threshold
                        // Rather than comparing lengths (which can cause re-renders)
                        if (stepCounterRef.current >= 20 && stepCounterRef.current % 20 === 0) {
                            onDisplayChart(convertToLegalXml(currentXml));
                        }
                        return (
                            <div key={callId} className="mt-2 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                                <div className="font-medium">Generating diagram...</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Tool: display_diagram
                                    <div className="mt-1 font-mono text-xs">
                                        onDisplayChart
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    case 'call':
                        return (
                            <div key={callId} className="mt-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                <div className="font-medium">Displaying diagram...</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Tool: display_diagram
                                    <div className="mt-1 font-mono text-xs">
                                        Args: {JSON.stringify(toolInvocation.args, null, 2)}
                                    </div>
                                </div>
                            </div>
                        );
                    case 'result':
                        return (
                            <div key={callId} className="mt-2 text-sm bg-green-50 p-2 rounded border border-green-200">
                                <div className="font-medium">Diagram generated</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Result: {toolInvocation.result}
                                </div>
                            </div>
                        );
                }
                break;
            }
            default:
                return null;
        }
    };

    return (
        <Card className="h-full flex flex-col rounded-none py-0">
            <CardHeader className="p-2 text-center">
                <CardTitle>Chat with Diagram Generator</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-4">
                <ScrollArea className="h-full pr-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            <p>Start a conversation to generate or modify diagrams.</p>
                            <p className="text-sm mt-2">Try: "Create a flowchart for user authentication"</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                <div
                                    className={`inline-block px-4 py-2 whitespace-pre-wrap text-sm rounded-lg max-w-[85%] break-words ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {/* Render message content based on parts if available */}
                                    {message.parts ? (
                                        message.parts.map((part, index) => {
                                            switch (part.type) {
                                                case 'text':
                                                    return <div key={index}>{part.text}</div>;
                                                case 'tool-invocation':
                                                    return renderToolInvocation(part.toolInvocation);
                                                default:
                                                    return null;
                                            }
                                        })
                                    ) : (
                                        // Fallback to simple content for older format
                                        message.content
                                    )}
                                </div>

                                {/* Display image attachments */}
                                {message?.experimental_attachments?.filter(attachment =>
                                    attachment?.contentType?.startsWith('image/')
                                ).map((attachment, index) => (
                                    <div key={`${message.id}-${index}`} className={`mt-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                        <div className="inline-block">
                                            <Image
                                                src={attachment.url}
                                                width={200}
                                                height={200}
                                                alt={attachment.name ?? `attachment-${index}`}
                                                className="rounded-md border"
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Legacy support for function_call format */}
                                {(message as any).function_call && (
                                    <div className="mt-2 text-left">
                                        <div className="text-xs text-gray-500">
                                            Using tool: {(message as any).function_call.name}...
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            Error: {error.message}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-2">
                <ChatInput
                    input={input}
                    status={status}
                    onSubmit={onFormSubmit}
                    onChange={handleInputChange}
                    setMessages={setMessages}
                    onDisplayChart={onDisplayChart}
                    files={files}
                    onFileChange={handleFileChange}
                />
            </CardFooter>
        </Card>
    )
}
