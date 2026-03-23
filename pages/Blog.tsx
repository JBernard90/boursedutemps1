
import React, { useState, useRef, useCallback } from 'react';
import { BlogPost, User, MediaItem, BlogComment } from '../types';
import { Edit2, Trash2, MessageCircle, Heart, Share2, ExternalLink, Bold, Italic, Underline, List, ListOrdered, Link, Quote, Type, Image, Film, FileText } from 'lucide-react';

interface BlogProps {
  blogs: BlogPost[];
  user: User | null;
  onUpdate: (b: BlogPost[]) => void;
  onAuthClick: () => void;
}

// ---- Rich Text Editor ----
const RichTextEditor: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Save cursor position before opening file dialog
  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore cursor position after file dialog
  const restoreRange = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    saveRange();
    const url = prompt('Entrez l\'URL du lien :');
    if (url) {
      restoreRange();
      exec('createLink', url);
    }
  };

  const uploadToCloudinary = async (file: File, type: 'image' | 'video' | 'raw'): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary non configuré');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`, {
      method: 'POST', body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Erreur upload');
    return data.secure_url;
  };

  // Insert image inline at cursor
  const insertImageAtCursor = (url: string, alt: string = 'image') => {
    restoreRange();
    editorRef.current?.focus();
    const img = `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block;" />`;
    document.execCommand('insertHTML', false, img);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Insert video inline at cursor
  const insertVideoAtCursor = (url: string) => {
    restoreRange();
    editorRef.current?.focus();
    let html = '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
      html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:12px 0;">
        <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
      </div>`;
    } else {
      html = `<video src="${url}" controls style="max-width:100%;border-radius:12px;margin:12px 0;display:block;"></video>`;
    }
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Insert file link inline
  const insertFileAtCursor = (url: string, name: string) => {
    restoreRange();
    editorRef.current?.focus();
    const ext = name.split('.').pop()?.toUpperCase() || 'FICHIER';
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#EFF6FF;border:1px solid #BFDBFE;color:#1D4ED8;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:4px 0;">
      📎 ${name} <span style="background:#1D4ED8;color:white;padding:2px 8px;border-radius:4px;font-size:11px;">${ext}</span>
    </a>`;
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'image');
      insertImageAtCursor(url, file.name);
    } catch { alert('Erreur upload image'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'video');
      insertVideoAtCursor(url);
    } catch { alert('Erreur upload vidéo'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // Handle file upload (PDF, doc, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'raw');
      insertFileAtCursor(url, file.name);
    } catch { alert('Erreur upload fichier'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  // Insert YouTube link
  const handleYouTubeLink = () => {
    saveRange();
    const url = prompt('Entrez le lien YouTube :');
    if (url) insertVideoAtCursor(url);
  };

  const ToolBtn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-2 rounded-lg transition hover:bg-blue-50 hover:text-blue-600 text-slate-500"
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200">
        
        {/* Formatage de base */}
        <ToolBtn onClick={() => exec('bold')} title="Gras"><Bold size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italique"><Italic size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Souligné"><Underline size={15} /></ToolBtn>
        <Divider />

        {/* Titres */}
        <ToolBtn onClick={() => exec('formatBlock', 'h1')} title="Titre 1"><span className="font-bold text-xs">H1</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Titre 2"><span className="font-bold text-xs">H2</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Titre 3"><span className="font-bold text-xs">H3</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraphe"><Type size={15} /></ToolBtn>
        <Divider />

        {/* Listes */}
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered size={15} /></ToolBtn>
        <Divider />

        {/* Alignement */}
        <ToolBtn onClick={() => exec('justifyLeft')} title="Gauche"><span className="text-xs">⬅</span></ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Centre"><span className="text-xs">↔</span></ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Droite"><span className="text-xs">➡</span></ToolBtn>
        <Divider />

        {/* Lien et citation */}
        <ToolBtn onClick={handleLink} title="Insérer un lien"><Link size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'blockquote')} title="Citation"><Quote size={15} /></ToolBtn>
        <Divider />

        {/* === INSERTION INLINE === */}
        {/* Image */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <ToolBtn
          onClick={() => { saveRange(); imageInputRef.current?.click(); }}
          title="Insérer une image dans le texte"
        >
          <Image size={15} />
        </ToolBtn>

        {/* Vidéo */}
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <ToolBtn
          onClick={() => { saveRange(); videoInputRef.current?.click(); }}
          title="Insérer une vidéo dans le texte"
        >
          <Film size={15} />
        </ToolBtn>

        {/* Lien YouTube */}
        <ToolBtn onClick={handleYouTubeLink} title="Insérer une vidéo YouTube">
          <span className="text-xs font-bold text-red-500">▶</span>
        </ToolBtn>

        {/* Fichier PDF/Doc */}
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileUpload} />
        <ToolBtn
          onClick={() => { saveRange(); fileInputRef.current?.click(); }}
          title="Insérer un fichier (PDF, Word...)"
        >
          <FileText size={15} />
        </ToolBtn>
        <Divider />

        {/* Couleur texte */}
        <input
          type="color"
          title="Couleur du texte"
          className="w-7 h-7 rounded cursor-pointer border border-slate-200"
          onMouseDown={saveRange}
          onChange={e => { restoreRange(); exec('foreColor', e.target.value); }}
        />

        {/* Effacer formatage */}
        <ToolBtn onClick={() => exec('removeFormat')} title="Effacer le formatage">
          <span className="text-xs text-red-400 font-bold">✕</span>
        </ToolBtn>
      </div>

      {/* Indicateur upload */}
      {uploading && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-600 font-bold flex items-center gap-2">
          <span className="animate-spin">⏳</span> Upload en cours...
        </div>
      )}

      {/* Zone d'édition */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[250px] max-h-[600px] overflow-y-auto px-5 py-4 outline-none text-slate-700 text-sm leading-relaxed
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h1]:mt-4
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-2 [&_h2]:mt-3
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mb-2 [&_h3]:mt-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
          [&_li]:my-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3
          [&_a]:text-blue-600 [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3
          [&_video]:max-w-full [&_video]:rounded-xl [&_video]:my-3
          [&_p]:my-1"
      />

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex gap-4">
        <span>🖊️ Sélectionnez du texte pour le formater</span>
        <span>🖼️ Cliquez sur l'icône image/vidéo pour insérer à la position du curseur</span>
        <span>📎 PDF, Word, PPT supportés</span>
      </div>
    </div>
  );
};

