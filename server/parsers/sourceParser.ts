import AdmZip from 'adm-zip';

export interface ParsedSourceResult {
  text: string;
  metadata: Record<string, any>;
  tables: string[][][];
  imagesFound: number;
}

export class SourceParser {
  public static ping(): { ok: boolean; parsers: string[] } {
    return {
      ok: true,
      parsers: ['DOCX_XML_EXTRACTOR', 'PDF_STREAM_EXTRACTOR', 'PL1_TABLE_PARSER', 'SGK_LOCATOR_PARSER']
    };
  }

  /**
   * True XML & text parser for DOCX files using AdmZip
   */
  public static parseDocxBuffer(buffer: Buffer): ParsedSourceResult {
    try {
      if (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
        const zip = new AdmZip(buffer);
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
    } catch (err) {
      console.warn('[SourceParser] AdmZip warning, falling back to raw scan:', err);
    }

    // Fallback if not zip or uncompressed XML
    const rawString = buffer.toString('utf8');
    const textMatches: string[] = [];
    const textRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
    let match: RegExpExecArray | null;

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
  public static async parsePdfBuffer(buffer: Buffer): Promise<ParsedSourceResult> {
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
    } catch (e) {
      return this.parsePdfBufferSync(buffer);
    }
  }

  /**
   * Synchronous fallback text parser for PDF files
   */
  public static parsePdfBufferSync(buffer: Buffer): ParsedSourceResult {
    const rawString = buffer.toString('latin1');
    const textBlocks: string[] = [];

    const streamRegex = /BT[\s\S]*?ET/g;
    let streamMatch: RegExpExecArray | null;
    while ((streamMatch = streamRegex.exec(rawString)) !== null) {
      const block = streamMatch[0];
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch: RegExpExecArray | null;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        if (tjMatch[1]) textBlocks.push(tjMatch[1]);
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
