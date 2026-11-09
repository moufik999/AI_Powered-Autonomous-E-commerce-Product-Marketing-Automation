/**
 * OmniMarket AI - Meta Facebook Graph API Configuration
 * Secure management of Page Access Token, Page ID, and API version endpoints.
 */

require('dotenv').config();
const logger = require('../utils/logger');

const getGraphApiVersion = () => process.env.FB_GRAPH_API_VERSION || 'v18.0';
const getBaseUrl = () => process.env.FB_GRAPH_BASE_URL || 'https://graph.facebook.com';
const getPageId = () => process.env.FB_PAGE_ID || '1469331552924612';
const getAccessToken = () => process.env.FB_PAGE_ACCESS_TOKEN || '';

const isFacebookConfigured = () => {
  const token = getAccessToken();
  const pageId = getPageId();
  return Boolean(token && token.trim().length > 15 && pageId && pageId.trim().length > 5);
};

const getFeedUrl = (pageId = getPageId()) => {
  return `${getBaseUrl()}/${getGraphApiVersion()}/${pageId}/feed`;
};

const getPhotosUrl = (pageId = getPageId()) => {
  return `${getBaseUrl()}/${getGraphApiVersion()}/${pageId}/photos`;
};

const getPageInfoUrl = (pageId = getPageId()) => {
  return `${getBaseUrl()}/${getGraphApiVersion()}/${pageId}?fields=id,name,category,link,verification_status`;
};

const getMaskedToken = () => {
  const token = getAccessToken();
  if (!token) return 'NOT_CONFIGURED';
  if (token.length < 12) return 'INVALID_TOKEN_LENGTH';
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
};

module.exports = {
  getGraphApiVersion,
  getBaseUrl,
  getPageId,
  getAccessToken,
  isFacebookConfigured,
  getFeedUrl,
  getPhotosUrl,
  getPageInfoUrl,
  getMaskedToken
};
