import React from 'react';
import { PLATFORM_CONFIGS, PLATFORMS } from '../utils/constants';
import { ChevronRight } from 'lucide-react';

/**
 * PlatformSelector - Visual cards for selecting output platforms.
 * Shows dimensions and allows multiple selection.
 */
const PlatformSelector = ({ selectedPlatforms, onToggle, onContinue }) => {
  const hasSelection = selectedPlatforms.length > 0;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Choose Platforms</h2>
        <p className="text-gray-400 text-sm">
          Select one or more platforms to generate banners for
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {PLATFORMS.map((key) => {
          const cfg = PLATFORM_CONFIGS[key];
          const isSelected = selectedPlatforms.includes(key);

          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`
                relative flex flex-col items-center p-6 rounded-xl
                border-2 transition-all duration-200 group
                ${isSelected
                  ? 'border-accent-light bg-accent/10 shadow-lg shadow-accent/10'
                  : 'border-surface-300 bg-surface-50 hover:border-surface-400 hover:bg-surface-100'
                }
              `}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-accent-light rounded-full
                                flex items-center justify-center animate-fade-in">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}

              <span className="text-3xl mb-3">{cfg.icon}</span>
              <span className="text-white font-semibold text-sm mb-1">{cfg.label}</span>
              <span className={`text-xs ${isSelected ? 'text-accent-ice' : 'text-gray-500'}`}>
                {cfg.width} × {cfg.height}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onContinue}
          disabled={!hasSelection}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-sm
            transition-all duration-200
            ${hasSelection
              ? 'bg-accent-light text-white hover:bg-accent shadow-lg shadow-accent-light/20 hover:shadow-accent/30'
              : 'bg-surface-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Editor
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlatformSelector;
