/**
 * OmniMarket AI - Sharp Photocard Compositor Service
 * Uses Sharp to composite AI generated backgrounds, real product photos,
 * typography, pricing/discount badges, and call-to-action buttons into an ultra-sharp 1080x1080 photocard.
 */

const sharp = require('sharp');
const logger = require('../utils/logger');

class SharpCompositorService {
  /**
   * Main Compositing Workflow
   * @param {Object} params
   * @param {Buffer} params.backgroundBuffer - AI or Studio background image buffer (1080x1080)
   * @param {Buffer|string} params.productCutout - Buffer or Base64 data URL of the cutout product photo
   * @param {Object} params.productData - Product information and analysis
   * @param {Object} params.template - Layout and color configuration
   * @param {string} [params.storeName='Amar bazar']
   * @returns {Promise<Buffer>} Final composed PNG buffer
   */
  async composite({
    backgroundBuffer,
    productCutout,
    productData,
    template,
    storeName = 'Amar bazar'
  }) {
    const W = 1080;
    const H = 1080;

    // 1. Ensure background is exactly 1080x1080 PNG
    let baseImage = sharp(backgroundBuffer).resize(W, H, { fit: 'cover' });

    const compositeLayers = [];

    // 2. Prepare & Scale the Cutout Real Product Image
    if (productCutout) {
      try {
        let productBuffer;
        if (typeof productCutout === 'string' && productCutout.startsWith('data:image')) {
          const matches = productCutout.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          productBuffer = Buffer.from(matches[2], 'base64');
        } else if (Buffer.isBuffer(productCutout)) {
          productBuffer = productCutout;
        }

        if (productBuffer) {
          const meta = await sharp(productBuffer).metadata();
          const pW = meta.width || 500;
          const pH = meta.height || 500;
          const aspect = pW / pH;

          const maxH = template?.productImagePosition?.maxHeight || 440;
          const maxW = template?.productImagePosition?.maxWidth || 460;

          let targetW, targetH;
          if (aspect > maxW / maxH) {
            targetW = Math.round(maxW);
            targetH = Math.round(maxW / aspect);
          } else {
            targetH = Math.round(maxH);
            targetW = Math.round(maxH * aspect);
          }

          const resizedProduct = await sharp(productBuffer)
            .resize(targetW, targetH, { fit: 'contain' })
            .png()
            .toBuffer();

          const left = Math.round((W - targetW) / 2);
          const top = Math.round((template?.productImagePosition?.bottomY || 780) - targetH);

          // Add soft ground shadow under product
          const shadowSvg = `
            <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="prodShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
                  <stop offset="50%" stop-color="#000000" stop-opacity="0.5" />
                  <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="${W / 2}" cy="${top + targetH + 4}" rx="${Math.round(targetW * 0.44)}" ry="26" fill="url(#prodShadow)" />
            </svg>
          `;
          compositeLayers.push({
            input: Buffer.from(shadowSvg),
            top: 0,
            left: 0
          });

          // Product cutout layer
          compositeLayers.push({
            input: resizedProduct,
            top: Math.max(0, top),
            left: Math.max(0, left)
          });
        }
      } catch (err) {
        logger.warn('Sharp product cutout composition warning:', err.message);
      }
    }

    // 3. Render High-DPI Vector Typography & Badges Overlay
    const overlaySvg = this._buildTypographyOverlaySvg(W, H, productData, template, storeName);
    compositeLayers.push({
      input: Buffer.from(overlaySvg),
      top: 0,
      left: 0
    });

    // 4. Combine all layers
    const finalBuffer = await baseImage
      .composite(compositeLayers)
      .png({ quality: 95 })
      .toBuffer();

    return finalBuffer;
  }

