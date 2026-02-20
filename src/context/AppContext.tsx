import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile, Match, Message, AppTab, User } from '../types';
import { MOCK_PROFILES, MOCK_MATCHES } from '../constants';
import { api } from '../api';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  profiles: Profile[];
  currentIndex: number;
  handleSwipe: (direction: 'left' | 'right' | 'up') => void;
  undo: () => void;
  matches: Match[];
  activeMatchId: string | null;
  setActiveMatch: (id: string | null) => void;
  messages: Record<string, Message[]>;
  sendMessage: (matchId: string, text: string) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (profileData: Partial<Profile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('discovery');
  const [profiles] = useState<Profile[]>(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'm1': [
      { id: '1', senderId: 'me', text: 'Hey Sarah! How was your weekend?', timestamp: '10:30 AM' },
      { id: '2', senderId: 'sarah', text: 'It was great! I went hiking. How about you?', timestamp: '10:32 AM' },
    ],
    'm2': [
      { id: '1', senderId: 'me', text: 'That sounds like a plan!', timestamp: '1h ago' },
    ]
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          setIsOnboarded(userData.is_onboarded);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    localStorage.setItem('token', access_token);
    const userData = await api.getMe();
    setUser(userData);
    setIsOnboarded(userData.is_onboarded);
  };

  const signup = async (email: string, password: string) => {
    await api.signup(email, password);
    await login(email, password);
  };

  const completeOnboarding = async (profileData: Partial<Profile>) => {
    await api.onboard(profileData);
    const userData = await api.getMe();
    setUser(userData);
    setIsOnboarded(true);
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];
    setHistory(prev => [...prev, currentIndex]);
    setCurrentIndex(prev => prev + 1);

    if (direction === 'right' || direction === 'up') {
      // Simulate a match
      const newMatch: Match = {
        id: `m-${profile.id}`,
        profile: profile,
        lastMessage: 'You matched!',
        timestamp: 'Just now',
        unread: true,
      };
      setMatches(prev => [newMatch, ...prev]);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  };

  const setActiveMatch = (id: string | null) => {
    setActiveMatchId(id);
    if (id) {
      setActiveTab('chat');
      // Mark as read
      setMatches(prev => prev.map(m => m.id === id ? { ...m, unread: false } : m));
    }
  };

  const sendMessage = (matchId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMessage]
    }));

    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, lastMessage: text, timestamp: 'Just now' } : m));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsOnboarded(false);
    setActiveTab('discovery');
    setCurrentIndex(0);
    setHistory([]);
  };

  return (
    <AppContext.Provider value={{
      user, isLoading,
      isOnboarded, setIsOnboarded,
      activeTab, setActiveTab,
      profiles, currentIndex, handleSwipe, undo,
      matches, activeMatchId, setActiveMatch,
      messages, sendMessage,
      login, signup, logout, completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
