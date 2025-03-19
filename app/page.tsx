"use client";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DrawIoEmbed, DrawIoEmbedRef } from "react-drawio";

import { Thread } from "@/components/assistant-ui/thread";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractDiagramXML } from "./extract_xml"
export default function Home() {
    const runtime = useChatRuntime({
        api: "/api/chat",
    });

    const drawioRef = useRef<DrawIoEmbedRef>(null);
    const [imgData, setImgData] = useState<string | null>(null);
    const [diagram, setDiagram] = useState<string>("");
    // const handleExport = () => {};
    const handleExport = () => {
        if (drawioRef.current) {
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            });
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (drawioRef.current) {
            drawioRef.current.load({
                xml: diagram,
            });
        }
    };
    console.log("imgData", imgData);
    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <div className="grid h-dvh grid-cols-[1fr_400px] gap-x-2 px-4 py-4">
                <DrawIoEmbed
                    ref={drawioRef}
                    onExport={(data) => setImgData(data.data)}
                    urlParameters={{
                        // ui: "kennedy",
                        spin: true,
                        libraries: false,
                        saveAndExit: false,
                        noExitBtn: true,
                    }}
                />
                {/* <Thread /> */}
                <div className="flex flex-col gap-2">
                    <form>
                        <div className="mb-4">
                            <label htmlFor="diagramXml" className="block text-sm font-medium mb-1">
                                Diagram XML
                            </label>
                            <textarea
                                id="diagramXml"
                                className="w-full p-2 border border-gray-300 rounded-md min-h-[200px]"
                                placeholder="Paste your diagram XML here..."
                                value={diagram || ''}
                                onChange={(e) => setDiagram(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSubmit}>submit</Button>
                    </form>
                    <div>
                        <div className="bg-amber-300 w-full h-[400px]">{imgData &&
                            <>
                                {/* <img src={imgData} /> */}
                                <div className="bg-blue-100 h-[400px] p-4 overflow-auto">
                                    <h1 className="font-semibold mb-2">Extracted XML</h1>
                                    {(() => {
                                        try {
                                            const extractedXml = extractDiagramXML(imgData);
                                            return <pre className="whitespace-pre-wrap text-sm">{extractedXml}</pre>;
                                        } catch (error) {
                                            return (
                                                <div className="text-red-600">
                                                    Error extracting XML: {error instanceof Error ? error.message : 'Unknown error'}
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </>}
                            <Button onClick={handleExport}>Export</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AssistantRuntimeProvider>
    );
}
