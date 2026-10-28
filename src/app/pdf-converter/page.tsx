'use client';

import { useState, useEffect } from 'react';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
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
    setStatusMessage('Rendering PDF pages with exact layout & visuals...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      let pageImageDatas: { dataUrl: string; width: number; height: number }[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setStatusMessage(`Rendering page ${i} of ${pdfDoc.numPages} (preserving colors & tables)...`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        pageImageDatas.push({ dataUrl, width: viewport.width, height: viewport.height });
      }

      if (outputType === 'docx') {
        setStatusMessage('Embedding visual pages into Word document (.docx)...');
        
        let docParagraphs: any[] = [];

        for (const pageImg of pageImageDatas) {
          const base64Data = pageImg.dataUrl.split(',')[1];
          const binaryStr = atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let j = 0; j < len; j++) {
            bytes[j] = binaryStr.charCodeAt(j);
          }

          const displayWidth = 550;
          const displayHeight = (pageImg.height / pageImg.width) * displayWidth;

          docParagraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  buffer: bytes,
                  transformation: {
                    width: displayWidth,
                    height: displayHeight,
                  },
                } as any),
              ],
              spacing: { after: 300 },
            })
          );
        }

        const doc = new Document({
          sections: [{ properties: {}, children: docParagraphs }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${selectedFile.name.replace(/\.[^/.]+$/, '')}-exact.docx`);

      } else {
        setStatusMessage('Building exact-match PowerPoint presentation (.pptx)...');
        
        const pres = new PptxGenJS();
        pres.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });

        for (const pageImg of pageImageDatas) {
          let slide = pres.addSlide();
          slide.background = { color: "FFFFFF" };
          
          slide.addImage({
            data: pageImg.dataUrl,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
          });
        }

        const blob = (await pres.write({ outputType: 'blob' })) as Blob;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${selectedFile.name.replace(/\.[^/.]+$/, '')}-exact.pptx`);
      }

      setStatusMessage('Conversion complete! Your exact-match file has downloaded.');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to render PDF layout. Please try another file.');
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
          Convert PDF files into exact visual DOCX or PPTX formats with 100% color, table, and layout fidelity. 100% private & client-side.
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
            <p className="text-xs text-slate-500 mt-1">Preserves 100% layout, colors, tables, and pictures</p>
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
                  <option value="docx">Word (.docx)</option>
                  <option value="pptx">PowerPoint (.pptx)</option>
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
              {loading ? 'Rendering Exact Layout...' : !pdfLibLoaded ? 'Loading Processor...' : `Convert to ${outputType.toUpperCase()} (Exact Match)`}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
