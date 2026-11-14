/**
 * OmniMarket AI - Auto-Reply Rules Management Component
 * Meta Graph API automated response rules for:
 * 1. Facebook Page Post Comment Replies (entry.changes)
 * 2. Facebook Messenger Inbox Replies (entry.messaging)
 *
 * Adheres strictly to the dark denim, amber gold, and glassmorphic design system.
 */

import React, { useState, useEffect } from 'react';
import { facebookService } from '../services/facebookService';

const COMMENT_PRESETS = [
  {
    label: '🛍️ General Store',
    text: "Thank you for reaching out! We have received your comment and will assist you shortly. Explore our store for exclusive deals! 🛍️✨"
  },
  {
    label: '🔥 Promo Offer',
    text: "Hey {name}! Thanks for commenting! This product is currently on special promotion. Send us a message for fast checkout! ⚡"
  },
  {
    label: '📦 Delivery Inquiry',
    text: "Thank you for your comment! We deliver nationwide with cash on delivery. Message our page directly to place your order! 🚚"
  }
];

const INBOX_PRESETS = [
  {
    label: '👋 Friendly Welcome',
    text: "Hello! Thanks for contacting OmniMarket. We're here to help you find the best products. How can we assist you today? 😊"
  },
  {
    label: '🛒 Order Assistance',
    text: "Hi there! Thanks for reaching out. Please let us know which product you're interested in and your delivery location! 📦"
  },
  {
    label: '⚡ Fast Checkout',
    text: "Welcome to OmniMarket! Our team is online and ready to assist you. Drop your preferred item or color, and we'll take care of the rest! 🚀"
  }
];

