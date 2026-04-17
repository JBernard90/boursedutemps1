export interface User {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  whatsapp?: string;
  gender?: 'Homme' | 'Femme';
  country?: string;
  bio?: string;
  offeredSkills?: string[];
  requestedSkills?: string[];
  availability?: string;
  languages?: string[];
  credits?: number;
  createdAt?: string;
  avatar?: string;
  coverPhoto?: string;
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'deactivated' | 'deleted';
}

export type Page =
  | 'home'
  | 'about'
  | 'services'
  | 'requests'
  | 'members'
  | 'forum'
  | 'blog'
  | 'testimonials'
  | 'profile'
  | 'moderation';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export interface BlogComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category?: string;
  media: MediaItem[];
  likes: string[];
  dislikes: string[];
  shares: number;
  reposts: number;
  comments: BlogComment[];
  externalLink?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title?: string;
  content: string;
  rating: number;
  media: MediaItem[];
  likes: string[];
  votes?: string[];
  dislikes: string[];
  shares: number;
  reposts: number;
  comments: BlogComment[];
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  message?: string;
  content?: string;
  category?: string;
  media: MediaItem[];
  likes: string[];
  dislikes: string[];
  shares: number;
  reposts: number;
  comments: BlogComment[];
  externalLink?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  creditCost: number;
  category?: string;
  status: 'proposed' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  acceptedBy?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  creditOffer: number;
  category?: string;
  status: 'proposed' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  fulfilledBy?: string;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  serviceTitle?: string;
  type?: string;
  date: string;
}

export interface Connection {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'sent' | 'accepted' | 'refused' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: string;
  isRead?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  fromName?: string;
  isRead: boolean;
  createdAt: string;
}
