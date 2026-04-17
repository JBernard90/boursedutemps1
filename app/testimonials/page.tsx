"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import Testimonials from '@/components/pages-old/Testimonials';
import { Testimonial } from '@/types';
import { subscribeToCollection } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function TestimonialsRoute() {
  const { user } = useUser();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection('testimonials', (data) => {
      setTestimonials(data as Testimonial[]);
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
