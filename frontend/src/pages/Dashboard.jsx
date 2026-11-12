/**
 * OmniMarket AI - Minimalist Dashboard Page
 * Features a single, prominent "Total Posts Generated" stat card
 * dynamically querying real-time MongoDB database counts.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const activeEmail = outletContext.userEmail || user?.email || localStorage.getItem('userEmail') || '';

  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPostCount = async () => {
      setLoading(true);
      try {
        const res = await postService.getCount(activeEmail);
        const count = res?.count ?? res?.data?.count ?? 0;
        if (isMounted) {
          setTotalCount(count);
        }
      } catch (err) {
        console.warn('Post count query notice:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPostCount();
    return () => { isMounted = false; };
  }, [activeEmail]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
            <span>✨</span> Merchant Intelligence Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and dynamic post metrics for {activeEmail || 'your store'}.
          </p>
        </div>

        <button
          onClick={() => navigate('/generate')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 active:scale-95"
        >
          <span>⚡</span> Create New Post
        </button>
      </div>

      {/* 2. Single Prominent Stat Card: "Total Posts Generated" */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-amber-500/35 shadow-2xl backdrop-blur-xl overflow-hidden group hover:border-amber-400/60 transition">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 shadow-md">
                ⚡
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  MongoDB Cloud Metrics
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Total Posts Generated
                </h2>
              </div>
            </div>

            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
                {loading ? (
                  <span className="inline-block w-16 h-12 bg-slate-800 rounded-xl animate-pulse" />
                ) : (
                  totalCount
                )}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Synchronized
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Database: omnimarket_auth_db
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-lg leading-relaxed pt-1">
              Every synthesized RAG marketing caption, price badge, and high-resolution Cloudinary photocard is stored and linked to your merchant account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>⚡</span> Generate Next Post
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>📑</span> View All Saved Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
