"use client";

import React, { useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
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

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const COLORS = ['#000000','#374151','#6B7280','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];
const HIGHLIGHTS = ['#FEF08A','#BBF7D0','#BFDBFE','#FBCFE8','#DDD6FE','#FED7AA'];

const ToolbarButton = ({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded-lg text-sm transition-colors ${
      active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-1 self-center" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Écrivez ici...', maxLength = 5000 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[180px] px-5 py-4',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const { characters, words } = editor.storage.characterCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">

        {/* Historique */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler (Ctrl+Z)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refaire (Ctrl+Y)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Titres */}
        <select
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
          }
          onChange={e => {
            const v = e.target.value;
            if (v === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(v[1]) as 1|2|3 }).run();
          }}
          onMouseDown={e => e.preventDefault()}
          className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="p">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <Divider />

        {/* Formatage */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)">
          <strong className="text-sm font-black">B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique (Ctrl+I)">
          <em className="text-sm font-semibold">I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné (Ctrl+U)">
          <span className="text-sm font-semibold underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
          <span className="text-sm font-semibold line-through">S</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Couleur texte */}
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Couleur du texte">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold" style={{ color: editor.getAttributes('textStyle').color || '#000' }}>A</span>
              <div className="w-4 h-1 rounded-sm mt-0.5" style={{ background: editor.getAttributes('textStyle').color || '#000' }} />
            </div>
          </ToolbarButton>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-wrap w-32 p-2 bg-white rounded-xl shadow-xl border border-slate-100 gap-1">
            {COLORS.map(c => (
              <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                style={{ background: c }} title={c} />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
              className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white text-slate-400 text-xs flex items-center justify-center hover:scale-110 transition-transform" title="Couleur par défaut">✕</button>
          </div>
        </div>

        {/* Surlignage */}
        <div className="relative group">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Surlignage">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 10l-5 9h16l-5-9"/><path d="M12 3v7"/><path d="M9 10h6"/></svg>
          </ToolbarButton>
          <div className="absolute top-full left-0 z-50 hidden group-hover:flex flex-wrap w-28 p-2 bg-white rounded-xl shadow-xl border border-slate-100 gap-1">
            {HIGHLIGHTS.map(c => (
              <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: c }).run(); }}
                className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform"
                style={{ background: c }} title={c} />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); }}
              className="w-5 h-5 rounded border-2 border-slate-200 bg-white text-slate-400 text-xs flex items-center justify-center hover:scale-110 transition-transform" title="Supprimer">✕</button>
          </div>
        </div>

        <Divider />

        {/* Alignement */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justifier">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Listes */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c0-3.5 1.5-6 4-8L9 7H6L3 13v8h6v-8H7c.5-1.5 1-3 3-4l-1-2c-3 1-6 4-6 8v4H3zm12 0c0-3.5 1.5-6 4-8L21 7h-3l-3 6v8h6v-8h-2c.5-1.5 1-3 3-4l-1-2c-3 1-6 4-6 8v4h-3z" opacity=".4"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloc de code">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 10 5 12 8 14"/><polyline points="16 10 19 12 16 14"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Lien */}
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insérer un lien">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton onClick={addImage} title="Insérer une image">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </ToolbarButton>

        {/* Tableau */}
        <ToolbarButton onClick={insertTable} title="Insérer un tableau">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Séparateur horizontal */}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne horizontale">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
        </ToolbarButton>

        {/* Effacer le formatage */}
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Effacer le formatage">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7-4-4-7 7 4 4zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18"/><line x1="2" y1="22" x2="22" y2="2"/></svg>
        </ToolbarButton>
      </div>

      {/* ── BubbleMenu (sélection de texte) ── */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
        <div className="flex items-center gap-1 bg-slate-900 rounded-xl px-2 py-1.5 shadow-xl">
          {[
            { cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: <strong className="text-white text-xs">B</strong>, title: 'Gras' },
            { cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: <em className="text-white text-xs">I</em>, title: 'Italique' },
            { cmd: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), icon: <span className="text-white text-xs underline">U</span>, title: 'Souligné' },
            { cmd: setLink, active: editor.isActive('link'), icon: <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>, title: 'Lien' },
          ].map((b, i) => (
            <button key={i} type="button" onMouseDown={e => { e.preventDefault(); b.cmd(); }}
              className={`px-2 py-1 rounded-lg transition-colors ${b.active ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              title={b.title}>{b.icon}</button>
          ))}
        </div>
      </BubbleMenu>

      {/* ── Zone de texte ── */}
      <div className="tiptap-editor">
        <style>{`
          .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
          }
          .tiptap-editor .ProseMirror h1 { font-size: 1.75rem; font-weight: 800; margin: 0.75rem 0 0.5rem; }
          .tiptap-editor .ProseMirror h2 { font-size: 1.375rem; font-weight: 700; margin: 0.625rem 0 0.375rem; }
          .tiptap-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
          .tiptap-editor .ProseMirror blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.875em; }
          .tiptap-editor .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; font-family: monospace; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror pre code { background: none; padding: 0; color: inherit; }
          .tiptap-editor .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror li { margin: 0.125rem 0; }
          .tiptap-editor .ProseMirror a { color: #3b82f6; text-decoration: underline; }
          .tiptap-editor .ProseMirror img { max-width: 100%; border-radius: 0.75rem; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
          .tiptap-editor .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
          .tiptap-editor .ProseMirror td, .tiptap-editor .ProseMirror th { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; min-width: 80px; }
          .tiptap-editor .ProseMirror th { background: #f8fafc; font-weight: 600; }
          .tiptap-editor .ProseMirror mark { padding: 0.1em 0.2em; border-radius: 0.25em; }
          .tiptap-editor .ProseMirror p { margin: 0.25rem 0; line-height: 1.7; }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer : compteur ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50">
        <span className="text-xs text-slate-400">
          {words()} mot{words() !== 1 ? 's' : ''} · {characters()} caractère{characters() !== 1 ? 's' : ''}
        </span>
        <span className={`text-xs font-medium ${characters() > maxLength * 0.9 ? 'text-orange-500' : 'text-slate-400'}`}>
          {characters()}/{maxLength}
        </span>
      </div>
    </div>
  );
}
