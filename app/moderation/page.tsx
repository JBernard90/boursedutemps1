"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Moderation from '@/components/pages-old/Moderation';
import { User, Service, Request } from '@/types';
import { subscribeToCollection } from '@/lib/api-client';
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

    const unsubUsers = subscribeToCollection('users', (data) => {
      setUsers(data as User[]);
    });

    const unsubServices = subscribeToCollection('services', (data) => {
      setServices(data as Service[]);
    });

    const unsubRequests = subscribeToCollection('requests', (data) => {
      setRequests(data as Request[]);
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
