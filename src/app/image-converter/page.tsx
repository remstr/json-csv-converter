'use client';

import { useState } from 'react';

export default function UniversalImageConverter() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('image/jpeg');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConvertedUrl(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined') return;

      const bitmap = await createImageBitmap(selectedImage);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not create canvas context');
      
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(bitmap, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Conversion failed.');
          setLoading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);
        setLoading(false);
      }, outputFormat, 0.9);

    } catch (err) {
      setError('Error processing image. Ensure the format is supported by your browser.');
      setLoading(false);
    }
  };

  const getExtension = (mime: string) => {
    switch (mime) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/webp': return 'webp';
      default: return 'jpg';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Universal Online Image Converter
        </h1>
        <p className="text-slate-400 text-center max-w-xl mb-8">
          Convert PNG, JPEG, WEBP, and HEIC images instantly. 100% free, private, and runs entirely in your browser.
        </p>

        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
          {error && (
            <div className="w-full bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <div className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 transition rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <svg className="w-12 h-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-300">
              {selectedImage ? selectedImage.name : "Drag & drop any image here, or browse"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Client-side processing with zero server uploads</p>
          </div>

          {selectedImage && (
            <div className="w-full mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />}
                <div>
                  <p className="text-sm font-medium text-slate-200 truncate max-w-xs">{selectedImage.name}</p>
                  <p className="text-xs text-slate-400">{(selectedImage.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-xs text-slate-400 whitespace-nowrap">Convert to:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 w-full md:w-auto"
                >
                  <option value="image/jpeg">JPG / JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>
            </div>
          )}

          {selectedImage && (
            <button
              onClick={handleConvert}
              disabled={loading}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50"
            >
              {loading ? 'Converting Image...' : 'Convert Image'}
            </button>
          )}

          {convertedUrl && (
            <div className="mt-8 w-full flex flex-col items-center border-t border-slate-800 pt-6">
              <p className="text-sm text-emerald-400 font-medium mb-4">Conversion Successful!</p>
              <a
                href={convertedUrl}
                download={`converted-image.${getExtension(outputFormat)}`}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg transition"
              >
                Download Converted Image
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
