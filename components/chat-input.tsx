"use client"

import React, { useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Trash, Image as ImageIcon, X } from "lucide-react"
import Image from "next/image"

interface ChatInputProps {
    input: string
    status: "submitted" | "streaming" | "ready" | "error"
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    setMessages: (messages: any[]) => void
    files?: FileList
    onFileChange?: (files: FileList | undefined) => void
}

export function ChatInput({
    input,
    status,
    onSubmit,
    onChange,
    setMessages,
    files,
    onFileChange
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Handle file changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFileChange) {
            onFileChange(e.target.files || undefined)
        }
    }

    // Clear file selection
    const clearFiles = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        if (onFileChange) {
            onFileChange(undefined)
        }
    }

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    return (
        <form onSubmit={onSubmit} className="w-full space-y-2">
            {/* File preview area */}
            {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/50 rounded-md">
                    {Array.from(files).map((file, index) => (
                        <div key={index} className="relative group">
                            <div className="w-20 h-20 border rounded-md overflow-hidden bg-muted">
                                {file.type.startsWith('image/') ? (
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-center p-1">
                                        {file.name}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={clearFiles}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove file"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
                <div className="flex gap-2">
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
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={triggerFileInput}
                        disabled={status === "streaming"}
                        title="Upload image"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        disabled={status === "streaming"}
                    />
                </div>

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
