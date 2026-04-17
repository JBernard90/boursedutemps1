"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Blog from '@/components/pages-old/Blog';
import { BlogPost } from '@/types';
import { onSnapshot, collection, db, query, orderBy } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function BlogRoute() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    setMounted(true);
    const unsub = onSnapshot(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });
    return () => unsub();
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout>
      <Blog 
        blogs={blogs} 
        onUpdate={setBlogs} 
        user={user} 
        onAuthClick={() => {}} 
      />
    </PageLayout>
  );
}