// ---- Render HTML content ----
const RichContent: React.FC<{ html: string }> = ({ html }) => {
  const isHTML = /<[a-z][\s\S]*>/i.test(html);
  if (isHTML) {
    return (
      <div
        className="text-slate-600 leading-relaxed mb-6
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3 [&_h1]:mt-4
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-2 [&_h2]:mt-3
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mb-2 [&_h3]:mt-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
          [&_li]:my-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3
          [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
          [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3
          [&_video]:max-w-full [&_video]:rounded-xl [&_video]:my-3
          [&_p]:my-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{html}</p>;
};

// ---- Main Blog Component ----
const Blog: React.FC<BlogProps> = ({ blogs, user, onUpdate, onAuthClick }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Expérience');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadingAttach, setUploadingAttach] = useState(false);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const uploadMediaAttach = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary non configuré');
    const isVideo = file.type.startsWith('video');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Erreur upload');
    return data.secure_url;
  };

  const handleAttachFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingAttach(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of files) {
        const url = await uploadMediaAttach(file);
        uploaded.push({ type: file.type.startsWith('video') ? 'video' : 'image', url });
      }
      setMediaItems(prev => [...prev, ...uploaded]);
    } catch { alert("Erreur upload. Réessayez."); }
    finally { setUploadingAttach(false); e.target.value = ''; }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cette publication ?")) return;
    const token = localStorage.getItem('token');
    await fetch('/api/blogs/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    onUpdate(blogs.filter(b => b.id !== id));
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const token = localStorage.getItem('token');

    const postData = {
      title: newTitle,
      content: newContent,
      category: newCategory,
      media: mediaItems,
      externalLink,
      authorId: user.uid,
      authorName: user.firstName + ' ' + user.lastName,
      authorAvatar: user.avatar,
      likes: [],
      dislikes: [],
      comments: [],
    };

    try {
      if (editingPost) {
        const res = await fetch('/api/blogs/' + editingPost.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify(postData),
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdate(blogs.map(b => b.id === editingPost.id ? updated : b));
        }
      } else {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify(postData),
        });
        if (res.ok) {
          const created = await res.json();
          onUpdate([created, ...blogs]);
        } else {
          const err = await res.json();
          alert('Erreur : ' + (err.error || 'Impossible de publier'));
          return;
        }
      }
      setShowAdd(false);
      setEditingPost(null);
      resetForm();
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setMediaItems([]);
    setExternalLink('');
    setCommentText('');
  };

  const handleLike = async (blog: BlogPost) => {
    if (!user) { onAuthClick(); return; }
    const token = localStorage.getItem('token');
    const hasLiked = blog.likes.includes(user.uid);
    const newLikes = hasLiked ? blog.likes.filter(id => id !== user.uid) : [...blog.likes, user.uid];
    await fetch('/api/blogs/' + blog.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ likes: newLikes }),
    });
    onUpdate(blogs.map(b => b.id === blog.id ? { ...b, likes: newLikes } : b));
  };

  const handleShare = async (blog: BlogPost) => {
    const token = localStorage.getItem('token');
    const shareUrl = `https://boursedutemps.vercel.app/share/blog/${blog.id}`;
    const shareText = blog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    if (navigator.share) {
      try { await navigator.share({ title: blog.title, text: shareText, url: shareUrl }); }
      catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié ! Partagez-le sur vos réseaux sociaux.");
    }
    await fetch('/api/blogs/' + blog.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ shares: (blog.shares || 0) + 1 }),
    });
    onUpdate(blogs.map(b => b.id === blog.id ? { ...b, shares: (b.shares || 0) + 1 } : b));
  };

  const handleComment = async (blog: BlogPost) => {
    if (!user) { onAuthClick(); return; }
    if (!commentText.trim()) return;
    const token = localStorage.getItem('token');
    const newComment: BlogComment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid,
      authorName: user.firstName + ' ' + user.lastName,
      authorAvatar: user.avatar,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...blog.comments, newComment];
    await fetch('/api/blogs/' + blog.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ comments: updatedComments }),
    });
    onUpdate(blogs.map(b => b.id === blog.id ? { ...b, comments: updatedComments } : b));
    setCommentText('');
    setActiveCommentPost(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-heading text-4xl font-bold text-slate-900">Feed Communautaire</h1>
        <button
          onClick={() => { if (!user) { onAuthClick(); return; } setEditingPost(null); resetForm(); setShowAdd(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          + Nouvelle publication
        </button>
      </div>

      {showAdd && (
        <div className="mb-12 bg-white p-8 rounded-[2rem] border border-blue-100 shadow-2xl">
          <h2 className="font-heading text-2xl font-bold mb-6">
            {editingPost ? 'Modifier la publication' : 'Nouvelle publication'}
          </h2>
          <form onSubmit={handlePost} className="space-y-5">
            <input
              required
              placeholder="Titre de votre publication"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Contenu — insérez images, vidéos et fichiers directement dans le texte
              </label>
              <RichTextEditor value={newContent} onChange={setNewContent} />
            </div>

            <select
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            >
              <option>Expérience</option>
              <option>Succès</option>
              <option>Tutoriel</option>
              <option>Actualité</option>
            </select>

            <input
              type="url"
              placeholder="🔗 Lien externe (optionnel)"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={externalLink}
              onChange={e => setExternalLink(e.target.value)}
            />


            {/* Bouton Importer Photos/Vidéos */}
            <div>
              <input ref={attachInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleAttachFiles} />
              <button
                type="button"
                onClick={() => attachInputRef.current?.click()}
                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                {uploadingAttach ? "⏳ Chargement..." : mediaItems.length > 0 ? `✅ ${mediaItems.length} photo(s)/vidéo(s) jointe(s)` : "📁 Importer Photos/Vidéos"}
              </button>
            </div>

            {/* Aperçu des médias joints */}
            {mediaItems.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mediaItems.map((m, i) => (
                  <div key={i} className="relative">
                    {m.type === 'image' ? (
                      <img src={m.url} className="w-full h-24 object-cover rounded-xl" alt="Preview" />
                    ) : (
                      <video src={m.url} className="w-full h-24 object-cover rounded-xl" />
                    )}
                    <button type="button" onClick={() => setMediaItems(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition">
                {editingPost ? 'Mettre à jour' : 'Publier maintenant'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setEditingPost(null); resetForm(); }} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-10">
        {blogs.map(blog => (
          <article key={blog.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                  {blog.authorAvatar ? <img src={blog.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{blog.authorName[0]}</div>}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800">{blog.authorName}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(blog.createdAt).toLocaleDateString()} • {blog.category}</p>
                </div>
                {user && (user.uid === blog.authorId || user.role === 'admin') && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingPost(blog); setNewTitle(blog.title); setNewContent(blog.content); setNewCategory(blog.category); setMediaItems(blog.media || []); setShowAdd(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(blog.id)} className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>

              <h2 className="font-heading text-2xl font-bold text-slate-900 mb-4">{blog.title}</h2>
              <RichContent html={blog.content} />

              {blog.externalLink && (
                <a href={blog.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mb-6">
                  <ExternalLink size={16} />{blog.externalLink}
                </a>
              )}

              <div className="flex items-center gap-6 border-t border-slate-100 pt-6">
                <button onClick={() => handleLike(blog)} className={`flex items-center gap-2 font-bold transition ${user && blog.likes.includes(user.uid) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                  <Heart size={20} className={user && blog.likes.includes(user.uid) ? 'fill-current' : ''} />
                  <span>{blog.likes.length}</span>
                </button>
                <button onClick={() => setActiveCommentPost(activeCommentPost === blog.id ? null : blog.id)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition">
                  <MessageCircle size={20} />
                  <span>{blog.comments.length}</span>
                </button>
                <button onClick={() => handleShare(blog)} className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold transition ml-auto">
                  <Share2 size={20} />
                  <span>{blog.shares || 0}</span>
                </button>
              </div>

              {activeCommentPost === blog.id && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="space-y-4 mb-6">
                    {blog.comments.map(comment => (
                      <div key={comment.id} className="bg-slate-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                            {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{comment.authorName[0]}</div>}
                          </div>
                          <span className="font-bold text-sm text-slate-800">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-8">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter un commentaire..."
                      className="flex-grow px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleComment(blog)}
                    />
                    <button onClick={() => handleComment(blog)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
