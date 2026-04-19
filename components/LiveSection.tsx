"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Radio, Plus, X, Users, Clock, Video } from 'lucide-react';
import { User } from '@/types';

const LiveRoom = dynamic(() => import('./LiveRoom'), { ssr: false });

interface LiveSession {
  id: number;
  roomName: string;
  roomUrl: string;
  title: string;
  type: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  participantCount: number;
  startedAt: string;
}

interface LiveSectionProps {
  user: User | null;
}

const SESSION_TYPES = [
  { value: 'webinaire', label: 'Webinaire', emoji: '📡', desc: 'Présentation pour un large public' },
  { value: 'reunion',   label: 'Réunion',   emoji: '🤝', desc: 'Échange entre membres' },
  { value: 'session',   label: 'Session live', emoji: '🎓', desc: 'Formation ou cours en direct' },
];

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  return `${Math.floor(diff / 3600)}h`;
}

export default function LiveSection({ user }: LiveSectionProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('webinaire');
  const [loading, setLoading] = useState(false);
  const [shareMenuId, setShareMenuId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  // Polling toutes les 10s pour voir les sessions actives
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/liveSessions');
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleCopyLink = (session: LiveSession) => {
    navigator.clipboard.writeText(session.roomUrl);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2000);
    setShareMenuId(null);
  };

  const handleShareWhatsApp = (session: LiveSession) => {
    const text = encodeURIComponent(`Rejoignez mon live "${session.title}" sur Bourse du Temps :
${session.roomUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareMenuId(null);
  };

  const handleShareEmail = (session: LiveSession) => {
    const subject = encodeURIComponent(`Live : ${session.title}`);
    const body = encodeURIComponent(`Bonjour,

Rejoignez mon live "${session.title}" sur Bourse du Temps :
${session.roomUrl}

À tout de suite !`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShareMenuId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/liveSessions', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          title,
          type,
          hostName: `${user.firstName} ${user.lastName}`,
          hostAvatar: user.avatar,
        }),
      });
      if (!res.ok) {
        let errMsg = 'Erreur lors de la création du live';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const session = await res.json();
      setSessions(prev => [session, ...prev]);
      setActiveSession(session);
      setShowModal(false);
      setTitle('');
      setType('webinaire');
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (session: LiveSession) => {
    if (!user) return alert('Connectez-vous pour rejoindre un live');
    setActiveSession(session);
  };

  const handleLeave = () => setActiveSession(null);

  const handleEnd = async () => {
    if (!activeSession) return;
    try {
      await fetch('/api/liveSessions', {
        method: 'DELETE',
        headers: authHeader,
        body: JSON.stringify({ id: activeSession.id, roomName: activeSession.roomName }),
      });
      setSessions(prev => prev.filter(s => s.id !== activeSession.id));
    } catch {}
    setActiveSession(null);
  };

  return (
    <>
      {/* Fermer le menu partage si on clique en dehors */}
      {shareMenuId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setShareMenuId(null)} />
      )}

      {/* ── Room en plein écran overlay ─────────────────────────────────── */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh]">
            <LiveRoom
              session={activeSession}
              localUserName={user ? `${user.firstName} ${user.lastName}` : 'Invité'}
              isHost={user?.uid === activeSession.hostId}
              onLeave={handleLeave}
              onEnd={handleEnd}
            />
          </div>
        </div>
      )}

      {/* ── Section live dans le forum ──────────────────────────────────── */}
      <div className="mb-8">

        {/* Header avec bouton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-red-500" />
            <span className="font-semibold text-slate-800 text-sm">Sessions en direct</span>
            {sessions.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {sessions.length}
              </span>
            )}
          </div>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold transition shadow-lg shadow-red-100"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Démarrer un live
            </button>
          )}
        </div>

        {/* Cartes sessions actives */}
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-white border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
              >
                {/* Avatar hôte */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {session.hostAvatar ? (
                    <Image src={session.hostAvatar} alt="Host" fill className="object-cover" unoptimized={(session.hostAvatar ?? '').startsWith('data:')} sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Video size={18} />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-800 text-sm truncate">{session.title}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                      {SESSION_TYPES.find(t => t.value === session.type)?.emoji} {session.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Par {session.hostName}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(session.startedAt)}</span>
                  </div>
                </div>

                {/* Bouton rejoindre */}
                <button
                  onClick={() => handleJoin(session)}
                  className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  <Users size={12} />
                  Rejoindre
                </button>

                {/* Bouton partager */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShareMenuId(shareMenuId === session.id ? null : session.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition bg-slate-50 hover:bg-blue-50 rounded-xl"
                    title="Partager le lien"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>

                  {shareMenuId === session.id && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-48">
                      {/* Copier le lien */}
                      <button
                        onClick={() => handleCopyLink(session)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs text-slate-700 font-medium transition"
                      >
                        {copiedId === session.id ? (
                          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        )}
                        {copiedId === session.id ? 'Copié !' : 'Copier le lien'}
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => handleShareWhatsApp(session)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-xs text-slate-700 font-medium transition"
                      >
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Partager sur WhatsApp
                      </button>

                      {/* Email */}
                      <button
                        onClick={() => handleShareEmail(session)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-xs text-slate-700 font-medium transition"
                      >
                        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Partager par email
                      </button>

                      {/* Lien direct */}
                      <div className="mt-1 pt-1 border-t border-slate-100">
                        <p className="px-3 py-1 text-[10px] text-slate-400 truncate">{session.roomUrl}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bouton terminer (hôte ou admin) */}
                {user && (user.uid === session.hostId || user.role === 'admin') && (
                  <button
                    onClick={async () => {
                      await fetch('/api/liveSessions', { method: 'DELETE', headers: authHeader, body: JSON.stringify({ id: session.id, roomName: session.roomName }) });
                      setSessions(prev => prev.filter(s => s.id !== session.id));
                    }}
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition"
                    title="Terminer le live"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-6 text-center">
            <Radio size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Aucune session en direct pour le moment</p>
            {user && (
              <button onClick={() => setShowModal(true)} className="mt-3 text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1 mx-auto">
                <Plus size={12} /> Lancer le premier live
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modal de création ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-300 hover:text-slate-600">
              <X size={22} />
            </button>
            <h2 className="font-bold text-xl text-slate-800 mb-6">Nouveau live</h2>
            <form onSubmit={handleCreate} className="space-y-5">

              {/* Titre */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Titre de la session</label>
                <input
                  required
                  placeholder="Ex : Maîtriser Excel en 1h"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {SESSION_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        type === t.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.emoji}</div>
                      <div className="text-xs font-semibold">{t.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Daily.co */}
              <div className="bg-blue-50 rounded-2xl p-3 text-xs text-blue-700">
                <strong>Daily.co</strong> — Vidéo HD, partage d'écran, jusqu'à 100 participants. La salle sera créée automatiquement et expirера après 4h.
              </div>

              <button
                type="submit"
                disabled={loading || !title}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-red-100"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {loading ? 'Création de la salle...' : 'Lancer le live maintenant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
