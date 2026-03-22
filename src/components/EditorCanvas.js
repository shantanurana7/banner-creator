import React, { useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { PLATFORM_CONFIGS, WINDOW_MOTIF_DEFAULTS } from '../utils/constants';
import {
  drawImageCover,
  drawGrid,
  drawLogo,
  drawDraftStamp,
  drawWindowMotif,
  drawSwoosh,
  drawTextElements,
} from '../utils/canvasHelpers';

/**
 * EditorCanvas - Main canvas component for each platform.
 * 
 * Canvas interactions: text drag, window motif drag/resize (all 4 corners), swoosh vertical drag.
 * Image crop is handled by the ImageCropModal, not here.
 */
const EditorCanvas = ({
  platformKey,
  imageDataUrl,
  textElements,
  cropState,
  motifState,
  swooshState,
  gridVisible,
  gridRatio,
  draftStamp,
  logoImg,
  onTextDrag,
  onMotifWindowChange,
  onSwooshOffsetChange,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef({
    type: null,
    active: false,
    elementId: null,
    corner  : null, // 'tl', 'tr', 'bl', 'br'
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    origX: 0,
    origY: 0,
    origWidth: 0,
    origHeight: 0,
  });

  const config = PLATFORM_CONFIGS[platformKey];

  // Draw everything
  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = config.width;
    canvas.height = config.height;

    // Layer 0: Image background
    drawImageCover(ctx, img, config.width, config.height, cropState);

    // Layer 1: Window Motif (gradient + cutout)
    if (motifState?.enabled) {
      drawWindowMotif(ctx, config.width, config.height, motifState);
    }

    // Layer 2: Swoosh
    if (swooshState?.enabled && motifState?.enabled) {
      drawSwoosh(ctx, canvas, motifState, swooshState);
    }

    // Layer 3a: Logo
    if (logoImg) {
      drawLogo(ctx, logoImg, platformKey);
    }

    // Layer 3b: Draft stamp
    if (draftStamp) {
      drawDraftStamp(ctx, config.width);
    }

    // Layer 3c: Grid
    if (gridVisible) {
      drawGrid(ctx, config.width, config.height, gridRatio);
    }

    // Layer 3d: Text
    drawTextElements(ctx, textElements);
  }, [config, cropState, motifState, swooshState, gridVisible, gridRatio, draftStamp, textElements, logoImg, platformKey]);

  // Load image from data URL
  useEffect(() => {
    if (!imageDataUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      // Force draw immediately upon image load to prevent stale state on tab switch
      drawAll();
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, drawAll]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  // --- Mouse coordinate helpers ---
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Hit-test: text
  const getTextElementAt = useCallback((mx, my) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');

    for (let i = textElements.length - 1; i >= 0; i--) {
      const el = textElements[i];
      const fontFamily = el.isTitle ? el.font : (el.isBold ? 'UniversLTStdBold' : el.font);
      ctx.font = `${el.isBold ? 'bold ' : ''}${el.size}px ${fontFamily}`;
      const textWidth = Math.min(ctx.measureText(el.text).width, el.wrapWidth);
      const textHeight = el.size;
      const hitX = el.textAlign === 'center' ? el.x - textWidth / 2 : el.x;
      const hitY = el.y - textHeight;

      if (mx >= hitX && mx <= hitX + textWidth && my >= hitY && my <= hitY + textHeight + 10) {
        return el.id;
      }
    }
    return null;
  }, [textElements]);

  // Hit-test: motif corners and body
  const getMotifHit = useCallback((mx, my) => {
    if (!motifState?.enabled || !motifState.window) return null;
    const win = motifState.window;
    const threshold = 20; // Corner hit area size

    // Check all 4 corners
    const corners = [
      { name: 'tl', cx: win.x, cy: win.y },
      { name: 'tr', cx: win.x + win.width, cy: win.y },
      { name: 'bl', cx: win.x, cy: win.y + win.height },
      { name: 'br', cx: win.x + win.width, cy: win.y + win.height },
    ];

    for (const corner of corners) {
      if (Math.abs(mx - corner.cx) < threshold && Math.abs(my - corner.cy) < threshold) {
        return { type: 'motif-resize', corner: corner.name };
      }
    }

    // Check inside window (for drag)
    if (mx >= win.x && mx <= win.x + win.width && my >= win.y && my <= win.y + win.height) {
      return { type: 'motif' };
    }
    return null;
  }, [motifState]);

  // Hit-test: swoosh
  const getSwooshHit = useCallback((mx, my) => {
    if (!swooshState?.enabled || !motifState?.enabled || !motifState.window) return false;
    const win = motifState.window;
    const sw = 120;
    const sh = 80;
    const swooshY = win.y + (swooshState.offsetY || win.height / 2) - sh / 2;

    let swooshX;
    if (swooshState.side === 'left') {
      swooshX = win.x - sw;
    } else {
      swooshX = win.x + win.width;
    }

    return mx >= swooshX && mx <= swooshX + sw && my >= swooshY && my <= swooshY + sh;
  }, [swooshState, motifState]);

  // Get cursor for a given corner
  const getCornerCursor = (corner) => {
    if (corner === 'tl' || corner === 'br') return 'nwse-resize';
    if (corner === 'tr' || corner === 'bl') return 'nesw-resize';
    return 'nwse-resize';
  };

  // --- Mouse event handlers ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      e.preventDefault();
      const pos = getCanvasPos(e);

      // Priority: text > swoosh > motif resize > motif drag
      const textId = getTextElementAt(pos.x, pos.y);
      if (textId) {
        const el = textElements.find((t) => t.id === textId);
        dragRef.current = {
          type: 'text', active: true, elementId: textId,
          offsetX: pos.x - el.x, offsetY: pos.y - el.y,
        };
        canvas.style.cursor = 'move';
        return;
      }

      if (getSwooshHit(pos.x, pos.y)) {
        dragRef.current = {
          type: 'swoosh', active: true, startY: pos.y,
          offsetY: swooshState.offsetY || motifState.window?.height / 2 || 0,
        };
        canvas.style.cursor = 'ns-resize';
        return;
      }

      const motifHit = getMotifHit(pos.x, pos.y);
      if (motifHit && motifHit.type === 'motif-resize') {
        const win = motifState.window;
        dragRef.current = {
          type: 'motif-resize', active: true,
          corner: motifHit.corner,
          startX: pos.x, startY: pos.y,
          origX: win.x, origY: win.y,
          origWidth: win.width, origHeight: win.height,
        };
        canvas.style.cursor = getCornerCursor(motifHit.corner);
        return;
      }

      if (motifHit && motifHit.type === 'motif') {
        dragRef.current = {
          type: 'motif', active: true,
          offsetX: pos.x - motifState.window.x, offsetY: pos.y - motifState.window.y,
        };
        canvas.style.cursor = 'move';
        return;
      }
    };

    const handleMouseMove = (e) => {
      e.preventDefault();
      const pos = getCanvasPos(e);
      const d = dragRef.current;

      if (!d.active) {
        // Hover cursors
        if (getTextElementAt(pos.x, pos.y)) canvas.style.cursor = 'move';
        else if (getSwooshHit(pos.x, pos.y)) canvas.style.cursor = 'ns-resize';
        else {
          const mh = getMotifHit(pos.x, pos.y);
          if (mh && mh.type === 'motif-resize') canvas.style.cursor = getCornerCursor(mh.corner);
          else if (mh && mh.type === 'motif') canvas.style.cursor = 'move';
          else canvas.style.cursor = 'default';
        }
        return;
      }

      switch (d.type) {
        case 'text':
          flushSync(() => {
            onTextDrag(d.elementId, pos.x - d.offsetX, pos.y - d.offsetY);
          });
          break;

        case 'motif': {
          const newX = pos.x - d.offsetX;
          const newY = pos.y - d.offsetY;
          const win = motifState.window;
          const clampedX = Math.max(0, Math.min(newX, config.width - win.width));
          const clampedY = Math.max(0, Math.min(newY, config.height - win.height));
          onMotifWindowChange({ ...win, x: clampedX, y: clampedY });
          break;
        }

        case 'motif-resize': {
          const [wR, hR] = (motifState.windowRatio || '7:10').split(':').map(Number);
          const minArea = config.width * config.height * WINDOW_MOTIF_DEFAULTS.minCoverFraction;
          const minW = Math.sqrt(minArea * (wR / hR));

          const deltaX = pos.x - d.startX;
          let newX = d.origX;
          let newY = d.origY;
          let newW = d.origWidth;

          // Determine resize direction based on corner
          if (d.corner === 'br') {
            newW = d.origWidth + deltaX;
          } else if (d.corner === 'bl') {
            newW = d.origWidth - deltaX;
            newX = d.origX + deltaX;
          } else if (d.corner === 'tr') {
            newW = d.origWidth + deltaX;
          } else if (d.corner === 'tl') {
            newW = d.origWidth - deltaX;
            newX = d.origX + deltaX;
          }

          // Enforce minimum
          newW = Math.max(minW, newW);
          let newH = newW * (hR / wR);

          // Adjust Y for top corners
          if (d.corner === 'tl' || d.corner === 'tr') {
            newY = d.origY + d.origHeight - newH;
          }

          // Adjust X for left corners
          if (d.corner === 'tl' || d.corner === 'bl') {
            newX = d.origX + d.origWidth - newW;
          }

          // Clamp within canvas
          newX = Math.max(0, newX);
          newY = Math.max(0, newY);
          newW = Math.min(newW, config.width - newX);
          newH = newW * (hR / wR);

          if (newY + newH > config.height) {
            newH = config.height - newY;
            newW = newH * (wR / hR);
          }

          onMotifWindowChange({ x: newX, y: newY, width: newW, height: newH });
          break;
        }

        case 'swoosh': {
          const deltaY = pos.y - d.startY;
          const newOffsetY = Math.max(0, Math.min(
            motifState.window.height,
            d.offsetY + deltaY
          ));
          onSwooshOffsetChange(newOffsetY);
          break;
        }

        default:
          break;
      }
    };

    const handleMouseUp = () => {
      dragRef.current.active = false;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    getCanvasPos, getTextElementAt, getMotifHit, getSwooshHit,
    textElements, motifState, swooshState, config,
    onTextDrag, onMotifWindowChange, onSwooshOffsetChange,
  ]);

  return (
    <div ref={containerRef} className="flex-1 min-w-0 flex flex-col items-center">
      <div
        className="w-full relative"
        style={{ maxWidth: '100%', aspectRatio: `${config.width} / ${config.height}` }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-xl shadow-2xl bg-surface-200"
          style={{ display: 'block' }}
        />
      </div>
      <div className="flex items-center justify-between w-full mt-2 px-1">
        <span className="text-[10px] text-gray-500">
          {config.width} × {config.height}px
        </span>
        <span className="text-[10px] text-gray-500">
          Drag text/motif/swoosh • Resize motif from corners
        </span>
      </div>
    </div>
  );
};

export default EditorCanvas;
