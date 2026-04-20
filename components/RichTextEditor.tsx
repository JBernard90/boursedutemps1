"use client";

import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Commencez à écrire...", 
  maxLength = 6000 
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[150px] resize-y text-slate-700"
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300">
          {value.length} / {maxLength}
        </div>
      </div>
      
      {/* 
        Note for the user: 
        This is a simplified version of a Rich Text Editor. 
        If you prefer a library like 'react-quill' or 'tiptap', 
        I can help you install and configure it in this component.
      */}
      <div className="mt-2 flex gap-2">
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${(value.length / maxLength) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
