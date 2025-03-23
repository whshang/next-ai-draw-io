"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, RotateCcw, Image as ImageIcon, X } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface ChatInputProps {
    input: string;
    status: "submitted" | "streaming" | "ready" | "error";
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    setMessages: (messages: any[]) => void;
    onDisplayChart: (xml: string) => void;
    files?: FileList;
    onFileChange?: (files: FileList | undefined) => void;
}

export function ChatInput({
    input,
    status,
    onSubmit,
    onChange,
    setMessages,
    onDisplayChart,
    files,
    onFileChange,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea based on content
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, []);

    useEffect(() => {
        adjustTextareaHeight();
    }, [input, adjustTextareaHeight]);

    // Handle clipboard paste events
    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            if (!onFileChange) return;

            const items = e.clipboardData.items;
            const imageItems = Array.from(items).filter(
                (item) => item.type.indexOf("image") !== -1
            );

            if (imageItems.length > 0) {
                e.preventDefault();

                // Convert clipboard image to File
                const file = imageItems[0].getAsFile();
                if (file) {
                    // Create a new FileList-like object
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);

                    // Pass to the existing file handler
                    onFileChange(dataTransfer.files);
                }
            }
        },
        [onFileChange]
    );

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form && input.trim() && status !== "streaming") {
                form.requestSubmit();
            }
        }
    };

    // Handle file changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFileChange) {
            onFileChange(e.target.files || undefined);
        }
    };

    // Clear file selection
    const clearFiles = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onFileChange) {
            onFileChange(undefined);
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={onSubmit} className="w-full space-y-2">
            {/* File preview area */}
            {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/50 rounded-md">
                    {Array.from(files).map((file, index) => (
                        <div key={index} className="relative group">
                            <div className="w-20 h-20 border rounded-md overflow-hidden bg-muted">
                                {file.type.startsWith("image/") ? (
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
                onPaste={handlePaste}
                placeholder="Describe what changes you want to make to the diagram... (Press Cmd/Ctrl + Enter to send)"
                disabled={status === "streaming"}
                aria-label="Chat input"
                className="min-h-[80px] resize-none transition-all duration-200"
            />

            <div className="flex items-center gap-2">
                <div className="mr-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setMessages([]);
                                        onDisplayChart(`<mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36" version="26.1.1">
                                            <diagram name="Page-1" id="NsivuNt5aJDXaP8udwGv">
                                                <mxGraphModel dx="394" dy="700" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
                                                    <root>
                                                    </root>
                                                </mxGraphModel>
                                            </diagram>
                                        </mxfile>`);
                                    }}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Clear current conversation and diagram
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex gap-2">
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
                    aria-label={
                        status === "streaming"
                            ? "Sending message..."
                            : "Send message"
                    }
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
    );
}
