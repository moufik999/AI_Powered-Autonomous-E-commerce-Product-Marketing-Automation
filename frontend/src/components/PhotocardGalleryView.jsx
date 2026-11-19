import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { photocardService } from '../services/photocardService';

export default function PhotocardGalleryView({ onNavigateToGenerator }) {
  const navigate = useNavigate();
  const goToGen = onNavigateToGenerator || (() => navigate('/generate'));
  const [photocards, setPhotocards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [error, setError] = useState(null);

  const loadPhotocards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await photocardService.getHistory();
      const list = res?.history || res?.data?.history || (Array.isArray(res?.data) ? res.data : []);
      setPhotocards(list);
    } catch {
      setError('Could not load photocard history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotocards();
  }, []);

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
    } catch {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <span>🎨</span> Generated Assets Gallery
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">
              All Photocards
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              Total Photocards: {photocards.length}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Dedicated gallery of branded commercial photocards with visible Amar bazar logo watermark, price tags, and category labels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPhotocards}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/40 text-xs font-semibold text-white transition-all duration-300 flex items-center gap-1.5"
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

      {loading && (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading generated photocards...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {error}
        </div>
      )}

      {!loading && photocards.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl">
            🖼️
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Photocards Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate AI marketing photocards with brand logo watermark, price tag, and category badge in the AI Post Generator.
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

      {!loading && photocards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photocards.map((card, idx) => {
            const cardId = card._id || card.id || idx;
            const imageUrl = card.finalImageUrl || card.imageUrl || card.backgroundImage;
            const isDownloading = downloadingId === cardId;

            return (
              <div
                key={cardId}
                className="group rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  className="relative aspect-square w-full bg-black/30 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPreview(card)}
                >
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

                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-900/85 backdrop-blur-md text-amber-300 border border-white/15 shadow-md">
                      Amar bazar
                    </span>
                    {card.category && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-black/60 backdrop-blur-md text-cyan-300 border border-white/10 shadow-md">
                        {card.category}
                      </span>
                    )}
                  </div>

                  {card.discount && (
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-md">
                        {card.discount}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-xs">
                      🔍 Click to Preview
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-white/[0.03] border-t border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                      {card.productName || 'Commercial Photocard'}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-emerald-400">
                        {card.offerPrice || card.price ? `Price: ${card.offerPrice || card.price}` : 'AI Rendered'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {card.createdAt
                          ? new Date(card.createdAt).toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPreview(card)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs transition"
                      title="Preview photocard"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(card)}
                      disabled={isDownloading || !imageUrl}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <span>{isDownloading ? '⏳' : '💾'}</span>
                      <span>{isDownloading ? 'Saving...' : 'Download Photocard'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="max-w-2xl w-full bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedPreview.productName || 'Photocard Preview'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                    Amar bazar
                  </span>
                  {selectedPreview.category && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase">
                      {selectedPreview.category}
                    </span>
                  )}
                  {selectedPreview.price && (
                    <span className="text-xs text-emerald-400 font-bold">
                      {selectedPreview.price}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/50">
              <img
                src={selectedPreview.finalImageUrl || selectedPreview.imageUrl || selectedPreview.backgroundImage}
                alt={selectedPreview.productName}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedPreview)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg"
              >
                Download Photocard 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
