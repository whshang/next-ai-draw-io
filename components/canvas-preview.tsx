"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiagram } from "@/contexts/diagram-context";
import { Eye, EyeOff, Code, ChevronDown, ChevronUp } from "lucide-react";

export function CanvasPreview() {
    const { chartXML } = useDiagram();
    const [showXML, setShowXML] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Parse XML to get element information
    const getElementInfo = (xml: string) => {
        if (!xml || xml.trim() === "") {
            return [];
        }
        
        try {
            const elements = [];
            const cellRegex = /<mxCell[^>]*id="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g;
            let match;
            
            while ((match = cellRegex.exec(xml)) !== null) {
                const [, id, value] = match;
                if (id !== "0" && id !== "1" && value) {
                    elements.push({ id, value: decodeURIComponent(value) });
                }
            }
            
            return elements;
        } catch (error) {
            return [];
        }
    };

    const elements = getElementInfo(chartXML);
    
    if (elements.length === 0) {
        return null;
    }

    return (
        <Card className="mb-2 bg-blue-50 border-blue-200">
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Eye className="h-4 w-4" />
                        <span>当前画布内容 ({elements.length} 个元素)</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-6 px-2 text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </Button>
                </div>
                
                {isExpanded && (
                    <div className="mt-3 space-y-2">
                        <div className="text-xs text-blue-600">
                            AI可以基于这些内容进行修改、扩展或重新组织：
                        </div>
                        
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {elements.map((element, index) => (
                                <div
                                    key={element.id}
                                    className="text-xs bg-white rounded px-2 py-1 border border-blue-200"
                                >
                                    <span className="font-mono text-gray-500">#{element.id}</span>
                                    <span className="ml-2">{element.value}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowXML(!showXML)}
                                className="h-6 px-2 text-xs"
                            >
                                <Code className="h-3 w-3 mr-1" />
                                {showXML ? "隐藏" : "查看"} XML
                            </Button>
                        </div>
                        
                        {showXML && (
                            <div className="mt-2">
                                <pre className="text-xs bg-gray-100 p-2 rounded border max-h-40 overflow-auto">
                                    {chartXML}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}