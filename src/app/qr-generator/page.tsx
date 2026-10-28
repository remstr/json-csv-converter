'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrGeneratorPage() {
  const [text, setText] = useState('https://jsontocsv.fyi');
  const [fgColor, setFgColor] = useState('#0f172a'); // slate-950
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          Custom QR Generator
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-12">
          Generate secure, custom QR codes instantly. Everything happens on your device—no data is sent to our servers.
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">URL or Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a website URL, Wi-Fi password, or text..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-violet-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">QR Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-slate-400 text-sm font-mono uppercase">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-slate-400 text-sm font-mono uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Image Size ({size}px)</label>
              <input
                type="range"
                min="128"
                max="1024"
                step="8"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div 
              ref={qrRef} 
              className="p-4 bg-white rounded-2xl shadow-xl transition-all duration-300"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeCanvas
                value={text || ' '}
                size={256} // Fixed visual size in UI
                fgColor={fgColor}
                bgColor={bgColor}
                level="H" // High error correction
                includeMargin={false}
                style={{ width: '256px', height: '256px' }} 
              />
              {/* Hidden high-res canvas for downloading */}
              <div className="hidden">
                <QRCodeCanvas
                  value={text || ' '}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={!text}
              className="mt-10 w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white hover:from-violet-500 hover:to-fuchsia-500 transition shadow-lg disabled:opacity-50"
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
