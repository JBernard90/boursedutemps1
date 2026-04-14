"use client";

import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export default function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 font-heading uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed space-y-6">
          {content}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
