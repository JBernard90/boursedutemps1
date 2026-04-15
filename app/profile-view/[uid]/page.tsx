"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Profile from '@/components/pages-old/Profile';
import { useUser } from '@/components/UserProvider';
import { useParams } from 'next/navigation';
import { User, Transaction, Connection, ChatMessage } from '@/types';

export default function ProfileViewRoute() {
  const { user: currentUser } = useUser();
  const params = useParams();
  const viewingUserId = params.uid as string;
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!viewingUserId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const authHeader = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const fetchData = async () => {
      try {
        const [userRes, usersRes, connectionsRes, transactionsRes] = await Promise.all([
          fetch(`/api/users/${viewingUserId}`),
          fetch('/api/users'),
          fetch('/api/connections', { headers: authHeader }),
          fetch('/api/transactions', { headers: authHeader }),
        ]);

        if (userRes.ok) setTargetUser(await userRes.json());
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (connectionsRes.ok) setConnections(await connectionsRes.json());
        if (transactionsRes.ok) setTransactions(await transactionsRes.json());
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchData();
  }, [viewingUserId]);

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const handleSendConnection = async (targetUid: string) => {
    if (!currentUser) return;
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ senderId: currentUser.uid, receiverId: targetUid, status: 'sent' })
    });
    if (res.ok) {
      const data = await res.json();
      setConnections(prev => [...prev, { id: data.id, senderId: currentUser.uid, receiverId: targetUid, status: 'sent', createdAt: new Date().toISOString() } as Connection]);
    }
  };

  const handleUpdateConnection = async (connectionId: string, status: 'accepted' | 'refused' | 'cancelled') => {
    await fetch(`/api/connections/${connectionId}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ status })
    });
    setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status } : c));
  };

  if (!targetUser) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Profile 
        user={targetUser} 
        currentUser={currentUser || undefined}
        allUsers={allUsers} 
        transactions={transactions} 
        connections={connections} 
        messages={messages} 
        onUpdate={() => {}} 
        onSendConnection={handleSendConnection}
        onUpdateConnection={handleUpdateConnection}
        onSendMessage={async () => {}} 
        onUpdateMessages={setMessages} 
        readOnly 
      />
    </PageLayout>
  );
}
