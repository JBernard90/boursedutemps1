"use client";

import React, { useState, useEffect } from 'react';
import { Video, Radio, Plus } from 'lucide-react';
import { User } from '../types';
import { db, collection, onSnapshot, query, where, addDoc, deleteDoc, doc } from '../api';

interface LiveSectionProps {
  user: User | null;
}

interface ActiveLive {
  id: string;
  roomName: string;
  hostId: string;
  hostName: string;
  startTime: string;
}

const LiveSection: React.FC<LiveSectionProps> = ({ user }) => {
  const [activeLives, setActiveLives] = useState<ActiveLive[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    // Écoute des sessions en direct (si la collection existe)
    try {
      const q = query(collection(db, 'liveSessions'));
      const unsub = onSnapshot(q, (snapshot) => {
        setActiveLives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActiveLive)));
      }, (err) => {
        console.warn("La collection liveSessions n'est pas encore initialisée ou accessible.");
      });
      return () => unsub();
    } catch (e) {
      console.warn("Erreur lors de l'initialisation du listener Live:", e);
    }
  }, []);

  const startLive = async () => {
    if (!user) return alert('Connectez-vous pour démarrer un live');
    
    const roomName = `bdt-${user.uid}-${Date.now()}`;
    
    try {
      // Enregistrement de la session pour qu'elle apparaisse dans la liste
      const docRef = await addDoc(collection(db, 'liveSessions'), {
        roomName,
        hostId: user.uid,
        hostName: `${user.firstName} ${user.lastName}`,
        startTime: new Date().toISOString()
      });
      
      setCurrentRoom(roomName);
    } catch (e) {
      // Fallback si la DB n'est pas prête, on lance quand même le live en local
      setCurrentRoom(roomName);
    }
  };

  const stopLive = async () => {
    if (currentRoom) {
      const myLive = activeLives.find(l => l.roomName === currentRoom);
      if (myLive) {
        await deleteDoc(doc(db, 'liveSessions', myLive.id));
      }
      setCurrentRoom(null);
    }
  };

  return (
    <div className="mb-12">
      {/* Header Section avec icône Live */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Radio className="text-red-500 animate-pulse" size={20} />
          <h2 className="font-heading text-lg font-bold text-slate-800">Sessions en direct</h2>
        </div>
        <button 
          onClick={startLive}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-red-100"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
          Démarrer un live
        </button>
      </div>

      {/* Zone de contenu des Lives */}
      <div className="bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center transition-all hover:bg-white hover:border-blue-200 group">
        {activeLives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeLives.map(live => (
              <div key={live.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <Video size={18} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase">En direct</p>
                    <p className="text-sm font-bold text-slate-800">{live.hostName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentRoom(live.roomName)}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Rejoindre le salon
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition">
              <Radio className="text-slate-300 group-hover:text-blue-400" size={32} />
            </div>
            <p className="text-slate-400 font-medium mb-2">Aucune session en direct pour le moment</p>
            <button 
               onClick={startLive}
               className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> Lancer le premier live
            </button>
          </div>
        )}
      </div>

      {/* Modal Iframe Call */}
      {currentRoom && (
        <div className="fixed inset-0 z-[300] bg-slate-900 flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-white font-bold">Session Live - Bourse du Temps</span>
            </div>
            <button 
              onClick={stopLive}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition"
            >
              Quitter / Terminer le live
            </button>
          </div>
          <iframe
            src={`https://boursedutemps.daily.co/${currentRoom}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="flex-grow w-full border-0"
            title="Daily.co Live Session"
          />
        </div>
      )}
    </div>
  );
};

export default LiveSection;
