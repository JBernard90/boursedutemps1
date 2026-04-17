"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Home from '@/components/pages-old/Home';
import { BlogPost, Testimonial } from '@/types';
import { subscribeToCollection } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  // Force re-render to clear stale chunks
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
    setMounted(true);
    // Fetch stats (mocked for now or from DB if implemented)
    const storedVisitors = localStorage.getItem('bdt_visitors');
    const visitorCount = storedVisitors ? parseInt(storedVisitors) : 0;
    
    const unsubBlogs = subscribeToCollection('blogs', (data) => {
      setBlogs(data as BlogPost[]);
    });

    const unsubTestimonials = subscribeToCollection('testimonials', (data) => {
      setTestimonials(data as Testimonial[]);
    });

    // For other stats, we'd need more snapshots or a dedicated API
    setStats(prev => ({ ...prev, totalVisitors: visitorCount }));

    return () => {
      unsubBlogs();
      unsubTestimonials();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
