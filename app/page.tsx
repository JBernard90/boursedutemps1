"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Home from '@/components/pages-old/Home';
import { BlogPost, Testimonial } from '@/types';
import { onSnapshot, collection, db, query, orderBy } from '@/api';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeMembers: 0,
    offlineMembers: 0,
    exchangesInProgress: 0,
    exchangesProposed: 0,
    exchangesAccepted: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Fetch stats (mocked for now or from DB if implemented)
    const storedVisitors = localStorage.getItem('bdt_visitors');
    const visitorCount = storedVisitors ? parseInt(storedVisitors) : 0;
    
    const unsubBlogs = onSnapshot(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });

    const unsubTestimonials = onSnapshot(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });

    // For other stats, we'd need more snapshots or a dedicated API
    setStats(prev => ({ ...prev, totalVisitors: visitorCount }));

    return () => {
      unsubBlogs();
      unsubTestimonials();
    };
  }, []);

  return (
    <PageLayout>
      <Home 
        navigate={(p) => router.push(p === 'home' ? '/' : `/${p}`)} 
        blogs={blogs} 
        testimonials={testimonials} 
        stats={stats} 
      />
    </PageLayout>
  );
}
