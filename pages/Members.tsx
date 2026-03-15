
import React, { useState } from 'react';
import { User, Connection } from '../types';

interface MembersProps {
  users: User[];
  currentUser?: User | null;
  connections?: Connection[];
  onViewProfile: (uid: string) => void;
  onSendConnection?: (targetUid: string) => void;
}

const Members: React.FC<MembersProps> = ({ users, currentUser, connections = [], onViewProfile, onSendConnection }) => {
  const [filter, setFilter] = useState('');

  const filtered = users.filter(u =>
    u.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    u.department.toLowerCase().includes(filter.toLowerCase()) ||
    (u.offeredSkills && u.offeredSkills.some(s => s.toLowerCase().includes(filter.toLowerCase()))) ||
    (u.requestedSkills && u.requestedSkills.some(s => s.toLowerCase().includes(filter.toLowerCase())))
  );

  const getConnectionStatus = (targetUid: string) => {
    if (!currentUser) return null;
    return connections.find(c =>
      (c.senderId === currentUser.uid && c.receiverId === targetUid) ||
      (c.senderId === targetUid && c.receiverId === currentUser.uid)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">Notre Communauté</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom, département, compétence..."
            className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.length > 0 ? filtered.map(u => {
          const conn = getConnectionStatus(u.uid);
          const isSelf = currentUser?.uid === u.uid;
          return (
            <div
              key={u.uid}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-center group"
            >
              <div
                className="cursor-pointer"
                onClick={() => onViewProfile(u.uid)}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-slate-50 group-hover:border-blue-100 transition">
                  {u.avatar ? (
                    <img src={u.avatar} alt={`${u.firstName}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400">
                      {u.firstName[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">{u.firstName} {u.lastName}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1 mb-4">{u.department}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Offre</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {u.offeredSkills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] bg-green-50 px-2 py-1 rounded-full font-medium text-green-600 border border-green-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recherche</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {u.requestedSkills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[10px] bg-orange-50 px-2 py-1 rounded-full font-medium text-orange-600 border border-orange-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispo: {u.availability || 'N/A'}</span>
                  <span className="text-xs font-bold text-slate-600">⏰ {u.credits}</span>
                </div>
              </div>

              {/* Bouton connexion */}
              {!isSelf && (
                <div>
                  {!currentUser && (
                    <button
                      onClick={() => onViewProfile(u.uid)}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                      + Se connecter
                    </button>
                  )}
                  {currentUser && !conn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSendConnection?.(u.uid); }}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                      + Se connecter
                    </button>
                  )}
                  {currentUser && conn?.status === 'sent' && conn.senderId === currentUser.uid && (
                    <span className="w-full inline-block bg-slate-100 text-slate-500 py-2 rounded-xl text-xs font-bold text-center">
                      ⏳ Demande envoyée
                    </span>
                  )}
                  {currentUser && conn?.status === 'sent' && conn.receiverId === currentUser.uid && (
                    <span className="w-full inline-block bg-orange-50 text-orange-600 py-2 rounded-xl text-xs font-bold text-center">
                      📩 Demande reçue
                    </span>
                  )}
                  {currentUser && conn?.status === 'accepted' && (
                    <span className="w-full inline-block bg-green-50 text-green-700 py-2 rounded-xl text-xs font-bold text-center border border-green-200">
                      ✅ Connecté
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium">Aucun membre ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
