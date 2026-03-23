
import React, { useState, useRef } from 'react';
import { Testimonial, User, MediaItem } from '../types';
import { db, doc, updateDoc, deleteDoc, addDoc, collection } from '../api';
import { Edit2, Trash2, MessageCircle, Heart, Share2, Bold, Italic, Underline, List, ListOrdered, Link, Quote, Type, Image, Film, FileText } from 'lucide-react';

interface TestimonialsProps {
  testimonials: Testimonial[];
  user: User | null;
  onUpdate: (t: Testimonial[]) => void;
  onAuthClick: () => void;
}

// ---- Rich Text Editor ----
const RichTextEditor: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = "Détaillez votre expérience..." }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
  };
  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };

  const uploadToCloudinary = async (file: File, type: 'image' | 'video' | 'raw'): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary non configuré');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Erreur upload');
    return data.secure_url;
  };

  const insertImageAtCursor = (url: string) => {
    restoreRange(); editorRef.current?.focus();
    document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block;" />`);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const insertVideoAtCursor = (url: string) => {
    restoreRange(); editorRef.current?.focus();
    let html = '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/');
      html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:12px 0;"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    } else {
      html = `<video src="${url}" controls style="max-width:100%;border-radius:12px;margin:12px 0;display:block;"></video>`;
    }
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const insertFileAtCursor = (url: string, name: string) => {
    restoreRange(); editorRef.current?.focus();
    const ext = name.split('.').pop()?.toUpperCase() || 'FICHIER';
    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#EFF6FF;border:1px solid #BFDBFE;color:#1D4ED8;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:4px 0;">📎 ${name} <span style="background:#1D4ED8;color:white;padding:2px 8px;border-radius:4px;font-size:11px;">${ext}</span></a>`);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { insertImageAtCursor(await uploadToCloudinary(file, 'image')); }
    catch { alert('Erreur upload image'); }
    finally { setUploading(false); e.target.value = ''; }
  };
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { insertVideoAtCursor(await uploadToCloudinary(file, 'video')); }
    catch { alert('Erreur upload vidéo'); }
    finally { setUploading(false); e.target.value = ''; }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { insertFileAtCursor(await uploadToCloudinary(file, 'raw'), file.name); }
    catch { alert('Erreur upload fichier'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const ToolBtn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button type="button" title={title} onClick={onClick} className="p-2 rounded-lg transition hover:bg-blue-50 hover:text-blue-600 text-slate-500">{children}</button>
  );
  const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <ToolBtn onClick={() => exec('bold')} title="Gras"><Bold size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italique"><Italic size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Souligné"><Underline size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('formatBlock', 'h1')} title="Titre 1"><span className="font-bold text-xs">H1</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Titre 2"><span className="font-bold text-xs">H2</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Titre 3"><span className="font-bold text-xs">H3</span></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraphe"><Type size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered size={15} /></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('justifyLeft')} title="Gauche"><span className="text-xs">⬅</span></ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Centre"><span className="text-xs">↔</span></ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Droite"><span className="text-xs">➡</span></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => { saveRange(); const url = prompt('URL du lien :'); if (url) { restoreRange(); exec('createLink', url); } }} title="Lien"><Link size={15} /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'blockquote')} title="Citation"><Quote size={15} /></ToolBtn>
        <Divider />
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <ToolBtn onClick={() => { saveRange(); imageInputRef.current?.click(); }} title="Insérer une image"><Image size={15} /></ToolBtn>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <ToolBtn onClick={() => { saveRange(); videoInputRef.current?.click(); }} title="Insérer une vidéo"><Film size={15} /></ToolBtn>
        <ToolBtn onClick={() => { saveRange(); const url = prompt('Lien YouTube :'); if (url) insertVideoAtCursor(url); }} title="Vidéo YouTube"><span className="text-xs font-bold text-red-500">▶</span></ToolBtn>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileUpload} />
        <ToolBtn onClick={() => { saveRange(); fileInputRef.current?.click(); }} title="Insérer un fichier"><FileText size={15} /></ToolBtn>
        <Divider />
        <input type="color" title="Couleur" className="w-7 h-7 rounded cursor-pointer border border-slate-200" onMouseDown={saveRange} onChange={e => { restoreRange(); exec('foreColor', e.target.value); }} />
        <ToolBtn onClick={() => exec('removeFormat')} title="Effacer formatage"><span className="text-xs text-red-400 font-bold">✕</span></ToolBtn>
      </div>
      {uploading && <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-600 font-bold flex items-center gap-2"><span className="animate-spin">⏳</span> Upload en cours...</div>}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[180px] max-h-[500px] overflow-y-auto px-5 py-4 outline-none text-slate-700 text-sm leading-relaxed
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-2
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mb-2
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3
          [&_a]:text-blue-600 [&_a]:underline
          [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3
          [&_video]:max-w-full [&_video]:rounded-xl [&_video]:my-3
          [&_p]:my-1"
      />
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
        🖼️ Image • 🎬 Vidéo • ▶ YouTube • 📎 Fichier — insérés à la position du curseur
      </div>
    </div>
  );
};

