'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function PdfToolkitPage() {
  const [activeTab, setActiveTab] = useState<'merge' | 'split' | 'image'>('merge');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  // Tab State: Merge
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Tab State: Split
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);

  // Tab State: Image
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMessage('Merging PDFs...');
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      // Added "as any" to bypass strict Blob typing
      triggerDownload(new Blob([pdfBytes as any], { type: 'application/pdf' }), 'merged-document.pdf');
      setStatusMessage('Merge complete!');
    } catch (err) {
      setError('Failed to merge PDFs. Ensure files are valid.');
    }
    setLoading(false);
  };

  const handleSplit = async () => {
    if (!splitFile || startPage > endPage || startPage < 1) {
      setError('Please provide a valid file and page range.');
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMessage('Extracting pages...');
    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      
      if (endPage > totalPages) {
        throw new Error(`End page exceeds total pages (${totalPages}).`);
      }

      const newPdf = await PDFDocument.create();
      const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i);
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      // Added "as any" to bypass strict Blob typing
      triggerDownload(new Blob([pdfBytes as any], { type: 'application/pdf' }), `split-${startPage}-to-${endPage}.pdf`);
      setStatusMessage('Split complete!');
    } catch (err: any) {
      setError(err.message || 'Failed to split PDF.');
    }
    setLoading(false);
  };

  const handleToImage = async () => {
    if (!imageFile || !pdfLibLoaded) {
      setError('Please select a file and ensure the processor is loaded.');
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMessage('Converting pages to high-res images...');
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      const zip = new JSZip();

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setStatusMessage(`Rendering page ${i} of ${pdfDoc.numPages}...`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) zip.file(`page-${i}.png`, blob);
      }

      setStatusMessage('Zipping images...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, `${imageFile.name.replace(/\.[^/.]+$/, '')}-images.zip`);
      setStatusMessage('Conversion complete!');
    } catch (err) {
      setError('Failed to convert PDF to images.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Universal PDF Toolkit
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-8">
          Merge, split, or convert PDFs to images securely in your browser. 100% free with zero file uploads.
        </p>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-8 border border-slate-800">
          {[
            { id: 'merge', label: 'Merge PDFs' },
            { id: 'split', label: 'Split / Extract' },
            { id: 'image', label: 'PDF to Image' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setError(null); setStatusMessage(null); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center min-h-[400px]">
          {error && <div className="w-full bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
          {statusMessage && <div className="w-full bg-blue-950/50 border border-blue-800 text-blue-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">{statusMessage}</div>}

          {/* MERGE TAB */}
          {activeTab === 'merge' && (
            <div className="w-full flex flex-col items-center">
              <input type="file" multiple accept="application/pdf" className="mb-4 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-950 file:text-blue-400 hover:file:bg-blue-900" 
                onChange={(e) => setMergeFiles(Array.from(e.target.files || []))} />
              {mergeFiles.length > 0 && (
                <ul className="w-full text-sm text-slate-400 mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  {mergeFiles.map((f, i) => <li key={i}>📄 {f.name}</li>)}
                </ul>
              )}
              <button onClick={handleMerge} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Merge PDFs'}
              </button>
            </div>
          )}

          {/* SPLIT TAB */}
          {activeTab === 'split' && (
            <div className="w-full flex flex-col items-center">
              <input type="file" accept="application/pdf" className="mb-6 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-950 file:text-emerald-400 hover:file:bg-emerald-900" 
                onChange={(e) => setSplitFile(e.target.files?.[0] || null)} />
              <div className="flex gap-4 mb-6">
                <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">Start Page</label><input type="number" min="1" value={startPage} onChange={(e) => setStartPage(Number(e.target.value))} className="bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg w-24 text-center" /></div>
                <div className="flex flex-col"><label className="text-xs text-slate-400 mb-1">End Page</label><input type="number" min="1" value={endPage} onChange={(e) => setEndPage(Number(e.target.value))} className="bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg w-24 text-center" /></div>
              </div>
              <button onClick={handleSplit} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50">
                {loading ? 'Processing...' : 'Split & Download'}
              </button>
            </div>
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <div className="w-full flex flex-col items-center">
              <input type="file" accept="application/pdf" className="mb-6 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-950 file:text-purple-400 hover:file:bg-purple-900" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              <button onClick={handleToImage} disabled={loading || !pdfLibLoaded} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50">
                {loading ? 'Processing...' : !pdfLibLoaded ? 'Loading...' : 'Convert to Images (ZIP)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
