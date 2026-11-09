/**
 * OmniMarket AI - Frontend Product Service
 */

import { request } from './api';

export const productService = {
  getAllProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`, {
      method: 'GET'
    });
  },

  getProductById: async (id) => {
    return request(`/products/${id}`, {
      method: 'GET'
    });
  },

  seedDemoProducts: async () => {
    return request('/products/seed', {
      method: 'POST'
    });
  }
};

export default productService;
