import { Profile, AuthResponse, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  signup: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
    }
    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/users/me`, {
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
    const response = await fetch(`${API_URL}/users/me/onboard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Onboarding failed');
    return response.json();
  }
};
