"use client";

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import RequestsPage from '@/components/pages-old/RequestsPage';
import { Request } from '@/types';
import { onSnapshot, collection, db, query, orderBy, updateDoc, doc, serverTimestamp } from '@/lib/api-client';
import { useUser } from '@/components/UserProvider';

export default function RequestsRoute() {
  const { user } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request)));
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (type: 'service' | 'request', id: string, newStatus: any, partnerId?: string) => {
    const collectionName = type === 'service' ? 'services' : 'requests';
    const updateData: any = { 
      status: newStatus,
      updatedAt: serverTimestamp()
    };
    if (newStatus === 'accepted' && partnerId) {
      updateData.fulfilledBy = partnerId;
      updateData.fulfilledAt = serverTimestamp();
    }
    await updateDoc(doc(db, collectionName, id), updateData);
  };

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
