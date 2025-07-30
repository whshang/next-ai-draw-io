"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import type { DrawIoEmbedRef } from "react-drawio";
import { extractDiagramXML } from "../lib/utils";

interface DiagramContextType {
    chartXML: string;
    latestSvg: string;
    diagramHistory: { svg: string; xml: string }[];
    loadDiagram: (chart: string) => void;
    handleExport: () => void;
    resolverRef: React.Ref<((value: string) => void) | null>;
    drawioRef: React.Ref<DrawIoEmbedRef | null>;
    handleDiagramExport: (data: any) => void;
    clearDiagram: () => void;
    startAutoMonitoring: () => void;
    stopAutoMonitoring: () => void;
    isAutoMonitoring: boolean;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export function DiagramProvider({ children }: { children: React.ReactNode }) {
    const [chartXML, setChartXML] = useState<string>("");
    const [latestSvg, setLatestSvg] = useState<string>("");
    const [diagramHistory, setDiagramHistory] = useState<
        { svg: string; xml: string }[]
    >([]);
    const drawioRef = useRef<DrawIoEmbedRef | null>(null);
    const resolverRef = useRef<((value: string) => void) | null>(null);
    const monitoringRef = useRef<NodeJS.Timeout | null>(null);
    const isMonitoringRef = useRef<boolean>(false);
    const lastXMLRef = useRef<string>("");

    const handleExport = () => {
        if (drawioRef.current) {
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            });
        }
    };

    const loadDiagram = (chart: string) => {
        if (drawioRef.current) {
            drawioRef.current.load({
                xml: chart,
            });
        }
    };

    const handleDiagramExport = (data: any) => {
        const extractedXML = extractDiagramXML(data.data);
        
        // 避免处理相同的XML内容
        if (extractedXML === lastXMLRef.current) {
            // 如果有等待的resolver，仍然需要调用
            if (resolverRef.current) {
                resolverRef.current(extractedXML);
                resolverRef.current = null;
            }
            return;
        }

        lastXMLRef.current = extractedXML;
        setChartXML(extractedXML);
        setLatestSvg(data.data);
        
        // 只有在内容真正变化时才添加到历史记录
        setDiagramHistory((prev) => {
            // 检查是否与最后一个历史记录相同
            if (prev.length > 0 && prev[prev.length - 1].xml === extractedXML) {
                return prev;
            }
            return [
                ...prev,
                {
                    svg: data.data,
                    xml: extractedXML,
                },
            ];
        });

        if (resolverRef.current) {
            resolverRef.current(extractedXML);
            resolverRef.current = null;
        }

        // 如果是自动监控触发的，输出日志
        if (isMonitoringRef.current) {
            console.log("检测到画布变化，已更新内容");
        }
    };

    const clearDiagram = () => {
        const emptyDiagram = `<mxfile><diagram name="Page-1" id="page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`;
        loadDiagram(emptyDiagram);
        setChartXML(emptyDiagram);
        setLatestSvg("");
        setDiagramHistory([]);
        lastXMLRef.current = emptyDiagram;
    };

    const startAutoMonitoring = () => {
        // 停止现有的监控实例
        if (monitoringRef.current) {
            clearInterval(monitoringRef.current);
            monitoringRef.current = null;
        }

        if (isMonitoringRef.current) {
            console.log("监控已在运行，跳过启动");
            return;
        }

        isMonitoringRef.current = true;
        console.log("开始自动监控画布变化");

        // 每2秒检查一次画布变化
        monitoringRef.current = setInterval(() => {
            if (drawioRef.current && isMonitoringRef.current) {
                try {
                    drawioRef.current.exportDiagram({
                        format: "xmlsvg",
                    });
                } catch (error) {
                    console.error("自动导出图表失败:", error);
                }
            }
        }, 2000);
    };

    const stopAutoMonitoring = () => {
        console.log("停止自动监控画布变化");
        isMonitoringRef.current = false;
        
        if (monitoringRef.current) {
            clearInterval(monitoringRef.current);
            monitoringRef.current = null;
        }
    };

    // 组件卸载时清理监控
    React.useEffect(() => {
        return () => {
            stopAutoMonitoring();
        };
    }, []);

    return (
        <DiagramContext.Provider
            value={{
                chartXML,
                latestSvg,
                diagramHistory,
                loadDiagram,
                handleExport,
                resolverRef,
                drawioRef,
                handleDiagramExport,
                clearDiagram,
                startAutoMonitoring,
                stopAutoMonitoring,
                isAutoMonitoring: isMonitoringRef.current,
            }}
        >
            {children}
        </DiagramContext.Provider>
    );
}

export function useDiagram() {
    const context = useContext(DiagramContext);
    if (context === undefined) {
        throw new Error("useDiagram must be used within a DiagramProvider");
    }
    return context;
}
