/**
 * OmniMarket AI - Meta Facebook Graph API Configuration
 * Secure management of Page Access Token, Page ID, and API version endpoints.
 */

require('dotenv').config();
const logger = require('../utils/logger');

const sanitize = (val) => {
  if (!val) return '';
  return val.toString().trim().replace(/^["'\[\]()]+|["'\[\]()]+$/g, '').trim();
};

const getGraphApiVersion = () => {
  const raw = (process.env.FB_GRAPH_API_VERSION || '').toString();
  const match = raw.match(/v?[0-9]+(?:\.[0-9]+)?/);
  if (match) {
    const v = match[0];
    return v.startsWith('v') ? v : `v${v}`;
  }
  return 'v18.0';
};

const getBaseUrl = () => {
  const raw = (process.env.FB_GRAPH_BASE_URL || '').toString();
  // Extract clean URL even if user pasted a markdown link like [https://...](https://...) or quoted string
  const match = raw.match(/https?:\/\/[a-zA-Z0-9.\-_]+/);
  if (match) {
    return match[0].replace(/\/+$/, '');
  }
  return 'https://graph.facebook.com';
};

const getPageId = () => {
  const pid = (process.env.FB_PAGE_ID || '').toString();
  const match = pid.match(/[0-9]{8,}/);
  if (match) {
    return match[0];
  }
  return '1469331552924612';
};

const getAccessToken = () => {
  const raw = (process.env.FB_PAGE_ACCESS_TOKEN || '').toString();
  return sanitize(raw);
};

const isFacebookConfigured = () => {
  const token = getAccessToken();
  const pageId = getPageId();
  return Boolean(token && token.length > 15 && pageId && pageId.length > 5);
};

const getFeedUrl = (pageId = getPageId()) => {
  const cleanId = sanitize(pageId).replace(/[^0-9]/g, '') || getPageId();
  return `${getBaseUrl()}/${getGraphApiVersion()}/${cleanId}/feed`;
};

const getPhotosUrl = (pageId = getPageId()) => {
  const cleanId = sanitize(pageId).replace(/[^0-9]/g, '') || getPageId();
  return `${getBaseUrl()}/${getGraphApiVersion()}/${cleanId}/photos`;
};

const getPageInfoUrl = (pageId = getPageId()) => {
  const cleanId = sanitize(pageId).replace(/[^0-9]/g, '') || getPageId();
  return `${getBaseUrl()}/${getGraphApiVersion()}/${cleanId}?fields=id,name,category,link,verification_status`;
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
