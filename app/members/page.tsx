"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Members from '@/components/pages-old/Members';
import { User } from '@/types';
import { subscribeToCollection } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function MembersRoute() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribeToCollection('users', (data) => {
      setUsers(data as User[]);
    });
    return () => unsub();
  }, []);

  return (
    <PageLayout>
      <Members 
        users={users} 
        onViewProfile={(uid) => router.push(`/profile-view/${uid}`)} 
        onContact={(uid) => router.push(`/profile?chat=${uid}`)} 
      />
    </PageLayout>
  );
}
