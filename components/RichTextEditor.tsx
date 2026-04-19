"use client";

import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Extension } from '@tiptap/core';

// ── Extensions custom : police et taille ────────────────────────────────────
const FontFamily = Extension.create({
  name: 'fontFamily',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: { fontFamily: {
      default: null,
      parseHTML: el => el.style.fontFamily?.replace(/['"]/g, '') || null,
      renderHTML: attrs => attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
    }}}];
  },
  addCommands() {
    return {
      setFontFamily: (v: string) => ({ chain }: any) => chain().setMark('textStyle', { fontFamily: v }).run(),
      unsetFontFamily: () => ({ chain }: any) => chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: { fontSize: {
      default: null,
      parseHTML: el => el.style.fontSize || null,
      renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
    }}}];
  },
  addCommands() {
    return {
      setFontSize: (v: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize: v }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

// ── Constantes ───────────────────────────────────────────────────────────────
const COLORS = ['#000000','#374151','#6B7280','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#FFFFFF','#FCA5A5','#FCD34D','#6EE7B7','#93C5FD','#C4B5FD'];
const HIGHLIGHTS = ['#FEF08A','#BBF7D0','#BFDBFE','#FBCFE8','#DDD6FE','#FED7AA','#E0F2FE','#FCE7F3'];
const FONTS = ['Par défaut','Arial','Georgia','Times New Roman','Courier New','Verdana','Trebuchet MS','Impact'];
const FONT_SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-0.5 self-center flex-shrink-0" />;

const Btn = ({ onClick, active, title, disabled, children }: {
  onClick: () => void; active?: boolean; title: string; disabled?: boolean; children: React.ReactNode;
}) => (
  <button type="button" onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }} title={title} disabled={disabled}
    className={`p-1.5 rounded-lg text-sm transition-colors flex-shrink-0 ${disabled ? 'opacity-30 cursor-not-allowed' : active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder = 'Écrivez ici...', maxLength = 5000 }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-5 py-4' },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien :', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setIsUploadingImage(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (cloudName && uploadPreset) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) editor.chain().focus().setImage({ src: data.secure_url }).run();
        else throw new Error('Upload failed');
      } else {
        // Fallback base64 si Cloudinary non configuré
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
      }
    } catch { alert('Erreur upload image. Réessayez.'); }
    finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }, [editor]);

  if (!editor) return null;

  const { characters, words } = editor.storage.characterCount;
  const currentFont = editor.getAttributes('textStyle').fontFamily || '';
  const currentSize = editor.getAttributes('textStyle').fontSize || '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

      {/* ── Barre 1 : typographie ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50">

        <Btn onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Refaire">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4"/></svg>
        </Btn>

        <Divider />

        {/* Police */}
        <select value={currentFont} title="Police de caractères"
          onChange={e => { const v = e.target.value; v ? (editor.chain().focus() as any).setFontFamily(v).run() : (editor.chain().focus() as any).unsetFontFamily().run(); }}
          className="h-7 text-xs border border-slate-200 rounded-lg px-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 max-w-[120px]">
          {FONTS.map(f => <option key={f} value={f === 'Par défaut' ? '' : f} style={{ fontFamily: f }}>{f}</option>)}
        </select>

        {/* Taille */}
        <select value={currentSize} title="Taille de police"
          onChange={e => { const v = e.target.value; v ? (editor.chain().focus() as any).setFontSize(v).run() : (editor.chain().focus() as any).unsetFontSize().run(); }}
          className="h-7 text-xs border border-slate-200 rounded-lg px-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-16">
          <option value="">Taille</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s.replace('px','')}</option>)}
        </select>

        <Divider />

        {/* Niveau titre */}
        <select value={editor.isActive('heading',{level:1})?'h1':editor.isActive('heading',{level:2})?'h2':editor.isActive('heading',{level:3})?'h3':'p'}
          onChange={e => { const v = e.target.value; v==='p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({level:parseInt(v[1]) as 1|2|3}).run(); }}
          className="h-7 text-xs border border-slate-200 rounded-lg px-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 w-24">
          <option value="p">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <Divider />

        {/* Formatage inline */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)">
          <strong className="text-sm font-black">B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique (Ctrl+I)">
          <em className="text-sm">I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné (Ctrl+U)">
          <span className="text-sm underline">U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
          <span className="text-sm line-through">S</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </Btn>

        <Divider />

        {/* Couleur texte */}
        <div className="relative group flex-shrink-0">
          <button type="button" onMouseDown={e => e.preventDefault()} title="Couleur du texte"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold leading-none">A</span>
            <div className="w-4 h-1.5 rounded-sm border border-slate-200" style={{ background: editor.getAttributes('textStyle').color || '#000' }} />
          </button>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-wrap w-36 p-2 bg-white rounded-xl shadow-xl border border-slate-100 gap-1">
            {COLORS.map(c => (
              <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
              className="w-6 h-6 rounded border-2 border-slate-300 bg-white text-slate-400 text-[10px] flex items-center justify-center hover:scale-110">✕</button>
          </div>
        </div>

        {/* Surlignage */}
        <div className="relative group flex-shrink-0">
          <button type="button" onMouseDown={e => e.preventDefault()} title="Surlignage"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold leading-none" style={{ background: '#FEF08A', borderRadius: '2px', padding: '0 2px' }}>A</span>
            <div className="w-4 h-1.5 rounded-sm bg-yellow-300 border border-slate-200" />
          </button>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-wrap w-28 p-2 bg-white rounded-xl shadow-xl border border-slate-100 gap-1">
            {HIGHLIGHTS.map(c => (
              <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: c }).run(); }}
                className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); }}
              className="w-6 h-6 rounded border-2 border-slate-300 bg-white text-slate-400 text-[10px] flex items-center justify-center hover:scale-110">✕</button>
          </div>
        </div>
      </div>

      {/* ── Barre 2 : structure + media ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/60">

        {/* Alignement */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({textAlign:'left'})} title="Gauche">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({textAlign:'center'})} title="Centre">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({textAlign:'right'})} title="Droite">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({textAlign:'justify'})} title="Justifier">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </Btn>

        <Divider />

        {/* Listes */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="6" fill="currentColor" stroke="none">1.</text><text x="2" y="14" fontSize="6" fill="currentColor" stroke="none">2.</text><text x="2" y="20" fontSize="6" fill="currentColor" stroke="none">3.</text></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" opacity=".7"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloc de code">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 10 5 12 8 14"/><polyline points="16 10 19 12 16 14"/></svg>
        </Btn>

        <Divider />

        {/* Retrait */}
        <Btn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Augmenter retrait">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/><polyline points="7 9 10 12 7 15"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Diminuer retrait">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="21" y2="12"/><line x1="7" y1="18" x2="21" y2="18"/><polyline points="11 9 8 12 11 15"/></svg>
        </Btn>

        <Divider />

        {/* Lien */}
        <Btn onClick={setLink} active={editor.isActive('link')} title="Insérer un lien">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </Btn>

        {/* Image — fonctionne sur desktop ET mobile (galerie + caméra) */}
        <Btn onClick={() => imageInputRef.current?.click()} active={isUploadingImage} title="Insérer une image (galerie / caméra / fichier)">
          {isUploadingImage
            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></svg>
            : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          }
        </Btn>
        {/* Pas de `capture` → laisse le choix entre galerie, caméra et fichier */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

        {/* Tableau */}
        <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insérer un tableau">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </Btn>

        <Divider />

        {/* HR */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
        </Btn>

        {/* Effacer formatage */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Effacer le formatage">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-4-4-7 7 4 4z"/><line x1="2" y1="22" x2="22" y2="2"/></svg>
        </Btn>
      </div>

      {/* ── BubbleMenu ── */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
        <div className="flex items-center gap-1 bg-slate-900 rounded-xl px-2 py-1.5 shadow-xl">
          {[
            { cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: <strong className="text-white text-xs">B</strong> },
            { cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: <em className="text-white text-xs">I</em> },
            { cmd: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), label: <span className="text-white text-xs underline">U</span> },
            { cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: <span className="text-white text-xs line-through">S</span> },
            { cmd: setLink, active: editor.isActive('link'), label: <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
          ].map((b, i) => (
            <button key={i} type="button" onMouseDown={e => { e.preventDefault(); b.cmd(); }}
              className={`px-2 py-1 rounded-lg transition-colors ${b.active ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>{b.label}</button>
          ))}
        </div>
      </BubbleMenu>

      {/* ── Zone de texte ── */}
      <div className="tiptap-editor">
        <style>{`
          .tiptap-editor .ProseMirror { outline: none; }
          .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
          .tiptap-editor .ProseMirror h1 { font-size: 1.75rem; font-weight: 800; margin: 0.75rem 0 0.5rem; line-height: 1.2; }
          .tiptap-editor .ProseMirror h2 { font-size: 1.375rem; font-weight: 700; margin: 0.625rem 0 0.375rem; line-height: 1.3; }
          .tiptap-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
          .tiptap-editor .ProseMirror p { margin: 0.25rem 0; line-height: 1.7; }
          .tiptap-editor .ProseMirror blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 0.75rem 0; }
          .tiptap-editor .ProseMirror code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.875em; }
          .tiptap-editor .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; font-family: monospace; margin: 0.75rem 0; }
          .tiptap-editor .ProseMirror pre code { background: none; padding: 0; color: inherit; }
          .tiptap-editor .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror li { margin: 0.125rem 0; }
          .tiptap-editor .ProseMirror a { color: #3b82f6; text-decoration: underline; cursor: pointer; }
          .tiptap-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 0.75rem 0; display: block; cursor: default; }
          .tiptap-editor .ProseMirror img.ProseMirror-selectednode { outline: 3px solid #3b82f6; border-radius: 0.75rem; }
          .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
          .tiptap-editor .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
          .tiptap-editor .ProseMirror td, .tiptap-editor .ProseMirror th { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; min-width: 80px; vertical-align: top; }
          .tiptap-editor .ProseMirror th { background: #f8fafc; font-weight: 700; }
          .tiptap-editor .ProseMirror mark { padding: 0.1em 0.3em; border-radius: 0.25em; }
          .tiptap-editor .ProseMirror .selectedCell:after { background: rgba(59,130,246,0.15); content: ""; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none; position: absolute; z-index: 2; }
          .tiptap-editor .ProseMirror .column-resize-handle { background-color: #3b82f6; bottom: -2px; position: absolute; right: -2px; top: 0; width: 4px; pointer-events: none; }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-400">{words()} mot{words()!==1?'s':''} · {characters()} caractère{characters()!==1?'s':''}</span>
        <span className={`text-xs font-medium ${characters()>maxLength*0.9?'text-orange-500':'text-slate-400'}`}>{characters()}/{maxLength}</span>
      </div>
    </div>
  );
}
