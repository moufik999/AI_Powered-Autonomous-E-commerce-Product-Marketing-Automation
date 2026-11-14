/**
 * OmniMarket AI - AutoReplyRule Model
 * Stores automated response configurations for Facebook Page events:
 * - Toggles for Comment Auto-Reply and Messenger Inbox Auto-Reply
 * - Custom response templates
 * - Real-time execution stats and delivery timestamps
 */

const mongoose = require('mongoose');

const autoReplyRuleSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      default: '1469331552924612',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      default: 'moufik241-35-391@diu.edu.bd',
      trim: true
    },
    commentReplyEnabled: {
      type: Boolean,
      default: true
    },
    inboxReplyEnabled: {
      type: Boolean,
      default: true
    },
    commentReplyText: {
      type: String,
      default: "Thank you for reaching out! We have received your comment and will assist you shortly. Explore our store for exclusive deals! 🛍️✨",
      trim: true
    },
    inboxReplyText: {
      type: String,
      default: "Hello! Thanks for contacting OmniMarket. We're here to help you find the best products. How can we assist you today? 😊",
      trim: true
    },
    stats: {
      commentRepliesSent: {
        type: Number,
        default: 0
      },
      inboxRepliesSent: {
        type: Number,
        default: 0
      },
      lastCommentReplyAt: {
        type: Date,
        default: null
      },
      lastInboxReplyAt: {
        type: Date,
        default: null
      },
      lastEventAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AutoReplyRule', autoReplyRuleSchema);
