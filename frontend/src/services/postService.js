/**
 * OmniMarket AI - Post Service
 * Frontend API client for saving generated posts and fetching post history.
 */

import { request } from './api';

export const postService = {
  // Save all post info into MongoDB
  savePost: async ({
    userEmail,
    productName,
    productDetails,
    price,
    discount,
    generatedCaption,
    photocardUrl,
    metadata
  }) => {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify({
        userEmail,
        productName,
        productDetails,
        price,
        discount,
        generatedCaption,
        photocardUrl,
        metadata
      })
    });
  },

  // Get post history for currently logged in user
  getHistory: async (userEmail = '') => {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
    return request(`/posts/history${query}`, {
      method: 'GET'
    });
  },

  // Get total post count
  getCount: async (userEmail = '') => {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
    return request(`/posts/count${query}`, {
      method: 'GET'
    });
  }
};

export default postService;
