import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, Search, Music, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Conect',
    description: 'Connect with people around you and find your perfect match.',
    icon: Flame,
  },
  {
    id: 'photos',
    title: 'Add your photos',
    description: 'Profiles with photos get 3x more matches. Show your best self!',
    icon: Check,
  },
  {
    id: 'interests',
    title: 'Your Interests',
    description: 'Select what you love to find people with similar passions.',
    icon: Search,
  },
  {
    id: 'bio',
    title: 'About You',
    description: 'A short bio helps people get to know the real you.',
    icon: Heart,
  }
];

const INTERESTS = ['Coffee', 'Hiking', 'Art', 'Travel', 'Cooking', 'Gaming', 'Music', 'Wine', 'Yoga', 'Nature', 'Fitness', 'Coding'];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-between p-8 text-center relative">
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 text-white/40 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
      >
        Skip
      </button>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-3xl tinder-gradient flex items-center justify-center mb-8 shadow-2xl shadow-tinder-orange/20">
              <Icon size={48} color="white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{step.title}</h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              {step.description}
            </p>

            {step.id === 'interests' && (
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm transition-all duration-300",
                      selectedInterests.includes(interest)
                        ? "bg-white text-black border-white"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            )}

            {step.id === 'bio' && (
              <div className="w-full mt-4">
                <textarea
                  placeholder="I love long walks on the beach..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-tinder-orange transition-colors"
                />
                <div className="flex items-center gap-2 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Music size={20} className="text-green-500" />
                  <span className="text-sm text-white/60">Connect Spotify Anthem</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Progress Dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentStep ? "w-8 bg-tinder-orange" : "w-1.5 bg-white/20"
              )}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full py-5 rounded-full tinder-gradient text-white font-bold text-lg uppercase tracking-widest shadow-xl shadow-tinder-orange/30 active:scale-95 transition-transform"
        >
          {currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
