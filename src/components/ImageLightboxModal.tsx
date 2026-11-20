import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import { TaskImage } from '../types';

interface Props {
  image: TaskImage | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<Props> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.dataUrl;
    a.download = image.name || 'task-image.jpg';
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-300 truncate max-w-md">
            <ZoomIn className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{image.name || 'Rasm'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors"
              title="Yuklab olish"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="flex items-center justify-center p-2 overflow-auto max-h-[calc(90vh-60px)]">
          <img
            src={image.dataUrl}
            alt={image.name || 'Task image'}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
