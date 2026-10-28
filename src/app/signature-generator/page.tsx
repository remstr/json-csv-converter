'use client';

import { useState, useRef } from 'react';

export default function SignatureGeneratorPage() {
  const [mode, setMode] = useState<'type' | 'draw'>('type');
  const [typedName, setTypedName] = useState('John Doe');
  const [selectedFont, setSelectedFont] = useState('font-serif italic');
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Professional dark blue
  const [fontSize, setFontSize] = useState(64);

  // Canvas drawing refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fonts = [
    { name: 'Cursive Script', class: 'font-serif italic tracking-wider' },
    { name: 'Handwritten', class: 'font-mono tracking-wide' },
    { name: 'Formal Calligraphy', class: 'font-serif font-bold tracking-widest' },
  ];

  // Handle Typed Signature Download
  const downloadTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Setup font styling
    ctx.fillStyle = inkColor;
    ctx.font = `italic ${fontSize}px serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillText(typedName || 'Signature', canvas.width / 2, canvas.height / 2);

    triggerDownload(canvas.toDataURL('image/png'), 'transparent-signature.png');
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    triggerDownload(canvas.toDataURL('image/png'), 'drawn-signature.png');
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
          Transparent Signature Studio
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-10">
          Create clean, transparent PNG signatures for contracts and documents. Processed safely on your device.
        </p>

        {/* Mode Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-8 border border-slate-800">
          <button
            onClick={() => setMode('type')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
              mode === 'type' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Type Signature
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${
              mode === 'draw' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Draw Signature
          </button>
        </div>

        {/* TOOL CONTAINER */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          
          {/* Controls Bar */}
          <div className="w-full flex flex-wrap gap-6 items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-8">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-medium">Ink Color:</label>
              <input
                type="color"
                value={inkColor}
                onChange={(e) => setInkColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-xs font-mono text-slate-400 uppercase">{inkColor}</span>
            </div>

            {mode === 'type' ? (
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 font-medium">Font Style:</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
                >
                  {fonts.map((f, i) => (
                    <option key={i} value={f.class}>{f.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <button
                onClick={clearCanvas}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
              >
                Clear Canvas ↺
              </button>
            )}
          </div>

          {/* TYPE MODE PREVIEW */}
          {mode === 'type' && (
            <div className="w-full flex flex-col items-center gap-8">
              <div className="w-full">
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition text-lg"
                />
              </div>

              {/* Live Preview Box with Checkerboard background to show transparency */}
              <div className="w-full h-48 rounded-2xl bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 border border-slate-800 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                <div 
                  className={`transition-all select-none ${selectedFont}`}
                  style={{ color: inkColor, fontSize: `${fontSize}px` }}
                >
                  {typedName || 'Your Signature'}
                </div>
              </div>

              <button
                onClick={downloadTypedSignature}
                disabled={!typedName}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 font-bold text-white hover:from-teal-500 hover:to-cyan-500 transition shadow-lg disabled:opacity-50"
              >
                Download Transparent PNG
              </button>
            </div>
          )}

          {/* DRAW MODE CANVAS */}
          {mode === 'draw' && (
            <div className="w-full flex flex-col items-center gap-6">
              <p className="text-xs text-slate-400 self-start">Use your mouse, trackpad, or finger to draw your signature below:</p>
              
              <div className="w-full rounded-2xl bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 border border-slate-800 overflow-hidden flex justify-center shadow-inner cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={250}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full max-w-full touch-none"
                />
              </div>

              <button
                onClick={downloadDrawnSignature}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 font-bold text-white hover:from-teal-500 hover:to-cyan-500 transition shadow-lg"
              >
                Download Transparent PNG
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
