import React from 'react';
import { Plus, Trash2, Bold, Minus } from 'lucide-react';
import { MAX_TITLES, MAX_SUBTITLES, FONT_COLORS } from '../utils/constants';

/**
 * TextPanel - Controls for editing text elements on the canvas.
 * Supports dynamic add/remove (max 3 titles, max 3 subtitles).
 */
const TextPanel = ({ textElements, onUpdateElement, onAddElement, onRemoveElement }) => {
  const titles = textElements.filter((el) => el.isTitle);
  const subtitles = textElements.filter((el) => !el.isTitle);

  const canAddTitle = titles.length < MAX_TITLES;
  const canAddSubtitle = subtitles.length < MAX_SUBTITLES;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Elements</h3>

      {/* Titles */}
      <div className="space-y-3">
        {titles.map((el, idx) => (
          <TextElementControl
            key={el.id}
            element={el}
            label={`Title ${idx + 1}`}
            onUpdate={onUpdateElement}
            onRemove={idx > 0 ? () => onRemoveElement(el.id) : null}
            showBoldToggle={false}
          />
        ))}
        {canAddTitle && (
          <button
            onClick={() => onAddElement('title')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium
                       text-accent-ice border border-dashed border-surface-300 rounded-lg
                       hover:border-accent-light hover:bg-accent/5 transition-colors duration-200"
          >
            <Plus size={14} /> Add Title
          </button>
        )}
      </div>

      <div className="border-t border-surface-300" />

      {/* Subtitles */}
      <div className="space-y-3">
        {subtitles.map((el, idx) => (
          <TextElementControl
            key={el.id}
            element={el}
            label={`Subtitle ${idx + 1}`}
            onUpdate={onUpdateElement}
            onRemove={idx > 0 ? () => onRemoveElement(el.id) : null}
            showBoldToggle={true}
          />
        ))}
        {canAddSubtitle && (
          <button
            onClick={() => onAddElement('subtitle')}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium
                       text-accent-ice border border-dashed border-surface-300 rounded-lg
                       hover:border-accent-light hover:bg-accent/5 transition-colors duration-200"
          >
            <Plus size={14} /> Add Subtitle
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Individual text element control.
 * Uses number input with +/- buttons instead of a slider.
 */
const TextElementControl = ({ element, label, onUpdate, onRemove, showBoldToggle }) => {
  const handleSizeChange = (delta) => {
    const newSize = Math.max(element.minSize, Math.min(element.maxSize, element.size + delta));
    onUpdate(element.id, 'size', newSize);
  };

  const handleSizeInput = (e) => {
    const val = parseInt(e.target.value);
    if (isNaN(val)) return;
    const clamped = Math.max(element.minSize, Math.min(element.maxSize, val));
    onUpdate(element.id, 'size', clamped);
  };

  return (
    <div className="bg-surface-100 rounded-lg p-3 space-y-2.5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Text Input */}
      <div className="relative">
        <textarea
          value={element.text}
          onChange={(e) => onUpdate(element.id, 'text', e.target.value)}
          maxLength={element.maxLength}
          rows="2"
          className="w-full p-2.5 pr-12 text-sm bg-surface-200 text-white rounded-lg border border-surface-300
                     focus:border-accent-light focus:ring-1 focus:ring-accent-light/30 outline-none
                     resize-none transition-all duration-200"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
        <span className="absolute bottom-2.5 right-2.5 text-[10px] text-gray-500">
          {element.text.length}/{element.maxLength}
        </span>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3">
        {/* Font Size — Number input with +/- buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSizeChange(-1)}
            className="w-6 h-6 flex items-center justify-center rounded bg-surface-200
                       text-gray-400 hover:text-white hover:bg-surface-300 transition-colors"
            title="Decrease size"
          >
            <Minus size={12} />
          </button>
          <input
            type="number"
            value={element.size}
            onChange={handleSizeInput}
            min={element.minSize}
            max={element.maxSize}
            className="w-12 h-6 text-center text-xs bg-surface-200 text-white rounded border border-surface-300
                       focus:border-accent-light outline-none [appearance:textfield]
                       [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => handleSizeChange(1)}
            className="w-6 h-6 flex items-center justify-center rounded bg-surface-200
                       text-gray-400 hover:text-white hover:bg-surface-300 transition-colors"
            title="Increase size"
          >
            <Plus size={12} />
          </button>
          <span className="text-[10px] text-gray-500 ml-0.5">px</span>
        </div>

        {/* Bold Toggle (subtitle only) */}
        {showBoldToggle && (
          <button
            onClick={() => onUpdate(element.id, 'isBold', !element.isBold)}
            className={`p-1.5 rounded-md transition-colors duration-200 ${
              element.isBold
                ? 'bg-accent-light text-white'
                : 'bg-surface-200 text-gray-400 hover:text-white'
            }`}
            title="Toggle Bold"
          >
            <Bold size={14} />
          </button>
        )}

        {/* Color Picker */}
        <div className="flex gap-1.5 ml-auto">
          {FONT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate(element.id, 'color', color)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                element.color === color
                  ? 'border-accent-light ring-2 ring-accent-light/40 scale-110'
                  : 'border-surface-300 hover:border-surface-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
