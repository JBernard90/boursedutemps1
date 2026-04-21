"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, Users, X, Radio, Maximize2, Minimize2, Settings } from 'lucide-react';

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

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

interface LiveRoomProps {
  session: LiveSession;
  localUserName: string;
  isHost: boolean;
  onLeave: () => void;
  onEnd: () => void;
}

const APP_ID = process.env.NEXT_PUBLIC_JAAS_APP_ID || 'vpaas-magic-cookie-017a1705a9c54e49afac8d78f0522e2a';

const SESSION_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  webinaire:   { label: 'Webinaire',    emoji: '📡', color: 'bg-blue-600' },
  reunion:     { label: 'Réunion',      emoji: '🤝', color: 'bg-emerald-600' },
  session:     { label: 'Session live', emoji: '🎓', color: 'bg-purple-600' },
};

function formatDuration(startedAt: string) {
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function LiveRoom({ session, localUserName, isHost, onLeave, onEnd }: LiveRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<{name: string; id: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState('00:00');
  const [fullscreen, setFullscreen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Timer
  useEffect(() => {
    if (!joined) return;
    const interval = setInterval(() => {
      setDuration(formatDuration(session.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [joined, session.startedAt]);

  const initJitsi = useCallback((jwt: string) => {
    if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

    const api = new window.JitsiMeetExternalAPI('8x8.vc', {
      roomName: `${APP_ID}/${session.roomName}`,
      jwt,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      userInfo: { displayName: localUserName },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        disableInviteFunctions: true,
        doNotStoreRoom: true,
        defaultLocalDisplayName: localUserName,
        hideDisplayName: false,
        // Activer toutes les fonctionnalités
        enableClosePage: false,
        disablePolls: false,
        whiteboard: { enabled: true },
        breakoutRooms: { hideAddRoomButton: false },
        recordings: { suggestRecording: false },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_FOOTER: false,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup', 'chat',
          'recording', 'livestreaming', 'etherpad', 'whiteboard',
          'sharedvideo', 'shareaudio', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'participants-pane',
          'feedback', 'stats', 'shortcuts', 'tileview',
          'select-background', 'download', 'help', 'mute-everyone',
          'security', 'toggle-camera',
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds'],
        filmStripOnly: false,
        INITIAL_TOOLBAR_TIMEOUT: 20000,
        TOOLBAR_ALWAYS_VISIBLE: false,
      },
    });

    apiRef.current = api;

    api.on('videoConferenceJoined', () => setJoined(true));
    api.on('participantJoined', (p: any) => {
      setParticipantCount(c => c + 1);
      setParticipants(prev => [...prev, { name: p.displayName || 'Participant', id: p.id }]);
    });
    api.on('participantLeft', (p: any) => {
      setParticipantCount(c => Math.max(1, c - 1));
      setParticipants(prev => prev.filter(x => x.id !== p.id));
    });
    api.on('audioMuteStatusChanged', ({ muted }: { muted: boolean }) => setAudioOn(!muted));
    api.on('videoMuteStatusChanged', ({ muted }: { muted: boolean }) => setVideoOn(!muted));
    api.on('screenSharingStatusChanged', ({ on }: { on: boolean }) => setSharingScreen(on));
    api.on('videoConferenceLeft', () => onLeave());
  }, [session.roomName, localUserName, onLeave]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    fetch('/api/jaasToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roomName: session.roomName, userName: localUserName, isModerator: isHost }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.token) throw new Error(data.error || 'Token JaaS manquant');
        const script = document.createElement('script');
        script.src = 'https://8x8.vc/external_api.js';
        script.async = true;
        script.onload = () => initJitsi(data.token);
        document.head.appendChild(script);
      })
      .catch(err => { console.error('JaaS error:', err); setError(err.message); });

    return () => { apiRef.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAudio  = () => apiRef.current?.executeCommand('toggleAudio');
  const toggleVideo  = () => apiRef.current?.executeCommand('toggleVideo');
  const toggleScreen = () => apiRef.current?.executeCommand('toggleShareScreen');

  const handleLeave = useCallback(() => { apiRef.current?.executeCommand('hangup'); onLeave(); }, [onLeave]);
  const handleEnd   = useCallback(() => { apiRef.current?.executeCommand('hangup'); onEnd(); }, [onEnd]);

  const typeInfo = SESSION_TYPE_LABELS[session.type] || { label: session.type, emoji: '🎙️', color: 'bg-slate-600' };

  return (
    <div className={`flex flex-col bg-slate-950 overflow-hidden transition-all duration-300 ${fullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'h-full rounded-[2rem]'}`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Live badge */}
          <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
          </div>

          {/* Type badge */}
          <span className={`${typeInfo.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0`}>
            {typeInfo.emoji} {typeInfo.label}
          </span>

          {/* Title */}
          <span className="text-white text-sm font-semibold truncate">{session.title}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Duration */}
          {joined && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-300 text-xs font-mono font-medium">{duration}</span>
            </div>
          )}

          {/* Participants */}
          <button
            onClick={() => setShowParticipants(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors text-xs font-medium ${showParticipants ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Users size={12} />
            <span>{participantCount}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setFullscreen(v => !v)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {!joined && !error && (
            <span className="text-slate-500 text-xs animate-pulse">Connexion...</span>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Video container */}
        <div className="flex-1 relative bg-slate-950">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-400 font-bold mb-2">Erreur de connexion</p>
                <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          ) : !joined ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
                  <div className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-white font-semibold mb-1">Connexion en cours...</p>
                <p className="text-slate-400 text-sm">Préparation de votre salle</p>
              </div>
            </div>
          ) : null}
          <div ref={containerRef} className={`w-full h-full ${!joined ? 'opacity-0 absolute inset-0' : ''}`} />
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-64 bg-slate-900 border-l border-slate-700/50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <span className="text-white text-sm font-semibold">Participants ({participantCount})</span>
              <button onClick={() => setShowParticipants(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Local user */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {localUserName[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{localUserName}</p>
                  <p className="text-blue-400 text-[10px]">{isHost ? 'Hôte' : 'Vous'}</p>
                </div>
                {isHost && <span className="ml-auto text-yellow-400 text-[10px] font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-full">HOST</span>}
              </div>

              {/* Remote participants */}
              {participants.map((p, i) => (
                <div key={p.id || i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <p className="text-slate-300 text-xs truncate">{p.name}</p>
                </div>
              ))}

              {participantCount === 1 && (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-xs">En attente de participants...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700/50">
        <div className="flex items-center justify-center gap-3">

          {/* Micro */}
          <button onClick={toggleAudio} title={audioOn ? 'Couper le micro' : 'Activer le micro'}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200 ${audioOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'}`}>
            {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
            <span className="text-[9px] font-semibold">{audioOn ? 'Micro' : 'Muet'}</span>
          </button>

          {/* Caméra */}
          <button onClick={toggleVideo} title={videoOn ? 'Désactiver la caméra' : 'Activer la caméra'}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200 ${videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'}`}>
            {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
            <span className="text-[9px] font-semibold">{videoOn ? 'Caméra' : 'Arrêtée'}</span>
          </button>

          {/* Partage écran */}
          <button onClick={toggleScreen} disabled={!joined} title={sharingScreen ? "Arrêter le partage" : "Partager l'écran"}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
              !joined ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
              sharingScreen ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' :
              'bg-slate-700 hover:bg-slate-600 text-white'}`}>
            {sharingScreen ? <MonitorOff size={20} /> : <Monitor size={20} />}
            <span className="text-[9px] font-semibold">Écran</span>
          </button>

          {/* Séparateur */}
          <div className="w-px h-10 bg-slate-700 mx-2" />

          {/* Quitter / Terminer */}
          {isHost ? (
            showEndConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-xs font-medium">Terminer pour tous ?</span>
                <button onClick={handleEnd} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors">
                  Oui
                </button>
                <button onClick={() => setShowEndConfirm(false)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors">
                  Non
                </button>
              </div>
            ) : (
              <button onClick={() => setShowEndConfirm(true)}
                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-lg shadow-red-900/50">
                <PhoneOff size={20} />
                <span className="text-[9px] font-semibold">Terminer</span>
              </button>
            )
          ) : (
            <button onClick={handleLeave}
              className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-lg shadow-red-900/50">
              <PhoneOff size={20} />
              <span className="text-[9px] font-semibold">Quitter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
