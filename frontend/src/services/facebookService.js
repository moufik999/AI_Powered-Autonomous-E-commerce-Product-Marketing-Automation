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
  }
};

export default facebookService;
