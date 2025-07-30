"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResetWarningModal } from "@/components/reset-warning-modal";
import {
    Loader2,
    Send,
    RotateCcw,
    Image as ImageIcon,
    History,
} from "lucide-react";
import { ButtonWithTooltip } from "@/components/button-with-tooltip";
import { FilePreviewList } from "./file-preview-list";
import { useDiagram } from "@/contexts/diagram-context";
import { HistoryDialog } from "@/components/history-dialog";

interface ChatInputProps {
    input: string;
    status: "submitted" | "streaming" | "ready" | "error";
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onClearChat: () => void;
    files?: File[];
    onFileChange?: (files: File[]) => void;
    showHistory?: boolean;
    onToggleHistory?: (show: boolean) => void;
    isReadingCanvas?: boolean;
}

export function ChatInput({
    input,
    status,
    onSubmit,
    onChange,
    onClearChat,
    files = [],
    onFileChange = () => {},
    showHistory = false,
    onToggleHistory = () => {},
    isReadingCanvas = false,
}: ChatInputProps) {
    const { diagramHistory } = useDiagram();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);

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

    // Handle keyboard shortcuts and paste events
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form && input.trim() && status !== "streaming") {
                form.requestSubmit();
            }
        }
    };

    // Handle clipboard paste
    const handlePaste = async (e: React.ClipboardEvent) => {
        if (status === "streaming") return;

        const items = e.clipboardData.items;
        const imageItems = Array.from(items).filter((item) =>
            item.type.startsWith("image/")
        );

        if (imageItems.length > 0) {
            const imageFiles = await Promise.all(
                imageItems.map(async (item) => {
                    const file = item.getAsFile();
                    if (!file) return null;
                    // Create a new file with a unique name
                    return new File(
                        [file],
                        `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
                        {
                            type: file.type,
                        }
                    );
                })
            );

            const validFiles = imageFiles.filter(
                (file): file is File => file !== null
            );
            if (validFiles.length > 0) {
                onFileChange([...files, ...validFiles]);
            }
        }
    };

    // Handle file changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        onFileChange([...files, ...newFiles]);
    };

    // Remove individual file
    const handleRemoveFile = (fileToRemove: File) => {
        onFileChange(files.filter((file) => file !== fileToRemove));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Handle drag events
    const handleDragOver = (e: React.DragEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (status === "streaming") return;

        const droppedFiles = e.dataTransfer.files;

        // Only process image files
        const imageFiles = Array.from(droppedFiles).filter((file) =>
            file.type.startsWith("image/")
        );

        if (imageFiles.length > 0) {
            onFileChange([...files, ...imageFiles]);
        }
    };

    // Handle clearing conversation and diagram
    const handleClear = () => {
        onClearChat();
        setShowClearDialog(false);
    };

    return (
        <form
            onSubmit={onSubmit}
            className={`w-full space-y-2 ${
                isDragging
                    ? "border-2 border-dashed border-primary p-4 rounded-lg bg-muted/20"
                    : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <FilePreviewList files={files} onRemoveFile={handleRemoveFile} />

            <Textarea
                ref={textareaRef}
                value={input}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="描述你想对图表做什么修改，或上传图片来复制图表。AI可以看到当前画布内容并基于它进行修改。(按 Cmd/Ctrl + Enter 发送)"
                disabled={status === "streaming"}
                aria-label="Chat input"
                className="min-h-[80px] resize-none transition-all duration-200 px-1 py-0"
            />

            <div className="flex items-center gap-2">
                <div className="mr-auto">
                    <ButtonWithTooltip
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowClearDialog(true)}
                        tooltipContent="Clear current conversation and diagram"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                    </ButtonWithTooltip>

                    {/* Warning Modal */}
                    <ResetWarningModal
                        open={showClearDialog}
                        onOpenChange={setShowClearDialog}
                        onClear={handleClear}
                    />

                    <HistoryDialog
                        showHistory={showHistory}
                        onToggleHistory={onToggleHistory}
                    />
                </div>
                <div className="flex gap-2">
                    {/* History Button */}
                    <ButtonWithTooltip
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onToggleHistory(true)}
                        disabled={
                            status === "streaming" ||
                            diagramHistory.length === 0
                        }
                        title="Diagram History"
                        tooltipContent="View diagram history"
                    >
                        <History className="h-4 w-4" />
                    </ButtonWithTooltip>

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
                    disabled={status === "streaming" || !input.trim() || isReadingCanvas}
                    className="transition-opacity"
                    aria-label={
                        isReadingCanvas
                            ? "Reading canvas..."
                            : status === "streaming"
                            ? "Sending message..."
                            : "Send message"
                    }
                >
                    {isReadingCanvas ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reading Canvas
                        </>
                    ) : status === "streaming" ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Send
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
