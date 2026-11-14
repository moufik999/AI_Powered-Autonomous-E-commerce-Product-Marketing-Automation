/**
 * OmniMarket AI - Frontend Facebook Service
 */

import { request } from './api';

export const facebookService = {
  // Publish post to Facebook Page
  publishPost: async ({ caption, imageUrl = null, platform = 'Facebook' }) => {
    return request('/facebook/publish', {
      method: 'POST',
      body: JSON.stringify({ caption, imageUrl, platform })
    });
  },

  // Check Facebook Page connection status
  getPageStatus: async () => {
    return request('/facebook/status', {
      method: 'GET'
    });
  },

  // Get past published marketing posts
  getHistory: async () => {
    return request('/facebook/history', {
      method: 'GET'
    });
  },

  // Get active Auto-Reply Rules and real-time execution statistics
  getAutoReplyRules: async () => {
    return request('/facebook/auto-reply-rules', {
      method: 'GET'
    });
  },

  // Update Auto-Reply Rules (toggles & custom response templates)
  updateAutoReplyRules: async (rules) => {
    return request('/facebook/auto-reply-rules', {
      method: 'PUT',
      body: JSON.stringify(rules)
    });
  },

  // Simulate an incoming webhook event for live UI testing
  testSimulateWebhook: async ({ type, testMessage, senderName }) => {
    return request('/facebook/test-webhook', {
      method: 'POST',
      body: JSON.stringify({ type, testMessage, senderName })
    });
  }
};

export default facebookService;
