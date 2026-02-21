import { Profile, AuthResponse, User, Match, Message } from './types';

const BASE_URL = '/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  signup: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.detail || 'Signup failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.detail || 'Login failed');
    }
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  onboard: async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${BASE_URL}/users/me/onboard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) throw new Error('Onboarding failed');
    return response.json();
  },

  updateProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await fetch(`${BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Update failed');
    return response.json();
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  },

  getDiscovery: async (filters: { gender?: string } = {}): Promise<Profile[]> => {
    const query = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${BASE_URL}/users/discovery?${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch discovery');
    return response.json();
  },

  swipe: async (targetId: number | string, isLike: boolean): Promise<{ is_match: boolean }> => {
    const response = await fetch(`${BASE_URL}/swipes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ target_id: targetId, is_like: isLike }),
    });
    if (!response.ok) throw new Error('Swipe failed');
    return response.json();
  },

  getMatches: async (): Promise<Match[]> => {
    const response = await fetch(`${BASE_URL}/matches`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch matches');
    return response.json();
  },

  getMessages: async (matchId: number | string): Promise<Message[]> => {
    const response = await fetch(`${BASE_URL}/matches/${matchId}/messages`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  sendMessage: async (matchId: number | string, text: string): Promise<Message> => {
    const response = await fetch(`${BASE_URL}/matches/${matchId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  reportUser: async (reportedId: number | string, reason: string) => {
    const response = await fetch(`${BASE_URL}/users/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reported_id: reportedId, reason }),
    });
    if (!response.ok) throw new Error('Report failed');
    return response.json();
  },

  blockUser: async (blockedId: number | string) => {
    const response = await fetch(`${BASE_URL}/users/block`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ blocked_id: blockedId }),
    });
    if (!response.ok) throw new Error('Block failed');
    return response.json();
  },

  unmatchUser: async (matchId: number | string) => {
    const response = await fetch(`${BASE_URL}/matches/${matchId}/unmatch`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Unmatch failed');
    return response.json();
  }
};
