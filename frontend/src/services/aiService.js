/**
 * OmniMarket AI - Frontend AI Generation Service
 */

import { request } from './api';

export const aiService = {
  // Generate post with structured product parameters
  generatePost: async ({
    productName,
    category,
    price,
    discount,
    details,
    prompt,
    platform = 'Facebook',
    tone
  }) => {
    return request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        productName,
        category,
        price,
        discount,
        details,
        prompt: prompt || productName,
        platform,
        tone
      })
    });
  },

  // Creative variations
  getVariations: async (prompt, count = 3) => {
    return request('/ai/variations', {
      method: 'POST',
      body: JSON.stringify({ prompt, count })
    });
  }
};

export default aiService;
