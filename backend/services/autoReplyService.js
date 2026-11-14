/**
 * OmniMarket AI - Auto Reply Service
 * Core business logic for Meta Graph API Webhook automation:
 * - Real-time parsing of incoming Facebook Page events (entry.messaging & entry.changes)
 * - Anti-loop protection (ignoring page echoes and self-comments)
 * - Idempotency & duplicate event deduplication
 * - Resilient database synchronization with in-memory caching fallback
 */

const mongoose = require('mongoose');
const AutoReplyRule = require('../models/AutoReplyRule');
const facebookService = require('./facebookService');
const facebookConfig = require('../config/facebook');
const logger = require('../utils/logger');

class AutoReplyService {
  constructor() {
    this._rulesCache = {
      pageId: facebookConfig.getPageId(),
      userEmail: 'moufik241-35-391@diu.edu.bd',
      commentReplyEnabled: true,
      inboxReplyEnabled: true,
      commentReplyText: "Thank you for reaching out! We have received your comment and will assist you shortly. Explore our store for exclusive deals! 🛍️✨",
      inboxReplyText: "Hello! Thanks for contacting OmniMarket. We're here to help you find the best products. How can we assist you today? 😊",
      stats: {
        commentRepliesSent: 0,
        inboxRepliesSent: 0,
        lastCommentReplyAt: null,
        lastInboxReplyAt: null,
        lastEventAt: null
      }
    };

    // Deduplication caches with max size to avoid memory leaks
    this._processedCommentIds = new Set();
    this._processedMessageIds = new Set();
    this._recentActivityLogs = [];

    // Attempt initial hydration from DB if available
    this._initFromDB();
  }

  async _initFromDB() {
    try {
      if (mongoose.connection.readyState === 1) {
        const pageId = facebookConfig.getPageId();
        const existing = await AutoReplyRule.findOne({ pageId }).lean();
        if (existing) {
          this._rulesCache = {
            ...this._rulesCache,
            ...existing,
            stats: {
              ...this._rulesCache.stats,
              ...(existing.stats || {})
            }
          };
          logger.info('AutoReplyService loaded active rules from database.');
        }
      }
    } catch (err) {
      logger.debug('AutoReplyService initial DB read notice:', err.message);
    }
  }

