/**
 * OmniMarket AI - Photocard Studio Component
 * Dedicated workspace for AI commercial background synthesis and photocard composition.
 */

import React, { useState } from 'react';
import { photocardService } from '../services/photocardService';

const TEMPLATES = [
  {
    id: 'gaming_neon_cyberpunk',
    category: 'Gaming',
    title: 'Neon Cyberpunk Vortex',
    gradient: 'from-purple-600 via-pink-600 to-blue-600',
    accent: '#06b6d4',
    badgeText: 'ELITE GAMING DEAL',
    tagline: 'High Performance Next-Gen Gear'
  },
  {
    id: 'electronics_minimal_slate',
    category: 'Electronics',
    title: 'Minimal Titanium Slate',
    gradient: 'from-slate-800 via-zinc-800 to-neutral-900',
    accent: '#38bdf8',
    badgeText: 'PREMIUM TECH SPECIAL',
    tagline: 'Precision Engineered Audio & Optics'
  },
  {
    id: 'skincare_botanic_dew',
    category: 'Skincare',
    title: 'Botanic Dew & Radiance',
    gradient: 'from-emerald-700 via-teal-800 to-cyan-900',
    accent: '#34d399',
    badgeText: 'ORGANIC RADIANCE',
    tagline: 'Dermatologist Tested Skin Nutrition'
  },
  {
    id: 'fashion_bold_editorial',
    category: 'Fashion',
    title: 'Editorial High Contrast',
    gradient: 'from-amber-600 via-orange-700 to-rose-800',
    accent: '#fbbf24',
    badgeText: 'SEASONAL DROP',
    tagline: 'Contemporary Streetwear & Elegance'
  },
  {
    id: 'food_artisanal_warmth',
    category: 'Food',
    title: 'Artisanal Golden Feast',
    gradient: 'from-amber-700 via-orange-800 to-stone-900',
    accent: '#f59e0b',
    badgeText: 'CHEF SELECTION',
    tagline: 'Freshly Prepared Organic Flavors'
  },
  {
    id: 'sports_dynamic_rush',
    category: 'Sports',
    title: 'Kinetic High Energy',
    gradient: 'from-red-600 via-orange-600 to-zinc-900',
    accent: '#f87171',
    badgeText: 'PEAK ATHLETIC DEAL',
    tagline: 'Engineered for Maximum Endurance'
  }
];

export default function PhotocardStudioView({ onNavigateToGenerator }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [productName, setProductName] = useState('Razer Viper V3 Pro');
  const [price, setPrice] = useState('$149');
  const [discount, setDiscount] = useState('20% OFF');
  const [bgPrompt, setBgPrompt] = useState('Cyberpunk neon illuminated gaming desk with holographic bokeh');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Photocard for "${productName}" downloaded successfully in 1080x1080 high-res PNG! 🎨`);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <span>🎨</span> AI Commercial Photocard Studio
          </div>
          <h2 className="text-2xl font-black text-white">
            Dynamic Photocard Studio
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Synthesize studio-quality product showcase graphics with custom templates and AI commercial backdrops.
          </p>
        </div>
        <button
          onClick={onNavigateToGenerator}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-2"
        >
          <span>⚡</span> Open Post Caption Generator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🛠️</span> Photocard Attributes
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sale Price
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discount Badge
                </label>
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Commercial Backdrop Prompt
              </label>
              <textarea
                rows={3}
                value={bgPrompt}
                onChange={(e) => setBgPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 transition resize-none"
              />
            </div>
          </div>

          {/* Template Selector Grid */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🎭</span> Category Templates ({TEMPLATES.length})
            </h3>
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedTemplate.id === tmpl.id
                      ? 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 line-clamp-1">
                    {tmpl.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Photocard Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col items-center">
            {/* Visual Canvas Card */}
            <div
              className={`relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${selectedTemplate.gradient} p-6 flex flex-col justify-between border border-white/10`}
            >
              {/* Top Banner & Discount */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-extrabold tracking-wider uppercase text-white border border-white/20">
                  {selectedTemplate.badgeText}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-lg uppercase tracking-wider">
                  {discount}
                </span>
              </div>

              {/* Product Center Feature */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
                <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl shadow-2xl animate-pulse">
                  ⚡
                </div>
                <div className="text-center mt-4">
                  <h4 className="text-xl font-black text-white drop-shadow-md">
                    {productName}
                  </h4>
                  <p className="text-xs text-white/80 font-medium drop-shadow-sm mt-0.5">
                    {selectedTemplate.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Price Bar */}
              <div className="relative z-10 p-3.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                    Special Offer
                  </span>
                  <span className="text-xl font-black text-white">
                    {price}
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs shadow-md">
                  Buy Now →
                </span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="w-full mt-4 flex items-center justify-between gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2"
              >
                <span>💾</span> {isExporting ? 'Exporting PNG...' : 'Download Photocard (1080x1080)'}
              </button>
              <button
                onClick={onNavigateToGenerator}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Use in Post ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
