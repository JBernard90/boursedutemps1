"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '@/types';
import { auth, onAuthStateChanged, onSnapshot, collection, db, query, where, orderBy } from '@/api';
import { registerServiceWorker, subscribeUserToPush } from '@/lib/push';

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  notifications: Notification[];
  logout: () => void;
  isAuthReady: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // Fetch full user data
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUser(data);
          setIsAuthReady(true);
        })
        .catch(() => setIsAuthReady(true));
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
        (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
        }
      );

      // Register push notifications
      registerServiceWorker().then(() => {
        subscribeUserToPush();
      });

      return () => unsub();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, notifications, logout, isAuthReady }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
