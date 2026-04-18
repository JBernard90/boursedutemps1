
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, Clock, LogOut } from 'lucide-react';
import { Page, User, Notification } from '../types';

interface NavbarProps {
  currentPage: Page;
  user: User | null;
  notifications: Notification[];
  onNavigate: (p: Page) => void;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onMarkRead: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, user, notifications, onNavigate, onLogin, onSignup, onLogout, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { label: string; page: Page; path: string }[] = [
    { label: 'Accueil', page: 'home', path: '/' },
    { label: 'À Propos', page: 'about', path: '/about' },
    { label: 'Services', page: 'services', path: '/services' },
    { label: 'Demandes', page: 'requests', path: '/requests' },
    { label: 'Membres', page: 'members', path: '/members' },
    { label: 'Forum', page: 'forum', path: '/forum' },
    { label: 'Blog', page: 'blog', path: '/blog' },
    { label: 'Témoignages', page: 'testimonials', path: '/testimonials' },
  ];

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link 
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10">
              <Image 
                src="https://i.postimg.cc/5Y3Rg6zs/image-1.jpg" 
                alt="Logo" 
                fill
                className="rounded-full shadow-sm group-hover:scale-105 transition-transform object-cover border border-slate-100" 
              />
              <div className="absolute inset-0 rounded-full bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-slate-900 hidden sm:block uppercase">
              BOURSE DU TEMPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                href={item.path}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  pathname === item.path 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAdminOrMod && (
              <Link
                href="/moderation"
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ml-1 ${
                  pathname === '/moderation' 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-purple-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                Modération
              </Link>
            )}
            
            <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-2">
              {/* Search Icon */}
              <div className="relative" ref={searchRef}>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isSearchOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Rechercher..." 
                      className="w-full px-4 py-2 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                )}
              </div>

              {user && (
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-all duration-200 relative ${
                      showNotifications ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} non lues</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                onMarkRead(n.id);
                                if (n.type === 'message' || n.type === 'connection') router.push('/profile');
                                setShowNotifications(false);
                              }}
                              className={`p-4 border-b border-slate-50 cursor-pointer transition hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg ${
                                  n.type === 'transaction' ? 'bg-green-100' : 
                                  n.type === 'connection' ? 'bg-purple-100' : 
                                  'bg-blue-100'
                                }`}>
                                  {n.type === 'transaction' ? '💰' : n.type === 'connection' ? '🤝' : '🔔'}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-slate-700 leading-tight">
                                    <span className="font-bold">{n.fromName}</span> {n.content}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {mounted ? new Date(n.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-slate-400">Aucune notification</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {user ? (
                <>
                <Link 
                  href="/profile"
                  className="flex items-center gap-2 bg-blue-600 text-white pl-4 pr-1.5 py-1.5 rounded-full transition-all duration-200 hover:bg-blue-700 shadow-md shadow-blue-200 group"
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-100" />
                    <span className="text-sm font-bold">{user.credits}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border border-blue-400 shadow-sm group-hover:scale-105 transition-transform relative">
                    {user.avatar ? (
                      <Image 
                        src={user.avatar ?? ''} 
                        alt="User avatar" 
                        fill 
                        className="object-cover" 
                        unoptimized={(user.avatar ?? '').startsWith('data:')}
                        sizes="28px"
                        quality={80}
                      />
                    ) : (
                      <span className="text-[10px] text-blue-600 font-bold">{user.firstName[0]}</span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
              ) : (
                <button 
                  onClick={onLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-blue-100 active:scale-95"
                >
                  Accès Membre
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-1 shadow-2xl animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <Link
              key={item.page}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors block ${
                pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
            {user ? (
              <>
                <Link 
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Mon Profil ({user.credits} crédits)
                </Link>
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <button 
                onClick={() => { onLogin(); setIsOpen(false); }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100"
              >
                Accès Membre
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
