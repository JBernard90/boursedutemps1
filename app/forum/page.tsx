"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Forum from '@/components/pages-old/Forum';
import { ForumTopic } from '@/types';
import { onSnapshot, collection, db, query, orderBy } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function ForumRoute() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [topics, setTopics] = useState<ForumTopic[]>([]);

  useEffect(() => {
    setMounted(true);
    const unsub = onSnapshot(query(collection(db, 'forumTopics'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumTopic)));
    });
    return () => unsub();
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout>
      <Forum user={user} topics={topics} onAdd={(t) => setTopics([t, ...topics])} />
    </PageLayout>
  );
}
