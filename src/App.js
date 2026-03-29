import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import UploadStep from './components/UploadStep';
import PlatformSelector from './components/PlatformSelector';
import EditorView from './components/EditorView';
import ConfirmModal from './components/ConfirmModal';
import { SESSION_STORAGE_KEY } from './utils/constants';

// ============================================================
// APP - Main orchestrator
// Steps: 1. Upload → 2. Select Platforms → 3. Edit
// Session persistence via sessionStorage
// ============================================================

const INITIAL_STATE = {
  step: 'upload', // 'upload' | 'platforms' | 'editor'
  imageDataUrl: null,
  selectedPlatforms: [],
  editorStates: {},
};

export default function App() {
  const [appState, setAppState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    }
    return { ...INITIAL_STATE };
  });

  const [showStartNewModal, setShowStartNewModal] = useState(false);

  // Auto-save to sessionStorage on every state change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  }, [appState]);

  const updateState = useCallback((updates) => {
    setAppState((prev) => ({ ...prev, ...updates }));
  }, []);

  // --- Handlers ---
  const handleImageUpload = useCallback((dataUrl) => {
    if (dataUrl) {
      updateState({ imageDataUrl: dataUrl, step: 'platforms' });
    } else {
      updateState({ imageDataUrl: null, step: 'upload', selectedPlatforms: [], editorStates: {} });
    }
  }, [updateState]);

  const handlePlatformToggle = useCallback((platform) => {
    setAppState((prev) => {
      const selected = prev.selectedPlatforms.includes(platform)
        ? prev.selectedPlatforms.filter((p) => p !== platform)
        : [...prev.selectedPlatforms, platform];
      return { ...prev, selectedPlatforms: selected };
    });
  }, []);

  const handleContinueToEditor = useCallback(() => {
    updateState({ step: 'editor' });
  }, [updateState]);

  const handleStartNew = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setAppState({ ...INITIAL_STATE });
    setShowStartNewModal(false);
  }, []);

  const handleEditorStatesChange = useCallback((editorStates) => {
    updateState({ editorStates });
  }, [updateState]);

  // --- Step navigation ---
  const goToStep = useCallback((step) => {
    updateState({ step });
  }, [updateState]);

  return (
    <div className="min-h-screen bg-surface text-gray-200 font-sans">
      {/* === Top Navigation === */}
      <nav className="sticky top-0 z-40 glass border-b border-panel-border">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-lighter
                            flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              Image Content Factory
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { key: 'upload', label: 'Upload', num: 1 },
              { key: 'platforms', label: 'Platforms', num: 2 },
              { key: 'editor', label: 'Editor', num: 3 },
            ].map((s, idx) => {
              const isCurrent = appState.step === s.key;
              const isPast =
                (s.key === 'upload') ||
                (s.key === 'platforms' && ['platforms', 'editor'].includes(appState.step)) ||
                (s.key === 'editor' && appState.step === 'editor');
              const isClickable =
                (s.key === 'upload') ||
                (s.key === 'platforms' && appState.imageDataUrl) ||
                (s.key === 'editor' && appState.selectedPlatforms.length > 0 && appState.imageDataUrl);

              return (
                <React.Fragment key={s.key}>
                  {idx > 0 && (
                    <div className={`w-8 h-px ${isPast ? 'bg-accent-lighter' : 'bg-surface-300'}`} />
                  )}
                  <button
                    onClick={() => isClickable && goToStep(s.key)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                                transition-all duration-200 ${
                      isCurrent
                        ? 'bg-accent-light/20 text-accent-ice border border-accent-light/30'
                        : isPast
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center
                                    ${isCurrent ? 'bg-accent-lighter text-white' : 'bg-surface-300 text-gray-400'}`}>
                      {s.num}
                    </span>
                    {s.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href={process.env.PUBLIC_URL + '/assets/brand-guidelines.pdf'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-medium text-gray-400 bg-surface-200 rounded-lg 
                         border border-surface-300 hover:text-white hover:border-surface-400 
                         transition-all duration-200"
            >
              Brand guidelines
            </a>
            <button
              onClick={() => setShowStartNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium
                         text-gray-400 bg-surface-200 rounded-lg border border-surface-300
                         hover:text-white hover:border-surface-400 transition-all duration-200"
            >
              <Plus size={14} /> Start New
            </button>
          </div>
        </div>
      </nav>

      {/* === Main Content === */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {appState.step === 'upload' && (
          <UploadStep
            onImageUpload={handleImageUpload}
            uploadedImageUrl={appState.imageDataUrl}
          />
        )}

        {appState.step === 'platforms' && (
          <PlatformSelector
            selectedPlatforms={appState.selectedPlatforms}
            onToggle={handlePlatformToggle}
            onContinue={handleContinueToEditor}
          />
        )}

        {appState.step === 'editor' && (
          <EditorView
            imageDataUrl={appState.imageDataUrl}
            selectedPlatforms={appState.selectedPlatforms}
            editorStates={appState.editorStates}
            onEditorStatesChange={handleEditorStatesChange}
          />
        )}
      </main>

      {/* === Confirm Modal === */}
      <ConfirmModal
        isOpen={showStartNewModal}
        onConfirm={handleStartNew}
        onCancel={() => setShowStartNewModal(false)}
        title="Start New Project"
        message="All current data will be deleted. If you wish to continue click on Yes. Otherwise Cancel."
      />
    </div>
  );
}