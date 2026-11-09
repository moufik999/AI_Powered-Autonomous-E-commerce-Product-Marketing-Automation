/**
 * OmniMarket AI - Dashboard Navbar Component
 */

import React from 'react';

export default function Navbar({ userEmail, role = 'Merchant', onSignOut }) {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-md text-white">
          ⚡
        </div>
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2 text-white">
            <span>OmniMarket AI</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Session
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">{userEmail || 'moufik241-35-391@diu.edu.bd'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">Role:</span>
          <span className="font-bold text-cyan-400">{role}</span>
        </div>

        <button
          onClick={onSignOut}
          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
