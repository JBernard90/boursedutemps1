"use client";

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { auth, db, onAuthStateChanged, collection, onSnapshot, query, where, orderBy, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp } from '../api';
import { Page, User, Service, Request, BlogPost, Testimonial, ForumTopic, Transaction, Connection, ChatMessage, Notification } from '../types';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { supabase } from '@/lib/supabaseClient';

// Lazy load pages from components/pages-old using next/dynamic
const Home = dynamic(() => import('./pages-old/Home'), { ssr: false });
const About = dynamic(() => import('./pages-old/About'), { ssr: false });
const Members = dynamic(() => import('./pages-old/Members'), { ssr: false });
const ServicesPage = dynamic(() => import('./pages-old/ServicesPage'), { ssr: false });
const RequestsPage = dynamic(() => import('./pages-old/RequestsPage'), { ssr: false });
const Forum = dynamic(() => import('./pages-old/Forum'), { ssr: false });
const Blog = dynamic(() => import('./pages-old/Blog'), { ssr: false });
const Testimonials = dynamic(() => import('./pages-old/Testimonials'), { ssr: false });
const Profile = dynamic(() => import('./pages-old/Profile'), { ssr: false });
const Moderation = dynamic(() => import('./pages-old/Moderation'), { ssr: false });

const ADMIN_EMAIL = 'jeanbernardpierrelouis@gmail.com';

