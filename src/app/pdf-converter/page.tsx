'use client';

import { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import PptxGenJS from 'pptxgenjs';

export default function PdfConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState<'docx' | 'pptx'>('docx');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setPdfLibLoaded(true);
      };
      document.body.appendChild(script);
    } else if ((window as any).pdfjsLib) {
      setPdfLibLoaded(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
      setStatusMessage(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    if (!pdfLibLoaded) {
      setError('PDF processor is still loading. Please wait a second and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Analyzing PDF layout and coordinates...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      let allPagesStructuredRows: { text: string; x: number; y: number }[][] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract items with exact X and Y coordinates
        let items = textContent.items.map((item: any) => ({
          text: item.str,
          x: Math.round(item.transform[4]),
          y: Math.round(item.transform[5]),
        })).filter(item => item.text.trim().length > 0);

        // Sort items vertically (top to bottom, descending Y in PDF coordinate space) then left to right
        items.sort((a, b) => {
          if (Math.abs(a.y - b.y) > 5) {
            return b.y - a.y; // Higher Y coordinate comes first in standard PDF rendering
          }
          return a.x - b.x; // Left to right
        });

        // Group into lines based on Y coordinate proximity (within 6 pixels)
        let lines: { text: string; x: number; y: number }[][] = [];
        let currentLine: { text: string; x: number; y: number }[] = [];
        let lastY = -1;

        items.forEach(item => {
          if (lastY === -1 || Math.abs(item.y - lastY) <= 6) {
            currentLine.push(item);
          } else {
            if (currentLine.length > 0) lines.push(currentLine);
            currentLine = [item];
          }
          lastY = item.y;
        });
        if (currentLine.length > 0) lines.push(currentLine);

        allPagesStructuredRows.push(lines.map(line => ({
          text: line.map(i => i.text).join('   '), // preserve spacing between columns
          x: line[0].x,
          y: line[0].y
        })));
      }

      if (outputType === 'docx') {
        setStatusMessage('Building structured Word document (.docx)...');
        
        let docChildren: any[] = [
          new Paragraph({
            text: `Converted Document: ${selectedFile.name}`,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({ text: "" }),
        ];

        allPagesStructuredRows.forEach((pageRows, pageIdx) => {
          docChildren.push(
            new Paragraph({
              text: `Page ${pageIdx + 1}`,
              heading: HeadingLevel.HEADING_2,
            })
          );

          pageRows.forEach(row => {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: row.text,
                    size: 22,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          });
        });

        const doc = new Document({
          sections: [{ properties: {}, children: docChildren }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${selectedFile.name.replace(/\.[^/.]+$/, '')}-editable.docx`);

      } else {
        setStatusMessage('Building structured PowerPoint presentation (.pptx)...');
        
        const pres = new PptxGenJS();
        
        allPagesStructuredRows.forEach((pageRows, pageIdx) => {
          let slide = pres.addSlide();
          
          slide.addText(`${selectedFile.name} - Page ${pageIdx + 1}`, { 
            x: 0.8, y: 0.4, fontSize: 16, bold: true, color: '2563eb' 
          });

          // Combine rows into clean text blocks that fit nicely on the slide
          const pageTextString = pageRows.map(r => r.text).join('\n');
          
          slide.addText(pageTextString || "Empty page", {
            x: 0.8,
            y: 1.1,
            w: '85%',
            h: '80%',
            fontSize: 11,
            color: '334155',
            valign: 'top',
          });
        });

        const blob = (await pres.write({ outputType: 'blob' })) as Blob;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${selectedFile.name.replace(/\.[^/.]+$/, '')}-editable.pptx`);
      }

      setStatusMessage('Conversion complete! Your editable file has downloaded.');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to extract structured text. Please try another file.');
      setLoading(false);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          PDF to Word & PowerPoint Converter
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-8">
          Extract editable text, alignments, and structured rows directly from PDFs into DOCX or PPTX. 100% client-side.
        </p>

        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          {error && (
            <div className="w-full bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          {statusMessage && (
            <div className="w-full bg-blue-950/50 border border-blue-800 text-blue-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {statusMessage}
            </div>
          )}

          <div className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 transition rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 relative">
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <svg className="w-12 h-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-300">
              {selectedFile ? selectedFile.name : "Drag & drop a PDF file here, or browse"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Extracts clean, fully editable text and rows</p>
          </div>

          {selectedFile && (
            <div className="w-full mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-200 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-xs text-slate-400 whitespace-nowrap">Convert to:</label>
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value as 'docx' | 'pptx')}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 w-full md:w-auto"
                >
                  <option value="docx">Word (.docx - Editable)</option>
                  <option value="pptx">PowerPoint (.pptx - Editable)</option>
                </select>
              </div>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={handleConvert}
              disabled={loading || !pdfLibLoaded}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50"
            >
              {loading ? 'Extracting Layout & Text...' : !pdfLibLoaded ? 'Loading Processor...' : `Convert to ${outputType.toUpperCase()} (Editable Text)`}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
