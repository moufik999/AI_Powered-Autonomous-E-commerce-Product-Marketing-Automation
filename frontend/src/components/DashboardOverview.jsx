/**
 * OmniMarket AI - Dashboard Overview Component
 * Central metrics, merchant status, and feature quick launches.
 */

import React from 'react';

export default function DashboardOverview({ onNavigate, userEmail }) {
  const metrics = [
    {
      label: 'AI Posts Generated',
      value: '128',
      change: '+24% this week',
      icon: '⚡',
      color: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400'
    },
    {
      label: 'Facebook Page Status',
      value: 'Amar bazar (Live)',
      change: 'Page ID: 1047291024',
      icon: '🚀',
      color: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    },
    {
      label: 'Photocards Rendered',
      value: '84',
      change: 'Sharp & Canvas Ready',
      icon: '🎨',
      color: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400'
    },
    {
      label: 'Engagement Boost',
      value: '+38.6%',
      change: 'High-converting RAG copy',
      icon: '🔥',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    }
  ];

  const quickActions = [
    {
      id: 'rag-generator',
      title: 'AI Post Generator',
      desc: 'Generate high-converting Facebook captions with Gemini RAG augmentation.',
      icon: '⚡',
      actionText: 'Open Generator'
    },
    {
      id: 'photocard-studio',
      title: 'Photocard Studio',
      desc: 'Combine transparent cutouts with AI commercial backgrounds and price badges.',
      icon: '🎨',
      actionText: 'Open Studio'
    },
    {
      id: 'trending',
      title: 'Trending & Hashtags',
      desc: 'Explore trending market categories and viral hashtags for maximum reach.',
      icon: '🔥',
      actionText: 'View Trends'
    },
    {
      id: 'publish',
      title: 'Facebook Page Publisher',
      desc: 'Publish photocards and promotional copy directly to your live Facebook Page.',
      icon: '🚀',
      actionText: 'Manage Posts'
    }
  ];

  const recentPosts = [
    {
      product: 'Logitech G Pro X Wireless Gaming Mouse',
      category: 'Gaming',
      time: '2 hours ago',
      platform: 'Facebook Page',
      status: 'Published Live',
      engagement: '342 Reactions'
    },
    {
      product: 'Glow Botanic Vitamin C Serum',
      category: 'Skincare',
      time: 'Yesterday',
      platform: 'Facebook Page',
      status: 'Published Live',
      engagement: '528 Reactions'
    },
    {
      product: 'Sony WH-1000XM5 Noise Canceling Headphones',
      category: 'Electronics',
      time: '2 days ago',
      platform: 'Facebook Page',
      status: 'Published Live',
      engagement: '891 Reactions'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-slate-700/60 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
              <span>✨</span> Merchant Intelligence Workspace
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back to OmniMarket AI
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Your autonomous marketing engine powered by Gemini RAG copy, dynamic photocard synthesis, and direct Meta Graph API publishing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('rag-generator')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition transform active:scale-95"
          >
            Create New Campaign ⚡
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-br ${m.color} bg-slate-900/80 border ${m.border} backdrop-blur-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {m.label}
              </span>
              <span className="text-xl">{m.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">{m.value}</div>
              <div className={`text-xs font-medium mt-1 ${m.text}`}>{m.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.id}
            onClick={() => onNavigate(action.id)}
            className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {action.desc}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-amber-300">
              <span>{action.actionText}</span>
              <span className="transform group-hover:translate-x-1 transition">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaign Activity */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📡</span> Recent Live Social Publications
          </h3>
          <button
            onClick={() => onNavigate('publish')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            View all posts →
          </button>
        </div>
        <div className="divide-y divide-slate-800">
          {recentPosts.map((post, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                  f
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{post.product}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Category: {post.category}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs text-slate-300">
                  {post.engagement}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