  /**
   * Log an activity item for live dashboard diagnostics
   */
  _logActivity(entry) {
    const logItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      ...entry
    };
    this._recentActivityLogs.unshift(logItem);
    if (this._recentActivityLogs.length > 30) {
      this._recentActivityLogs.pop();
    }
  }

  /**
   * Get active Auto-Reply Rules and live stats
   */
  async getRules() {
    const pageId = facebookConfig.getPageId();

    if (mongoose.connection.readyState === 1) {
      try {
        let rule = await AutoReplyRule.findOne({ pageId });
        if (!rule) {
          rule = await AutoReplyRule.create({
            pageId,
            ...this._rulesCache
          });
        }
        this._rulesCache = {
          ...this._rulesCache,
          pageId: rule.pageId,
          commentReplyEnabled: rule.commentReplyEnabled,
          inboxReplyEnabled: rule.inboxReplyEnabled,
          commentReplyText: rule.commentReplyText,
          inboxReplyText: rule.inboxReplyText,
          stats: {
            ...this._rulesCache.stats,
            ...(rule.stats || {})
          }
        };
      } catch (err) {
        logger.debug('Could not read rules from DB, using cache:', err.message);
      }
    }

    return {
      success: true,
      rules: this._rulesCache,
      diagnostics: {
        pageId,
        verifyToken: facebookConfig.getVerifyToken(),
        webhookUrl: '/webhook',
        graphApiVersion: facebookConfig.getGraphApiVersion(),
        isConfigured: facebookConfig.isFacebookConfigured(),
        recentLogs: this._recentActivityLogs.slice(0, 10)
      }
    };
  }

  /**
   * Update Auto-Reply Rules configuration
   */
  async updateRules(updates = {}) {
    const pageId = facebookConfig.getPageId();

    if (typeof updates.commentReplyEnabled === 'boolean') {
      this._rulesCache.commentReplyEnabled = updates.commentReplyEnabled;
    }
    if (typeof updates.inboxReplyEnabled === 'boolean') {
      this._rulesCache.inboxReplyEnabled = updates.inboxReplyEnabled;
    }
    if (typeof updates.commentReplyText === 'string') {
      this._rulesCache.commentReplyText = updates.commentReplyText.trim();
    }
    if (typeof updates.inboxReplyText === 'string') {
      this._rulesCache.inboxReplyText = updates.inboxReplyText.trim();
    }

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await AutoReplyRule.findOneAndUpdate(
          { pageId },
          {
            $set: {
              commentReplyEnabled: this._rulesCache.commentReplyEnabled,
              inboxReplyEnabled: this._rulesCache.inboxReplyEnabled,
              commentReplyText: this._rulesCache.commentReplyText,
              inboxReplyText: this._rulesCache.inboxReplyText
            }
          },
          { upsert: true, new: true }
        );
        if (updated && updated.stats) {
          this._rulesCache.stats = {
            ...this._rulesCache.stats,
            ...updated.stats
          };
        }
      } catch (err) {
        logger.warn('Could not persist updated rules to MongoDB:', err.message);
      }
    }

    logger.info('Auto-reply rules updated successfully.');
    return {
      success: true,
      message: 'Auto-reply rules successfully updated.',
      rules: this._rulesCache
    };
  }

  /**
   * Increment execution stats in cache and DB
   */
  async _recordReplyStat(type) {
    const now = new Date();
    this._rulesCache.stats.lastEventAt = now;

    if (type === 'comment') {
      this._rulesCache.stats.commentRepliesSent = (this._rulesCache.stats.commentRepliesSent || 0) + 1;
      this._rulesCache.stats.lastCommentReplyAt = now;
    } else if (type === 'inbox') {
      this._rulesCache.stats.inboxRepliesSent = (this._rulesCache.stats.inboxRepliesSent || 0) + 1;
      this._rulesCache.stats.lastInboxReplyAt = now;
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const incField = type === 'comment' ? 'stats.commentRepliesSent' : 'stats.inboxRepliesSent';
        const dateField = type === 'comment' ? 'stats.lastCommentReplyAt' : 'stats.lastInboxReplyAt';
        await AutoReplyRule.updateOne(
          { pageId: facebookConfig.getPageId() },
          {
            $inc: { [incField]: 1 },
            $set: { [dateField]: now, 'stats.lastEventAt': now }
          }
        );
      } catch (err) {
        logger.debug('Could not update rule stats in DB:', err.message);
      }
    }
  }

  /**
   * Process incoming Meta Webhook event payload
   * @param {Object} payload - The Meta Webhook JSON body
   */
  async handleWebhookPayload(payload) {
    if (!payload || payload.object !== 'page') {
      logger.debug('Webhook received non-page object or empty payload. Acknowledging with 200.');
      return { status: 'IGNORED', reason: 'Not a page object' };
    }

    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    const results = {
      processedEntries: entries.length,
      messagingEventsProcessed: 0,
      commentEventsProcessed: 0,
      actionsTaken: []
    };

    const rulesData = await this.getRules();
    const rules = rulesData.rules || this._rulesCache;
    const configuredPageId = facebookConfig.getPageId();

    for (const entry of entries) {
      const entryPageId = (entry.id || configuredPageId).toString();

      // ==============================================================
      // 1. Process entry.messaging for Inbox Messages
      // ==============================================================
      if (Array.isArray(entry.messaging) && entry.messaging.length > 0) {
        for (const msgEvent of entry.messaging) {
          const senderId = msgEvent.sender?.id?.toString();
          const recipientId = msgEvent.recipient?.id?.toString();
          const message = msgEvent.message;

          // Skip echo messages sent by the page itself to avoid loops
          if (message?.is_echo) {
            logger.debug('Skipping message echo originated from page.');
            continue;
          }

          // Skip if sender is the page itself
          if (senderId === entryPageId || senderId === configuredPageId) {
            logger.debug('Skipping message sent by page ID itself.');
            continue;
          }

          // Check for message text or quick reply
          const userText = message?.text || msgEvent.postback?.title || msgEvent.postback?.payload;
          const mid = message?.mid || `${senderId}_${msgEvent.timestamp}`;

          // Check deduplication
          if (this._processedMessageIds.has(mid)) {
            logger.debug(`Message ID ${mid} already processed. Skipping duplicate.`);
            continue;
          }
          this._processedMessageIds.add(mid);
          if (this._processedMessageIds.size > 2000) {
            const first = this._processedMessageIds.values().next().value;
            this._processedMessageIds.delete(first);
          }

          results.messagingEventsProcessed += 1;

          if (!rules.inboxReplyEnabled) {
            logger.info('Auto Inbox Reply is currently DISABLED. Skipping automated response.');
            this._logActivity({
              type: 'inbox_skipped',
              senderId,
              messageSnippet: userText ? userText.substring(0, 40) : 'Non-text message',
              note: 'Auto Inbox Reply toggle is OFF'
            });
            continue;
          }

          const replyText = rules.inboxReplyText || "Hello! Thanks for reaching out. How can we assist you today?";
          logger.info(`Triggering Auto Inbox Reply for PSID: ${senderId} ("${userText || ''}")`);

          // Send Messenger message via Meta Graph API
          const sendResult = await facebookService.sendMessengerReply({
            recipientId: senderId,
            messageText: replyText,
            pageId: entryPageId
          });

          if (sendResult.success) {
            await this._recordReplyStat('inbox');
            this._logActivity({
              type: 'inbox_replied',
              senderId,
              messageSnippet: userText ? userText.substring(0, 40) : '',
              replySnippet: replyText.substring(0, 40),
              status: 'SENT'
            });
            results.actionsTaken.push({
              type: 'MESSENGER_REPLY_SENT',
              recipientId: senderId,
              messageId: sendResult.messageId
            });
          } else {
            this._logActivity({
              type: 'inbox_failed',
              senderId,
              error: sendResult.error,
              status: 'ERROR'
            });
          }
        }
      }

      // ==============================================================
      // 2. Process entry.changes for Feed / Comment Events
      // ==============================================================
      if (Array.isArray(entry.changes) && entry.changes.length > 0) {
        for (const change of entry.changes) {
          const field = change.field;
          const val = change.value || {};

          // Filter for new comment events
          if ((field === 'feed' || field === 'comments') && val.item === 'comment' && val.verb === 'add') {
            const commentId = val.comment_id;
            const senderId = (val.from?.id || val.sender_id || '').toString();
            const senderName = val.from?.name || val.sender_name || 'Customer';
            const commentText = val.message || '';

            // Skip comments posted by the page itself to prevent infinite feedback loops
            if (senderId === entryPageId || senderId === configuredPageId) {
              logger.debug('Skipping comment made by page itself.');
              continue;
            }

            if (!commentId) {
              continue;
            }

            // Check deduplication
            if (this._processedCommentIds.has(commentId)) {
              logger.debug(`Comment ID ${commentId} already processed. Skipping duplicate.`);
              continue;
            }
            this._processedCommentIds.add(commentId);
            if (this._processedCommentIds.size > 2000) {
              const first = this._processedCommentIds.values().next().value;
              this._processedCommentIds.delete(first);
            }

            results.commentEventsProcessed += 1;

            if (!rules.commentReplyEnabled) {
              logger.info('Auto Comment Reply is currently DISABLED. Skipping automated reply.');
              this._logActivity({
                type: 'comment_skipped',
                commentId,
                senderName,
                commentSnippet: commentText.substring(0, 40),
                note: 'Auto Comment Reply toggle is OFF'
              });
              continue;
            }

            let replyText = rules.commentReplyText || "Thanks for your comment! We'll assist you shortly.";
            // Dynamic variable interpolation: replace {name} if present
            if (replyText.includes('{name}')) {
              replyText = replyText.replace(/\{name\}/g, senderName);
            }

            logger.info(`Triggering Auto Comment Reply for Comment ID: ${commentId} by "${senderName}"`);

            // Send Comment Reply via Meta Graph API
            const replyResult = await facebookService.sendCommentReply({
              commentId,
              messageText: replyText,
              pageId: entryPageId
            });

            if (replyResult.success) {
              await this._recordReplyStat('comment');
              this._logActivity({
                type: 'comment_replied',
                commentId,
                senderName,
                commentSnippet: commentText.substring(0, 40),
                replySnippet: replyText.substring(0, 40),
                status: 'SENT'
              });
              results.actionsTaken.push({
                type: 'COMMENT_REPLY_POSTED',
                commentId,
                replyId: replyResult.replyId
              });
            } else {
              this._logActivity({
                type: 'comment_failed',
                commentId,
                error: replyResult.error,
                status: 'ERROR'
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Simulate a webhook event (used for direct testing from the dashboard)
   */
  async simulateWebhookEvent({ type = 'comment', testMessage = 'Hello, is this item available?', senderName = 'Test Shopper' }) {
    const rulesData = await this.getRules();
    const rules = rulesData.rules;
    const pageId = facebookConfig.getPageId();

    if (type === 'comment') {
      const simulatedCommentId = `test_comment_${Date.now()}`;
      let replyText = rules.commentReplyText || "Thank you for reaching out!";
      if (replyText.includes('{name}')) {
        replyText = replyText.replace(/\{name\}/g, senderName);
      }

      let simulatedAction = 'DISABLED';
      if (rules.commentReplyEnabled) {
        simulatedAction = 'REPLIED_SIMULATED';
        await this._recordReplyStat('comment');
        this._logActivity({
          type: 'test_comment_simulated',
          senderName,
          commentSnippet: testMessage,
          replySnippet: replyText,
          status: 'SIMULATED_SUCCESS'
        });
      }

      return {
        success: true,
        type: 'comment',
        enabled: rules.commentReplyEnabled,
        action: simulatedAction,
        input: { commentId: simulatedCommentId, senderName, message: testMessage },
        generatedReply: replyText,
        pageId
      };
    } else {
      const simulatedPsid = `test_psid_${Date.now()}`;
      const replyText = rules.inboxReplyText || "Hello! Thanks for messaging us.";

      let simulatedAction = 'DISABLED';
      if (rules.inboxReplyEnabled) {
        simulatedAction = 'REPLIED_SIMULATED';
        await this._recordReplyStat('inbox');
        this._logActivity({
          type: 'test_inbox_simulated',
          senderId: simulatedPsid,
          messageSnippet: testMessage,
          replySnippet: replyText,
          status: 'SIMULATED_SUCCESS'
        });
      }

      return {
        success: true,
        type: 'inbox',
        enabled: rules.inboxReplyEnabled,
        action: simulatedAction,
        input: { psid: simulatedPsid, message: testMessage },
        generatedReply: replyText,
        pageId
      };
    }
  }
}

module.exports = new AutoReplyService();
