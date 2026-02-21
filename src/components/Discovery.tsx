import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import { X, Heart, MapPin, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Discovery() {
  const { profiles, currentIndex, handleSwipe } = useAppContext();
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles[currentIndex];

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      handleSwipe('right');
      x.set(0);
    } else if (info.offset.x < -threshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      handleSwipe('left');
      x.set(0);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const onSwipeButton = async (direction: 'left' | 'right') => {
    if (direction === 'right') {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
    } else {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
    }
    handleSwipe(direction);
    x.set(0);
    // Reset position instantly after animation "completes" logically for the next card
    controls.set({ x: 0, opacity: 1 });
  };

  if (!currentProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/50">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4 animate-pulse">
          <Heart size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No more profiles</h3>
        <p>Check back later for more matches!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 pb-24 relative overflow-hidden">
      <div className="flex-1 relative w-full max-w-md mx-auto">
        <motion.div
          ref={cardRef}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 cursor-grab active:cursor-grabbing border border-white/10"
        >
          {/* Image */}
          <div className="absolute inset-0">
            <img
              src={currentProfile.images[0] || "https://picsum.photos/800/1200"}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
          </div>

          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{currentProfile.name}</h1>
              <span className="text-2xl font-medium opacity-90 mb-1">{currentProfile.age}</span>
            </div>

            <div className="flex items-center gap-2 text-white/80 mb-4 text-sm">
              <MapPin size={16} />
              <span>{currentProfile.distance || 'Nearby'}</span>
              {currentProfile.job && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50 mx-1" />
                  <Briefcase size={16} />
                  <span>{currentProfile.job}</span>
                </>
              )}
            </div>

            {/* Interests Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentProfile.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="h-24 flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => onSwipeButton('left')}
          className="w-16 h-16 rounded-full bg-zinc-900 border border-red-500/30 text-red-500 flex items-center justify-center shadow-lg shadow-red-500/10 hover:scale-110 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
        >
          <X size={32} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => onSwipeButton('right')}
          className="w-16 h-16 rounded-full bg-zinc-900 border border-green-500/30 text-green-500 flex items-center justify-center shadow-lg shadow-green-500/10 hover:scale-110 hover:bg-green-500 hover:text-white transition-all duration-300 active:scale-95"
        >
          <Heart size={32} strokeWidth={2.5} fill="currentColor" className="fill-transparent hover:fill-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
