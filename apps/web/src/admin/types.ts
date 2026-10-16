export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'studio_director' | 'lead_artist';
  avatar?: string;
  lastLogin?: string;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

export type ProjectCategory = 'still-images' | 'animations' | 'vr' | '360-panoramas';

export interface AdminProject {
  id: string;
  title: string;
  category: ProjectCategory;
  architect: string;
  location: string;
  year: string;
  description: string;
  image: string;
  aspectRatio?: string;
  pipeline?: string;
  createdAt?: string;
}

export interface AdminClient {
  id: string;
  name: string;
  subtitle?: string;
  logoUrl?: string;
  createdAt?: string;
}

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  submittedAt: string;
}

export interface AdminBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed';
  submittedAt: string;
}
