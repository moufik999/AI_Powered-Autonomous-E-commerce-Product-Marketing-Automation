/**
 * OmniMarket AI - Photocard Gallery View
 * Dedicated view that ONLY displays successfully generated photocards
 * with clear local "Download" actions.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { photocardService } from '../services/photocardService';

export default function PhotocardGalleryView({ onNavigateToGenerator }) {
  const navigate = useNavigate();
  const goToGen = onNavigateToGenerator || (() => navigate('/generate'));
  const [photocards, setPhotocards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch saved photocard history from backend database
  const loadPhotocards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await photocardService.getHistory();
      const list = res?.history || res?.data?.history || (Array.isArray(res?.data) ? res.data : []);
      setPhotocards(list);
    } catch (err) {
      console.warn('Photocard history fetch notice:', err.message);
      setError('Could not load photocard history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotocards();
  }, []);

  // Trigger local browser download
  const handleDownload = async (card) => {
    const imageUrl = card.finalImageUrl || card.imageUrl || card.backgroundImage;
    if (!imageUrl) return;

    setDownloadingId(card._id || card.id || imageUrl);
    const fileName = `${(card.productName || 'photocard').replace(/[^\w]/g, '_')}_photocard.png`;

    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: direct download link click
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = fileName;
      link.click();
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <span>🎨</span> Generated Assets Gallery
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Generated Photocards
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse and download all successfully synthesized AI product marketing photocards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPhotocards}
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
            title="Refresh photocard gallery"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={goToGen}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <span>⚡</span> Generate New Photocard
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading generated photocards...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && photocards.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl">
            🖼️
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Photocards Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate your first AI marketing photocard with transparent product cutout and commercial backgrounds in the AI Post Generator.
            </p>
          </div>
          <button
            onClick={goToGen}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition"
          >
            Open Post Generator ⚡
          </button>
        </div>
      )}

      {/* Photocards Grid */}
      {!loading && photocards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photocards.map((card, idx) => {
            const cardId = card._id || card.id || idx;
            const imageUrl = card.finalImageUrl || card.imageUrl || card.backgroundImage;
            const isDownloading = downloadingId === cardId;

            return (
              <div
                key={cardId}
                className="group rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
              >
                {/* Photocard Image Container */}
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={card.productName || 'Generated Photocard'}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      Image unavailable
                    </div>
                  )}

                  {/* Category & Discount Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {card.category && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 shadow-md">
                        {card.category}
                      </span>
                    )}
                    {card.discount && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-md">
                        {card.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details & Download Action */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                      {card.productName || 'Commercial Photocard'}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span>{card.price ? `Price: ${card.price}` : 'AI Rendered'}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {card.createdAt
                          ? new Date(card.createdAt).toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Download Button */}
                  <button
                    onClick={() => handleDownload(card)}
                    disabled={isDownloading || !imageUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{isDownloading ? '⏳' : '💾'}</span>
                    <span>{isDownloading ? 'Saving to Computer...' : 'Download Photocard'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
