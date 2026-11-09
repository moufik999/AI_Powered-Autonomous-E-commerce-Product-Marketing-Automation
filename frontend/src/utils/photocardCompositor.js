/**
 * OmniMarket AI - Real Product Photo 3D Studio Photocard Compositor
 * Performs client-side background removal, tight transparent bounding-box cropping,
 * and composites the real product photo onto a photorealistic 3D studio podium stage.
 */

/**
 * Remove solid / white / studio background from a real product photo.
 * Uses color-distance edge sampling, neutral floor-shadow removal, edge feathering,
 * and tight bounding-box crop so the product sits flush on top of the 3D podium.
 *
 * @param {HTMLImageElement|HTMLCanvasElement} imgElement
 * @returns {HTMLCanvasElement} Cutout canvas tightly cropped around the product
 */
export const removeImageBackground = (imgElement) => {
  const width = imgElement.naturalWidth || imgElement.width || 600;
  const height = imgElement.naturalHeight || imgElement.height || 600;

  // 1. Draw source image onto an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imgElement, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 2. Sample outer perimeter & corners to determine background color
  let rSum = 0, gSum = 0, bSum = 0, sampleCount = 0;
  const samplePoints = [
    [2, 2], [width - 3, 2], [2, height - 3], [width - 3, height - 3],
    [Math.floor(width / 2), 2], [2, Math.floor(height / 2)],
    [width - 3, Math.floor(height / 2)], [Math.floor(width / 4), 2],
    [Math.floor((3 * width) / 4), 2]
  ];

  samplePoints.forEach(([x, y]) => {
    const idx = (y * width + x) * 4;
    rSum += data[idx];
    gSum += data[idx + 1];
    bSum += data[idx + 2];
    sampleCount++;
  });

  const bgR = rSum / sampleCount;
  const bgG = gSum / sampleCount;
  const bgB = bSum / sampleCount;
  const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

  // Thresholds for distance matting
  const colorThreshold = 28;
  const featherRange = 22;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasValidPixels = false;

  // 3. Process pixels: Alpha matting & neutral floor shadow removal
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) continue;

      // Color distance from sampled background
      const dist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      // White / bright studio background check
      const isPureWhite = (bgLum > 215) && (r > 238 && g > 238 && b > 238);

      // Floor shadow check near the bottom 25% of image
      const isBottomRegion = y > height * 0.75;
      const isNeutralGray = Math.abs(r - g) < 14 && Math.abs(g - b) < 14;
      const isFloorShadow = isBottomRegion && isNeutralGray && (r > 120 && r < 240) && dist < 75;

      if (isPureWhite || dist <= colorThreshold || isFloorShadow) {
        data[idx + 3] = 0; // Transparent
      } else if (dist < colorThreshold + featherRange) {
        // Smooth edge feathering
        const factor = (dist - colorThreshold) / featherRange;
        data[idx + 3] = Math.round(data[idx + 3] * factor);
      }

      // Track bounding box of non-transparent product pixels
      if (data[idx + 3] > 18) {
        hasValidPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // If matting removed everything or image was already transparent, return canvas
  if (!hasValidPixels || minX >= maxX || minY >= maxY) {
    return canvas;
  }

  // 4. Tight transparent bounding-box crop so product sits flush on podium surface
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const cropCtx = croppedCanvas.getContext('2d');
  cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return croppedCanvas;
};

/**
 * Composite the cutout Real Product Photo onto a Photorealistic 3D Studio Podium Stage.
 *
 * @param {HTMLCanvasElement} canvas - Target 900x900 canvas
 * @param {Object} options
 * @param {HTMLCanvasElement|HTMLImageElement} options.productCutout - Background-removed real product photo
 * @param {string} options.productName - Product title
 * @param {string} options.category - Product category
 * @param {string} [options.price] - Product price
 * @param {string} [options.discount] - Discount
 * @param {string} [options.theme='teal'] - 'teal' | 'blue'
 * @param {string} [options.storeName='Amar bazar']
 */
