import Link from 'next/link';

export default function Home() {
  const tools = [
    {
      title: 'JSON to CSV',
      description: 'Convert complex nested JSON data into clean, exportable CSV files instantly.',
      href: '/json-to-csv',
      icon: '📊',
      accent: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)]'
    },
    {
      title: 'Image Converter',
      description: 'Convert PNG, JPEG, WEBP, and HEIC images safely with zero server uploads.',
      href: '/image-converter',
      icon: '🖼️',
      accent: 'group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]'
    },
    {
      title: 'PDF Toolkit',
      description: 'Merge, split, and convert PDF pages to high-res images completely offline.',
      href: '/pdf-converter',
      icon: '📄',
      accent: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center selection:bg-blue-500/30">
      <div className="w-full max-w-6xl mx-auto px-6 py-24 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Privacy-First <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Web Tools</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A suite of high-performance utilities that run 100% locally in your browser. 
            No limits, no subscriptions, and zero server uploads.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {tools.map((tool) => (
            <Link 
              key={tool.href} 
              href={tool.href} 
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col ${tool.accent}`}
            >
              {/* Subtle background glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-bl-full pointer-events-none -mr-8 -mt-8"></div>
              
              <div className="text-5xl mb-6 bg-slate-950/50 w-20 h-20 rounded-2xl border border-slate-800 flex items-center justify-center shadow-inner">
                {tool.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-slate-200 group-hover:text-white transition-colors">
                {tool.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                {tool.description}
              </p>
              
              <div className="mt-auto text-sm font-semibold tracking-wide uppercase text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                Launch Tool
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer/Trust Badge */}
        <div className="mt-24 pt-8 border-t border-slate-800/50 w-full flex flex-col md:flex-row items-center justify-center text-slate-500 text-sm gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Everything is processed safely on your device.
        </div>
      </div>
    </main>
  );
}
