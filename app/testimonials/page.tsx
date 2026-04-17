"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Testimonials from '@/components/pages-old/Testimonials';
import { Testimonial } from '@/types';
import { onSnapshot, collection, db, query, orderBy } from '@/api';
import { useUser } from '@/components/UserProvider';

export default function TestimonialsRoute() {
  const { user } = useUser();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });
    return () => unsub();
  }, []);

  return (
    <PageLayout>
      <Testimonials 
        testimonials={testimonials} 
        onUpdate={setTestimonials} 
        user={user} 
        onAuthClick={() => {}} 
      />
    </PageLayout>
  );
}
