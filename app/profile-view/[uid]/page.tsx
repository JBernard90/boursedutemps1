"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Profile from '@/components/pages-old/Profile';
import { useUser } from '@/components/UserProvider';
import { useParams } from 'next/navigation';
import { onSnapshot, collection, db, query, orderBy, getDoc, doc } from '@/api';
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

    const fetchTarget = async () => {
      const docRef = doc(db, 'users', viewingUserId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTargetUser(docSnap.data() as User);
      }
    };
    fetchTarget();

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const unsubConnections = onSnapshot(collection(db, 'connections'), (snapshot) => {
      setConnections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection)));
    });

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'asc')), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });

    return () => {
      unsubUsers();
      unsubConnections();
      unsubTransactions();
      unsubMessages();
    };
  }, [viewingUserId]);

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
        onSendConnection={async (uid) => {}} 
        onUpdateConnection={async (id, s) => {}} 
        onSendMessage={async (uid, c) => {}} 
        onUpdateMessages={setMessages} 
        readOnly 
      />
    </PageLayout>
  );
}
