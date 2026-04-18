
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Transaction, Connection, ChatMessage } from '../../types';

interface ProfileProps {
  user: User;
  currentUser?: User | null;
  allUsers: User[];
  transactions: Transaction[];
  connections: Connection[];
  messages: ChatMessage[];
  onUpdate: (u: User) => void;
  onSendConnection?: (targetUid: string) => void;
  onUpdateConnection?: (connectionId: string, status: 'accepted' | 'refused' | 'cancelled') => void;
  onSendMessage?: (receiverId: string, content: string) => void;
  onUpdateMessages: (m: ChatMessage[]) => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  initialTab?: 'info' | 'connections' | 'messages' | 'suivi';
  initialChatPartner?: string | null;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  currentUser, 
  allUsers,
  transactions, 
  connections,
  messages,
  onUpdate, 
  onSendConnection,
  onUpdateConnection,
  onSendMessage,
  onUpdateMessages,
  onDeactivate,
  onDelete,
  readOnly = false,
  initialTab = 'info',
  initialChatPartner = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState<'info' | 'connections' | 'messages' | 'suivi'>(initialTab);
  const [messageContent, setMessageContent] = useState('');
  const [selectedChatPartner, setSelectedChatPartner] = useState<string | null>(initialChatPartner);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(editedUser);
    setIsEditing(false);
    setShowSuccessMessage("Profil mis à jour avec succès !");
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, coverPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!messageContent.trim() || !selectedChatPartner || !onSendMessage) return;
    onSendMessage(selectedChatPartner, messageContent);
    setMessageContent('');
  };

  const userTransactions = transactions.filter(t => t.fromId === user.uid || t.toId === user.uid);
  
  // Connections logic
  const myConnections = connections.filter(c => (c.senderId === user.uid || c.receiverId === user.uid) && c.status === 'accepted');
  const pendingRequests = connections.filter(c => c.receiverId === user.uid && c.status === 'sent');
  const sentRequests = connections.filter(c => c.senderId === user.uid && c.status === 'sent');

  const getConnectionStatus = () => {
    if (!currentUser) return null;
    const conn = connections.find(c => 
      (c.senderId === currentUser.uid && c.receiverId === user.uid) || 
      (c.senderId === user.uid && c.receiverId === currentUser.uid)
    );
    return conn;
  };

  const connection = getConnectionStatus();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="h-48 bg-slate-900 p-8 flex items-end justify-between relative group">
          {isEditing ? (
            editedUser.coverPhoto ? (
              <Image src={editedUser.coverPhoto} fill className="absolute inset-0 object-cover opacity-80" alt="Cover" unoptimized={editedUser.coverPhoto.startsWith('data:')} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80"></div>
            )
          ) : (
            user.coverPhoto ? (
              <Image src={user.coverPhoto} fill className="absolute inset-0 object-cover opacity-80" alt="Cover" unoptimized={user.coverPhoto.startsWith('data:')} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80"></div>
            )
          )}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {isEditing && (
            <div className="absolute top-4 right-4 z-20">
              <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverPhotoChange} />
              <button onClick={() => coverInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold transition border border-white/30 text-sm">
                📷 Changer la couverture
              </button>
            </div>
          )}

          <div className="flex items-center gap-6 translate-y-12 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                    unoptimized={user.avatar.startsWith('data:')} 
                    sizes="128px"
                    priority
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
            </div>
            <div className="pb-4">
              <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl">
                <h2 className="font-heading text-2xl font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{user.department}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.offeredSkills?.slice(0, 3).map((s, i) => (
                    <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-green-200">
                      {s}
                    </span>
                  ))}
                  {user.requestedSkills?.slice(0, 3).map((s, i) => (
                    <span key={i} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-orange-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {readOnly && currentUser && currentUser.uid !== user.uid && (
            <div className="relative z-10 flex gap-4">
              {!connection && (
                <button onClick={() => onSendConnection?.(user.uid)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition">
                  Se connecter
                </button>
              )}
              {connection?.status === 'sent' && connection.senderId === currentUser.uid && (
                <button onClick={() => onUpdateConnection?.(connection.id, 'cancelled')} className="bg-slate-700 text-white px-6 py-3 rounded-2xl font-bold transition">
                  Annuler la demande
                </button>
              )}
              {connection?.status === 'sent' && connection.receiverId === currentUser.uid && (
                <div className="flex gap-2">
                  <button onClick={() => onUpdateConnection?.(connection.id, 'accepted')} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold transition">Accepter</button>
                  <button onClick={() => onUpdateConnection?.(connection.id, 'refused')} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition">Refuser</button>
                </div>
              )}
              {connection?.status === 'accepted' && (
                <span className="bg-green-500/20 backdrop-blur-md text-green-100 px-6 py-3 rounded-2xl font-bold border border-green-500/30">
                  Connecté
                </span>
              )}
            </div>
          )}

          {!readOnly && (
            <button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold transition border border-white/30 relative z-10">
              Modifier
            </button>
          )}
        </div>

        {/* Tabs */}
        {!readOnly && (
          <div className="mt-20 px-10 border-b border-slate-100 flex gap-8">
            <button onClick={() => setActiveTab('info')} className={`pb-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Profil</button>
            <button onClick={() => setActiveTab('suivi')} className={`pb-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === 'suivi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Suivi Crédits</button>
            <button onClick={() => setActiveTab('connections')} className={`pb-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === 'connections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Réseau</button>
            <button onClick={() => setActiveTab('messages')} className={`pb-4 text-sm font-bold uppercase tracking-widest transition ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Messages</button>
          </div>
        )}

        <div className="pt-10 px-10 pb-16">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-8">
                {isEditing ? (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4">
                    <section>
                      <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Présentation</h3>
                      <textarea 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" 
                        value={editedUser.bio} 
                        onChange={e => setEditedUser({...editedUser, bio: e.target.value})} 
                        placeholder="Parlez-nous de vous..."
                      />
                    </section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Compétences Offertes</h3>
                        <input 
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editedUser.offeredSkills?.join(', ')} 
                          onChange={e => setEditedUser({...editedUser, offeredSkills: e.target.value.split(',').map(s => s.trim())})} 
                          placeholder="Excel, Design, Cuisine..."
                        />
                      </section>
                      <section>
                        <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Compétences Recherchées</h3>
                        <input 
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" 
                          value={editedUser.requestedSkills?.join(', ')} 
                          onChange={e => setEditedUser({...editedUser, requestedSkills: e.target.value.split(',').map(s => s.trim())})} 
                          placeholder="Anglais, Piano, Yoga..."
                        />
                      </section>
                    </div>
                    <section>
                      <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Disponibilité</h3>
                      <input 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" 
                        value={editedUser.availability} 
                        onChange={e => setEditedUser({...editedUser, availability: e.target.value})} 
                        placeholder="Ex: Soirs et weekends, Lundi après-midi..."
                      />
                    </section>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">Sauvegarder les modifications</button>
                  </div>
                ) : (
                  <>
                    <section>
                      <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Présentation</h3>
                      <p className="text-slate-500 italic leading-relaxed">{user.bio || "Pas de présentation."}</p>
                    </section>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section>
                        <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Je propose</h3>
                        <div className="flex flex-wrap gap-2">
                          {(user.offeredSkills?.length ?? 0) > 0 ? user.offeredSkills!.map((s, i) => (
                            <span key={i} className="bg-green-50 text-green-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-green-100">{s}</span>
                          )) : <span className="text-slate-400 text-sm italic">Aucune compétence listée</span>}
                        </div>
                      </section>
                      <section>
                        <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Je recherche</h3>
                        <div className="flex flex-wrap gap-2">
                          {(user.requestedSkills?.length ?? 0) > 0 ? user.requestedSkills!.map((s, i) => (
                            <span key={i} className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-orange-100">{s}</span>
                          )) : <span className="text-slate-400 text-sm italic">Aucune demande listée</span>}
                        </div>
                      </section>
                    </div>

                    <section>
                      <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Disponibilité</h3>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <span className="text-2xl">📅</span>
                        <p className="text-slate-600 font-medium">{user.availability || "Non spécifiée"}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Échanges Récents</h3>
                      {userTransactions.length === 0 ? (
                        <p className="text-slate-400 italic text-sm">Aucun échange pour le moment.</p>
                      ) : (
                        <div className="space-y-3">
                          {userTransactions.slice(0, 3).map(t => (
                            <div key={t.id} className="p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.fromId === user.id ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                  {t.fromId === user.id ? 'OUT' : 'IN'}
                                </div>
                                <div>
                                  <p className="font-bold text-xs text-slate-800">{t.serviceTitle}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="font-bold text-sm text-slate-700">
                                {t.amount} ⏰
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                    <section className="pt-12 border-t border-slate-100">
                      <h3 className="font-heading text-lg font-bold text-red-600 mb-4">Zone de danger</h3>
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div>
                          <p className="text-red-800 font-bold text-sm">Gestion du compte</p>
                          <p className="text-red-600 text-xs">Désactivez temporairement ou supprimez définitivement votre compte.</p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowDeactivateConfirm(true)}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                          >
                            Désactiver
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-lg shadow-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>
              <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl">
                <p className="text-xs font-bold opacity-70 mb-1 tracking-widest uppercase">Solde Actuel</p>
                <h4 className="text-5xl font-bold">⏰ {user.credits}</h4>
                <p className="mt-4 text-[10px] opacity-60">Crédits négociables pour vos services.</p>
              </div>
            </div>
          )}

          {/* Modals */}
          {showDeactivateConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-6">⚠️</div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Désactiver votre compte ?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Votre profil ne sera plus visible par les autres membres. Vous pourrez le réactiver à tout moment en vous reconnectant.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Annuler</button>
                  <button 
                    onClick={() => {
                      onDeactivate?.();
                      setShowDeactivateConfirm(false);
                    }} 
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                  >
                    Désactiver
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🛑</div>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Suppression définitive</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Cette action est <span className="font-bold text-red-600">irréversible</span>. Toutes vos données, crédits et messages seront définitivement supprimés.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Annuler</button>
                  <button 
                    onClick={() => {
                      onDelete?.();
                      setShowDeleteConfirm(false);
                    }} 
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSuccessMessage && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-bold">{showSuccessMessage}</span>
              </div>
            </div>
          )}

          {activeTab === 'suivi' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="font-heading text-lg font-bold text-slate-800 mb-6">Historique des transactions</h3>
              {userTransactions.length === 0 ? (
                <p className="text-slate-400 italic">Aucune transaction enregistrée.</p>
              ) : (
                <div className="space-y-3">
                  {userTransactions.map(t => (
                    <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${t.fromId === user.id ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {t.fromId === user.id ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.serviceTitle}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(t.date).toLocaleDateString()} — {t.fromId === user.id ? 'Débit' : 'Crédit'}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${t.fromId === user.id ? 'text-red-500' : 'text-green-500'}`}>
                        {t.fromId === user.id ? '-' : '+'}{t.amount} ⏰
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="space-y-8 animate-in fade-in">
              {pendingRequests.length > 0 && (
                <section>
                  <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Demandes reçues</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRequests.map(req => {
                      const sender = allUsers.find(u => u.uid === req.senderId);
                      return sender ? (
                        <div key={req.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                              <Image 
                                src={sender.avatar} 
                                alt="Avatar" 
                                fill 
                                className="rounded-full object-cover" 
                                unoptimized={sender.avatar.startsWith('data:')} 
                                sizes="40px"
                              />
                            </div>
                            <p className="font-bold text-sm">{sender.firstName} {sender.lastName}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onUpdateConnection?.(req.id, 'accepted')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Accepter</button>
                            <button onClick={() => onUpdateConnection?.(req.id, 'refused')} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold">Refuser</button>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </section>
              )}

              <section>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-4">Mes connexions</h3>
                {myConnections.length === 0 ? (
                  <p className="text-slate-400 italic">Vous n'avez pas encore de connexions.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myConnections.map(conn => {
                      const partnerId = conn.senderId === user.uid ? conn.receiverId : conn.senderId;
                      const partner = allUsers.find(u => u.uid === partnerId);
                      return partner ? (
                        <div key={conn.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <div className="relative w-10 h-10">
                            <Image 
                              src={partner.avatar} 
                              alt="Avatar" 
                              fill 
                              className="rounded-full object-cover" 
                              unoptimized={partner.avatar.startsWith('data:')} 
                              sizes="40px"
                            />
                          </div>
                          <p className="font-bold text-xs">{partner.firstName} {partner.lastName}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px] animate-in fade-in">
              <div className="md:col-span-1 border-r border-slate-100 pr-4 overflow-y-auto">
                <h3 className="font-heading text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Conversations</h3>
                <div className="space-y-2">
                  {myConnections.map(conn => {
                    const partnerId = conn.senderId === user.uid ? conn.receiverId : conn.senderId;
                    const partner = allUsers.find(u => u.uid === partnerId);
                    if (!partner) return null;
                    return (
                      <button 
                        key={partner.uid}
                        onClick={() => setSelectedChatPartner(partner.uid)}
                        className={`w-full p-3 rounded-2xl flex items-center gap-3 transition ${selectedChatPartner === partner.uid ? 'bg-blue-50 border-blue-100 border' : 'hover:bg-slate-50 border border-transparent'}`}
                      >
                        <div className="relative w-10 h-10">
                          <Image 
                            src={partner.avatar} 
                            alt="Avatar" 
                            fill 
                            className="rounded-full object-cover" 
                            unoptimized={partner.avatar.startsWith('data:')} 
                            sizes="40px"
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-xs text-slate-800">{partner.firstName}</p>
                          <p className="text-[10px] text-slate-400 truncate w-24">Dernier message...</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col h-full">
                {selectedChatPartner ? (
                  <>
                    <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                      {messages
                        .filter(m => (m.senderId === user.uid && m.receiverId === selectedChatPartner) || (m.senderId === selectedChatPartner && m.receiverId === user.uid))
                        .map(m => (
                          <div key={m.id} className={`flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.senderId === user.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                              {m.content}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        className="flex-grow px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                        placeholder="Écrivez votre message..."
                        value={messageContent}
                        onChange={e => setMessageContent(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                      />
                      <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-slate-400 italic text-sm">
                    Sélectionnez une conversation pour commencer à discuter.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