export default function AutoReplyRules() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Toggles and Custom Texts
  const [commentReplyEnabled, setCommentReplyEnabled] = useState(true);
  const [inboxReplyEnabled, setInboxReplyEnabled] = useState(true);
  const [commentReplyText, setCommentReplyText] = useState('');
  const [inboxReplyText, setInboxReplyText] = useState('');

  // Diagnostic Stats & Meta Info
  const [stats, setStats] = useState({
    commentRepliesSent: 0,
    inboxRepliesSent: 0,
    lastCommentReplyAt: null,
    lastInboxReplyAt: null,
    lastEventAt: null
  });
  const [metaInfo, setMetaInfo] = useState({
    pageId: '1469331552924612',
    verifyToken: 'omnimarket_meta_webhook_token_2026',
    webhookUrl: '/webhook',
    graphApiVersion: 'v18.0'
  });

  // Simulation test state
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Fetch initial rules from backend
  useEffect(() => {
    let isMounted = true;

    const loadRules = async () => {
      setLoading(true);
      try {
        const res = await facebookService.getAutoReplyRules();
        if (isMounted && res) {
          const rules = res.rules || res.data?.rules || {};
          setCommentReplyEnabled(Boolean(rules.commentReplyEnabled));
          setInboxReplyEnabled(Boolean(rules.inboxReplyEnabled));
          setCommentReplyText(rules.commentReplyText || COMMENT_PRESETS[0].text);
          setInboxReplyText(rules.inboxReplyText || INBOX_PRESETS[0].text);
          if (rules.stats) {
            setStats(rules.stats);
          }
          if (res.diagnostics) {
            setMetaInfo(prev => ({ ...prev, ...res.diagnostics }));
          }
        }
      } catch (err) {
        console.warn('Auto-reply rules notice:', err.message);
        // Fallback default presets if backend is temporarily unreachable
        if (isMounted) {
          setCommentReplyText(COMMENT_PRESETS[0].text);
          setInboxReplyText(INBOX_PRESETS[0].text);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRules();
    return () => { isMounted = false; };
  }, []);

  // Save rules changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await facebookService.updateAutoReplyRules({
        commentReplyEnabled,
        inboxReplyEnabled,
        commentReplyText,
        inboxReplyText
      });

      if (res && (res.success || res.status === 200)) {
        setFeedback({
          type: 'success',
          message: '✓ Auto-reply rules successfully saved and active for Meta Webhook!'
        });
        if (res.rules?.stats) {
          setStats(res.rules.stats);
        }
      } else {
        throw new Error(res?.message || 'Could not save rules');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update auto-reply rules. Please check backend server.'
      });
    } finally {
      setSaving(false);
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setFeedback(prev => prev?.type === 'success' ? null : prev);
      }, 5000);
    }
  };

  // Run live simulation test
  const handleSimulate = async (type) => {
    setSimulating(true);
    setSimResult(null);

    try {
      const testMsg = type === 'comment'
        ? 'Is this product still in stock?'
        : 'Hi! I want to order this item.';
      const res = await facebookService.testSimulateWebhook({
        type,
        testMessage: testMsg,
        senderName: 'Shopper Test'
      });

      if (res && res.simulation) {
        setSimResult(res.simulation);
        // Refresh local stats counter
        setStats(prev => ({
          ...prev,
          commentRepliesSent: type === 'comment' ? (prev.commentRepliesSent || 0) + 1 : prev.commentRepliesSent,
          inboxRepliesSent: type === 'inbox' ? (prev.inboxRepliesSent || 0) + 1 : prev.inboxRepliesSent
        }));
      }
    } catch (err) {
      console.warn('Simulation test notice:', err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Diagnostics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-2xl relative overflow-hidden dark:hover:border-white/40 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-600 dark:text-amber-300 text-xs font-bold tracking-wide">
              <span>🤖</span> Meta Graph API Webhook Automation
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Auto-Reply Rules Management
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-400 max-w-2xl leading-relaxed">
              Define automated conversational responses for your connected Facebook Page. Incoming post comments and Messenger inbox events will trigger instant intelligent replies.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 flex-shrink-0">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/10 dark:border-white/15 flex flex-col">
              <span className="text-[10px] font-bold text-gray-700 dark:text-slate-400 uppercase tracking-wider">
                Comment Replies
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {stats.commentRepliesSent || 0}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {commentReplyEnabled ? 'Active' : 'Paused'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/10 dark:border-white/15 flex flex-col">
              <span className="text-[10px] font-bold text-gray-700 dark:text-slate-400 uppercase tracking-wider">
                Inbox Replies
              </span>
              <span className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {stats.inboxRepliesSent || 0}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {inboxReplyEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Webhook Connection Details */}
        <div className="relative z-10 mt-6 pt-5 border-t border-gray-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-700 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Webhook Path:</span>
            <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
              {metaInfo.webhookUrl}
            </code>
            <span className="text-gray-400 dark:text-slate-600">|</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Verify Token:</span>
            <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
              {metaInfo.verifyToken}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Meta Page ID:</span>
            <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
              {metaInfo.pageId}
            </code>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-sans text-[11px] font-bold">
              ✓ Meta Graph API v18.0
            </span>
          </div>
        </div>
      </div>

      {/* 2. Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✨' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Rule Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* RULE 1: Auto Comment Reply */}
        {/* ========================================================= */}
        <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-xl flex flex-col justify-between dark:hover:border-white/40 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <div className="space-y-4">
            {/* Header + Toggle Switch */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg text-amber-500 dark:text-amber-400">
                  💬
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                    Auto Comment Reply
                  </h3>
                  <p className="text-[11px] text-gray-700 dark:text-slate-400">
                    Responds to Facebook Page post comments (<code className="text-amber-600 dark:text-amber-300">entry.changes</code>)
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  commentReplyEnabled ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500'
                }`}>
                  {commentReplyEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={commentReplyEnabled}
                  onClick={() => setCommentReplyEnabled(!commentReplyEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    commentReplyEnabled ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-gray-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      commentReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              When a visitor comments on any marketing post, the Meta Webhook will automatically trigger this response text on behalf of your Page.
            </p>

            {/* Textarea Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Custom Comment Reply Text</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-normal">
                    (Use &#123;name&#125; for customer name)
                  </span>
                </label>
                <span className="text-[10px] text-gray-700 dark:text-slate-400 font-mono">
                  {commentReplyText.length} chars
                </span>
              </div>

              <textarea
                rows={4}
                value={commentReplyText}
                onChange={(e) => setCommentReplyText(e.target.value)}
                placeholder="Enter your custom automated comment reply..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:focus:border-white/40 dark:focus:ring-white/20 text-xs sm:text-sm dark:text-white dark:placeholder-slate-500 transition resize-none leading-relaxed"
              />
            </div>

            {/* Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-400">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMENT_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCommentReplyText(p.text)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 dark:bg-white/5 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/40 text-[11px] dark:text-white font-medium transition-all duration-300 active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Simulation Button */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-gray-700 dark:text-slate-400">
              Anti-loop filter: Page's own comments ignored
            </span>
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('comment')}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 dark:bg-white/5 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/40 text-xs font-semibold dark:text-white transition-all duration-300 flex items-center gap-1.5 active:scale-95"
            >
              <span>🧪</span> Test Reply
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RULE 2: Auto Inbox Reply */}
        {/* ========================================================= */}
        <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-xl flex flex-col justify-between dark:hover:border-white/40 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <div className="space-y-4">
            {/* Header + Toggle Switch */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-lg text-blue-500 dark:text-blue-400">
                  📬
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                    Auto Inbox Reply
                  </h3>
                  <p className="text-[11px] text-gray-700 dark:text-slate-400">
                    Responds to Messenger messages (<code className="text-blue-600 dark:text-blue-300">entry.messaging</code>)
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  inboxReplyEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'
                }`}>
                  {inboxReplyEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inboxReplyEnabled}
                  onClick={() => setInboxReplyEnabled(!inboxReplyEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    inboxReplyEnabled ? 'bg-blue-600 shadow-md shadow-blue-500/30' : 'bg-gray-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      inboxReplyEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              When a customer initiates a Messenger chat, the Meta Webhook will instantly reply with your customized message using the Send API.
            </p>

            {/* Textarea Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900 dark:text-slate-300">
                  Custom Messenger Reply Text
                </label>
                <span className="text-[10px] text-gray-700 dark:text-slate-400 font-mono">
                  {inboxReplyText.length} chars
                </span>
              </div>

              <textarea
                rows={4}
                value={inboxReplyText}
                onChange={(e) => setInboxReplyText(e.target.value)}
                placeholder="Enter your custom automated Messenger inbox reply..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:focus:border-white/40 dark:focus:ring-white/20 text-xs sm:text-sm dark:text-white dark:placeholder-slate-500 transition resize-none leading-relaxed"
              />
            </div>

            {/* Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-400">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {INBOX_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInboxReplyText(p.text)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 dark:bg-white/5 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/40 text-[11px] dark:text-white font-medium transition-all duration-300 active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Simulation Button */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-gray-700 dark:text-slate-400">
              Echo protection: Page echoes are filtered out
            </span>
            <button
              type="button"
              disabled={simulating}
              onClick={() => handleSimulate('inbox')}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 dark:bg-white/5 dark:hover:bg-white/20 dark:border-white/10 dark:hover:border-white/40 text-xs font-semibold dark:text-white transition-all duration-300 flex items-center gap-1.5 active:scale-95"
            >
              <span>🧪</span> Test Reply
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Simulation Result Box (If user clicked Test Reply) */}
      {simResult && (
        <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-xl dark:hover:border-white/40 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
              <span>⚡</span> Simulated Webhook Execution Result ({simResult.type.toUpperCase()})
            </span>
            <button
              type="button"
              onClick={() => setSimResult(null)}
              className="text-xs text-gray-700 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 space-y-1">
              <span className="text-[10px] uppercase text-gray-700 dark:text-slate-400 block font-sans font-bold">
                Incoming Event Trigger:
              </span>
              <p className="text-gray-900 dark:text-white">
                "{simResult.input?.message}"
              </p>
              <span className="text-[10px] text-gray-500 dark:text-slate-500 block pt-1">
                Rule Enabled: {simResult.enabled ? 'YES (TRUE)' : 'NO (PAUSED)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-emerald-500/30 dark:bg-white/5 dark:border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block font-sans font-bold">
                Automated Reply Dispatched:
              </span>
              <p className="text-emerald-700 dark:text-emerald-200">
                "{simResult.generatedReply}"
              </p>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 block pt-1">
                Status: {simResult.action}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Action Bar: Save Rules Button */}
      <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:hover:border-white/40 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
            🛡️
          </div>
          <p className="text-xs text-gray-700 dark:text-slate-400">
            Rule changes take effect immediately across all live Meta Webhook notifications.
          </p>
        </div>

        <button
          type="button"
          disabled={saving || loading}
          onClick={handleSave}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Saving Rules...</span>
            </>
          ) : (
            <>
              <span>💾</span> Save Auto-Reply Rules
            </>
          )}
        </button>
      </div>
    </div>
  );
}
