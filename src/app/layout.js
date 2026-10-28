import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "jsontocsv.fyi | Free Privacy-First Browser Utilities",
  description: "Secure, 100% client-side web tools for JSON to CSV conversion, image conversion, PDF editing, QR code generation, text diff checking, and signature creation. No server uploads.",
  keywords: "json to csv, client side image converter, privacy pdf merge split, secure text diff checker, transparent signature generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        {/* Global Navigation Bar */}
        <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo / Home Button */}
            <Link href="/" className="font-extrabold text-lg tracking-wide text-white flex items-center gap-2 hover:opacity-80 transition">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">⚡ jsontocsv.fyi</span>
            </Link>
            
            {/* Quick Links */}
            <div className="hidden lg:flex gap-5 text-sm font-medium text-slate-400">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <Link href="/json-to-csv" className="hover:text-amber-400 transition">JSON to CSV</Link>
              <Link href="/image-converter" className="hover:text-blue-400 transition">Images</Link>
              <Link href="/pdf-converter" className="hover:text-emerald-400 transition">PDF Toolkit</Link>
              <Link href="/qr-generator" className="hover:text-violet-400 transition">QR Code</Link>
              <Link href="/diff-checker" className="hover:text-rose-400 transition">Text Diff</Link>
              <Link href="/signature-generator" className="hover:text-teal-400 transition">Signature</Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
