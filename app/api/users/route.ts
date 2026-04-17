export interface User {
  id: string;
  uid: string;
  email: string;

  firstName?: string;
  lastName?: string;

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
