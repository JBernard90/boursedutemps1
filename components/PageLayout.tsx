"use client";

import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { useUser } from './UserProvider';
import { useRouter, usePathname } from 'next/navigation';
import { Page } from '@/types';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, notifications, logout } = useUser();
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to Page type for Navbar
  const getPageFromPath = (path: string): Page => {
    const p = path.replace('/', '') as Page;
    return p || 'home';
  };

  const handleNavigate = (page: Page) => {
    if (page === 'home') router.push('/');
    else router.push(`/${page}`);
  };

  const handleAuth = (loggedInUser: any) => {
    setUser(loggedInUser);
    setShowAuthModal(null);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ isRead: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        currentPage={getPageFromPath(pathname)} 
        user={user} 
        notifications={notifications}
        onNavigate={handleNavigate} 
        onLogin={() => setShowAuthModal('login')} 
        onSignup={() => setShowAuthModal('signup')} 
        onLogout={logout} 
        onMarkRead={handleMarkRead}
      />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal 
          mode={showAuthModal} 
          onClose={() => setShowAuthModal(null)} 
          onAuth={handleAuth}
          onSwitch={setShowAuthModal}
        />
      )}
    </div>
  );
}
