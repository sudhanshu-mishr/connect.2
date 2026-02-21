export interface Profile {
  id: string | number;
  name: string;
  age: number;
  bio: string;
  // New Fields
  gender?: string;
  orientation?: string;
  relationship_goals?: string;
  lifestyle_badges?: string[];
  job_title?: string;
  company?: string;
  school?: string;

  distance?: string; // Derived on frontend or passed from backend
  images: string[];
  interests: string[];
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_onboarded: boolean;
  is_verified: boolean;
  is_admin: boolean;
  profile?: Profile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Match {
  id: string | number;
  user: User; // The other user
  lastMessage?: Message;
  timestamp: string;
  unread_count: number;

  // Legacy support for older components
  profile?: Profile;
  lastMessageText?: string;
  unread?: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export type AppTab = 'discovery' | 'matches' | 'chat' | 'profile';
export type OnboardingStep = 'welcome' | 'photos' | 'preferences' | 'interests' | 'bio';
