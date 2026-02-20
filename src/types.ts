export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  job?: string;
  school?: string;
  images: string[];
  interests: string[];
}

export interface Match {
  id: string;
  profile: Profile;
  lastMessage?: string;
  timestamp: string;
  unread: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export type AppTab = 'discovery' | 'matches' | 'chat' | 'profile';
export type OnboardingStep = 'welcome' | 'photos' | 'preferences' | 'interests' | 'bio';
