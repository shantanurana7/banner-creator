import React from 'react';
import { MOTIF_GRADIENTS } from '../utils/constants';
import { Layers, Wind } from 'lucide-react';

/**
 * Slider sub-component for a labeled range input.
 */
const LabeledSlider = ({ label, value, min, max, step, onChange, displayValue }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] text-gray-400 font-mono">
        {displayValue !== undefined ? displayValue : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                 bg-surface-300 accent-accent-lighter"
    />
  </div>
);

/**
 * MotifPanel - Controls for window motif, swoosh, and draft stamp.
 */
const MotifPanel = ({ motifState, swooshState, draftStamp, onMotifChange, onSwooshChange, onDraftStampToggle }) => {

  // Resolve current gradient opacity
  const currentGrad = MOTIF_GRADIENTS[motifState.gradientKey] || MOTIF_GRADIENTS.dark;
  const gradientOpacity = motifState.gradientOpacity !== undefined
    ? motifState.gradientOpacity
    : currentGrad.opacity;
  const contrast    = motifState.contrast    !== undefined ? motifState.contrast    : 100;
  const saturation  = motifState.saturation  !== undefined ? motifState.saturation  : 100;
  const blendMode   = motifState.blendMode   || 'source-over';

  const blendOptions = [
    { value: 'source-over', label: 'Smooth (Default)' },
    { value: 'darken',      label: 'Darken' },
    { value: 'multiply',    label: 'Multiply' },
    { value: 'hard-light',  label: 'Linear' },
    { value: 'overlay',     label: 'Overlay' },
    { value: 'color',       label: 'Color' },
    { value: 'lighten',     label: 'Lighten' },
    { value: 'saturation',  label: 'Saturation' },
  ];

  return (
    <div className="space-y-4">
      {/* --- Window Motif Section --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} /> Window Motif
          </h3>
          <ToggleSwitch
            checked={motifState.enabled}
            onChange={(val) => onMotifChange({ ...motifState, enabled: val })}
          />
        </div>

        {motifState.enabled && (
          <div className="space-y-4 animate-fade-in">
            {/* Gradient Selection */}
            <div>
              <span className="text-[11px] text-gray-500 mb-2 block">Gradient</span>
              <div className="flex gap-2">
                {Object.entries(MOTIF_GRADIENTS).map(([key, grad]) => (
                  <button
                    key={key}
                    onClick={() => onMotifChange({ ...motifState, gradientKey: key })}
                    className={`flex-1 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      motifState.gradientKey === key
                        ? 'border-accent-lighter ring-2 ring-accent-lighter/30 scale-105'
                        : 'border-surface-300 hover:border-surface-400'
                    }`}
                    title={grad.label}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                        opacity: 0.9,
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                {Object.values(MOTIF_GRADIENTS).map((grad) => (
                  <span key={grad.label} className="flex-1 text-center text-[10px] text-gray-500">
                    {grad.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Window Aspect Ratio */}
            <div>
              <span className="text-[11px] text-gray-500 mb-2 block">Window Ratio</span>
              <div className="flex gap-2">
                {['7:10', '10:7'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => onMotifChange({ ...motifState, windowRatio: ratio })}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                      motifState.windowRatio === ratio
                        ? 'bg-accent-light text-white'
                        : 'bg-surface-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* ─────────── Image Adjustment Sliders ─────────── */}
            <div className="border-t border-surface-300/50 pt-3 space-y-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">
                Image Adjustments
              </span>

              {/* Gradient Opacity */}
              <LabeledSlider
                label="Gradient Opacity"
                value={gradientOpacity}
                min={0}
                max={1}
                step={0.05}
                displayValue={gradientOpacity.toFixed(2)}
                onChange={(v) => onMotifChange({ ...motifState, gradientOpacity: v })}
              />

              {/* Image Contrast */}
              <LabeledSlider
                label="Image Contrast"
                value={contrast}
                min={50}
                max={200}
                step={1}
                displayValue={`${contrast}%`}
                onChange={(v) => onMotifChange({ ...motifState, contrast: v })}
              />

              {/* Image Saturation */}
              <LabeledSlider
                label="Image Saturation"
                value={saturation}
                min={0}
                max={200}
                step={1}
                displayValue={`${saturation}%`}
                onChange={(v) => onMotifChange({ ...motifState, saturation: v })}
              />

              {/* Blend Mode */}
              <div>
                <span className="text-[11px] text-gray-500 mb-1.5 block">Gradient Blend Mode</span>
                <select
                  value={blendMode}
                  onChange={(e) => onMotifChange({ ...motifState, blendMode: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-surface-200 text-gray-300
                             border border-surface-300 focus:outline-none focus:border-accent-lighter
                             cursor-pointer transition-colors"
                >
                  {blendOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-surface-300" />

      {/* --- Swoosh Section --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Wind size={14} /> Swoosh
          </h3>
          <ToggleSwitch
            checked={swooshState.enabled}
            onChange={(val) => onSwooshChange({ ...swooshState, enabled: val })}
            disabled={!motifState.enabled}
          />
        </div>

        {swooshState.enabled && motifState.enabled && (
          <div className="space-y-3 animate-fade-in">
            {/* Side Selection */}
            <div>
              <span className="text-[11px] text-gray-500 mb-2 block">Position</span>
              <div className="flex gap-2">
                {['left', 'right'].map((side) => (
                  <button
                    key={side}
                    onClick={() => onSwooshChange({ ...swooshState, side })}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-all duration-200 ${
                      swooshState.side === side
                        ? 'bg-accent-light text-white'
                        : 'bg-surface-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-gray-500">
              Drag vertically on canvas to reposition
            </div>
          </div>
        )}

        {!motifState.enabled && (
          <p className="text-[11px] text-gray-600 italic">Enable Window Motif to use Swoosh</p>
        )}
      </div>

      <div className="border-t border-surface-300" />

      {/* --- Draft Stamp Section --- */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Draft Version
        </h3>
        <ToggleSwitch
          checked={draftStamp}
          onChange={onDraftStampToggle}
        />
      </div>
      {draftStamp && (
        <p className="text-[10px] text-yellow-400/80 animate-fade-in">
          "Draft Version" stamp visible on canvas (top-right)
        </p>
      )}
    </div>
  );
};

/**
 * Fixed toggle switch component.
 * Uses explicit pixel positioning to prevent the knob from going outside.
 */
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    type="button"
    className={`relative inline-flex items-center flex-shrink-0
                w-9 h-5 rounded-full transition-colors duration-200
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${checked ? 'bg-accent-light' : 'bg-surface-300'}`}
  >
    <span
      className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm
                  transform transition-transform duration-200
                  ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
    />
  </button>
);

export default MotifPanel;
