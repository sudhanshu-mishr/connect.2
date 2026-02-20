import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

export default function Auth() {
  const { login, signup } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-3xl tinder-gradient flex items-center justify-center mb-8 shadow-2xl shadow-tinder-orange/20">
        <Flame size={48} color="white" />
      </div>

      <h1 className="text-4xl font-bold mb-8 text-white">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-tinder-orange transition-colors"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-tinder-orange transition-colors"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full tinder-gradient text-white font-bold text-lg uppercase tracking-widest shadow-xl shadow-tinder-orange/30 active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-white/60 text-sm hover:text-white transition-colors"
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
