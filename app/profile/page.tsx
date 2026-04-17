"use client";

import React, { useState, useEffect, Suspense } from 'react';
import PageLayout from '@/components/PageLayout';
import Profile from '@/components/pages-old/Profile';
import { useUser } from '@/components/UserProvider';
import { useSearchParams } from 'next/navigation';
import { subscribeToCollection } from '@/lib/api-client';
import { User, Transaction, Connection, ChatMessage } from '@/types';

function ProfileContent() {
  const { user, setUser, logout } = useUser();
  const searchParams = useSearchParams();
  const initialChatPartner = searchParams.get('chat');
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubUsers = subscribeToCollection('users', (data) => {
      setAllUsers(data as User[]);
    });

    const unsubConnections = subscribeToCollection('connections', (data) => {
      setConnections(data as Connection[]);
    });

    const unsubTransactions = subscribeToCollection('transactions', (data) => {
      setTransactions(data as Transaction[]);
    });

    const unsubMessages = subscribeToCollection('messages', (data) => {
      setMessages(data as ChatMessage[]);
    });

    return () => {
      unsubUsers();
      unsubConnections();
      unsubTransactions();
      unsubMessages();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Veuillez vous connecter pour accéder à votre profil.</p>
      </div>
    );
  }

  return (
    <Profile 
      user={user} 
      allUsers={allUsers} 
      transactions={transactions} 
      connections={connections} 
      messages={messages} 
      onUpdate={(u) => setUser(u)} 
      onSendConnection={async (uid) => {}} 
      onUpdateConnection={async (id, s) => {}} 
      onSendMessage={async (uid, c) => {}} 
      onUpdateMessages={setMessages} 
      onDeactivate={async () => {}} 
      onDelete={async () => {}} 
      initialTab={initialChatPartner ? 'messages' : 'info'} 
      initialChatPartner={initialChatPartner} 
    />
  );
}

export default function ProfileRoute() {
  return (
    <PageLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-500">Chargement...</p></div>}>
        <ProfileContent />
      </Suspense>
    </PageLayout>
  );
}
