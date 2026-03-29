import {
  GRID_CONFIG,
  LOGO_CONFIG,
  DRAFT_STAMP_CONFIG,
  MOTIF_GRADIENTS,
  SWOOSH_CONFIG,
} from './constants';

// ============================================================
// CANVAS HELPER FUNCTIONS
// All drawing operations for the editor canvas
// ============================================================

/**
 * Wraps text on a canvas context. Supports center alignment.
 */
export const wrapText = (ctx, text, x, y, maxWidth, lineHeight, align = 'center') => {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, i) => {
    let drawX = x;
    if (align === 'center') {
      const textWidth = ctx.measureText(l).width;
      drawX = x - textWidth / 2;
    }
    ctx.fillText(l, drawX, y + i * lineHeight);
  });

  return lines.length;
};

/**
 * Draws a grid overlay on the canvas.
 * gridRatio controls the cell proportions (e.g. '7:10' or '10:7').
 */
export const drawGrid = (ctx, canvasWidth, canvasHeight, gridRatio = '7:10') => {
  const density = GRID_CONFIG.density;
  const [wR, hR] = gridRatio.split(':').map(Number);
  const cellWidth = canvasWidth / density;
  const cellHeight = cellWidth * (hR / wR);

  ctx.save();
  ctx.strokeStyle = GRID_CONFIG.color;
  ctx.lineWidth = GRID_CONFIG.lineWidth;
  ctx.beginPath();

  // Vertical lines
  for (let x = cellWidth; x < canvasWidth; x += cellWidth) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }

  // Horizontal lines
  for (let y = cellHeight; y < canvasHeight; y += cellHeight) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }

  ctx.stroke();
  ctx.restore();
};

/**
 * Draws the KPMG logo on the canvas.
 * Uses per-platform logo widths from LOGO_CONFIG.widths.
 */
export const drawLogo = (ctx, logoImg, platformKey) => {
  if (!logoImg) return;

  const pos = LOGO_CONFIG.positions[platformKey];
  if (!pos) return;

  const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
  const drawWidth = LOGO_CONFIG.widths[platformKey] || 100;
  const drawHeight = drawWidth * aspectRatio;

  ctx.drawImage(logoImg, pos.x, pos.y, drawWidth, drawHeight);
};

/**
 * Draws the Draft Version stamp on the canvas.
 */
export const drawDraftStamp = (ctx, canvasWidth) => {
  const cfg = DRAFT_STAMP_CONFIG;
  const x = canvasWidth - cfg.width - cfg.padding;
  const y = cfg.padding;

  // Background
  ctx.save();
  ctx.fillStyle = cfg.bgColor;
  ctx.beginPath();
  roundRect(ctx, x, y, cfg.width, cfg.height, cfg.cornerRadius);
  ctx.fill();

  // Border
  ctx.strokeStyle = cfg.textColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, x, y, cfg.width, cfg.height, cfg.cornerRadius);
  ctx.stroke();

  // Text
  ctx.fillStyle = cfg.textColor;
  ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.text, x + cfg.width / 2, y + cfg.height / 2);

  ctx.restore();
};

/**
 * Helper to draw rounded rectangles.
 */
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * Draws the window motif overlay with gradient and window cutout.
 *
 * LAYER ORDER:
 *   Layer 0 (base): Uploaded image background (drawn before this function)
 *   Layer 1: Full-canvas gradient overlay with a CUTOUT that reveals Layer 0
 *   Layer 2: Swoosh (drawn after this function)
 *   Layer 3: Logo + text (drawn after this function)
 *
 * The cutout is the "window" — it punches through the gradient to show the image.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {object} motifState - { enabled, gradientKey, windowRatio, gradientOpacity, blendMode,
 *                                window: { x, y, width, height } }
 */
