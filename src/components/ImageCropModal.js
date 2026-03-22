import React, { useState, useRef, useCallback } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { X, Check, ZoomIn, ZoomOut, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

/**
 * ImageCropModal - Full-screen modal with react-advanced-cropper for editing the image.
 * Based on the CodeSandbox reference: react-image-editor-t734x4 by saeedkefayati
 * 
 * Features:
 *   - Crop area locked to platform aspect ratio
 *   - Zoom slider
 *   - Rotate (90° increments)
 *   - Flip horizontal / vertical
 *   - Apply / Cancel
 * 
 * Does NOT include upload or download functionality.
 */
const ImageCropModal = ({ isOpen, imageUrl, platformConfig, onSave, onClose }) => {
  const cropperRef = useRef(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const aspectRatio = platformConfig.width / platformConfig.height;

  const handleApply = useCallback(() => {
    const cropper = cropperRef.current;
    if (!cropper) return;

    const canvas = cropper.getCanvas({
      width: platformConfig.width,
      height: platformConfig.height,
    });

    if (canvas) {
      const croppedDataUrl = canvas.toDataURL('image/png');
      onSave(croppedDataUrl);
    }
    onClose();
  }, [onSave, onClose, platformConfig]);

  const handleRotate = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      cropper.rotateImage(90);
    }
  };

  const handleFlipH = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      cropper.flipImage(true, false);
      setFlipH(!flipH);
    }
  };

  const handleFlipV = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      cropper.flipImage(false, true);
      setFlipV(!flipV);
    }
  };

  const handleZoom = (delta) => {
    const cropper = cropperRef.current;
    if (cropper) {
      cropper.zoomImage(delta);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3
                      bg-surface-50/95 border-b border-surface-300 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white">
          Edit Image — {platformConfig.label} ({platformConfig.width}×{platformConfig.height})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium
                       text-gray-400 bg-surface-200 rounded-lg hover:text-white
                       hover:bg-surface-300 transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium
                       text-white bg-accent-light rounded-lg hover:bg-accent transition-colors"
          >
            <Check size={14} /> Apply
          </button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="relative flex-1 z-10 overflow-hidden" style={{ background: '#0D1117' }}>
        <Cropper
          ref={cropperRef}
          src={imageUrl}
          stencilProps={{
            aspectRatio: aspectRatio,
          }}
          className="h-full"
          style={{ height: '100%' }}
        />
      </div>

      {/* Bottom Toolbar */}
      <div className="relative z-10 flex items-center justify-center gap-6 px-6 py-3
                      bg-surface-50/95 border-t border-surface-300 backdrop-blur-sm">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(0.9)}
            className="p-2 rounded-lg bg-surface-200 text-gray-400 hover:text-white
                       hover:bg-surface-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => handleZoom(1.1)}
            className="p-2 rounded-lg bg-surface-200 text-gray-400 hover:text-white
                       hover:bg-surface-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-surface-300" />

        {/* Rotate */}
        <button
          onClick={handleRotate}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                     bg-surface-200 text-gray-400 hover:text-white hover:bg-surface-300
                     transition-colors"
          title="Rotate 90°"
        >
          <RotateCw size={14} /> Rotate
        </button>

        {/* Flip H */}
        <button
          onClick={handleFlipH}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                     transition-colors ${
                       flipH
                         ? 'bg-accent-light/20 text-accent-ice'
                         : 'bg-surface-200 text-gray-400 hover:text-white hover:bg-surface-300'
                     }`}
          title="Flip Horizontal"
        >
          <FlipHorizontal size={14} /> Flip H
        </button>

        {/* Flip V */}
        <button
          onClick={handleFlipV}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg
                     transition-colors ${
                       flipV
                         ? 'bg-accent-light/20 text-accent-ice'
                         : 'bg-surface-200 text-gray-400 hover:text-white hover:bg-surface-300'
                     }`}
          title="Flip Vertical"
        >
          <FlipVertical size={14} /> Flip V
        </button>
      </div>
    </div>
  );
};

export default ImageCropModal;
