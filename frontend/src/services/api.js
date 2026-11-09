/**
 * OmniMarket AI - Base API Client
 * Centralized fetch wrapper with automatic JWT token attachment and error parsing.
 * Preserves backward-compatible loginUser and registerUser functions.
 */

import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

/**
 * Core HTTP Request Wrapper
 */
export const request = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please verify backend is running on port 5000.');
    }
    throw error;
  }
};

/**
 * Backward-compatible exports for existing component callers
 */
export const loginUser = async (email, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerUser = async (email, password) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export default {
  request,
  loginUser,
  registerUser
};
