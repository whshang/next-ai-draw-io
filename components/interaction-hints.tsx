"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiagram } from "@/contexts/diagram-context";
import { Lightbulb, Plus, Edit, Shuffle } from "lucide-react";

interface InteractionHintsProps {
    onSuggestionClick: (suggestion: string) => void;
}

export function InteractionHints({ onSuggestionClick }: InteractionHintsProps) {
    const { chartXML } = useDiagram();
    
    const hasContent = chartXML && chartXML.trim() !== "";
    
    const suggestions = hasContent ? [
        {
            icon: <Edit className="h-3 w-3" />,
            text: "修改现有元素的样式和颜色",
            prompt: "请修改图表中的元素样式，使用更现代的颜色方案"
        },
        {
            icon: <Plus className="h-3 w-3" />,
            text: "添加新的元素或连接",
            prompt: "在现有图表基础上添加一个新的流程步骤"
        },
        {
            icon: <Shuffle className="h-3 w-3" />,
            text: "重新组织布局",
            prompt: "重新排列图表元素，使布局更加清晰美观"
        }
    ] : [
        {
            icon: <Plus className="h-3 w-3" />,
            text: "创建流程图",
            prompt: "创建一个用户注册流程的流程图"
        },
        {
            icon: <Plus className="h-3 w-3" />,
            text: "创建组织架构图",
            prompt: "创建一个公司组织架构图"
        },
        {
            icon: <Plus className="h-3 w-3" />,
            text: "创建思维导图",
            prompt: "创建一个项目规划的思维导图"
        }
    ];

    return (
        <Card className="mb-2 bg-amber-50 border-amber-200">
            <div className="p-3">
                <div className="flex items-center gap-2 text-sm text-amber-700 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>{hasContent ? "你可以这样操作：" : "试试这些建议："}</span>
                </div>
                
                <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => onSuggestionClick(suggestion.prompt)}
                            className="h-auto p-2 justify-start text-left text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100 w-full"
                        >
                            <div className="flex items-center gap-2">
                                {suggestion.icon}
                                <span>{suggestion.text}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </Card>
    );
}