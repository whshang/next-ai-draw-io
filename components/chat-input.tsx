"use client"

import React, { useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Trash } from "lucide-react"

interface ChatInputProps {
    input: string
    status: "submitted" | "streaming" | "ready" | "error"
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    setMessages: (messages: any[]) => void
}

export function ChatInput({ input, status, onSubmit, onChange, setMessages }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea based on content
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [])

    useEffect(() => {
        adjustTextareaHeight()
    }, [input, adjustTextareaHeight])

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            const form = e.currentTarget.closest("form")
            if (form && input.trim() && status !== "streaming") {
                form.requestSubmit()
            }
        }
    }

    return (
        <form onSubmit={onSubmit} className="w-full space-y-2">
            <Textarea
                ref={textareaRef}
                value={input}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder="Describe what changes you want to make to the diagram... (Press Cmd/Ctrl + Enter to send)"
                disabled={status === "streaming"}
                aria-label="Chat input"
                className="min-h-[80px] resize-none transition-all duration-200"
            />
            <div className="flex justify-between gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => setMessages([])}
                    title="Clear messages"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Start a new conversation
                </Button>
                <Button
                    type="submit"
                    disabled={status === "streaming" || !input.trim()}
                    className="transition-opacity"
                    aria-label={status === "streaming" ? "Sending message..." : "Send message"}
                >
                    {status === "streaming" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Send
                </Button>
            </div>
        </form>
    )
}
