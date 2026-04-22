"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff, Users, X,
  MessageCircle, Hand, PenTool, CircleStop, Settings, Lock, Unlock,
  BarChart3, LayoutGrid, ImagePlus, MoreVertical
} from 'lucide-react';

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

export default function LiveRoom({ session, localUserName, isHost, onLeave, onEnd }: LiveRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isTileView, setIsTileView] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const initJitsi = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: session.roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
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
          enableLocalRecording: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_FOOTER: false,
          TOOLBAR_BUTTONS: [],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator'],
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
        },
      });

      apiRef.current = api;

      api.on("videoConferenceJoined", () => setJoined(true));
      api.on("participantJoined", () => {
        setParticipantCount(api.getParticipantsInfo().length);
      });
      api.on("participantLeft", () => {
        setParticipantCount(api.getParticipantsInfo().length);
      });
      api.on("audioMuteStatusChanged", (e: any) => setAudioOn(!e.muted));
      api.on("videoMuteStatusChanged", (e: any) => setVideoOn(!e.muted));
      api.on("screenSharingStatusChanged", (e: any) => setSharingScreen(e.on));
      api.on("raiseHandUpdated", (e: any) => setIsHandRaised(e.handRaised));
      api.on("recordingStatusChanged", (e: any) => setIsRecording(e.status === 'on'));
      api.on("tileViewChanged", (e: any) => setIsTileView(e.enabled));
      api.on("videoConferenceLeft", () => onLeave());
    };

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initJitsi();
    document.head.appendChild(script);

    navigator.mediaDevices.enumerateDevices().then(devices => {
      setAudioInputs(devices.filter(d => d.kind === 'audioinput'));
      setVideoInputs(devices.filter(d => d.kind === 'videoinput'));
    });

    return () => {
      apiRef.current?.dispose();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [session.roomName, localUserName, onLeave]);

  const toggleAudio = () => apiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => apiRef.current?.executeCommand("toggleVideo");
  const toggleScreen = () => apiRef.current?.executeCommand("toggleShareScreen");
  const toggleChat = () => apiRef.current?.executeCommand("toggleChat");
  const toggleParticipants = () => apiRef.current?.executeCommand("toggleParticipants");
  const toggleHand = () => apiRef.current?.executeCommand("toggleRaiseHand");
  const toggleTileView = () => apiRef.current?.executeCommand("toggleTileView");
  const toggleStats = () => apiRef.current?.executeCommand("toggleStats");
  
  const toggleRoomLock = () => {
    apiRef.current?.executeCommand("toggleRoomLock");
    setIsLocked(!isLocked);
  };

  const openSettings = (section?: string) => {
    setShowMoreMenu(false);
    apiRef.current?.executeCommand("toggleSettings", section ? { section } : undefined);
  };

  const openVirtualBackground = () => {
    setShowMoreMenu(false);
    apiRef.current?.executeCommand("toggleSettings", { section: 'virtual-background' });
  };

  const handleRecording = async () => {
    try {
      if (!isRecording) {
        await apiRef.current?.executeCommand("startRecording", { mode: 'local' });
      } else {
        await apiRef.current?.executeCommand("stopRecording", { mode: 'local' });
      }
    } catch (error) {
      console.error("Erreur d'enregistrement :", error);
    }
  };

  const changeDevice = (deviceId: string, kind: 'audioinput' | 'videoinput') => {
    if (kind === 'audioinput') apiRef.current?.executeCommand("setAudioInputDevice", deviceId);
    if (kind === 'videoinput') apiRef.current?.executeCommand("setVideoInputDevice", deviceId);
    setShowDeviceMenu(false);
  };

  const handleLeave = useCallback(() => {
    apiRef.current?.executeCommand("hangup");
    onLeave();
  }, [onLeave]);

  const handleEnd = useCallback(() => {
    apiRef.current?.executeCommand("hangup");
    onEnd();
  }, [onEnd]);

  const ActionButton = ({ icon, label, active, activeClass, onClick, disabled, danger }: any) => {
    const isDisabled = disabled || !joined;
    let classes = "relative flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all duration-200 ";
    
    if (isDisabled) {
      classes += "bg-slate-800/50 text-slate-600 cursor-not-allowed";
    } else if (danger) {
      classes += "bg-red-600 hover:bg-red-700 text-white";
    } else if (active) {
      classes += `${activeClass || "bg-blue-600"} text-white shadow-lg`;
    } else {
      classes += "bg-slate-700/80 hover:bg-slate-600 text-white";
    }

    return (
      <button onClick={onClick} disabled={isDisabled} className={classes}>
        {icon}
        <span className="text-[9px] font-medium opacity-80">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
      
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
          <span className="text-white text-sm font-bold tracking-wide">{session.title}</span>
          <span className="text-slate-400 text-[10px] uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md font-semibold">{session.type}</span>
          {isLocked && <Lock size={12} className="text-yellow-500" />}
          {isRecording && <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold animate-pulse"><CircleStop size={12} /> REC</div>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleParticipants} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs px-3 py-1.5 rounded-xl">
            <Users size={14} /><span>{participantCount}</span>
          </button>
          {!joined && <span className="text-slate-500 text-xs animate-pulse ml-2">Connexion...</span>}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        <div ref={containerRef} className="w-full h-full" />
        
        {!joined && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-950 pointer-events-none">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Connexion au serveur...</p>
            </div>
          </div>
        )}

        {showWhiteboard && (
          <div className="absolute inset-4 z-30 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-500 flex flex-col">
            <div className="flex items-center justify-between p-2 bg-slate-100 border-b">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2"><PenTool size={16} /> Tableau blanc collaboratif</span>
              <button onClick={() => setShowWhiteboard(false)} className="p-1 hover:bg-slate-300 rounded-lg transition-colors"><X size={18} className="text-slate-600" /></button>
            </div>
            <iframe src="https://excalidraw.com" className="w-full flex-1 bg-white" />
          </div>
        )}
      </div>

      <div className="relative bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 py-3">
        
        {showDeviceMenu && (
          <div className="absolute bottom-full mb-2 left-4 w-72 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-4 z-50">
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Microphones</h4>
            <div className="space-y-1 mb-4 max-h-24 overflow-y-auto">
              {audioInputs.length === 0 && <p className="text-slate-500 text-xs">Aucun détecté</p>}
              {audioInputs.map(dev => (
                <button key={dev.deviceId} onClick={() => changeDevice(dev.deviceId, 'audioinput')} className="w-full text-left text-xs text-slate-300 hover:bg-slate-700 p-2 rounded-lg truncate">{dev.label || `Micro ${dev.deviceId.slice(0,5)}`}</button>
              ))}
            </div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Caméras</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {videoInputs.length === 0 && <p className="text-slate-500 text-xs">Aucune détectée</p>}
              {videoInputs.map(dev => (
                <button key={dev.deviceId} onClick={() => changeDevice(dev.deviceId, 'videoinput')} className="w-full text-left text-xs text-slate-300 hover:bg-slate-700 p-2 rounded-lg truncate">{dev.label || `Caméra ${dev.deviceId.slice(0,5)}`}</button>
              ))}
            </div>
          </div>
        )}

        {showMoreMenu && (
          <div className="absolute bottom-full mb-2 right-4 w-64 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-3 z-50 grid grid-cols-3 gap-2">
            <ActionButton icon={<LayoutGrid size={18} />} label="Mosaïque" active={isTileView} onClick={() => { toggleTileView(); setShowMoreMenu(false); }} />
            <ActionButton icon={<ImagePlus size={18} />} label="Arrière-plan" onClick={openVirtualBackground} />
            <ActionButton icon={<BarChart3 size={18} />} label="Statistiques" onClick={() => { toggleStats(); setShowMoreMenu(false); }} />
            {isHost && <ActionButton icon={isLocked ? <Unlock size={18} /> : <Lock size={18} />} label="Sécurité" active={isLocked} activeClass="bg-yellow-600" onClick={() => { toggleRoomLock(); setShowMoreMenu(false); }} />}
            <ActionButton icon={<Settings size={18} />} label="Paramètres" onClick={() => openSettings()} />
          </div>
        )}

        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <ActionButton icon={audioOn ? <Mic size={20} /> : <MicOff size={20} />} label={audioOn ? "Micro" : "Muet"} active={!audioOn} activeClass="bg-red-600" onClick={toggleAudio} />
            
            <div className="relative">
              <ActionButton icon={videoOn ? <Video size={20} /> : <VideoOff size={20} />} label={videoOn ? "Caméra" : "Arrêtée"} active={!videoOn} activeClass="bg-red-600" onClick={toggleVideo} />
              <button onClick={() => setShowDeviceMenu(!showDeviceMenu)} className="absolute -top-1 -right-1 w-3 h-3 bg-slate-500 rounded-full hover:bg-blue-500 transition-colors border border-slate-900" title="Choisir le périphérique" />
            </div>

            <ActionButton icon={sharingScreen ? <MonitorOff size={20} /> : <Monitor size={20} />} label="Écran" active={sharingScreen} onClick={toggleScreen} />
          </div>

          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-2xl">
            <ActionButton icon={<MessageCircle size={20} />} label="Chat" onClick={toggleChat} />
            <ActionButton icon={<Hand size={20} />} label="Main" active={isHandRaised} activeClass="bg-yellow-500 text-black" onClick={toggleHand} />
            <ActionButton icon={<PenTool size={20} />} label="Tableau" active={showWhiteboard} onClick={() => setShowWhiteboard(!showWhiteboard)} />
            <ActionButton icon={<CircleStop size={20} />} label="Enregistrer" active={isRecording} activeClass="bg-red-600 animate-pulse" onClick={handleRecording} />
          </div>

          <div className="flex items-center gap-2">
            <ActionButton icon={<MoreVertical size={20} />} label="Plus" active={showMoreMenu} onClick={() => { setShowMoreMenu(!showMoreMenu); setShowDeviceMenu(false); }} />
            
            <div className="w-px h-10 bg-slate-700 mx-1" />
            
            {isHost ? (
              <ActionButton icon={<PhoneOff size={20} />} label="Terminer" danger onClick={handleEnd} />
            ) : (
              <ActionButton icon={<PhoneOff size={20} />} label="Quitter" danger onClick={handleLeave} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}