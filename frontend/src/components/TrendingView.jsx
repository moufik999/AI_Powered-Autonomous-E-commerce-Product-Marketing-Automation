/**
 * OmniMarket AI - Trending & Hashtags Component
 * Real-time eCommerce market demand insights, viral hashtag discovery, and RAG keyword suggestions.
 */

import React, { useState } from 'react';

const TRENDING_CATEGORIES = [
  {
    category: 'Gaming & Peripherals',
    demandScore: 98,
    trend: '+45% YoY',
    topKeywords: ['Wireless Gaming Mouse', 'RGB Mechanical Keyboard', 'Low-Latency Headsets'],
    tags: ['#GamingBD', '#AmarBazarGaming', '#GamerLife', '#ProGamer', '#TechDealsBD'],
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    category: 'Skincare & Cosmetics',
    demandScore: 94,
    trend: '+38% YoY',
    topKeywords: ['Niacinamide Glow Serum', 'Hydrating Sunscreen SPF50', 'Centella Soothing Gel'],
    tags: ['#SkincareEssentials', '#GlowRoutine', '#OrganicBeauty', '#AmarBazarGlow', '#KoreanSkincareBD'],
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    category: 'Smart Electronics',
    demandScore: 91,
    trend: '+29% YoY',
    topKeywords: ['Active Noise Canceling Earbuds', 'Fitness Smartwatch', 'Magnetic Power Bank'],
    tags: ['#SmartGadgets', '#TechReview', '#WirelessAudio', '#AmarBazarTech', '#DailyDeals'],
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    category: 'Fashion & Apparel',
    demandScore: 87,
    trend: '+22% YoY',
    topKeywords: ['Oversized Heavyweight Tees', 'Minimalist Sneakers', 'Denim Jackets'],
    tags: ['#StreetwearBD', '#FashionInspo', '#OOTD', '#AmarBazarFashion', '#UrbanStyle'],
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  }
];

export default function TrendingView({ onNavigateToGenerator }) {
  const [copiedTag, setCopiedTag] = useState('');

  const handleCopyTag = (tag) => {
    navigator.clipboard?.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(''), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <span>🔥</span> Market Intelligence Engine
          </div>
          <h2 className="text-2xl font-black text-white">
            Trending & Viral Hashtags
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time viral keyword trends and high-converting hashtags tuned for social media sellers.
          </p>
        </div>
        <button
          onClick={onNavigateToGenerator}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
        >
          Generate Post with Viral Trends ⚡
        </button>
      </div>

      {copiedTag && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>✓</span> Copied "{copiedTag}" to clipboard!
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TRENDING_CATEGORIES.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                  Demand Score: {item.demandScore}/100
                </span>
                <span className="text-xs font-semibold text-emerald-400">{item.trend}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{item.category}</h3>
              
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  High-Velocity Search Terms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.topKeywords.map((kw, kidx) => (
                    <span
                      key={kidx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Viral Hashtag Cluster (Click to Copy):
              </span>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, tidx) => (
                  <button
                    key={tidx}
                    onClick={() => handleCopyTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 text-xs font-mono transition flex items-center gap-1 group"
                  >
                    <span>{tag}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-amber-400">📋</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
