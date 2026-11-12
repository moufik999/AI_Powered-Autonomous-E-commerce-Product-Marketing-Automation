/**
 * OmniMarket AI - All Posts View
 * Displays user's complete saved post history from MongoDB with unique dynamic image rendering.
 * Fixes duplicate image bug by ensuring every card's <img src={...} /> dynamically targets
 * the individual post's photocardUrl returned by the database.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';

export default function AllPosts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const activeEmail = outletContext.userEmail || user?.email || localStorage.getItem('userEmail') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getHistory(activeEmail);
      const list = res?.posts || res?.data?.posts || (Array.isArray(res?.data) ? res.data : []);
      setPosts(list);
    } catch (err) {
      console.warn('Failed to load post history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeEmail]);

  // Download individual photocard asset locally
  const handleDownload = async (post) => {
    const targetUrl = post.photocardUrl || post.imageUrl || post.finalImageUrl;
    if (!targetUrl) return;

    const id = post._id || post.id || targetUrl;
    setDownloadingId(id);

    const safeName = (post.productName || 'photocard').replace(/[^\w]/g, '_');
    const fileName = `${safeName}_${Date.now()}.png`;

    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: direct download link
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.download = fileName;
      a.click();
    } finally {
      setTimeout(() => setDownloadingId(null), 400);
    }
  };

  const handleCopyCaption = (caption, id) => {
    if (!caption) return;
    navigator.clipboard?.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <span>📑</span> Database Post Archive
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            All Posts & Photocards
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete database records with unique Cloudinary assets, prices, and RAG marketing copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
            title="Refresh database records"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={() => navigate('/generate')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <span>⚡</span> Create New Post
          </button>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Fetching unique posts from MongoDB...</span>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && posts.length === 0 && (
        <div className="p-16 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl">
            📑
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Posts Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate your first product campaign in the AI Post Generator to see it archived here.
            </p>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition"
          >
            Create Post Now ⚡
          </button>
        </div>
      )}

      {/* 4. Posts Grid with Dynamic Non-Duplicated Image Rendering */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {posts.map((post, idx) => {
            const postId = post._id || post.id || `post_${idx}`;
            // Dynamic image URL resolution directly from database document
            const currentPostImageUrl = post.photocardUrl || post.imageUrl || post.finalImageUrl;
            const caption = post.generatedCaption || post.caption || '';
            const isDownloading = downloadingId === postId;
            const isCopied = copiedId === postId;

            return (
              <div
                key={postId}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl hover:border-slate-700/80 transition flex flex-col justify-between p-5 sm:p-6 space-y-5"
              >
                {/* A. Top of the Card: Product Name, Price, Discount, Date */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
                      {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Archived Post'}
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight break-words">
                      {post.productName}
                    </h3>
                    {post.productDetails && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {post.productDetails}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.price && (
                      <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400">
                        {post.price}
                      </span>
                    )}
                    {post.discount && (
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                        {post.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* B. Photocard Image with Dynamic URL & Clear Download Button */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-5 flex flex-col items-center space-y-2.5">
                    <div className="relative aspect-square w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg group">
                      {currentPostImageUrl ? (
                        <img
                          src={currentPostImageUrl}
                          alt={post.productName || 'Photocard'}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-medium">
                          No Photocard Image
                        </div>
                      )}
                    </div>

                    {/* Clear Download Button directly below photocard */}
                    <button
                      onClick={() => handleDownload(post)}
                      disabled={isDownloading || !currentPostImageUrl}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <span>{isDownloading ? '⏳' : '💾'}</span>
                      <span>{isDownloading ? 'Saving...' : 'Download Photocard'}</span>
                    </button>
                  </div>

                  {/* C. Generated Caption Box (Scrollable / Expandable) */}
                  <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span>✨</span> Generated RAG Copy:
                      </span>

                      <button
                        onClick={() => handleCopyCaption(caption, postId)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 transition flex items-center gap-1 shadow-sm"
                        title="Copy caption text to clipboard"
                      >
                        <span>{isCopied ? '✓' : '📋'}</span>
                        <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
                      </button>
                    </div>

                    {/* Scrollable Text Box */}
                    <div className="w-full h-[180px] p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans overflow-y-auto whitespace-pre-line shadow-inner">
                      {caption || 'No caption text saved for this post.'}
                    </div>

                    {/* Card Footer Tag */}
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                      <span className="truncate max-w-[140px]">
                        Owner: {post.userEmail || activeEmail}
                      </span>
                      <span className="text-slate-400">Unique Asset ID: {String(postId).slice(-6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
