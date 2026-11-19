import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';

export default function SavedPostsView({ userEmail, onNavigateToGenerator }) {
  const navigate = useNavigate();
  const goToGen = onNavigateToGenerator || (() => navigate('/generate'));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeEmail = userEmail || localStorage.getItem('userEmail') || '';
      const res = await postService.getHistory(activeEmail);
      const list = res?.posts || res?.data?.posts || (Array.isArray(res?.data) ? res.data : []);
      setPosts(list);

      const postsWithFb = list.filter(p => p.facebookPostId && (p.reactionsCount === undefined || p.reactionsCount === 0));
      if (postsWithFb.length > 0) {
        postsWithFb.slice(0, 3).forEach(p => {
          handleSyncInsights(p._id || p.id, p.facebookPostId, true);
        });
      }
    } catch (err) {
      setError('Could not load saved posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [userEmail]);

  const handleDownload = async (post) => {
    const imageUrl = post.photocardUrl || post.finalImageUrl || post.imageUrl;
    if (!imageUrl) return;

    const postId = post._id || post.id || imageUrl;
    setDownloadingId(postId);

    const safeName = (post.productName || 'photocard').replace(/[^\w]/g, '_');
    const fileName = `${safeName}_photocard.png`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
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
      setTimeout(() => setDownloadingId(null), 400);
    }
  };

  const handleCopyCaption = (caption, postId) => {
    if (!caption) return;
    navigator.clipboard?.writeText(caption);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSyncInsights = async (postId, fbId, silent = false) => {
    const identifier = postId || fbId;
    if (!identifier) return;

    if (!silent) setSyncingId(identifier);
    try {
      const res = await postService.syncInsights(identifier);
      const updatedPost = res?.post || res?.data?.post;
      const updatedInsights = res?.insights || res?.data?.insights;

      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId || p.id === postId || (fbId && p.facebookPostId === fbId)) {
            return {
              ...p,
              ...(updatedPost || {}),
              facebookPostId: updatedPost?.facebookPostId || p.facebookPostId || fbId,
              reactionsCount: updatedInsights?.reactionsCount ?? updatedPost?.reactionsCount ?? p.reactionsCount ?? 0,
              likesCount: updatedInsights?.likesCount ?? updatedPost?.likesCount ?? p.likesCount ?? 0,
              commentsCount: updatedInsights?.commentsCount ?? updatedPost?.commentsCount ?? p.commentsCount ?? 0,
              repliesCount: updatedInsights?.repliesCount ?? updatedPost?.repliesCount ?? p.repliesCount ?? 0,
              sharesCount: updatedInsights?.sharesCount ?? updatedPost?.sharesCount ?? p.sharesCount ?? 0
            };
          }
          return p;
        })
      );
    } catch (err) {
      if (!silent) {
        console.warn('Sync insights note:', err.message);
      }
    } finally {
      if (!silent) setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <span>💾</span> Database History
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Saved Posts
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              Total Saved Posts: {posts.length}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse saved marketing posts, branded photocards, and live Facebook engagement statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/40 text-xs font-semibold text-white transition-all duration-300 flex items-center gap-1.5"
            title="Refresh database records"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={goToGen}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <span>⚡</span> Create New Post
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading saved posts...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {error}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl">
            📦
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Saved Posts Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate commercial photocards and marketing copy to store complete records in your database.
            </p>
          </div>
          <button
            onClick={goToGen}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition"
          >
            Launch Generator ⚡
          </button>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post, idx) => {
            const postId = post._id || post.id || `post_${idx}`;
            const imageUrl = post.photocardUrl || post.finalImageUrl || post.imageUrl;
            const caption = post.generatedCaption || post.caption || '';
            const isDownloading = downloadingId === postId;
            const isCopied = copiedId === postId;
            const isSyncing = syncingId === postId || (post.facebookPostId && syncingId === post.facebookPostId);

            const hasFbId = Boolean(post.facebookPostId && String(post.facebookPostId).trim());
            const reactions = post.reactionsCount ?? post.likesCount ?? 0;
            const comments = post.commentsCount ?? 0;
            const replies = post.repliesCount ?? 0;
            const shares = post.sharesCount ?? 0;

            return (
              <div
                key={postId}
                className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Saved Record'}
                      </span>
                      {post.category && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight break-words">
                      {post.productName}
                    </h3>
                    {post.productDetails && (
                      <p className="text-xs text-slate-400 line-clamp-1">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-5 flex flex-col items-center space-y-2.5">
                    <div className="relative aspect-square w-full rounded-2xl bg-black/30 border border-white/10 overflow-hidden shadow-lg group">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.productName}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                          No Photocard Image
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-900/80 backdrop-blur-md text-amber-300 border border-white/15">
                          Amar bazar
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(post)}
                      disabled={isDownloading || !imageUrl}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <span>{isDownloading ? '⏳' : '💾'}</span>
                      <span>{isDownloading ? 'Downloading...' : 'Download Photocard'}</span>
                    </button>
                  </div>

                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span>✨</span> Generated Caption
                        </span>

                        <button
                          onClick={() => handleCopyCaption(caption, postId)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/40 text-[11px] font-semibold text-amber-300 transition-all duration-300 flex items-center gap-1 shadow-sm"
                          title="Copy caption text to clipboard"
                        >
                          <span>{isCopied ? '✓' : '📋'}</span>
                          <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
                        </button>
                      </div>

                      <div className="w-full h-[150px] p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white leading-relaxed font-sans overflow-y-auto whitespace-pre-line shadow-inner">
                        {caption || 'No caption text saved for this post.'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <span>📊</span> Facebook Post Insights
                          </span>
                          {post.syncedAt && (
                            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                              Synced {new Date(post.syncedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleSyncInsights(post._id || post.id, post.facebookPostId)}
                          disabled={isSyncing}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] font-semibold text-blue-300 transition flex items-center gap-1 disabled:opacity-50"
                          title="Refresh live stats directly from Meta Graph API"
                        >
                          <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
                          <span>{isSyncing ? 'Syncing...' : 'Refresh Stats'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Reactions</span>
                          <span className="text-sm sm:text-base font-black text-rose-400">{reactions}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Comments</span>
                          <span className="text-sm sm:text-base font-black text-blue-400">{comments}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Replies</span>
                          <span className="text-sm sm:text-base font-black text-amber-400">{replies}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Shares</span>
                          <span className="text-sm sm:text-base font-black text-emerald-400">{shares}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-500">FB Post ID:</span>
                          {hasFbId ? (
                            <span className="text-blue-300 font-semibold truncate select-all">{post.facebookPostId}</span>
                          ) : (
                            <span className="text-amber-400/80 italic">Unpublished / Local Draft</span>
                          )}
                        </div>
                        <span className="text-slate-500">Page: Amar bazar</span>
                      </div>
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
