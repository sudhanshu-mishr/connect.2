import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Profile, Match, Message, AppTab, User } from '../types';
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
  sendMessage: (matchId: string, text: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (profileData: Partial<Profile>) => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshMatches: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('discovery');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const fetchDiscovery = useCallback(async () => {
    try {
      const data = await api.getDiscovery();
      setProfiles(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Fetch discovery failed', error);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Fetch matches failed', error);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          setIsOnboarded(userData.is_onboarded);
          if (userData.is_onboarded) {
            fetchDiscovery();
            fetchMatches();
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchDiscovery, fetchMatches]);

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    localStorage.setItem('token', access_token);
    const userData = await api.getMe();
    setUser(userData);
    setIsOnboarded(userData.is_onboarded);
    if (userData.is_onboarded) {
      fetchDiscovery();
      fetchMatches();
    }
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
    fetchDiscovery();
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    const updatedProfile = await api.updateProfile(profileData);
    setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];
    setHistory(prev => [...prev, currentIndex]);
    setCurrentIndex(prev => prev + 1);

    const isLike = direction === 'right' || direction === 'up';
    try {
      const result = await api.swipe(profile.id, isLike);
      if (result.is_match) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Swipe failed', error);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  };

  const setActiveMatch = async (id: string | null) => {
    setActiveMatchId(id);
    if (id) {
      setActiveTab('chat');
      // Ensure we have the match in our list or fetch it?
      // For now, assume it's in the list.
      // Fetch messages
      try {
        const msgs = await api.getMessages(id);
        setMessages(prev => ({ ...prev, [id]: msgs }));
      } catch (e) {
        console.error('Failed to load messages', e);
      }
    }
  };

  const sendMessage = async (matchId: string, text: string) => {
    try {
      const newMsg = await api.sendMessage(matchId, text);
      setMessages(prev => ({
        ...prev,
        [matchId]: [...(prev[matchId] || []), newMsg]
      }));
      fetchMatches();
    } catch (e) {
      console.error('Send message failed', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsOnboarded(false);
    setActiveTab('discovery');
    setCurrentIndex(0);
    setHistory([]);
    setProfiles([]);
    setMatches([]);
  };

  return (
    <AppContext.Provider value={{
      user, isLoading,
      isOnboarded, setIsOnboarded,
      activeTab, setActiveTab,
      profiles, currentIndex, handleSwipe, undo,
      matches, activeMatchId, setActiveMatch,
      messages, sendMessage,
      login, signup, logout, completeOnboarding, updateProfile,
      refreshMatches: fetchMatches
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
