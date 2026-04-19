"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  DailyProvider,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
  DailyVideo,
  useScreenShare,
  useMeetingState,
} from '@daily-co/daily-react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, Users, MessageSquare, X } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Tile participant ─────────────────────────────────────────────────────────
function ParticipantTile({ sessionId, isLocal }: { sessionId: string; isLocal: boolean }) {
  const videoTrack = useVideoTrack(sessionId);
  const audioTrack = useAudioTrack(sessionId);
  const isMuted = audioTrack.isOff;
  const isVideoOff = videoTrack.isOff;

  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
      {!isVideoOff ? (
        <DailyVideo
          sessionId={sessionId}
          type="video"
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {isLocal ? '👤' : '?'}
            </span>
          </div>
          <span className="text-slate-400 text-xs">Caméra désactivée</span>
        </div>
      )}
      {isLocal && (
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-lg">
          Vous
        </div>
      )}
      {isMuted && (
        <div className="absolute bottom-2 right-2 bg-red-500/90 p-1 rounded-lg">
          <MicOff size={10} className="text-white" />
        </div>
      )}
    </div>
  );
}

// ── Controls bar ─────────────────────────────────────────────────────────────
function Controls({ isHost, onLeave, onEnd, joined }: { isHost: boolean; onLeave: () => void; onEnd: () => void; joined: boolean }) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const videoTrack = useVideoTrack(localSessionId ?? '');
  const audioTrack = useAudioTrack(localSessionId ?? '');
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!audioOn);
    setAudioOn(v => !v);
  }, [daily, audioOn]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!videoOn);
    setVideoOn(v => !v);
  }, [daily, videoOn]);

  const toggleScreen = useCallback(() => {
    if (isSharingScreen) stopScreenShare();
    else startScreenShare().catch(console.error);
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 border-t border-slate-700">
      {/* Micro */}
      <button
        onClick={toggleAudio}
        title={audioOn ? 'Couper le micro' : 'Activer le micro'}
        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
          audioOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {audioOn ? <Mic size={20} /> : <MicOff size={20} />}
        <span className="text-[9px] font-medium">{audioOn ? 'Micro' : 'Muet'}</span>
      </button>

      {/* Caméra */}
      <button
        onClick={toggleVideo}
        title={videoOn ? 'Désactiver la caméra' : 'Activer la caméra'}
        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
          videoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
        <span className="text-[9px] font-medium">{videoOn ? 'Caméra' : 'Arrêtée'}</span>
      </button>

      {/* Partage écran */}
      <button
        onClick={toggleScreen}
        title={isSharingScreen ? "Arrêter le partage" : "Partager l'écran"}
        disabled={!joined}
        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
          !joined ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
          isSharingScreen ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
        }`}
      >
        {isSharingScreen ? <MonitorOff size={20} /> : <Monitor size={20} />}
        <span className="text-[9px] font-medium">Écran</span>
      </button>

      {/* Séparateur */}
      <div className="w-px h-10 bg-slate-700 mx-1" />

      {/* Quitter */}
      {isHost ? (
        <button
          onClick={onEnd}
          title="Terminer pour tous"
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff size={20} />
          <span className="text-[9px] font-medium">Terminer</span>
        </button>
      ) : (
        <button
          onClick={onLeave}
          title="Quitter"
          className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff size={20} />
          <span className="text-[9px] font-medium">Quitter</span>
        </button>
      )}
    </div>
  );
}

// ── Room interior (inside DailyProvider) ────────────────────────────────────
function RoomInterior({ session, isHost, localUserName, onLeave, onEnd }: LiveRoomProps) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const participantIds = useParticipantIds({ filter: 'remote' });
  const [showParticipants, setShowParticipants] = useState(false);
  const meetingState = useMeetingState();
  const joined = meetingState === 'joined-meeting';

  useEffect(() => {
    if (!daily) return;
    // Start camera/mic after provider mounts to trigger join
    daily.startCamera().catch(console.error);
    return () => {
      daily.leave().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily]);

  const handleLeave = useCallback(async () => {
    await daily?.leave();
    onLeave();
  }, [daily, onLeave]);

  const handleEnd = useCallback(async () => {
    await daily?.leave();
    onEnd();
  }, [daily, onEnd]);

  const allIds = localSessionId ? [localSessionId, ...participantIds] : participantIds;
  const count = allIds.length;

  const gridCols =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
    count <= 4 ? 'grid-cols-2' :
    count <= 6 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-semibold">{session.title}</span>
          </div>
          <span className="text-slate-400 text-xs capitalize bg-slate-800 px-2 py-0.5 rounded-lg">
            {session.type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowParticipants(v => !v)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs"
          >
            <Users size={14} />
            <span>{count}</span>
          </button>
          {!joined && (
            <span className="text-slate-500 text-xs animate-pulse">Connexion...</span>
          )}
        </div>
      </div>

      {/* Grid vidéo */}
      <div className="flex-1 overflow-hidden p-4">
        {!joined ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Connexion à la salle...</p>
            </div>
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-3 h-full`}>
            {localSessionId && (
              <ParticipantTile sessionId={localSessionId} isLocal={true} />
            )}
            {participantIds.map(id => (
              <ParticipantTile key={id} sessionId={id} isLocal={false} />
            ))}
          </div>
        )}
      </div>

      {/* Panneau participants */}
      {showParticipants && (
        <div className="absolute right-0 top-0 h-full w-64 bg-slate-900 border-l border-slate-700 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-semibold">Participants ({count})</span>
            <button onClick={() => setShowParticipants(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {allIds.map(id => (
              <div key={id} className="flex items-center gap-2 text-slate-300 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">👤</div>
                <span>{id === localSessionId ? `${localUserName} (vous)` : 'Participant'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <Controls isHost={isHost} onLeave={handleLeave} onEnd={handleEnd} joined={joined} />
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────────────────────
export default function LiveRoom(props: LiveRoomProps) {
  return (
    <DailyProvider url={props.session.roomUrl} userName={props.localUserName}>
      <RoomInterior {...props} />
    </DailyProvider>
  );
}
