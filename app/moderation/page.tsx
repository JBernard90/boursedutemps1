"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Moderation from '@/components/pages-old/Moderation';
import { User, Service, Request } from '@/types';
import { onSnapshot, collection, db, query, orderBy } from '@/api';
import { useUser } from '@/components/UserProvider';
import { useRouter } from 'next/navigation';

export default function ModerationRoute() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      // router.push('/'); // Redirect if not authorized
      return;
    }

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('createdAt', 'desc')), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    const unsubRequests = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request)));
    });

    return () => {
      unsubUsers();
      unsubServices();
      unsubRequests();
    };
  }, [user]);

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500">Accès restreint aux modérateurs.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Moderation 
        users={users} 
        onUpdateUsers={setUsers} 
        services={services} 
        onUpdateServices={setServices} 
        requests={requests} 
        onUpdateRequests={setRequests} 
        currentUser={user} 
      />
    </PageLayout>
  );
}