export const compositePhotocard = (canvas, {
  productCutout,
  productName = 'Product',
  category = 'General',
  price = '',
  discount = '',
  theme = 'teal',
  storeName = 'Amar bazar'
}) => {
  const ctx = canvas.getContext('2d');
  const W = 900;
  const H = 900;
  canvas.width = W;
  canvas.height = H;

  // Clear canvas
  ctx.clearRect(0, 0, W, H);

  // Pricing calculations
  let originalPrice = price.trim();
  let offerPrice = '';
  let discountText = discount.trim();

  if (price && discount) {
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const unit = price.replace(/[0-9.,]/g, '').trim() || 'BDT';
    const percentMatch = discount.match(/([0-9]+)\s*%/);

    if (numPrice && percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      offerPrice = `${Math.round(numPrice * (1 - pct / 100)).toLocaleString()} ${unit}`;
      discountText = `${pct}% OFF`;
    } else if (numPrice) {
      const fixMatch = discount.match(/([0-9]+)/);
      if (fixMatch) {
        const fix = parseFloat(fixMatch[1]);
        offerPrice = `${Math.max(0, numPrice - fix).toLocaleString()} ${unit}`;
      }
    }
  }

  if (theme === 'teal') {
    renderTealSpotlightPedestal(ctx, W, H, {
      productCutout,
      productName,
      category,
      price: originalPrice,
      offerPrice,
      discountText,
      storeName
    });
  } else {
    renderMidnightBlueFloatingPodium(ctx, W, H, {
      productCutout,
      productName,
      category,
      price: originalPrice,
      offerPrice,
      discountText,
      storeName
    });
  }
};

/* =========================================================================
 * THEME A: "Teal Spotlight 3D Pedestal" (Dropper Bottle Reference Vibe)
 * ========================================================================= */
