"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import History from "@tiptap/extension-history";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Blockquote,
      Image,
      History,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded p-3 bg-white space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2">

        <button onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded">B</button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded italic">I</button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="px-2 py-1 border rounded underline">U</button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="px-2 py-1 border rounded">H1</button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-1 border rounded">H2</button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="px-2 py-1 border rounded">H3</button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 py-1 border rounded">• Liste</button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="px-2 py-1 border rounded">1. Liste</button>

        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="px-2 py-1 border rounded">❝</button>

        <button onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 border rounded">↺</button>

        <button onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 border rounded">↻</button>

        <button
          onClick={() => {
            const url = prompt("URL de l'image");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="px-2 py-1 border rounded"
        >
          🖼️ Image
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}

