import React from 'react';
import { X } from 'lucide-react';

interface FullScreenPreviewProps {
  url: string;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-300 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src={url}
          title="Event Preview"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default FullScreenPreview;
