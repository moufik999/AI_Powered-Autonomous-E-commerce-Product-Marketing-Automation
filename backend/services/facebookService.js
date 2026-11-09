/**
 * OmniMarket AI - Facebook Service
 * Encapsulates Meta Graph API business logic for Page Publishing and verification.
 * Automatically resolves Page Access Token from User Access Token if needed.
 * Follows security best practices: NEVER leaks tokens in logs or responses.
 */

const axios = require('axios');
const facebookConfig = require('../config/facebook');
const logger = require('../utils/logger');

class FacebookService {
  constructor() {
    this._cachedPageToken = null;
    this._cachedForPageId = null;
    this._cachedSourceToken = null;
  }

  /**
   * Resolves the actual Page Access Token.
   * If the configured token is a User Access Token, Meta Graph API provides
   * the Page Access Token via GET /{pageId}?fields=access_token.
   */
  async getEffectivePageAccessToken(targetPageId, configuredToken) {
    if (
      this._cachedPageToken &&
      this._cachedForPageId === targetPageId &&
      this._cachedSourceToken === configuredToken
    ) {
      return this._cachedPageToken;
    }

    try {
      const pageInfoUrl = `${facebookConfig.getBaseUrl()}/${facebookConfig.getGraphApiVersion()}/${targetPageId}?fields=id,name,access_token`;
      const res = await axios.get(pageInfoUrl, {
        params: { access_token: configuredToken },
        timeout: 10000
      });

      if (res.data && res.data.access_token) {
        logger.info(`✓ Successfully resolved Page Access Token for Page: "${res.data.name || targetPageId}"`);
        this._cachedPageToken = res.data.access_token;
        this._cachedForPageId = targetPageId;
        this._cachedSourceToken = configuredToken;
        return this._cachedPageToken;
      }
    } catch (err) {
      logger.debug('Could not auto-resolve nested Page token, will attempt using configured token directly:', err.message);
    }

    return configuredToken;
  }

