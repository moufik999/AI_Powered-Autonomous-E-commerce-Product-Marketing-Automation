/**
 * OmniMarket AI - Developer Profile Modal & View
 * Showcases author credentials, DIU Student ID, GitHub, and LinkedIn profiles.
 */

import React, { useState } from 'react';

export default function ProfileModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition shadow-md"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-xl ring-2 ring-amber-400/40">
            SM
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
              <span>🎓</span> Project Author & Lead Developer
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Sheikh Nishat Anam Moufik
            </h3>
            <p className="text-xs font-mono text-cyan-400 mt-0.5 font-semibold">
              ID: 241-35-391
            </p>
          </div>
        </div>

        {/* Copied Feedback Toast */}
        {copiedField && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span>✓</span> Copied {copiedField} to clipboard!
          </div>
        )}

        {/* Academic & Project Details */}
        <div className="space-y-3 mb-6 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Institution & Department
            </span>
            <p className="font-semibold text-slate-200">
              Department of Software Engineering, Daffodil International University (DIU)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Capstone Project
            </span>
            <p className="font-semibold text-amber-300">
              OmniMarket AI Engine: AI-Driven Product Post, Dynamic Photocard & Automated Facebook Publishing Engine
            </p>
          </div>
        </div>

        {/* Social & Contact Links */}
        <div className="space-y-3">
          {/* GitHub */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                🐙
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  GitHub Profile
                </span>
                <span className="text-xs font-mono text-cyan-300 truncate block">
                  github.com/moufik999
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopy('https://github.com/moufik999', 'GitHub URL')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
              >
                Copy
              </button>
              <a
                href="https://github.com/moufik999"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white transition shadow-md"
              >
                Open ↗
              </a>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg flex-shrink-0">
                💼
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  LinkedIn Profile
                </span>
                <span className="text-xs font-mono text-cyan-300 truncate block">
                  linkedin.com/in/moufik999
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopy('https://linkedin.com/in/moufik999', 'LinkedIn URL')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
              >
                Copy
              </button>
              <a
                href="https://linkedin.com/in/moufik999"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white transition shadow-md"
              >
                Open ↗
              </a>
            </div>
          </div>

          {/* University Email */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg flex-shrink-0">
                ✉️
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Institutional Email
                </span>
                <span className="text-xs font-mono text-slate-200 truncate block">
                  moufik241-35-391@diu.edu.bd
                </span>
              </div>
            </div>
            <button
              onClick={() => handleCopy('moufik241-35-391@diu.edu.bd', 'Email')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition flex-shrink-0"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition shadow-md"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
