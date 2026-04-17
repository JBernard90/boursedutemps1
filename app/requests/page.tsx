"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import RequestsPage from '@/components/pages-old/RequestsPage';
import { Request } from '@/types';
import { subscribeToCollection, updateRecord, createTimestamp } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function RequestsRoute() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    setMounted(true);
    const unsub = subscribeToCollection('requests', (data) => {
      setRequests(data as Request[]);
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
      updateData.fulfilledBy = partnerId;
      updateData.fulfilledAt = createTimestamp();
    }
    await updateRecord(`${collectionName}/${id}`, updateData);
  };

  if (!mounted) return null;

  return (
    <PageLayout>
      <RequestsPage 
        user={user} 
        requests={requests} 
        onUpdate={setRequests} 
        onFulfill={(r, amt) => alert(`Fulfillment of ${amt} credits`)} 
        onUpdateStatus={handleUpdateStatus} 
      />
    </PageLayout>
  );
}
