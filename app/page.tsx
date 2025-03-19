"use client";
import { DrawIoEmbed, DrawIoEmbedRef } from "react-drawio";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractDiagramXML } from "./extract_xml";
import ChatPanel from "@/components/chatPanel";

export default function Home() {
    const drawioRef = useRef<DrawIoEmbedRef>(null);
    const [chartXML, setChartXML] = useState<string>("");
    // Add a ref to store the resolver function
    const resolverRef = useRef<((value: string) => void) | null>(null);

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

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-2/3 p-1">
                <DrawIoEmbed
                    ref={drawioRef}
                    onExport={(data) => {
                        const extractedXML = extractDiagramXML(data.data);
                        setChartXML(extractedXML);
                        // If there's a pending resolver, resolve it with the fresh XML
                        if (resolverRef.current) {
                            resolverRef.current(extractedXML);
                            resolverRef.current = null;
                        }
                    }}
                    urlParameters={{
                        spin: true,
                        libraries: false,
                        saveAndExit: false,
                        noExitBtn: true,
                    }}
                />
            </div>
            <Button
                onClick={handleExport}
            >export </Button>
            <div className="w-1/3 p-1 border-gray-300">
                <ChatPanel
                    onDisplayChart={(xml) => loadDiagram(xml)}
                    onFetchChart={() => {
                        return new Promise<string>((resolve) => {
                            // Store the resolver so onExport can use it
                            resolverRef.current = resolve;
                            // Trigger the export
                            handleExport();
                        });
                    }}
                />
            </div>
        </div>
    );
}
