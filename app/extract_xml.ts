import * as pako from 'pako';

export function extractDiagramXML(xml_svg_string: string): string {
    try {
        // 1. Parse the SVG string (using built-in DOMParser in a browser-like environment)
        const svgString = atob(xml_svg_string.slice(26));
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) {
            throw new Error("No SVG element found in the input string.");
        }
        // 2. Extract the 'content' attribute
        const encodedContent = svgElement.getAttribute('content');

        if (!encodedContent) {
            throw new Error("SVG element does not have a 'content' attribute.");
        }

        // 3. Decode HTML entities (using a minimal function)
        function decodeHtmlEntities(str: string) {
            const textarea = document.createElement('textarea'); // Use built-in element
            textarea.innerHTML = str;
            return textarea.value;
        }
        const xmlContent = decodeHtmlEntities(encodedContent);

        // 4. Parse the XML content
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        const diagramElement = xmlDoc.querySelector('diagram');

        if (!diagramElement) {
            throw new Error("No diagram element found");
        }
        // 5. Extract base64 encoded data
        const base64EncodedData = diagramElement.textContent;

        if (!base64EncodedData) {
            throw new Error("No encoded data found in the diagram element");
        }

        // 6. Decode base64 data
        const binaryString = atob(base64EncodedData);

        // 7. Convert binary string to Uint8Array
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 8. Decompress data using pako (equivalent to zlib.decompress with wbits=-15)
        const decompressedData = pako.inflate(bytes, { windowBits: -15 });

        // 9. Convert the decompressed data to a string
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(decompressedData);

        // Decode URL-encoded content (equivalent to Python's urllib.parse.unquote)
        const urlDecodedString = decodeURIComponent(decodedString);

        return urlDecodedString;

    } catch (error) {
        console.error("Error extracting diagram XML:", error);
        throw error; // Re-throw for caller handling
    }
}
