import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { X, Heart, Star, Zap, RotateCcw, Info, Flame } from 'lucide-react';
import { MOCK_PROFILES } from '../constants';
import { Profile } from '../types';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

interface CardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
  key?: React.Key;
}

const Card = ({ profile, onSwipe, isTop }: CardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);
  const superLikeOpacity = useTransform(y, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
    else if (info.offset.y < -100) onSwipe('up');
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity, zIndex: isTop ? 10 : 0 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
        <img
          src={profile.images[0]}
          alt={profile.name}
          className="w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        {/* Swipe Indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 rounded-xl px-4 py-2 rotate-[-20deg]">
          <span className="text-4xl font-black text-green-500 uppercase tracking-widest">LIKE</span>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 rounded-xl px-4 py-2 rotate-[20deg]">
          <span className="text-4xl font-black text-red-500 uppercase tracking-widest">NOPE</span>
        </motion.div>
        <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-40 left-1/2 -translate-x-1/2 border-4 border-blue-400 rounded-xl px-4 py-2">
          <span className="text-4xl font-black text-blue-400 uppercase tracking-widest whitespace-nowrap">SUPER LIKE</span>
        </motion.div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-3xl font-bold">{profile.name}, {profile.age}</h2>
            <button className="mb-1 opacity-60 hover:opacity-100 transition-opacity">
              <Info size={20} />
            </button>
          </div>
          
          <div className="flex flex-col gap-1 mb-4 opacity-90">
            {profile.job && <p className="text-lg">{profile.job}</p>}
            {profile.school && <p className="text-base opacity-70">{profile.school}</p>}
            <p className="text-sm font-medium text-white/60">{profile.distance}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {profile.interests.slice(0, 3).map(interest => (
              <span key={interest} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs border border-white/10">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Discovery() {
  const { profiles, currentIndex, handleSwipe, undo } = useAppContext();

  return (
    <div className="h-full flex flex-col p-4 pt-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-1">
          <Flame className="text-tinder-orange" size={32} />
          <span className="text-2xl font-black tracking-tighter tinder-gradient-text">conect</span>
        </div>
        <div className="flex gap-4">
          {/* Removed premium icons */}
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative">
        <AnimatePresence>
          {currentIndex < profiles.length ? (
            profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, index) => (
              <Card
                key={profile.id}
                profile={profile}
                onSwipe={handleSwipe}
                isTop={index === 1 || profiles.length - currentIndex === 1}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Flame size={40} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No more profiles</h3>
              <p className="text-white/40 mb-8">Try expanding your discovery settings to see more people.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-full tinder-gradient font-bold uppercase tracking-wider"
              >
                Refresh Feed
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8 mb-4">
        <button onClick={undo} className="p-3 bg-zinc-900 rounded-full border border-white/10 text-yellow-500 hover:scale-110 transition-transform">
          <RotateCcw size={24} />
        </button>
        <button onClick={() => handleSwipe('left')} className="p-5 bg-zinc-900 rounded-full border border-white/10 text-red-500 hover:scale-110 transition-transform">
          <X size={32} strokeWidth={3} />
        </button>
        <button onClick={() => handleSwipe('right')} className="p-5 bg-zinc-900 rounded-full border border-white/10 text-green-500 hover:scale-110 transition-transform">
          <Heart size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
