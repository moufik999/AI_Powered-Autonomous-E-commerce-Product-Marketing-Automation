/**
 * OmniMarket AI - Interactive Denim Zipper Menu (6-Item Navigation)
 * 
 * Features:
 * - HTML5 Canvas diagonal denim texture with base color #1e3252
 * - Smooth S-curve parting mechanism over 110px reach
 * - Dashed gold seam stitching parallel to tracks (leftX - 14, rightX + 14)
 * - Interlocking brass teeth with gold gradient and specular highlights
 * - 6 Progressive reveal items:
 *   1. Dashboard (/dashboard)
 *   2. AI Post Generator (/generate)
 *   3. Photocard (/photocards)
 *   4. All Posts (/history)
 *   5. My Profile (/profile)
 *   6. Sign Out (red danger hover)
 * - Physics: pointerdown, pointermove, pointerup, drag, partial stop, flick gesture
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ZipperMenu.css';

const W = 300;
const H = 510;
const ZIP_X = 68;
const GAP = 180;
const REACH = 110;
const MIN_Y = 28;
const MAX_Y = 458;
const SPACING = 9;

// 6 Target Route Items
export const DEFAULT_ZIPPER_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    subtitle: 'Overview metrics & health',
    path: '/dashboard',
    icon: '📊'
  },
  {
    id: 'generate',
    label: 'AI Post Generator',
    subtitle: 'Gemini RAG copy engine',
    path: '/generate',
    icon: '⚡'
  },
  {
    id: 'photocards',
    label: 'Photocard',
    subtitle: 'View & download cards',
    path: '/photocards',
    icon: '🎨'
  },
  {
    id: 'history',
    label: 'All Posts',
    subtitle: 'Saved post history',
    path: '/history',
    icon: '📑'
  },
  {
    id: 'profile',
    label: 'My Profile',
    subtitle: 'Active session info',
    path: '/profile',
    icon: '👤',
    isProfile: true
  },
  {
    id: 'signout',
    label: 'Sign Out',
    subtitle: 'End session & return to login',
    path: '/login',
    icon: '🚪',
    isSignout: true
  }
];

// Procedural diagonal denim twill texture with #1e3252
function createDenimPattern() {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base denim color #1e3252 as specified
  ctx.fillStyle = '#1e3252';
  ctx.fillRect(0, 0, size, size);

  // Diagonal 3/1 twill weave lines (45 degrees)
  ctx.lineWidth = 1.2;
  for (let offset = -size; offset < size * 2; offset += 4) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + size, size);
    ctx.strokeStyle = Math.abs(offset) % 8 === 0 ? '#274470' : '#172740';
    ctx.stroke();
  }

  // Warp and weft thread flecks
  for (let x = 0; x < size; x += 2) {
    for (let y = 0; y < size; y += 2) {
      if ((x + y) % 4 === 0) {
        ctx.fillStyle = 'rgba(180, 205, 235, 0.16)';
        ctx.fillRect(x, y, 1, 1);
      } else if ((x - y) % 3 === 0) {
        ctx.fillStyle = 'rgba(10, 16, 30, 0.32)';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas;
}

// Compute track coordinates and tangent rotation angles
function getTrackX(y, sliderY) {
  if (y >= sliderY) {
    return { leftX: ZIP_X, rightX: ZIP_X, angleLeft: 0, angleRight: 0 };
  }

  const distAbove = sliderY - y;
  const t = Math.min(1, distAbove / REACH);
  const smooth = t * t * (3 - 2 * t);
  const leftX = ZIP_X - smooth * 32;
  const rightX = ZIP_X + smooth * (GAP - 32);

  let dLeftX_dy = 0;
  let dRightX_dy = 0;

  if (t < 1) {
    const dsmooth_dy = (-6 * t * (1 - t)) / REACH;
    dLeftX_dy = -32 * dsmooth_dy;
    dRightX_dy = (GAP - 32) * dsmooth_dy;
  }

  const angleLeft = Math.atan2(dLeftX_dy, 1);
  const angleRight = Math.atan2(dRightX_dy, 1);

  return { leftX, rightX, angleLeft, angleRight };
}

export default function ZipperMenu({
  items = DEFAULT_ZIPPER_ITEMS,
  onSignOut,
  className = '',
  initialSliderY = MAX_Y // Default open or custom
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sliderY, setSliderY] = useState(initialSliderY);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const denimPatternRef = useRef(null);
  const animRef = useRef(null);
  const itemRefs = useRef([]);

  // Physics tracking refs
  const dragStartY = useRef(0);
  const dragStartSliderY = useRef(0);
  const lastPointerY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const totalTravel = useRef(0);

  // Find active item
  const activeItem = items.find((i) => i.path === location.pathname) || items[0];

  // Smooth animation helper
  const animateTo = useCallback((targetY, duration = 300, onComplete) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    setSliderY((currentSliderY) => {
      const startY = currentSliderY;
      const diff = targetY - startY;

      if (Math.abs(diff) < 1) {
        if (onComplete) onComplete();
        return targetY;
      }

      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const nextY = startY + diff * ease;

        setSliderY(nextY);

        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          setSliderY(targetY);
          animRef.current = null;
          if (onComplete) onComplete();
        }
      };

      animRef.current = requestAnimationFrame(step);
      return currentSliderY;
    });
  }, []);

  // Handle Menu Item Click: Navigate or Sign Out
  const handleItemClick = (item) => {
    if (item.isSignout) {
      if (onSignOut) {
        onSignOut();
      } else {
        localStorage.clear();
        navigate('/login');
      }
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  // Pointer Physics: Drag, Flick, Click-Toggle
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (animRef.current) cancelAnimationFrame(animRef.current);

    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartSliderY.current = sliderY;
    lastPointerY.current = e.clientY;
    lastTime.current = performance.now();
    velocity.current = 0;
    totalTravel.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTime.current);
    const dy = e.clientY - lastPointerY.current;

    velocity.current = dy / dt;
    totalTravel.current += Math.abs(dy);

    lastPointerY.current = e.clientY;
    lastTime.current = now;

    const rawNewY = dragStartSliderY.current + (e.clientY - dragStartY.current);
    const clampedY = Math.max(MIN_Y, Math.min(MAX_Y, rawNewY));
    setSliderY(clampedY);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const vpx = velocity.current;
    const travel = totalTravel.current;

    // 1. Simple Click (< 6px travel) toggles
    if (travel < 6) {
      if (sliderY > (MIN_Y + MAX_Y) / 2) {
        animateTo(MIN_Y, 260);
      } else {
        animateTo(MAX_Y, 300);
      }
      return;
    }

    // 2. Velocity-based Flick Gesture
    if (Math.abs(vpx) > 0.65 && travel > 24) {
      if (vpx > 0) {
        animateTo(MAX_Y, 240); // flick down -> open
      } else {
        animateTo(MIN_Y, 240); // flick up -> close
      }
      return;
    }

    // 3. Partial Stop: Released in middle -> stays right at sliderY
  };

  // HTML5 Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Prepare denim pattern
    if (!denimPatternRef.current) {
      const pCanvas = createDenimPattern();
      denimPatternRef.current = ctx.createPattern(pCanvas, 'repeat');
    }
    const denimPattern = denimPatternRef.current;

    // 1. Draw Left Denim Flap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(getTrackX(0, sliderY).leftX, 0);
    for (let y = 1; y <= sliderY; y += 2) {
      ctx.lineTo(getTrackX(y, sliderY).leftX, y);
    }
    ctx.lineTo(ZIP_X, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = denimPattern;
    ctx.fill();

    // Fabric cut edge shadow
    ctx.strokeStyle = 'rgba(10, 16, 28, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Right Denim Flap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(getTrackX(0, sliderY).rightX, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(ZIP_X, H);
    ctx.lineTo(ZIP_X, sliderY);
    for (let y = sliderY; y >= 0; y -= 2) {
      ctx.lineTo(getTrackX(y, sliderY).rightX, y);
    }
    ctx.closePath();
    ctx.fillStyle = denimPattern;
    ctx.fill();

    // Fabric cut edge shadow
    ctx.strokeStyle = 'rgba(10, 16, 28, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();

    // 3. Draw Dashed Gold Seam Stitching (leftX - 14 and rightX + 14)
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = 'rgba(212, 163, 89, 0.85)';
    ctx.lineWidth = 1.5;

    // Left Seam Stitch
    ctx.beginPath();
    ctx.moveTo(getTrackX(0, sliderY).leftX - 14, 0);
    for (let y = 1; y <= sliderY; y += 3) {
      ctx.lineTo(getTrackX(y, sliderY).leftX - 14, y);
    }
    ctx.lineTo(ZIP_X - 14, H);
    ctx.stroke();

    // Right Seam Stitch
    ctx.beginPath();
    ctx.moveTo(getTrackX(0, sliderY).rightX + 14, 0);
    for (let y = 1; y <= sliderY; y += 3) {
      ctx.lineTo(getTrackX(y, sliderY).rightX + 14, y);
    }
    ctx.lineTo(ZIP_X + 14, H);
    ctx.stroke();
    ctx.restore();

    // 4. Draw Brass Teeth
    const toothW = 7.5;
    const toothH = 3.6;
    const toothR = 1.3;

    const drawTooth = (x, y, angle, isRightSide) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      if (isRightSide) ctx.scale(-1, 1);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 2.5;
      ctx.shadowOffsetY = 1;

      const grad = ctx.createLinearGradient(-toothW / 2, -toothH / 2, toothW / 2, toothH / 2);
      grad.addColorStop(0, '#b45309');
      grad.addColorStop(0.5, '#fde047');
      grad.addColorStop(1, '#92400e');

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-toothW / 2, -toothH / 2, toothW, toothH, toothR);
      } else {
        ctx.rect(-toothW / 2, -toothH / 2, toothW, toothH);
      }
      ctx.fill();

      // Highlight line
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-toothW / 2 + 1, -toothH / 2 + 0.5, toothW - 2, 0.8);

      ctx.restore();
    };

    // A. Parted teeth along V-opening above slider
    for (let y = 8; y < sliderY; y += SPACING) {
      const { leftX, rightX, angleLeft, angleRight } = getTrackX(y, sliderY);
      drawTooth(leftX + 1.2, y, angleLeft, false);
      drawTooth(rightX - 1.2, y, angleRight, true);
    }

    // B. Interlocked teeth below slider
    for (let y = sliderY; y < H - 8; y += SPACING) {
      drawTooth(ZIP_X - 1.2, y, 0, false);
      if (y + SPACING / 2 < H - 8) {
        drawTooth(ZIP_X + 1.2, y + SPACING / 2, 0, true);
      }
    }

    ctx.restore();
  }, [sliderY]);

  // Unzipped Percentage & State Label
  const unzippedPercent = Math.round(((sliderY - MIN_Y) / (MAX_Y - MIN_Y)) * 100);
  const stateLabel =
    unzippedPercent <= 5 ? 'CLOSED' : unzippedPercent >= 95 ? 'FULLY OPEN' : `${unzippedPercent}% UNZIPPED`;

  return (
    <div className={`zipper-menu-container ${className}`}>
      {/* 1. Status Header Above Zipper */}
      <div className="zipper-status-header">
        <div className="zipper-status-badge">
          <span className="zipper-status-dot" />
          <span>Active View</span>
        </div>
        <h3 className="zipper-status-title">{activeItem.label}</h3>
        <div className="zipper-status-hint">
          <span className="zipper-status-state">{stateLabel}</span>
          <span>{sliderY <= MIN_Y + 10 ? 'Pull slider down to unzip' : 'Click uncovered route'}</span>
        </div>
      </div>

      {/* 2. Container: nav.zipper */}
      <nav
        className="zipper"
        style={{
          '--zipper-w': `${W}px`,
          '--zipper-h': `${H}px`,
          '--zipper-gap': `${GAP}px`,
          '--zipper-reach': `${REACH}px`,
          '--zip-x': `${ZIP_X}px`
        }}
      >
        {/* Procedural Denim & Brass Teeth Canvas Overlay */}
        <canvas ref={canvasRef} className="zipper-canvas" />

        {/* 6 Menu Items with Progressive Reveal */}
        <ul className="zipper-links">
          {items.map((item, index) => {
            const el = itemRefs.current[index];
            const itemTop = el ? el.offsetTop : 18 + index * 58;
            const isRevealed = sliderY > itemTop + 40;
            const isActive = location.pathname === item.path;

            return (
              <li
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                className="zipper-link-item"
                style={{
                  opacity: isRevealed ? 1 : 0.25,
                  transform: isRevealed ? 'translateY(0)' : 'translateY(8px)',
                  pointerEvents: isRevealed ? 'auto' : 'none',
                  transition: 'opacity 0.22s ease-out, transform 0.22s ease-out'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`zipper-link-btn ${isActive ? 'is-active' : ''} ${
                    item.isProfile ? 'is-profile' : ''
                  } ${item.isSignout ? 'is-signout' : ''}`}
                >
                  <div className="zipper-link-icon-wrap">
                    <span>{item.icon}</span>
                  </div>
                  <div className="zipper-link-info">
                    <span className="zipper-link-title">{item.label}</span>
                    <span className="zipper-link-subtitle">{item.subtitle}</span>
                  </div>
                  {isActive && <span className="zipper-link-active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 3. Realistic Gold Zipper Pull Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`zipper-pull ${isDragging ? 'is-dragging' : ''}`}
          style={{
            top: `${sliderY}px`
          }}
          aria-label="Zipper pull slider"
        >
          {/* Slider Body (Crown) */}
          <div className="slider-body">
            <div className="slider-bridge" />
          </div>

          {/* Hanging Pull Tab */}
          <div className="slider-tab">
            <div className="slider-tab-grip">
              <span />
              <span />
              <span />
            </div>
            <div className="slider-tab-hole" />
          </div>
        </button>
      </nav>
    </div>
  );
}
