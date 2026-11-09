/**
 * OmniMarket AI - Frontend Constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-powered-autonomous-server-1-opps1a7ct-moufik.vercel.app/api';

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_EMAIL: 'userEmail',
  USER_ROLE: 'userRole'
};

export const PLATFORMS = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TWITTER: 'Twitter'
};

export const TONES = [
  'Engaging & High-Converting',
  'Urgent & Promotional',
  'Casual & Friendly',
  'Professional & Informative',
  'Storytelling & Relatable'
];