function renderTealSpotlightPedestal(ctx, W, H, {
  productCutout,
  productName,
  category,
  price,
  offerPrice,
  discountText,
  storeName
}) {
  // 1. Photorealistic Dark Emerald/Teal Studio Background
  const bgGrad = ctx.createRadialGradient(W / 2, 280, 50, W / 2, 450, 650);
  bgGrad.addColorStop(0, '#0f3a3a');
  bgGrad.addColorStop(0.45, '#082525');
  bgGrad.addColorStop(0.85, '#031414');
  bgGrad.addColorStop(1, '#010a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Top-Center Glowing Studio Lamp & Volumetric Spotlight Cone
  ctx.save();
  // Volumetric Cone
  const coneGrad = ctx.createRadialGradient(W / 2, 0, 20, W / 2, 540, 520);
  coneGrad.addColorStop(0, 'rgba(45, 212, 191, 0.22)');
  coneGrad.addColorStop(0.4, 'rgba(20, 184, 166, 0.08)');
  coneGrad.addColorStop(0.8, 'rgba(13, 148, 136, 0.02)');
  coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, 0);
  ctx.lineTo(W / 2 + 40, 0);
  ctx.lineTo(W / 2 + 340, 580);
  ctx.lineTo(W / 2 - 340, 580);
  ctx.closePath();
  ctx.fill();

  // Top Light Fixture Glow
  const lampGrad = ctx.createRadialGradient(W / 2, 15, 2, W / 2, 15, 55);
  lampGrad.addColorStop(0, '#ffffff');
  lampGrad.addColorStop(0.3, '#5eead4');
  lampGrad.addColorStop(0.7, 'rgba(45, 212, 191, 0.35)');
  lampGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
  ctx.fillStyle = lampGrad;
  ctx.beginPath();
  ctx.arc(W / 2, 15, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. 2-Tier 3D Isometric Teal Square Pedestal
  // Lower Base Pedestal Tier
  const baseCenterY = 575;
  const baseW = 390;
  const baseD = 130;
  const baseH = 40;
  drawIsometricBlock(ctx, W / 2, baseCenterY, baseW, baseD, baseH, {
    topColor: '#0a3636',
    frontColor: '#052222',
    rightColor: '#021616',
    edgeHighlight: '#14b8a6'
  });

  // Upper Top Pedestal Tier
  const topCenterY = 515;
  const topW = 300;
  const topD = 105;
  const topH = 42;
  drawIsometricBlock(ctx, W / 2, topCenterY, topW, topD, topH, {
    topColor: '#0d9488',
    frontColor: '#0f766e',
    rightColor: '#115e59',
    edgeHighlight: '#5eead4',
    radialSpotlight: true
  });

  // 4. Dark Radial Ambient-Occlusion Contact Shadow on Upper Pedestal Top Face
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(W / 2, topCenterY, 5, W / 2, topCenterY, 110);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
  shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.65)');
  shadowGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.25)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(W / 2, topCenterY + 4, 110, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Inverted Real Product Surface Reflection & Flush Placement
  if (productCutout) {
    const maxProductH = 340;
    const maxProductW = 280;
    const aspect = productCutout.width / productCutout.height;

    let pW, pH;
    if (aspect > maxProductW / maxProductH) {
      pW = Math.min(productCutout.width, maxProductW);
      pH = pW / aspect;
    } else {
      pH = Math.min(productCutout.height, maxProductH);
      pW = pH * aspect;
    }

    const pX = W / 2 - pW / 2;
    const pY = topCenterY - pH + 2; // Bottom sits flush right on pedestal top face!

    // Inverted Surface Reflection
    ctx.save();
    ctx.beginPath();
    // Clip to upper pedestal rhombus top face
    ctx.moveTo(W / 2, topCenterY - topD / 2);
    ctx.lineTo(W / 2 + topW / 2, topCenterY);
    ctx.lineTo(W / 2, topCenterY + topD / 2);
    ctx.lineTo(W / 2 - topW / 2, topCenterY);
    ctx.closePath();
    ctx.clip();

    ctx.translate(W / 2, topCenterY);
    ctx.scale(1, -0.25);
    ctx.globalAlpha = 0.16;
    ctx.drawImage(productCutout, -pW / 2, 0, pW, pH);
    ctx.restore();

    // Draw the Cutout REAL Product Photo
    ctx.save();
    ctx.drawImage(productCutout, pX, pY, pW, pH);

    // Subtle overhead spotlight highlight on product
    ctx.globalCompositeOperation = 'source-atop';
    const prodLight = ctx.createLinearGradient(W / 2, pY, W / 2, pY + pH);
    prodLight.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    prodLight.addColorStop(0.4, 'rgba(45, 212, 191, 0.08)');
    prodLight.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = prodLight;
    ctx.fillRect(pX, pY, pW, pH);
    ctx.restore();
  }

  // 6. Double-Ring Circular "{Discount} OFF" Badge (Mid-Left)
  if (discountText) {
    drawDoubleRingBadge(ctx, 165, 305, 52, {
      ringColor: '#14b8a6',
      centerBg: '#042f2e',
      line1: discountText.includes('OFF') ? discountText.replace('OFF', '').trim() : discountText,
      line2: 'OFF',
      glow: '#2dd4bf'
    });
  }

  // 7. Circular "PRICE / OFFER PRICE" Badge (Mid-Right)
  if (price || offerPrice) {
    const displayPrice = offerPrice || price;
    drawDoubleRingBadge(ctx, 735, 305, 54, {
      ringColor: '#fbbf24',
      centerBg: '#042f2e',
      line1: offerPrice ? 'OFFER' : 'PRICE',
      line2: displayPrice,
      glow: '#f59e0b',
      isPrice: true
    });
  }

  // 8. Product Title & Details Below the Podium
  ctx.save();
  ctx.textAlign = 'center';

  // Product Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText(productName, W / 2, 690);

  // Category
  ctx.fillStyle = '#2dd4bf';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.shadowBlur = 0;
  ctx.fillText(category.toUpperCase(), W / 2, 722);

  // Features list
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('✨ 100% Authentic Quality   •   ✨ Verified Store Batch   •   ✨ Fast Express Delivery', W / 2, 750);
  ctx.restore();

  // 9. Dot-Matrix Accents & Bottom Footer
  drawDotMatrix(ctx, 60, 60, 4, 4, '#14b8a6');
  drawDotMatrix(ctx, W - 100, 60, 4, 4, '#14b8a6');

  // Bottom Center "SHOP NOW" Pill Button
  drawPillButton(ctx, W / 2, 825, 200, 46, 'SHOP NOW ➔', '#0d9488', '#14b8a6');

  // Bottom Left Social Icons Accent
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('● Facebook  ● WhatsApp', 60, 832);

  // Bottom Right Store Brand
  ctx.textAlign = 'right';
  ctx.fillStyle = '#2dd4bf';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(storeName, W - 60, 832);
  ctx.restore();
}

