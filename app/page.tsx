"use client";
import { DrawIoEmbed, DrawIoEmbedRef } from "react-drawio";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractDiagramXML } from "./extract_xml";
import ChatPanel from "@/components/chatPanel";

export default function Home() {
    const drawioRef = useRef<DrawIoEmbedRef>(null);
    const [chartXML, setChartXML] = useState<string>("");
    const [diagram, setDiagram] = useState<string>("");
    // const handleExport = () => {};
    const handleExport = () => {
        // use this function to export the diagramxml from the drawio editor
        if (drawioRef.current) {
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            });
        }
    };
    const loadDiagram = (chart: string) => {
        // use this function to display the diagramxml in the drawio editor
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
                    onExport={(data) => setChartXML(extractDiagramXML(data.data))}
                    urlParameters={{
                        // ui: "kennedy",
                        spin: true,
                        libraries: false,
                        saveAndExit: false,
                        noExitBtn: true,
                    }}
                />
            </div>
            <div className="w-1/3 p-1  border-gray-300 ">
                <ChatPanel />
            </div>
        </div>
    );
}
