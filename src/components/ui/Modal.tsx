import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
