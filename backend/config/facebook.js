/**
 * OmniMarket AI - Meta Facebook Graph API Configuration
 * Secure management of Page Access Token, Page ID, and API version endpoints.
 */

require('dotenv').config();
const logger = require('../utils/logger');

const sanitize = (val) => {
  if (!val) return '';
  return val.toString().trim().replace(/^["']|["']$/g, '').trim();
};

const getGraphApiVersion = () => {
  let v = sanitize(process.env.FB_GRAPH_API_VERSION);
  if (!v) return 'v18.0';
  if (!v.startsWith('v')) v = `v${v}`;
  return v.replace(/[^a-zA-Z0-9.]/g, '');
};

const getBaseUrl = () => {
  let url = sanitize(process.env.FB_GRAPH_BASE_URL);
  if (!url || !url.startsWith('http')) {
    if (url && (url.includes('graph.facebook.com') || url.includes('facebook.com'))) {
      url = `https://${url.replace(/^\/+/, '')}`;
    } else {
      url = 'https://graph.facebook.com';
    }
  }
  return url.replace(/\/+$/, '');
};

const getPageId = () => {
  const pid = sanitize(process.env.FB_PAGE_ID);
  const cleanId = pid.replace(/[^0-9]/g, '');
  return cleanId || '1469331552924612';
};

const getAccessToken = () => sanitize(process.env.FB_PAGE_ACCESS_TOKEN);

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