// ---- Render HTML ----
const RichContent: React.FC<{ html: string }> = ({ html }) => {
  const isHTML = /<[a-z][\s\S]*>/i.test(html);
  if (isHTML) return (
    <div className="text-slate-500 italic leading-relaxed mb-8
      [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:not-italic [&_h1]:mb-3
      [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:not-italic [&_h2]:mb-2
      [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:not-italic [&_h3]:mb-2
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:not-italic
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:not-italic
      [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-3
      [&_a]:text-blue-600 [&_a]:underline [&_a]:not-italic
      [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-3
      [&_video]:max-w-full [&_video]:rounded-xl [&_video]:my-3"
      dangerouslySetInnerHTML={{ __html: html }} />
  );
  return <p className="text-slate-500 italic leading-relaxed mb-8 whitespace-pre-wrap">{html}</p>;
};

// ---- Main Testimonials Component ----
const Testimonials: React.FC<TestimonialsProps> = ({ testimonials, user, onAuthClick }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingPost, setEditingPost] = useState<Testimonial | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ce témoignage ?")) return;
    await deleteDoc(doc(db, 'testimonials', id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return onAuthClick();
    try {
      if (editingPost) {
        await updateDoc(doc(db, 'testimonials', editingPost.id), { title: newTitle, content: newContent, rating: newRating });
      } else {
        await addDoc(collection(db, 'testimonials'), {
          title: newTitle, content: newContent, rating: newRating,
          authorId: user.uid, authorName: `${user.firstName} ${user.lastName}`,
          authorAvatar: user.avatar || null,
          likes: [], shares: 0, comments: [],
          createdAt: new Date().toISOString(),
        });
      }
      setShowAdd(false); setEditingPost(null);
      setNewTitle(''); setNewContent(''); setNewRating(5);
    } catch (err: any) { alert('Erreur : ' + err.message); }
  };

  const handleLike = async (t: Testimonial) => {
    if (!user) { onAuthClick(); return; }
    const likes = t.likes || [];
    const newLikes = likes.includes(user.uid) ? likes.filter(id => id !== user.uid) : [...likes, user.uid];
    await updateDoc(doc(db, 'testimonials', t.id), { likes: newLikes });
  };

  const handleShare = async (t: Testimonial) => {
    const text = (t.content || '').replace(/<[^>]*>/g, '').substring(0, 150);
    if (navigator.share) {
      try { await navigator.share({ title: t.title, text, url: window.location.href }); }
      catch (err) { console.error(err); }
    } else { navigator.clipboard.writeText(window.location.href); alert("Lien copié !"); }
    await updateDoc(doc(db, 'testimonials', t.id), { shares: (t.shares || 0) + 1 });
  };

  const handleComment = async (t: Testimonial) => {
    if (!user) { onAuthClick(); return; }
    if (!commentText.trim()) return;
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.uid, authorName: `${user.firstName} ${user.lastName}`,
      authorAvatar: user.avatar || null, content: commentText,
      createdAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'testimonials', t.id), { comments: [...(t.comments || []), newComment] });
    setCommentText(''); setActiveCommentPost(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">Paroles de Membres</h1>
        <p className="text-slate-500 mb-10">Partagez votre expérience et votez pour les meilleures histoires d'entraide.</p>
        <button
          onClick={() => { if (!user) { onAuthClick(); return; } setEditingPost(null); setNewTitle(''); setNewContent(''); setNewRating(5); setShowAdd(true); }}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-600 transition shadow-xl"
        >Contribuer au mur</button>
      </div>

      {showAdd && (
        <div className="mb-16 bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl">
          <h2 className="font-heading text-2xl font-bold mb-8">{editingPost ? 'Modifier le témoignage' : 'Votre Témoignage'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input required placeholder="Titre de votre histoire" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Contenu — insérez images, vidéos et fichiers dans le texte</label>
              <RichTextEditor value={newContent} onChange={setNewContent} />
            </div>
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold text-slate-400">Note :</span>
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setNewRating(star)} className={`text-2xl transition ${newRating >= star ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}>★</button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition">{editingPost ? 'Mettre à jour' : 'Publier'}</button>
              <button type="button" onClick={() => { setShowAdd(false); setEditingPost(null); }} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="columns-1 md:columns-2 gap-8 space-y-8">
        {testimonials.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(t => (
          <div key={t.id} className="break-inside-avoid bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
            {user && (user.uid === t.authorId || user.role === 'admin') && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => { setEditingPost(t); setNewTitle(t.title || ''); setNewContent(t.content); setNewRating(t.rating); setShowAdd(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-white/80 rounded-full"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white/80 rounded-full"><Trash2 size={16} /></button>
              </div>
            )}
            <div className="flex text-yellow-400 mb-6 text-lg">{'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
            <h3 className="font-heading font-bold text-xl text-slate-800 mb-4 pr-10">"{t.title}"</h3>
            <RichContent html={t.content} />
            <div className="flex items-center gap-4 pt-6 border-t border-slate-50 mb-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shadow-sm">
                {t.authorAvatar ? <img src={t.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-blue-600">{t.authorName[0]}</div>}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Par {t.authorName}</span>
            </div>
            <div className="flex items-center gap-6 border-t border-slate-50 pt-6">
              <button onClick={() => handleLike(t)} className={`flex items-center gap-2 font-bold transition ${user && (t.likes||[]).includes(user.uid) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                <Heart size={18} className={user && (t.likes||[]).includes(user.uid) ? 'fill-current' : ''} />
                <span className="text-xs">{(t.likes||[]).length}</span>
              </button>
              <button onClick={() => setActiveCommentPost(activeCommentPost === t.id ? null : t.id)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition">
                <MessageCircle size={18} /><span className="text-xs">{(t.comments||[]).length}</span>
              </button>
              <button onClick={() => handleShare(t)} className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold transition ml-auto">
                <Share2 size={18} /><span className="text-xs">{t.shares||0}</span>
              </button>
            </div>
            {activeCommentPost === t.id && (
              <div className="mt-6 pt-6 border-t border-slate-50">
                <div className="space-y-4 mb-6">
                  {(t.comments||[]).map(comment => (
                    <div key={comment.id} className="bg-slate-50 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                          {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold">{comment.authorName[0]}</div>}
                        </div>
                        <span className="font-bold text-xs text-slate-800">{comment.authorName}</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-7">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Commenter..." className="flex-grow px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-xs" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleComment(t)} />
                  <button onClick={() => handleComment(t)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition">Envoyer</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
