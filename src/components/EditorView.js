import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  Download, RefreshCw, Grid3X3, FileDown, ImageIcon, Repeat,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import EditorCanvas from './EditorCanvas';
import TextPanel from './TextPanel';
import MotifPanel from './MotifPanel';
import ImageCropModal from './ImageCropModal';
import {
  PLATFORM_CONFIGS,
  FONTS,
  LOGO_CONFIG,
  WINDOW_MOTIF_DEFAULTS,
  SWOOSH_CONFIG,
  GRID_CONFIG,
  createDefaultTextElements,
} from '../utils/constants';
import {
  drawImageCover,
  drawLogo,
  drawDraftStamp,
  drawWindowMotif,
  drawSwoosh,
  drawTextElements,
} from '../utils/canvasHelpers';

/**
 * Compute initial (smallest valid) window size for a given platform and ratio.
 * Smallest = 20% of canvas area at the given aspect ratio.
 */
const computeMinWindow = (config, ratio) => {
  const [wR, hR] = ratio.split(':').map(Number);
  const minArea = config.width * config.height * WINDOW_MOTIF_DEFAULTS.minCoverFraction;
  const winW = Math.sqrt(minArea * (wR / hR));
  const winH = winW * (hR / wR);
  return {
    x: (config.width - winW) / 2,
    y: (config.height - winH) / 2,
    width: winW,
    height: winH,
  };
};

/**
 * EditorView - Tab-based multi-platform editor orchestrator.
 */
