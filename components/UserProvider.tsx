"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Notification } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { subscribeToCollection, filterBy, sortBy } from "@/lib/api-client";
import { registerServiceWorker, subscribeUserToPush } from "@/lib/push";

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

  // 🔵 Auth Listener (Supabase)
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase client is not initialized. Please check your environment variables.");
      setIsAuthReady(true);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token);

          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          const data = await res.json();
          if (!data.error) setUser(data);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }

        setIsAuthReady(true);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 🔵 Real-time Notifications Listener
  useEffect(() => {
    if (user) {
      const unsub = subscribeToCollection('notifications', (data) => {
        setNotifications(data as Notification[]);
      }, [
        filterBy("userId", "==", user.uid),
        sortBy("createdAt", "desc")
      ]);

      registerServiceWorker().then(() => {
        subscribeUserToPush();
      });

      return () => unsub();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // 🔴 LOGOUT — VERSION SUPABASE
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, notifications, logout, isAuthReady }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
