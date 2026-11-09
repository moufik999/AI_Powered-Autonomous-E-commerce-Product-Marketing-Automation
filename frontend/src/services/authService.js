/**
 * OmniMarket AI - Frontend Authentication Service
 */

import { request } from './api';

export const authService = {
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (email, password) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getProfile: async () => {
    return request('/auth/me', {
      method: 'GET'
    });
  }
};

export default authService;
