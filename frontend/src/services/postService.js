import { request } from './api';

export const postService = {
  savePost: async ({
    userId,
    userEmail,
    productName,
    category,
    productDetails,
    price,
    discount,
    generatedCaption,
    photocardUrl,
    facebookPostId,
    metadata
  }) => {
    return request('/posts', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        userEmail,
        productName,
        category,
        productDetails,
        price,
        discount,
        generatedCaption,
        photocardUrl,
        facebookPostId,
        metadata
      })
    });
  },

  getHistory: async (userEmail = '') => {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
    return request(`/posts/history${query}`, {
      method: 'GET'
    });
  },

  getCount: async (userEmail = '') => {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
    return request(`/posts/count${query}`, {
      method: 'GET'
    });
  },

  syncInsights: async (postId) => {
    const timestamp = Date.now();
    return request(`/ai/posts/${postId}/sync-insights?_t=${timestamp}`, {
      method: 'GET',
      cache: 'no-store'
    });
  }
};

export default postService;
