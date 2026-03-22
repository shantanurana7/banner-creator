import React from 'react';

/**
 * Reusable confirmation modal with glassmorphism dark theme.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onConfirm - Called when user clicks "Yes"
 * @param {function} onCancel - Called when user clicks "Cancel"
 * @param {string} title - Modal title
 * @param {string} message - Modal body message
 */
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass rounded-xl p-6 max-w-md w-full mx-4 animate-slide-up shadow-2xl">
        {/* Header */}
        <h3 className="text-lg font-semibold text-white mb-3">
          {title || 'Confirm Action'}
        </h3>

        {/* Body */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {message || 'Are you sure you want to proceed?'}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm font-medium text-gray-300 bg-surface-200 rounded-lg
                       hover:bg-surface-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
                       hover:bg-red-700 transition-colors duration-200"
          >
            Yes, Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
