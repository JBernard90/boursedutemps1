"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, Users, X } from 'lucide-react';

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

export default function LiveRoom({ session, localUserName, isHost, onLeave, onEnd }: LiveRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        toolbarButtons: [],
        disableInviteFunctions: true,
        doNotStoreRoom: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_FOOTER: false,
        TOOLBAR_BUTTONS: [],
        SETTINGS_SECTIONS: [],
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
      },
    });

    apiRef.current = api;
    api.on('videoConferenceJoined', () => setJoined(true));
    api.on('participantJoined', () => {
      setParticipantCount(c => c + 1);
      setParticipants(api.getParticipantsInfo().map((p: any) => p.displayName || 'Participant'));
    });
    api.on('participantLeft', () => {
      setParticipantCount(c => Math.max(1, c - 1));
      setParticipants(api.getParticipantsInfo().map((p: any) => p.displayName || 'Participant'));
    });
    api.on('audioMuteStatusChanged', ({ muted }: { muted: boolean }) => setAudioOn(!muted));
    api.on('videoMuteStatusChanged', ({ muted }: { muted: boolean }) => setVideoOn(!muted));
    api.on('screenSharingStatusChanged', ({ on }: { on: boolean }) => setSharingScreen(on));
    api.on('videoConferenceLeft', () => onLeave());
  }, [session.roomName, localUserName, onLeave]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 1. Fetch JWT from our API
    fetch('/api/jaasToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        roomName: session.roomName,
        userName: localUserName,
        isModerator: isHost,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.token) throw new Error(data.error || 'Token JaaS manquant');

        // 2. Load JaaS SDK
        const script = document.createElement('script');
        script.src = 'https://8x8.vc/external_api.js';
        script.async = true;
        script.onload = () => initJitsi(data.token);
        document.head.appendChild(script);
      })
      .catch(err => {
        console.error('JaaS error:', err);
        setError(err.message);
      });

    return () => {
      apiRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAudio = () => apiRef.current?.executeCommand('toggleAudio');
  const toggleVideo = () => apiRef.current?.executeCommand('toggleVideo');
  const toggleScreen = () => apiRef.current?.executeCommand('toggleShareScreen');

  const handleLeave = useCallback(() => {
    apiRef.current?.executeCommand('hangup');
    onLeave();
  }, [onLeave]);

  const handleEnd = useCallback(() => {
    apiRef.current?.executeCommand('hangup');
    onEnd();
  }, [onEnd]);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-[2rem] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-semibold">{session.title}</span>
          <span className="text-slate-400 text-xs capitalize bg-slate-800 px-2 py-0.5 rounded-lg">{session.type}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowParticipants(v => !v)} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs">
            <Users size={14} /><span>{participantCount}</span>
          </button>
          {!joined && !error && <span className="text-slate-500 text-xs animate-pulse">Connexion...</span>}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-red-400 font-semibold mb-2">Erreur de connexion</p>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}

        {showParticipants && (
          <div className="absolute right-0 top-0 h-full w-64 bg-slate-900 border-l border-slate-700 p-4 z-20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-semibold">Participants ({participantCount})</span>
              <button onClick={() => setShowParticipants(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">👤</div>
                <span>{localUserName} (vous)</span>
              </div>
              {participants.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">👤</div>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 border-t border-slate-700">
        <button onClick={toggleAudio} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${audioOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
          <span className="text-[9px] font-medium">{audioOn ? 'Micro' : 'Muet'}</span>
        </button>
        <button onClick={toggleVideo} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
          <span className="text-[9px] font-medium">{videoOn ? 'Caméra' : 'Arrêtée'}</span>
        </button>
        <button onClick={toggleScreen} disabled={!joined} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${!joined ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : sharingScreen ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
          {sharingScreen ? <MonitorOff size={20} /> : <Monitor size={20} />}
          <span className="text-[9px] font-medium">Écran</span>
        </button>
        <div className="w-px h-10 bg-slate-700 mx-1" />
        {isHost ? (
          <button onClick={handleEnd} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors">
            <PhoneOff size={20} /><span className="text-[9px] font-medium">Terminer</span>
          </button>
        ) : (
          <button onClick={handleLeave} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors">
            <PhoneOff size={20} /><span className="text-[9px] font-medium">Quitter</span>
          </button>
        )}
      </div>
    </div>
  );
}