export const drawWindowMotif = (ctx, canvasWidth, canvasHeight, motifState) => {
  if (!motifState || !motifState.enabled) return;

  const gradient = MOTIF_GRADIENTS[motifState.gradientKey] || MOTIF_GRADIENTS.dark;
  const win = motifState.window;

  // Use per-state opacity if set, otherwise fall back to gradient default
  const opacity = (motifState.gradientOpacity !== undefined)
    ? motifState.gradientOpacity
    : gradient.opacity;

  // Blend mode: 'source-over' (normal/smooth), 'multiply', 'overlay' (linear)
  const blendMode = motifState.blendMode || 'source-over';

  ctx.save();

  // Create an offscreen canvas for the gradient layer
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const offCtx = offscreen.getContext('2d');

  // Fill with gradient on offscreen canvas
  const grad = offCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  grad.addColorStop(0, gradient.from);
  grad.addColorStop(1, gradient.to);
  offCtx.fillStyle = grad;
  offCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Cut out the window area (clear those pixels — no border drawn)
  offCtx.clearRect(win.x, win.y, win.width, win.height);

  // Draw the offscreen gradient (with cutout) onto the main canvas
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = blendMode;
  ctx.drawImage(offscreen, 0, 0);

  // Reset composite operation and alpha
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;

  ctx.restore();
};

/**
 * Draws the swoosh effect as a RECTANGLE (not ellipse).
 * Samples edge color from the window cutout and creates a gradient streak.
 *
 * Opacity behavior:
 *  - 100% opacity from the window edge to (opaqueFraction * swooshWidth)
 *  - Linear fade from 100% → 0% over the remaining far portion
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {object} motifState
 * @param {object} swooshState
 * @param {string} platformKey - used to select per-platform swoosh dimensions
 */
export const drawSwoosh = (ctx, canvas, motifState, swooshState, platformKey) => {
  if (!swooshState || !swooshState.enabled || !motifState || !motifState.enabled) return;

  const win = motifState.window;
  const { side, offsetY } = swooshState;

  // Per-platform dimensions, with fallback
  const platformDims = (SWOOSH_CONFIG.platforms && platformKey && SWOOSH_CONFIG.platforms[platformKey])
    ? SWOOSH_CONFIG.platforms[platformKey]
    : { width: 120, height: 80 };

  const swooshW = swooshState.width || platformDims.width?.default || 120;
  const swooshH = swooshState.height || platformDims.height?.default || 80;
  const stripCount = SWOOSH_CONFIG.sampleBandSize || 30;
  const opaqueFraction = SWOOSH_CONFIG.opaqueFraction || 0.6;

  // X positions for drawing and sampling
  let sampleX, swooshX;
  if (side === 'left') {
    sampleX = Math.max(0, win.x + 5);
    swooshX = win.x - swooshW;
  } else {
    sampleX = Math.min(canvas.width - 1, win.x + win.width - 5);
    swooshX = win.x + win.width;
  }

  const swooshY = win.y + (offsetY || win.height / 2) - swooshH / 2;

  // Clamp swoosh within the window motif border (top & bottom), then within canvas
  const clampedY = Math.max(win.y, Math.min(win.y + win.height - swooshH, swooshY));
  const clampedX = Math.max(0, Math.min(canvas.width - swooshW, swooshX));

  ctx.save();

  // --- Step 1: Sample N colors at evenly-spaced points along the swoosh height ---
  const samples = [];   // [{ r, g, b }]
  for (let i = 0; i < stripCount; i++) {
    const t = i / (stripCount - 1);
    const sampleY = Math.min(canvas.height - 1, Math.max(0, clampedY + t * (swooshH - 1)));
    let r = 0, g = 51, b = 141; // fallback: #00338d
    try {
      const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
      r = pixel[0]; g = pixel[1]; b = pixel[2];
    } catch (e) { /* CORS fallback */ }
    samples.push({ r, g, b });
  }

  // --- Step 2: Render 1px-tall rows with per-row interpolated color (no banding) ---
  const totalRows = Math.ceil(swooshH);

  for (let row = 0; row < totalRows; row++) {
    const t = row / Math.max(totalRows - 1, 1);  // 0..1 along vertical extent

    // Smooth lerp between the two nearest sample colors
    const samplePos = t * (stripCount - 1);
    const lo = Math.floor(samplePos);
    const hi = Math.min(lo + 1, stripCount - 1);
    const frac = samplePos - lo;

    const sLo = samples[lo];
    const sHi = samples[hi];
    const r = Math.round(sLo.r + (sHi.r - sLo.r) * frac);
    const g = Math.round(sLo.g + (sHi.g - sLo.g) * frac);
    const b = Math.round(sLo.b + (sHi.b - sLo.b) * frac);
    const currentY = clampedY + row;

    // Horizontal gradient: fully opaque zone → smooth ease-out fade to transparent
    let grad;
    if (side === 'left') {
      // Swoosh goes LEFT from window edge (right side of swoosh is at window)
      // clampedX is leftmost edge; clampedX + swooshW is at window edge
      grad = ctx.createLinearGradient(clampedX + swooshW, currentY, clampedX, currentY);
    } else {
      // Swoosh goes RIGHT from window edge (left side of swoosh is at window)
      grad = ctx.createLinearGradient(clampedX, currentY, clampedX + swooshW, currentY);
    }

    const swooshOpacity = swooshState.opacity !== undefined ? swooshState.opacity : 1;

    // Fully opaque from window edge to opaqueFraction
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${swooshOpacity})`);
    grad.addColorStop(opaqueFraction, `rgba(${r}, ${g}, ${b}, ${swooshOpacity})`);
    // Ease-out fade: mid-point at ~35% of the base opacity for a smooth visual ramp
    const midFade = opaqueFraction + (1 - opaqueFraction) * 0.5;
    grad.addColorStop(midFade, `rgba(${r}, ${g}, ${b}, ${swooshOpacity * 0.35})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(clampedX, currentY, swooshW, 1);
  }

  ctx.restore();
};

