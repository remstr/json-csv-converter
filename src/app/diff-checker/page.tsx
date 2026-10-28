'use client';

import { useState } from 'react';
import { diffWords, diffLines, Change } from 'diff';

export default function DiffCheckerPage() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [diffMode, setDiffMode] = useState<'words' | 'lines'>('words');
  const [result, setResult] = useState<Change[] | null>(null);

  const handleCompare = () => {
    if (!textA && !textB) return;
    
    if (diffMode === 'words') {
      setResult(diffWords(textA, textB));
    } else {
      setResult(diffLines(textA, textB));
    }
  };

  const clearAll = () => {
    setTextA('');
    setTextB('');
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent">
          Confidential Text Compare
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-10">
          Find the exact differences between two documents. Processed 100% locally in your browser to protect sensitive company data.
        </p>

        {/* Input Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Original Text</label>
              <span className="text-xs text-slate-500">{textA.length} chars</span>
            </div>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste original contract, email, or code here..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 h-64 focus:outline-none focus:border-rose-500 transition resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Modified Text</label>
              <span className="text-xs text-slate-500">{textB.length} chars</span>
            </div>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste modified version here..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 h-64 focus:outline-none focus:border-orange-500 transition resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-lg gap-4">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setDiffMode('words')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                diffMode === 'words' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Word
            </button>
            <button
              onClick={() => setDiffMode('lines')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                diffMode === 'lines' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Line
            </button>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={clearAll}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition w-full sm:w-auto"
            >
              Clear
            </button>
            <button
              onClick={handleCompare}
              disabled={!textA && !textB}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 font-bold text-white hover:from-rose-500 hover:to-orange-500 transition shadow-lg w-full sm:w-auto disabled:opacity-50"
            >
              Compare Text
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-4">
              Comparison Result
              <div className="flex gap-4 text-xs font-normal">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></span> Added</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></span> Removed</span>
              </div>
            </h3>
            
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {result.map((part, index) => {
                const colorClass = part.added
                  ? 'bg-emerald-500/20 text-emerald-300 px-1 rounded-sm border-b border-emerald-500/50'
                  : part.removed
                  ? 'bg-rose-500/20 text-rose-400 px-1 rounded-sm line-through decoration-rose-500/50'
                  : 'text-slate-400';
                
                return (
                  <span key={index} className={colorClass}>
                    {part.value}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