/* =========================================================================
 * THEME B: "Midnight Blue 3D Floating Podium" (AirPods Pro Reference Vibe)
 * ========================================================================= */
function renderMidnightBlueFloatingPodium(ctx, W, H, {
  productCutout,
  productName,
  category,
  price,
  offerPrice,
  discountText,
  storeName
}) {
  // 1. Deep Midnight-Blue Studio Stage Background
  const bgGrad = ctx.createRadialGradient(W / 2, 440, 40, W / 2, 450, 650);
  bgGrad.addColorStop(0, '#1e3a8a');
  bgGrad.addColorStop(0.35, '#0f172a');
  bgGrad.addColorStop(0.75, '#050a18');
  bgGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Top Centered Typography
  ctx.save();
  ctx.textAlign = 'center';

  // Cursive "Exclusive" script header
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive';
  ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
  ctx.shadowBlur = 12;
  ctx.fillText('Exclusive', W / 2, 95);

  // Bold Large Product Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 38px "Plus Jakarta Sans", sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 14;
  ctx.fillText(productName, W / 2, 150);

  // Category Subtitle
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.shadowBlur = 0;
  ctx.fillText(`( ${category.toUpperCase()} )`, W / 2, 185);

  // Pipe-separated features
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Top Rated Pick  |  Precision Craftsmanship  |  Guaranteed Satisfaction', W / 2, 215);
  ctx.restore();

  // 3. 2-Tier 3D Rounded Isometric Blue Platform / Podium at Bottom
  const podiumY = 620;
  const baseW = 460;
  const baseH = 65;
  const depth = 45;

  // Bottom tier
  drawRoundedPodium(ctx, W / 2, podiumY + 35, baseW + 50, baseH + 10, depth, {
    topColor: '#0c1e4a',
    sideColor: '#060d24',
    rimColor: '#1d4ed8'
  });

  // Top tier
  drawRoundedPodium(ctx, W / 2, podiumY, baseW, baseH, depth, {
    topColor: '#1e40af',
    sideColor: '#172554',
    rimColor: '#60a5fa'
  });

  // 4. Realistic Dark Oval Contact / Levitation Shadow on Podium
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(W / 2, podiumY, 10, W / 2, podiumY, 140);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.65)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(W / 2, podiumY + 2, 140, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Cutout REAL Product Standing / Floating on Podium
  if (productCutout) {
    const maxProductH = 340;
    const maxProductW = 320;
    const aspect = productCutout.width / productCutout.height;

    let pW, pH;
    if (aspect > maxProductW / maxProductH) {
      pW = Math.min(productCutout.width, maxProductW);
      pH = pW / aspect;
    } else {
      pH = Math.min(productCutout.height, maxProductH);
      pW = pH * aspect;
    }

    const pX = W / 2 - pW / 2;
    const pY = podiumY - pH + 4; // Flush with top surface

    ctx.save();
    ctx.drawImage(productCutout, pX, pY, pW, pH);

    // Subtle edge rim light
    ctx.globalCompositeOperation = 'source-atop';
    const rimLight = ctx.createLinearGradient(pX, pY, pX + pW, pY + pH);
    rimLight.addColorStop(0, 'rgba(147, 197, 253, 0.22)');
    rimLight.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    rimLight.addColorStop(1, 'rgba(30, 58, 138, 0.25)');
    ctx.fillStyle = rimLight;
    ctx.fillRect(pX, pY, pW, pH);
    ctx.restore();
  }

  // 6. Left Callout: "Hurry up!" & "{Discount} Off"
  if (discountText) {
    ctx.save();
    ctx.textAlign = 'left';

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('Hurry up!', 95, 430);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(discountText, 95, 470);
    ctx.restore();
  }

  // 7. Right Callout: Circular "Price" Badge
  if (price || offerPrice) {
    const finalPrice = offerPrice || price;
    drawCircularPricePill(ctx, 770, 440, 55, {
      label: offerPrice ? 'DEAL' : 'PRICE',
      price: finalPrice
    });
  }

  // 8. Bottom CTA: Glowing Blue "Buy now" Button & Spaced Website URL
  drawPillButton(ctx, W / 2, 805, 210, 48, 'Buy now', '#2563eb', '#60a5fa');

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(`W W W . ${storeName.replace(/\s+/g, '').toUpperCase()} . C O M`, W / 2, 860);
  ctx.restore();
}