/**
 * Draws the uploaded image onto the canvas with crop/zoom applied.
 * The image always fills the entire canvas (cover behavior).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} image
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {object} cropState - { zoom, panX, panY }
 * @param {object} [imageAdjust] - { contrast, saturation } as percentages (100 = normal)
 */
export const drawImageCover = (ctx, image, canvasWidth, canvasHeight, cropState, imageAdjust) => {
  if (!image) return;

  const zoom = cropState?.zoom || 1;
  const panX = cropState?.panX || 0;
  const panY = cropState?.panY || 0;

  const imgRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let srcWidth, srcHeight;
  if (imgRatio > canvasRatio) {
    // Image is wider — fit by height
    srcHeight = image.naturalHeight / zoom;
    srcWidth = srcHeight * canvasRatio;
  } else {
    // Image is taller — fit by width
    srcWidth = image.naturalWidth / zoom;
    srcHeight = srcWidth / canvasRatio;
  }

  // Center + pan
  let srcX = (image.naturalWidth - srcWidth) / 2 - panX / zoom;
  let srcY = (image.naturalHeight - srcHeight) / 2 - panY / zoom;

  // Clamp to image bounds
  srcX = Math.max(0, Math.min(srcX, image.naturalWidth - srcWidth));
  srcY = Math.max(0, Math.min(srcY, image.naturalHeight - srcHeight));

  // Apply image filters if provided
  if (imageAdjust && (imageAdjust.contrast !== 100 || imageAdjust.saturation !== 100)) {
    ctx.save();
    ctx.filter = `contrast(${imageAdjust.contrast}%) saturate(${imageAdjust.saturation}%)`;
    ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, canvasWidth, canvasHeight);
    ctx.filter = 'none';
    ctx.restore();
  } else {
    ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, canvasWidth, canvasHeight);
  }
};

/**
 * Draws all text elements on the canvas.
 */
export const drawTextElements = (ctx, textElements) => {
  textElements.forEach((el) => {
    ctx.save();
    ctx.fillStyle = el.color;
    const fontWeight = el.isBold ? 'bold ' : '';
    const fontFamily = el.isTitle ? el.font : (el.isBold ? 'UniversLTStdBold' : el.font);
    ctx.font = `${fontWeight}${el.size}px ${fontFamily}`;
    ctx.textAlign = 'left';
    wrapText(ctx, el.text, el.x, el.y, el.wrapWidth, el.size + 5, el.textAlign || 'center');
    ctx.restore();
  });
};
