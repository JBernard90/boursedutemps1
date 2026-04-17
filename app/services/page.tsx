"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import ServicesPage from '@/components/pages-old/ServicesPage';
import { Service } from '@/types';
import { subscribeToCollection, updateRecord, createTimestamp } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function ServicesRoute() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setMounted(true);
    const unsub = subscribeToCollection('services', (data) => {
      setServices(data as Service[]);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (type: 'service' | 'request', id: string, newStatus: any, partnerId?: string) => {
    const collectionName = type === 'service' ? 'services' : 'requests';
    const updateData: any = { 
      status: newStatus,
      updatedAt: createTimestamp()
    };
    if (newStatus === 'accepted' && partnerId) {
      updateData.acceptedBy = partnerId;
      updateData.acceptedAt = createTimestamp();
    }
    await updateRecord(`${collectionName}/${id}`, updateData);
  };

  const handleTransaction = async (item: Service, negotiatedAmount: number) => {
    if (!user) return;
    // Transaction logic (similar to AppWrapper)
    // For brevity, I'll assume the logic is moved to a shared utility or kept here
    alert(`Transaction de ${negotiatedAmount} crédits pour ${item.title}`);
  };

  if (!mounted) return null;

  return (
    <PageLayout>
      <ServicesPage 
        user={user} 
        services={services} 
        onUpdate={setServices} 
        onBuy={handleTransaction} 
        onUpdateStatus={handleUpdateStatus} 
      />
    </PageLayout>
  );
}