/* =========================================================================
 * GRAPHICS HELPER UTILITIES FOR 3D CANVAS
 * ========================================================================= */

// Draw 3D Isometric Rectangular Pedestal Block
function drawIsometricBlock(ctx, cx, cy, w, d, h, {
  topColor,
  frontColor,
  rightColor,
  edgeHighlight,
  radialSpotlight = false
}) {
  ctx.save();

  // 1. Right Face
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy + d / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx + w / 2, cy + h);
  ctx.lineTo(cx, cy + d / 2 + h);
  ctx.closePath();
  ctx.fill();

  // 2. Front Face
  ctx.fillStyle = frontColor;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy);
  ctx.lineTo(cx, cy + d / 2);
  ctx.lineTo(cx, cy + d / 2 + h);
  ctx.lineTo(cx - w / 2, cy + h);
  ctx.closePath();
  ctx.fill();

  // 3. Top Face (Rhombus)
  if (radialSpotlight) {
    const spotGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
    spotGrad.addColorStop(0, '#14b8a6');
    spotGrad.addColorStop(0.7, topColor);
    spotGrad.addColorStop(1, '#0f766e');
    ctx.fillStyle = spotGrad;
  } else {
    ctx.fillStyle = topColor;
  }

  ctx.beginPath();
  ctx.moveTo(cx, cy - d / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + d / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
  ctx.fill();

  // 4. Luminous Edge Chamfer Lines
  if (edgeHighlight) {
    ctx.strokeStyle = edgeHighlight;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy);
    ctx.lineTo(cx, cy + d / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw 3D Rounded Cylinder Podium
function drawRoundedPodium(ctx, cx, cy, w, h, depth, { topColor, sideColor, rimColor }) {
  ctx.save();

  // Side Depth
  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + depth, w / 2, h / 2, 0, 0, Math.PI);
  ctx.lineTo(cx - w / 2, cy);
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  // Top Ellipse Face
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Rim
  if (rimColor) {
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.restore();
}

// Draw Double-Ring Circular Badge (Theme A)
function drawDoubleRingBadge(ctx, cx, cy, r, { ringColor, centerBg, line1, line2, glow, isPrice = false }) {
  ctx.save();
  ctx.shadowColor = glow || ringColor;
  ctx.shadowBlur = 14;

  // Outer ring
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
  ctx.stroke();

  // Center disk
  ctx.fillStyle = centerBg;
  ctx.fill();

  // Text
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.font = isPrice ? 'bold 12px "Plus Jakarta Sans", sans-serif' : '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(line1, cx, cy - 8);

  ctx.fillStyle = isPrice ? '#fbbf24' : '#2dd4bf';
  ctx.font = isPrice ? 'bold 15px "Plus Jakarta Sans", sans-serif' : 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(line2, cx, cy + 12);

  ctx.restore();
}

// Draw Circular Price Pill (Theme B)
function drawCircularPricePill(ctx, cx, cy, r, { label, price }) {
  ctx.save();
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = 16;

  const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r);
  grad.addColorStop(0, '#1e40af');
  grad.addColorStop(0.8, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(label, cx, cy - 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(price, cx, cy + 10);

  ctx.restore();
}

// Draw Modern Pill Button
function drawPillButton(ctx, cx, cy, w, h, text, bgColor, glowColor) {
  ctx.save();
  ctx.shadowColor = glowColor || bgColor;
  ctx.shadowBlur = 15;

  const radius = h / 2;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, radius);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);

  ctx.restore();
}

// Draw Dot Matrix Grid Accent
function drawDotMatrix(ctx, startX, startY, rows, cols, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  const gap = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.arc(startX + c * gap, startY + r * gap, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export default {
  removeImageBackground,
  compositePhotocard
};
