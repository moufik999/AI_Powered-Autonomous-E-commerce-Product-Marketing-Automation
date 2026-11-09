/**
 * OmniMarket AI - Frontend Photocard Service
 * API client for AI Photocard generation, background regeneration, and template selection.
 */

import { request } from './api';

export const photocardService = {
  // Generate full photocard
  generatePhotocard: async (params) => {
    return request('/photocard/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Regenerate background only
  regenerateBackground: async (params) => {
    return request('/photocard/regenerate-background', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Get templates for category
  getTemplates: async (category = '') => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/photocard/templates${query}`, {
      method: 'GET'
    });
  },

  // Get photocard generation history
  getHistory: async () => {
    return request('/photocard/history', {
      method: 'GET'
    });
  }
};

export default photocardService;
