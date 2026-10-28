'use client';

import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState('json-to-csv'); // 'json-to-csv' or 'csv-to-json'
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleConvert = () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError('Please enter some data to convert.');
      return;
    }

    if (mode === 'json-to-csv') {
      try {
        const parsed = JSON.parse(input);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        
        if (array.length === 0) {
          setError('JSON array is empty.');
          return;
        }

        const keys = Array.from(new Set(array.flatMap(item => (item && typeof item === 'object' ? Object.keys(item) : []))));
        if (keys.length === 0) {
          setError('Invalid JSON structure for tabular conversion.');
          return;
        }

        const header = keys.join(',');
        const rows = array.map(obj => 
          keys.map(key => {
            let val = obj[key] !== undefined ? obj[key] : '';
            if (typeof val === 'object') val = JSON.stringify(val);
            // Escape quotes and commas
            const stringVal = String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
              return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
          }).join(',')
        );

        setOutput([header, ...rows].join('\n'));
      } catch (err) {
        setError('Invalid JSON syntax: ' + err.message);
      }
    } else {
      // CSV to JSON
      try {
        const lines = input.trim().split('\n');
        if (lines.length < 2) {
          setError('CSV must have at least a header row and one data row.');
          return;
        }

        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const result = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const obj = {};
          headers.forEach((h, index) => {
            obj[h] = values[index] !== undefined ? values[index] : '';
          });
          return obj;
        });

        setOutput(JSON.stringify(result, null, 2));
      } catch (err) {
        setError('Failed to parse CSV: ' + err.message);
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const loadSample = () => {
    if (mode === 'json-to-csv') {
      setInput(JSON.stringify([
        { name: "John Doe", age: 30, city: "New York" },
        { name: "Jane Smith", age: 25, city: "Los Angeles" }
      ], null, 2));
    } else {
      setInput("name,age,city\nJohn Doe,30,New York\nJane Smith,25,Los Angeles");
    }
    setOutput('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          {mode === 'json-to-csv' ? 'Free Online JSON to CSV Converter' : 'Free Online CSV to JSON Converter'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Instantly convert your data securely in your browser. Fast, free, and zero server uploads.
        </p>

        {/* Mode Switcher Tabs */}
        <div className="flex justify-center mt-6 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit mx-auto">
          <button
            onClick={() => { setMode('json-to-csv'); handleClear(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'json-to-csv' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            JSON to CSV
          </button>
          <button
            onClick={() => { setMode('csv-to-json'); handleClear(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'csv-to-json' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CSV to JSON
          </button>
        </div>
      </div>

      {/* Converter Card */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Box */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-300">
                {mode === 'json-to-csv' ? 'Paste JSON Input' : 'Paste CSV Input'}
              </label>
              <button
                onClick={loadSample}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'json-to-csv' ? '[{"name": "John", "age": 30}]' : 'name,age,city\nJohn,30,New York'}
              className="w-full h-72 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Output Box */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-300">
                {mode === 'json-to-csv' ? 'Converted CSV Result' : 'Converted JSON Result'}
              </label>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Your converted output will appear here..."
              className="w-full h-72 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-400 focus:outline-none resize-none"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleConvert}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            {mode === 'json-to-csv' ? 'Convert to CSV' : 'Convert to JSON'}
          </button>
          <button
            onClick={handleClear}
            className="sm:w-32 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all"
          >
            Clear
          </button>
        </div>

      </div>

      {/* SEO Footer Content */}
      <div className="max-w-3xl mt-16 text-slate-400 text-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Why Use This Free Data Converter?</h2>
        <p>
          Whether you are a developer migrating data tables, a data analyst cleaning spreadsheets, or a digital marketer formatting custom payloads, our tool handles bidirectional conversions safely in your browser.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>100% Free with no registration or sign-ups required.</li>
          <li>Client-side processing ensures complete privacy—your data never touches an external server.</li>
          <li>Optimized for speed, supporting complex nested structures, escaped quotes, and commas.</li>
        </ul>
      </div>
    </main>
  );
}
