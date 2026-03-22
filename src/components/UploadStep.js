import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * UploadStep - Drag-and-drop image upload with preview.
 * Replaces the old image library browser.
 */
const UploadStep = ({ onImageUpload, uploadedImageUrl }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback((file) => {
    setError('');
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageUpload(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    processFile(file);
  }, [processFile]);

  const handleRemove = useCallback(() => {
    onImageUpload(null);
  }, [onImageUpload]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
          <Upload className="w-8 h-8 text-accent-lighter" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Upload Your Image</h2>
        <p className="text-gray-400 text-sm">
          Upload a high-resolution image to get started. Supported formats: JPG, PNG, WebP
        </p>
      </div>

      {!uploadedImageUrl ? (
        /* Drop Zone */
        <label
          className={`
            relative flex flex-col items-center justify-center
            w-full h-72 rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-300 ease-out
            ${isDragOver
              ? 'border-accent-lighter bg-accent/10 scale-[1.01]'
              : 'border-surface-300 bg-surface-50/50 hover:border-surface-400 hover:bg-surface-50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className={`transition-transform duration-200 ${isDragOver ? 'scale-110' : ''}`}>
            <ImageIcon className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          </div>

          <p className="text-gray-300 font-medium mb-1">
            {isDragOver ? 'Drop your image here' : 'Drag & drop your image here'}
          </p>
          <p className="text-gray-500 text-sm">
            or <span className="text-accent-lighter underline">browse files</span>
          </p>
        </label>
      ) : (
        /* Preview */
        <div className="relative group rounded-2xl overflow-hidden border border-surface-300 bg-surface-50">
          <img
            src={uploadedImageUrl}
            alt="Uploaded preview"
            className="w-full max-h-[400px] object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white rounded-lg text-sm font-medium
                         hover:bg-red-700"
            >
              <X size={16} /> Remove Image
            </button>
          </div>
          <div className="p-3 bg-surface-100 border-t border-surface-300">
            <p className="text-xs text-gray-400">
              ✓ Image uploaded successfully. Proceed to select platforms.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadStep;