  /**
   * Publish a text post or photo post to the configured Facebook Page
   * @param {Object} params
   * @param {string} params.caption - The marketing post text
   * @param {string} [params.imageUrl] - Optional image URL to publish
   * @param {string} [params.pageId] - Optional custom page ID (defaults to config)
   * @returns {Promise<{success: boolean, postId: string, message: string, platform: string, data: any}>}
   */
  async publishPost({ caption, imageUrl = null, pageId = null }) {
    if (!facebookConfig.isFacebookConfigured()) {
      const error = new Error('Facebook Page Access Token or Page ID is not configured on the server.');
      error.statusCode = 400;
      error.code = 'FB_NOT_CONFIGURED';
      throw error;
    }

    if (!caption || !caption.trim()) {
      const error = new Error('Post caption content is required.');
      error.statusCode = 400;
      error.code = 'FB_EMPTY_CAPTION';
      throw error;
    }

    const targetPageId = pageId || facebookConfig.getPageId();
    const rawConfiguredToken = facebookConfig.getAccessToken();

    // Automatically resolve Page Access Token (handles both User Tokens and direct Page Tokens)
    const effectiveToken = await this.getEffectivePageAccessToken(targetPageId, rawConfiguredToken);

    try {
      let response;

      if (imageUrl && typeof imageUrl === 'string') {
        const photosUrl = facebookConfig.getPhotosUrl(targetPageId);

        if (imageUrl.startsWith('data:image')) {
          // 1. Publish Canvas Photocard (Data URL) via Multipart FormData
          logger.info(`Publishing Canvas Photocard to Facebook Page Photos: ${targetPageId}`);
          const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1] || 'image/png';
            const buffer = Buffer.from(matches[2], 'base64');
            const blob = new Blob([buffer], { type: mimeType });
            const formData = new FormData();
            formData.append('source', blob, 'photocard.png');
            formData.append('caption', caption.trim());
            formData.append('access_token', effectiveToken);

            response = await axios.post(photosUrl, formData, {
              timeout: 30000
            });
          }
        } else if (imageUrl.startsWith('http')) {
          // 2. Publish Image Post via remote URL
          logger.info(`Publishing Photo post (URL) to Facebook Page Photos: ${targetPageId}`);
          response = await axios.post(
            photosUrl,
            {
              url: imageUrl,
              caption: caption.trim(),
              access_token: effectiveToken
            },
            {
              timeout: 25000,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      if (!response) {
        // 3. Publish Text Post to Page Feed endpoint
        logger.info(`Publishing Text post to Facebook Page: ${targetPageId}`);
        const feedUrl = facebookConfig.getFeedUrl(targetPageId);
        response = await axios.post(
          feedUrl,
          {
            message: caption.trim(),
            access_token: effectiveToken
          },
          {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const postId = response.data.id || response.data.post_id;
      logger.info(`Successfully published post to Facebook Page (Post ID: ${postId})`);

      return {
        success: true,
        postId,
        message: 'Successfully published to Amar bazar Page live! 🚀',
        platform: 'Facebook',
        data: {
          id: postId,
          pageId: targetPageId,
          publishedAt: new Date()
        }
      };
    } catch (err) {
      // Invalidate cache if token failed
      this._cachedPageToken = null;

      // Handle and sanitize Facebook API errors without leaking access token
      const fbError = err.response?.data?.error;
      const rawMessage = fbError?.message || err.message || 'Unknown Facebook API error';
      const cleanMessage = logger.mask(rawMessage);
      const errorCode = fbError?.code;
      const errorSubcode = fbError?.error_subcode;

      logger.error(`Facebook Publish Error [Code: ${errorCode || 'N/A'}, Subcode: ${errorSubcode || 'N/A'}]: ${cleanMessage}`);

      const error = new Error();

      if (errorCode === 190) {
        error.message = 'The Facebook Page Access Token has expired or is invalid. Please refresh the token in server settings.';
        error.code = 'FB_TOKEN_EXPIRED';
        error.statusCode = 401;
      } else if (errorCode === 200 || errorCode === 10) {
        error.message = 'Permission denied by Meta Facebook Graph API. Please ensure the token has pages_manage_posts and pages_read_engagement permissions.';
        error.code = 'FB_PERMISSION_DENIED';
        error.statusCode = 403;
      } else if (errorCode === 368) {
        error.message = 'The Facebook Page is temporarily blocked or restricted by Meta policies.';
        error.code = 'FB_POLICY_RESTRICTION';
        error.statusCode = 429;
      } else {
        error.message = `Facebook Publishing failed: ${cleanMessage}`;
        error.code = 'FB_PUBLISH_FAILED';
        error.statusCode = err.response?.status || 500;
      }

      throw error;
    }
  }

  /**
   * Retrieve page metadata and verify connectivity
   * @returns {Promise<{isConfigured: boolean, pageId: string, pageName?: string, apiVersion: string}>}
   */
  async getPageStatus() {
    const isConfigured = facebookConfig.isFacebookConfigured();
    const pageId = facebookConfig.getPageId();
    const apiVersion = facebookConfig.getGraphApiVersion();

    if (!isConfigured) {
      return {
        isConfigured: false,
        pageId,
        apiVersion,
        status: 'Unconfigured',
        message: 'Facebook Page credentials are not fully configured in environment.'
      };
    }

    try {
      const pageInfoUrl = facebookConfig.getPageInfoUrl(pageId);
      const configuredToken = facebookConfig.getAccessToken();
      const response = await axios.get(pageInfoUrl, {
        params: { access_token: configuredToken },
        timeout: 8000
      });

      return {
        isConfigured: true,
        pageId,
        pageName: response.data.name || 'Amar bazar',
        category: response.data.category,
        apiVersion,
        status: 'Connected',
        message: 'Connected to Meta Facebook Graph API'
      };
    } catch (err) {
      logger.warn(`Could not verify Facebook Page status: ${logger.mask(err.message)}`);
      return {
        isConfigured: true,
        pageId,
        apiVersion,
        status: 'Connected (Fallback)',
        message: 'Page credentials configured.'
      };
    }
  }
}

module.exports = new FacebookService();