export default function AppWrapper() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);

  const stats = {
    totalVisitors: visitorCount,
    activeMembers: users.filter(u => u.status === 'active').length,
    offlineMembers: users.filter(u => u.status !== 'active').length,
    exchangesInProgress: [...services, ...requests].filter(e => e.status === 'in-progress').length,
    exchangesProposed: [...services, ...requests].filter(e => e.status === 'proposed').length,
    exchangesAccepted: [...services, ...requests].filter(e => e.status === 'accepted').length,
  };

  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [initialProfileTab, setInitialProfileTab] = useState<'info' | 'connections' | 'messages' | 'suivi'>('info');
  const [initialChatPartner, setInitialChatPartner] = useState<string | null>(null);

  useEffect(() => {
    const storedVisitors = localStorage.getItem('bdt_visitors');
    const currentVisitors = storedVisitors ? parseInt(storedVisitors) : 0;
    const newVisitors = currentVisitors + 1;
    setVisitorCount(newVisitors);
    localStorage.setItem('bdt_visitors', newVisitors.toString());
  }, []);

  const handleUpdateExchangeStatus = async (type: 'service' | 'request', id: string, newStatus: 'accepted' | 'cancelled' | 'in-progress', partnerId?: string) => {
    if (!user) return;
    const collectionName = type === 'service' ? 'services' : 'requests';
    const updateData: any = { 
      status: newStatus,
      updatedAt: serverTimestamp()
    };
    if (newStatus === 'accepted' && partnerId) {
      if (type === 'service') {
        updateData.acceptedBy = partnerId;
        updateData.acceptedAt = serverTimestamp();
      } else {
        updateData.fulfilledBy = partnerId;
        updateData.fulfilledAt = serverTimestamp();
      }
    }
    await updateDoc(doc(db, collectionName, id), updateData);
    
    if (newStatus === 'accepted' && partnerId) {
      const partner = users.find(u => u.uid === partnerId);
      if (partner) {
        triggerNotification(partner.uid, type === 'service' ? 'offer' : 'request', `Votre ${type === 'service' ? 'offre' : 'demande'} a été acceptée par ${user.firstName}`, user.firstName);
      }
    }
  };

  useEffect(() => {
    // Auth Listener
    let unsubUsers = () => {};
    let unsubConnections = () => {};
    let unsubTransactions = () => {};
    let unsubMessages = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
        
        // Subscribe to protected collections only when authenticated
        unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          setUsers(snapshot.docs.map(doc => doc.data() as User));
        }, (error) => console.error("Users snapshot error:", error));

        unsubConnections = onSnapshot(collection(db, 'connections'), (snapshot) => {
          setConnections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection)));
        }, (error) => console.error("Connections snapshot error:", error));

        unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
          setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
        }, (error) => console.error("Transactions snapshot error:", error));

        unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'asc')), (snapshot) => {
          setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
        }, (error) => console.error("Messages snapshot error:", error));

        // Notifications listener
        const unsubNotifications = onSnapshot(
          query(collection(db, 'notifications'), where('userId', '==', authUser.uid), orderBy('createdAt', 'desc')),
          (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
          },
          (error) => console.error("Notifications snapshot error:", error)
        );

        return () => {
          unsubNotifications();
          unsubMessages();
          unsubUsers();
          unsubConnections();
          unsubTransactions();
        };

      } else {
        setUser(null);
        setUsers([]);
        setConnections([]);
        setTransactions([]);
        setMessages([]);
        unsubUsers();
        unsubConnections();
        unsubTransactions();
        unsubMessages();
      }
    });

    // Public collections
    const unsubServices = onSnapshot(query(collection(db, 'services'), orderBy('createdAt', 'desc')), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => console.error("Services snapshot error:", error));

    const unsubRequests = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request)));
    }, (error) => console.error("Requests snapshot error:", error));

    const unsubBlogs = onSnapshot(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    }, (error) => console.error("Blogs snapshot error:", error));

    const unsubTestimonials = onSnapshot(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    }, (error) => console.error("Testimonials snapshot error:", error));

    const unsubForum = onSnapshot(query(collection(db, 'forumTopics'), orderBy('createdAt', 'desc')), (snapshot) => {
      setForumTopics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumTopic)));
    }, (error) => console.error("Forum snapshot error:", error));

    return () => {
      unsubscribeAuth();
      unsubServices();
      unsubRequests();
      unsubBlogs();
      unsubTestimonials();
      unsubForum();
    };
  }, []);

  const triggerNotification = async (targetUserId: string, type: 'request' | 'offer' | 'message' | 'connection' | 'transaction', content: string, fromName: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        type,
        content,
        fromName,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error creating notification:", e);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const handleAuth = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowAuthModal(null);
  };

 const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setCurrentPage('home');
};

  const handleTransaction = async (item: Service | Request, negotiatedAmount: number, type: 'service' | 'request') => {
    if (!user) { setShowAuthModal('login'); return; }
    
    const buyerId = type === 'service' ? user.uid : item.userId;
    const providerId = type === 'service' ? item.userId : user.uid;
    
    const buyer = users.find(u => u.uid === buyerId);
    const provider = users.find(u => u.uid === providerId);

    if (!buyer || buyer.credits < negotiatedAmount) {
      alert("Erreur : Crédits insuffisants.");
      return;
    }

    try {
      await updateDoc(doc(db, 'users', buyerId), { credits: buyer.credits - negotiatedAmount });
      await updateDoc(doc(db, 'users', providerId), { credits: (provider?.credits || 0) + negotiatedAmount });

      await addDoc(collection(db, 'transactions'), {
        fromId: buyerId,
        toId: providerId,
        amount: negotiatedAmount,
        serviceTitle: item.title,
        type: type,
        createdAt: new Date().toISOString()
      });

      if (provider) triggerNotification(provider.uid, 'transaction', `Vous avez reçu ${negotiatedAmount} crédits pour : ${item.title}`, user.firstName);
      alert(`Succès ! ${negotiatedAmount} crédits ont été transférés.`);
    } catch (e) {
      console.error(e);
      alert("Une erreur est survenue lors de la transaction.");
    }
  };

  const handleSendConnection = async (targetUid: string) => {
    if (!user) { setShowAuthModal('login'); return; }
    try {
      await addDoc(collection(db, 'connections'), {
        senderId: user.uid,
        receiverId: targetUid,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const target = users.find(u => u.uid === targetUid);
      if (target) triggerNotification(target.uid, 'connection', "souhaite se connecter avec vous", user.firstName);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateConnection = async (connectionId: string, newStatus: 'accepted' | 'refused' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'connections', connectionId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      if (newStatus === 'accepted') {
        const conn = connections.find(c => c.id === connectionId);
        if (conn && user) {
          const targetId = conn.senderId === user.uid ? conn.receiverId : conn.senderId;
          const target = users.find(u => u.uid === targetId);
          if (target) {
            triggerNotification(target.uid, 'connection', `a accepté votre demande de connexion`, user.firstName);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (receiverId: string, content: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId,
        content,
        createdAt: new Date().toISOString()
      });
      
      const target = users.find(u => u.uid === receiverId);
      if (target) {
        triggerNotification(target.uid, 'message', `vous a envoyé un message : "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`, user.firstName);
      }
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    try {
      await updateDoc(doc(db, 'users', updatedUser.uid), { ...updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { status: 'deactivated' });
    await auth.signOut();
    setUser(null);
    setCurrentPage('home');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { status: 'deleted' });
    await auth.signOut();
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home navigate={handleNavigate} blogs={blogs} testimonials={testimonials} stats={stats} />;
      case 'about': return <About />;
      case 'services': return <ServicesPage user={user} services={services} onUpdate={setServices} onBuy={(s, amt) => handleTransaction(s, amt, 'service')} onUpdateStatus={handleUpdateExchangeStatus} />;
      case 'requests': return <RequestsPage user={user} requests={requests} onUpdate={setRequests} onFulfill={(r, amt) => handleTransaction(r, amt, 'request')} onUpdateStatus={handleUpdateExchangeStatus} />;
      case 'members': return <Members users={users} onViewProfile={(uid) => { setViewingUserId(uid); setCurrentPage('profile-view'); }} onContact={(uid) => { if (!user) { setShowAuthModal('login'); return; } setInitialProfileTab('messages'); setInitialChatPartner(uid); setCurrentPage('profile'); }} />;
      case 'forum': return <Forum user={user} topics={forumTopics} onAdd={(t) => setForumTopics([t, ...forumTopics])} />;
      case 'blog': return <Blog blogs={blogs} onUpdate={(b) => { setBlogs(b); localStorage.setItem('bdt_blogs', JSON.stringify(b)); }} user={user} onAuthClick={() => setShowAuthModal('login')} />;
      case 'testimonials': return <Testimonials testimonials={testimonials} onUpdate={(t) => { setTestimonials(t); localStorage.setItem('bdt_testimonials', JSON.stringify(t)); }} user={user} onAuthClick={() => setShowAuthModal('login')} />;
      case 'profile': return user ? <Profile user={user} allUsers={users} transactions={transactions} connections={connections} messages={messages} onUpdate={handleUpdateUser} onSendConnection={handleSendConnection} onUpdateConnection={handleUpdateConnection} onSendMessage={handleSendMessage} onUpdateMessages={setMessages} onDeactivate={handleDeactivateAccount} onDelete={handleDeleteAccount} initialTab={initialProfileTab} initialChatPartner={initialChatPartner} /> : <Home navigate={handleNavigate} blogs={blogs} testimonials={testimonials} stats={stats} />;
      case 'profile-view': 
        const target = users.find(u => u.uid === viewingUserId);
        return target ? <Profile user={target} currentUser={user} allUsers={users} transactions={transactions} connections={connections} messages={messages} onUpdate={() => {}} onSendConnection={handleSendConnection} onUpdateConnection={handleUpdateConnection} onSendMessage={handleSendMessage} onUpdateMessages={setMessages} readOnly /> : <Members users={users} onViewProfile={() => {}} onContact={() => {}} />;
      case 'moderation': return <Moderation users={users} onUpdateUsers={setUsers} services={services} onUpdateServices={setServices} requests={requests} onUpdateRequests={setRequests} currentUser={user!} />;
      default: return <Home navigate={handleNavigate} blogs={blogs} testimonials={testimonials} stats={stats} />;
    }
  };

  const handleNavigate = (page: Page) => {
    if (page === 'profile') {
      setInitialProfileTab('info');
      setInitialChatPartner(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
<Navbar
  currentPage={currentPage}
  user={user}
  notifications={notifications}
  onNavigate={handleNavigate}
  onLogin={() => setShowAuthModal('login')}
  onSignup={() => setShowAuthModal('signup')}
  onLogout={handleLogout}
  onMarkRead={handleMarkNotificationRead}
/>

      <main className="flex-grow pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          {renderPage()}
        </Suspense>
      </main>

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
