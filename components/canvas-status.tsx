"use client";

import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDiagram } from "@/contexts/diagram-context";
import { Eye, FileText, Play, Square, Activity } from "lucide-react";

export function CanvasStatus() {
    const { 
        chartXML, 
        startAutoMonitoring, 
        stopAutoMonitoring, 
        isAutoMonitoring 
    } = useDiagram();
    
    // Parse XML to get basic info about the diagram
    const getDiagramInfo = (xml: string) => {
        if (!xml || xml.trim() === "") {
            return { hasContent: false, elementCount: 0 };
        }
        
        try {
            // Count mxCell elements (excluding root cells)
            const cellMatches = xml.match(/<mxCell[^>]*id="(?!0|1)"/g);
            const elementCount = cellMatches ? cellMatches.length : 0;
            
            return {
                hasContent: elementCount > 0,
                elementCount
            };
        } catch (error) {
            return { hasContent: false, elementCount: 0 };
        }
    };

    const diagramInfo = getDiagramInfo(chartXML);

    // 组件挂载时自动开始监控
    useEffect(() => {
        startAutoMonitoring();
        return () => {
            stopAutoMonitoring();
        };
    }, [startAutoMonitoring, stopAutoMonitoring]);

    const handleToggleMonitoring = () => {
        if (isAutoMonitoring) {
            stopAutoMonitoring();
        } else {
            startAutoMonitoring();
        }
    };

    return (
        <Card className={`p-3 mb-2 ${
            diagramInfo.hasContent 
                ? "bg-blue-50 border-blue-200" 
                : "bg-gray-50 border-dashed"
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    {diagramInfo.hasContent ? (
                        <>
                            <Eye className="h-4 w-4 text-blue-700" />
                            <span className="text-blue-700">
                                AI可以看到当前图表 ({diagramInfo.elementCount} 个元素)
                            </span>
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">画布为空 - AI将创建新图表</span>
                        </>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {isAutoMonitoring && (
                        <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleMonitoring}
                        className="h-6 px-2 text-xs"
                    >
                        {isAutoMonitoring ? (
                            <>
                                <Square className="h-3 w-3 mr-1" />
                                停止监控
                            </>
                        ) : (
                            <>
                                <Play className="h-3 w-3 mr-1" />
                                开始监控
                            </>
                        )}
                    </Button>
                </div>
            </div>
            
            {diagramInfo.hasContent && (
                <div className="text-xs text-blue-600 mt-1">
                    {isAutoMonitoring ? "正在自动监控画布变化" : "你可以要求AI修改、扩展或重新组织现有内容"}
                </div>
            )}
        </Card>
    );
}