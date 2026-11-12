/**
 * OmniMarket AI - Dashboard Navbar Component
 * Featuring real-time session indicators, Denim Zipper Menu launcher, and merchant controls.
 */

import React from 'react';

export default function Navbar({
  userEmail,
  role = 'Merchant',
  onSignOut,
  activeFeatureName = 'AI Post Generator',
  onToggleZipper,
  isZipperOpen = false
}) {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 bg-slate-900/85 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
      {/* Brand & Live Session */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-base shadow-md text-white">
          ⚡
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white tracking-tight">
              OmniMarket AI
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Session
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {userEmail || 'moufik241-35-391@diu.edu.bd'}
          </p>
        </div>
      </div>

      {/* Center / Right: Zipper Menu Trigger & User Controls */}
      <div className="flex items-center gap-3">
        {/* Interactive Denim Zipper Trigger Button */}
        <button
          onClick={onToggleZipper}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 shadow-lg ${
            isZipperOpen
              ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-amber-400/20'
              : 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-amber-200'
          }`}
          title="Toggle Denim Zipper Menu"
        >
          <span className="text-sm animate-pulse">👖</span>
          <span className="hidden sm:inline">Zipper Menu:</span>
          <span className="text-white font-extrabold max-w-[130px] truncate">
            {activeFeatureName}
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            {isZipperOpen ? '▲ Close' : '▼ Unzip'}
          </span>
        </button>

        {/* Role Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">Role:</span>
          <span className="font-bold text-cyan-400">{role}</span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>🔒</span>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