const EditorView = ({ imageDataUrl, selectedPlatforms, editorStates, onEditorStatesChange }) => {
  const [activeTab, setActiveTab] = useState(selectedPlatforms[0] || '');
  const logoImgRef = useRef(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  // Load logo once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      logoImgRef.current = img;
      setLogoLoaded(true);
    };
    img.onerror = () => console.warn('Failed to load logo');
    img.src = LOGO_CONFIG.path;
  }, []);

  // Initialize editor states for selected platforms
  useEffect(() => {
    const newStates = { ...editorStates };
    let changed = false;

    selectedPlatforms.forEach((platform) => {
      if (!newStates[platform]) {
        const config = PLATFORM_CONFIGS[platform];
        const initRatio = WINDOW_MOTIF_DEFAULTS.aspectRatio;
        const win = computeMinWindow(config, initRatio);

        newStates[platform] = {
          textElements: createDefaultTextElements(platform),
          cropState: { zoom: 1, panX: 0, panY: 0 },
          croppedImageUrl: null, // Will hold result from ImageCropModal
          motifState: {
            enabled: false,
            gradientKey: WINDOW_MOTIF_DEFAULTS.defaultGradient,
            windowRatio: initRatio,
            window: win,
          },
          swooshState: {
            enabled: false,
            side: SWOOSH_CONFIG.defaultSide,
            offsetY: win.height / 2,
          },
          gridVisible: false,
          gridRatio: GRID_CONFIG.defaultRatio,
          draftStamp: false,
        };
        changed = true;
      }
    });

    if (changed) {
      onEditorStatesChange(newStates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatforms]);

  // Ensure activeTab is valid
  useEffect(() => {
    if (!selectedPlatforms.includes(activeTab)) {
      setActiveTab(selectedPlatforms[0] || '');
    }
  }, [selectedPlatforms, activeTab]);

  const currentState = editorStates[activeTab];
  if (!currentState) return null;

  const currentPlatformConfig = PLATFORM_CONFIGS[activeTab];

  // The image to display: use cropped version if available, otherwise original
  const displayImageUrl = currentState.croppedImageUrl || imageDataUrl;

  // --- State updaters ---
  const updateCurrentPlatform = (updates) => {
    onEditorStatesChange({
      ...editorStates,
      [activeTab]: { ...editorStates[activeTab], ...updates },
    });
  };

  const updateTextElement = (elementId, key, value) => {
    const newTextElements = currentState.textElements.map((el) =>
      el.id === elementId ? { ...el, [key]: value } : el
    );
    updateCurrentPlatform({ textElements: newTextElements });
  };

  const handleTextDrag = (elementId, x, y) => {
    flushSync(() => {
      const newTextElements = currentState.textElements.map((el) =>
        el.id === elementId ? { ...el, x, y } : el
      );
      updateCurrentPlatform({ textElements: newTextElements });
    });
  };

  const addTextElement = (type) => {
    const isTitle = type === 'title';
    const existing = currentState.textElements.filter((el) => el.isTitle === isTitle);
    const idx = existing.length + 1;
    const config = PLATFORM_CONFIGS[activeTab];

    const newElement = {
      id: `${type}${Date.now()}`,
      text: `${isTitle ? 'Title' : 'Subtitle'} ${idx}`,
      x: config.width / 2,
      y: config.height / 2 + (isTitle ? -40 + (idx - 1) * 60 : 40 + (idx - 1) * 40),
      size: isTitle ? 48 : 24,
      minSize: isTitle ? 28 : 14,
      maxSize: isTitle ? 72 : 40,
      color: '#FFFFFF',
      isTitle,
      maxLength: isTitle ? 60 : 90,
      font: isTitle ? FONTS.title : FONTS.subtitle,
      isBold: isTitle,
      wrapWidth: Math.min(config.width * 0.7, 600),
      textAlign: 'center',
    };

    updateCurrentPlatform({
      textElements: [...currentState.textElements, newElement],
    });
  };

  const removeTextElement = (elementId) => {
    updateCurrentPlatform({
      textElements: currentState.textElements.filter((el) => el.id !== elementId),
    });
  };

  const handleReset = () => {
    const config = PLATFORM_CONFIGS[activeTab];
    const initRatio = WINDOW_MOTIF_DEFAULTS.aspectRatio;
    const win = computeMinWindow(config, initRatio);

    updateCurrentPlatform({
      textElements: createDefaultTextElements(activeTab),
      cropState: { zoom: 1, panX: 0, panY: 0 },
      croppedImageUrl: null,
      motifState: {
        enabled: false,
        gradientKey: WINDOW_MOTIF_DEFAULTS.defaultGradient,
        windowRatio: initRatio,
        window: win,
      },
      swooshState: {
        enabled: false,
        side: SWOOSH_CONFIG.defaultSide,
        offsetY: win.height / 2,
      },
      gridVisible: false,
      gridRatio: GRID_CONFIG.defaultRatio,
      draftStamp: false,
    });
  };

  const handleSwitchGridRatio = () => {
    const newRatio = currentState.gridRatio === '7:10' ? '10:7' : '7:10';
    updateCurrentPlatform({ gridRatio: newRatio });
  };

  // --- Crop Modal ---
  const handleCropSave = (croppedDataUrl) => {
    updateCurrentPlatform({ croppedImageUrl: croppedDataUrl });
  };

  // --- Download ---
  const buildExportCanvas = (platformKey, state, callback) => {
    const pConfig = PLATFORM_CONFIGS[platformKey];
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pConfig.width;
    tempCanvas.height = pConfig.height;
    const ctx = tempCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawImageCover(ctx, img, pConfig.width, pConfig.height, state.cropState);

      if (state.motifState?.enabled) {
        drawWindowMotif(ctx, pConfig.width, pConfig.height, state.motifState);
      }
      if (state.swooshState?.enabled && state.motifState?.enabled) {
        drawSwoosh(ctx, tempCanvas, state.motifState, state.swooshState);
      }
      if (logoImgRef.current) {
        drawLogo(ctx, logoImgRef.current, platformKey);
      }
      if (state.draftStamp) {
        drawDraftStamp(ctx, pConfig.width);
      }
      drawTextElements(ctx, state.textElements);
      callback(tempCanvas);
    };
    // Use cropped image if available
    img.src = state.croppedImageUrl || imageDataUrl;
  };

  const handleDownload = () => {
    buildExportCanvas(activeTab, currentState, (canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `${PLATFORM_CONFIGS[activeTab].label.toLowerCase().replace(/\s+/g, '_')}.png`);
      });
    });
  };

  const handleDownloadAll = () => {
    const zip = new JSZip();
    const platforms = selectedPlatforms.filter((p) => editorStates[p]);

    let completed = 0;
    platforms.forEach((platform) => {
      buildExportCanvas(platform, editorStates[platform], (canvas) => {
        canvas.toBlob((blob) => {
          zip.file(`${PLATFORM_CONFIGS[platform].label.toLowerCase().replace(/\s+/g, '_')}.png`, blob);
          completed++;
          if (completed === platforms.length) {
            zip.generateAsync({ type: 'blob' }).then((content) => {
              saveAs(content, 'banners.zip');
            });
          }
        });
      });
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-surface-300 mb-4">
        <div className="flex">
          {selectedPlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`px-5 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                activeTab === platform
                  ? 'text-accent-ice'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{PLATFORM_CONFIGS[platform].icon}</span>
                {PLATFORM_CONFIGS[platform].label}
              </span>
              {activeTab === platform && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-lighter rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          {/* Grid Toggle */}
          <button
            onClick={() => updateCurrentPlatform({ gridVisible: !currentState.gridVisible })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
              currentState.gridVisible
                ? 'bg-accent/20 text-accent-ice border border-accent-light/30'
                : 'bg-surface-200 text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Grid3X3 size={13} /> Grid
          </button>

          {/* Grid Ratio Switch */}
          <button
            onClick={handleSwitchGridRatio}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-surface-200 text-gray-400
                       rounded-lg hover:text-white transition-colors"
          >
            <Repeat size={13} />
            {currentState.gridRatio}
          </button>

          <div className="w-px h-5 bg-surface-300 mx-1" />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-yellow-600/20 text-yellow-400
                       rounded-lg hover:bg-yellow-600/30 transition-colors"
          >
            <RefreshCw size={13} /> Reset
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600/20 text-green-400
                       rounded-lg hover:bg-green-600/30 transition-colors"
          >
            <Download size={13} /> Download
          </button>

          {/* Download All */}
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-light/20 text-accent-ice
                       rounded-lg hover:bg-accent-light/30 transition-colors"
          >
            <FileDown size={13} /> All (.zip)
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex gap-4">
        {/* Canvas */}
        <EditorCanvas
          platformKey={activeTab}
          imageDataUrl={displayImageUrl}
          textElements={currentState.textElements}
          cropState={currentState.cropState}
          motifState={currentState.motifState}
          swooshState={currentState.swooshState}
          gridVisible={currentState.gridVisible}
          gridRatio={currentState.gridRatio}
          draftStamp={currentState.draftStamp}
          logoImg={logoLoaded ? logoImgRef.current : null}
          onTextDrag={handleTextDrag}
          onMotifWindowChange={(window) =>
            updateCurrentPlatform({
              motifState: { ...currentState.motifState, window },
            })
          }
          onSwooshOffsetChange={(offsetY) =>
            updateCurrentPlatform({
              swooshState: { ...currentState.swooshState, offsetY },
            })
          }
        />

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto max-h-[75vh] pr-1">
          {/* Edit Image Button */}
          <button
            onClick={() => setCropModalOpen(true)}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium
                       text-white bg-accent-light rounded-xl hover:bg-accent
                       transition-colors duration-200 shadow-lg shadow-accent-light/20"
          >
            <ImageIcon size={16} /> Edit Image Background
          </button>

          {/* Text Panel */}
          <div className="glass rounded-xl p-4">
            <TextPanel
              textElements={currentState.textElements}
              onUpdateElement={updateTextElement}
              onAddElement={addTextElement}
              onRemoveElement={removeTextElement}
            />
          </div>

          {/* Motif & Effects Panel */}
          <div className="glass rounded-xl p-4">
            <MotifPanel
              motifState={currentState.motifState}
              swooshState={currentState.swooshState}
              draftStamp={currentState.draftStamp}
              onMotifChange={(newMotifState) => {
                // If ratio changed, recalculate window dimensions
                if (newMotifState.windowRatio !== currentState.motifState.windowRatio) {
                  const win = currentState.motifState.window;
                  const centerX = win.x + win.width / 2;
                  const centerY = win.y + win.height / 2;
                  const area = win.width * win.height;
                  const [wR, hR] = newMotifState.windowRatio.split(':').map(Number);
                  const minArea = currentPlatformConfig.width * currentPlatformConfig.height * WINDOW_MOTIF_DEFAULTS.minCoverFraction;
                  const effectiveArea = Math.max(area, minArea);
                  let newW = Math.sqrt(effectiveArea * (wR / hR));
                  let newH = newW * (hR / wR);
                  let newX = centerX - newW / 2;
                  let newY = centerY - newH / 2;
                  // Clamp within canvas
                  newX = Math.max(0, Math.min(newX, currentPlatformConfig.width - newW));
                  newY = Math.max(0, Math.min(newY, currentPlatformConfig.height - newH));
                  newMotifState = {
                    ...newMotifState,
                    window: { x: newX, y: newY, width: newW, height: newH },
                  };
                }
                updateCurrentPlatform({ motifState: newMotifState });
              }}
              onSwooshChange={(swooshState) => updateCurrentPlatform({ swooshState })}
              onDraftStampToggle={(val) => updateCurrentPlatform({ draftStamp: val })}
            />
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageUrl={imageDataUrl}
        platformConfig={currentPlatformConfig}
        onSave={handleCropSave}
        onClose={() => setCropModalOpen(false)}
      />
    </div>
  );
};

export default EditorView;