  /**
   * Builds SVG vector overlay for Typography, Badges, and Call To Action
   */
  _buildTypographyOverlaySvg(W, H, productData, template, storeName) {
    const {
      productName = 'Product Name',
      category = 'Category',
      marketingHeadline = '',
      features = [],
      price = '',
      discount = '',
      offerPrice = ''
    } = productData;

    const colors = template?.colorScheme || {
      primary: '#3b82f6',
      accent: '#60a5fa',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      badgeBg: 'rgba(15, 23, 42, 0.92)'
    };

    const headline = marketingHeadline || `Exclusive ${productName}`;
    const cleanFeatures = (features || []).slice(0, 3);
    const featuresLine = cleanFeatures.join('   •   ');

    // Badges SVG
    let discountBadgeSvg = '';
    if (discount) {
      discountBadgeSvg = `
        <!-- Discount Circular Double Ring Badge (Top Left) -->
        <g transform="translate(140, 150)">
          <circle cx="0" cy="0" r="54" fill="${colors.badgeBg}" stroke="${colors.accent}" stroke-width="3" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))" />
          <circle cx="0" cy="0" r="47" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
          <text x="0" y="-8" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${this._escapeXml(discount)}</text>
          <text x="0" y="16" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="${colors.accent}" text-anchor="middle" dominant-baseline="middle">OFF</text>
        </g>
      `;
    }

    let priceBadgeSvg = '';
    if (price || offerPrice) {
      const displayPrice = offerPrice || price;
      const isOffer = Boolean(offerPrice && discount);
      priceBadgeSvg = `
        <!-- Price Badge (Top Right) -->
        <g transform="translate(${W - 150}, 150)">
          <circle cx="0" cy="0" r="58" fill="${colors.badgeBg}" stroke="${isOffer ? '#fbbf24' : colors.accent}" stroke-width="3" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))" />
          <circle cx="0" cy="0" r="51" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
          <text x="0" y="-12" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="${isOffer ? '#fef08a' : '#94a3b8'}" text-anchor="middle" dominant-baseline="middle">${isOffer ? 'SPECIAL DEAL' : 'PRICE'}</text>
          <text x="0" y="12" font-family="Arial, sans-serif" font-weight="900" font-size="17" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${this._escapeXml(displayPrice)}</text>
        </g>
      `;
    }

    return `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.9" />
          </filter>
          <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.primary}" />
            <stop offset="100%" stop-color="${colors.secondary || colors.primary}" />
          </linearGradient>
        </defs>

        <!-- Top Category Pill Tag -->
        <g transform="translate(${W / 2}, 65)">
          <rect x="-90" y="-16" width="180" height="32" rx="16" fill="rgba(0,0,0,0.6)" stroke="${colors.accent}" stroke-width="1.5" />
          <text x="0" y="2" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="${colors.accent}" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${this._escapeXml(category.toUpperCase())}</text>
        </g>

        <!-- Marketing Headline -->
        <text x="${W / 2}" y="125" font-family="Arial, sans-serif" font-weight="800" font-size="34" fill="${colors.textPrimary}" text-anchor="middle" filter="url(#textGlow)">${this._escapeXml(headline)}</text>

        <!-- Product Name -->
        <text x="${W / 2}" y="175" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle" filter="url(#textGlow)">${this._escapeXml(productName)}</text>

        <!-- Feature Bullets Header -->
        ${featuresLine ? `<text x="${W / 2}" y="215" font-family="Arial, sans-serif" font-weight="600" font-size="15" fill="${colors.textSecondary}" text-anchor="middle" filter="url(#textGlow)">${this._escapeXml(featuresLine)}</text>` : ''}

        <!-- Badges -->
        ${discountBadgeSvg}
        ${priceBadgeSvg}

        <!-- Bottom Call to Action Button & Store Footer -->
        <g transform="translate(${W / 2}, ${H - 120})">
          <!-- Button Background Pill -->
          <rect x="-130" y="-27" width="260" height="54" rx="27" fill="url(#ctaGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.6))" />
          <text x="0" y="2" font-family="Arial, sans-serif" font-weight="800" font-size="18" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">ORDER NOW ➔</text>
        </g>

        <!-- Store URL & Verified Footer -->
        <text x="${W / 2}" y="${H - 55}" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#94a3b8" text-anchor="middle" letter-spacing="3">WWW.AMARBAZAR.COM  •  VERIFIED QUALITY</text>
      </svg>
    `;
  }

  _escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return String(unsafe || '');
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }
}

module.exports = new SharpCompositorService();
