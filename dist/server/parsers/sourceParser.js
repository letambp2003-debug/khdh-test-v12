"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceParser = void 0;
const adm_zip_1 = __importDefault(require("adm-zip"));
class SourceParser {
    static ping() {
        return {
            ok: true,
            parsers: ['DOCX_XML_EXTRACTOR', 'PDF_STREAM_EXTRACTOR', 'PL1_TABLE_PARSER', 'SGK_LOCATOR_PARSER']
        };
    }
    /**
     * True XML & text parser for DOCX files using AdmZip
     */
    static parseDocxBuffer(buffer) {
        try {
            if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
                const zip = new adm_zip_1.default(buffer);
                const docEntry = zip.getEntry('word/document.xml');
                if (docEntry) {
                    const xml = docEntry.getData().toString('utf8');
                    // Extract text with clean paragraph line breaks
                    const cleanText = xml
                        .replace(/<w:p[^>]*>/g, '\n')
                        .replace(/<w:tab[^>]*\/>/g, '\t')
                        .replace(/<w:br[^>]*\/>/g, '\n')
                        .replace(/<w:t[^>]*>(.*?)<\/w:t>/g, '$1')
                        .replace(/<[^>]+>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&apos;/g, "'")
                        .replace(/\n\s*\n/g, '\n')
                        .trim();
                    const mediaCount = zip.getEntries().filter(e => e.entryName.startsWith('word/media/')).length;
                    return {
                        text: cleanText,
                        metadata: { byteLength: buffer.length, format: 'DOCX_ZIP_XML' },
                        tables: [],
                        imagesFound: mediaCount
                    };
                }
            }
        }
        catch (err) {
            console.warn('[SourceParser] AdmZip warning, falling back to raw scan:', err);
        }
        // Fallback if not zip or uncompressed XML
        const rawString = buffer.toString('utf8');
        const textMatches = [];
        const textRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
        let match;
        while ((match = textRegex.exec(rawString)) !== null) {
            if (match[1]) {
                textMatches.push(match[1]);
            }
        }
        let fullText = textMatches.join(' ');
        if (!fullText || fullText.trim().length === 0) {
            fullText = buffer.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
        }
        return {
            text: fullText.trim(),
            metadata: { byteLength: buffer.length, format: 'RAW_FALLBACK' },
            tables: [],
            imagesFound: rawString.includes('word/media') ? 1 : 0
        };
    }
    /**
     * Asynchronous text parser for PDF files using pdf-parse
     */
    static async parsePdfBuffer(buffer) {
        try {
            const pdf = require('pdf-parse');
            const data = await pdf(buffer);
            return {
                text: (data.text || '').trim(),
                metadata: {
                    numpages: data.numpages || 1,
                    info: data.info || {},
                    byteLength: buffer.length,
                    format: 'PDF_PARSE'
                },
                tables: [],
                imagesFound: 0
            };
        }
        catch (e) {
            return this.parsePdfBufferSync(buffer);
        }
    }
    /**
     * Synchronous fallback text parser for PDF files
     */
    static parsePdfBufferSync(buffer) {
        const rawString = buffer.toString('latin1');
        const textBlocks = [];
        const streamRegex = /BT[\s\S]*?ET/g;
        let streamMatch;
        while ((streamMatch = streamRegex.exec(rawString)) !== null) {
            const block = streamMatch[0];
            const tjRegex = /\((.*?)\)\s*Tj/g;
            let tjMatch;
            while ((tjMatch = tjRegex.exec(block)) !== null) {
                if (tjMatch[1])
                    textBlocks.push(tjMatch[1]);
            }
        }
        let text = textBlocks.join(' ');
        if (text.length < 20) {
            text = buffer.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
        }
        return {
            text: text.trim(),
            metadata: { byteLength: buffer.length, format: 'PDF_SYNC_FALLBACK' },
            tables: [],
            imagesFound: rawString.includes('/XObject') ? 2 : 0
        };
    }
}
exports.SourceParser = SourceParser;
