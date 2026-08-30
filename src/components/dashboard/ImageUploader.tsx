import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImageUploaderProps {
  onClose: () => void;
  onUpload: (base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onClose, onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Max 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (preview) {
      onUpload(preview);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-96 max-w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Upload Event Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
        />
        {error && (
          <p className="mt-2 text-sm text-rose-400">{error}</p>
        )}
        {preview && (
          <div className="mt-4">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-2" />
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium"
            >
              Use this Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
