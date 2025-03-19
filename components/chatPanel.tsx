"use client"

import type React from "react"
import { useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"
import { useChat } from '@ai-sdk/react';
import { ToolInvocation } from 'ai';


interface ChatPanelProps {
    onDisplayChart: (xml: string) => void;
    onFetchChart: () => Promise<string>; // Change return type to Promise<string>
}

export default function ChatPanel({ onDisplayChart, onFetchChart }: ChatPanelProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, addToolResult } = useChat({
        async onToolCall({ toolCall }) {
            console.log("Tool call:", toolCall);
            console.log("Tool call name:", toolCall.toolName);
            console.log("Tool call arguments:", toolCall.args);

            if (toolCall.toolName === "display_flow_chart") {
                const { xml } = toolCall.args as { xml: string };
                onDisplayChart(xml);
                return "Displaying the flowchart...";
            } else if (toolCall.toolName === "fetch_flow_chart") {
                const currentXML = await onFetchChart();
                console.log("Current XML:", currentXML);
                return currentXML;
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
    }, [messages])

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim() && !isLoading) {
            handleSubmit(e)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
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
                                    className={`inline-block px-4 py-2 rounded-lg max-w-[85%] break-words ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {message.content}
                                </div>
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
            <CardFooter className="pt-2">
                <form onSubmit={onFormSubmit} className="w-full flex space-x-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Describe what changes you want to make to the diagram..."
                        disabled={isLoading}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
