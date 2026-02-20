import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Check, Search, Music, Heart, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface OnboardingProps {
  onComplete?: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Conect',
    description: 'Connect with people around you and find your perfect match.',
    icon: Flame,
  },
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Tell us a bit about yourself.',
    icon: UserIcon,
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
  const { completeOnboarding } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    bio: '',
    interests: [] as string[],
    images: [] as string[] // Placeholder for now
  });

  const nextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await completeOnboarding(formData);
        if (onComplete) onComplete();
      } catch (error) {
        console.error('Onboarding failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-between p-8 text-center relative">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-24 h-24 rounded-3xl tinder-gradient flex items-center justify-center mb-8 shadow-2xl shadow-tinder-orange/20">
              <Icon size={48} color="white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{step.title}</h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              {step.description}
            </p>

            {step.id === 'basic' && (
               <div className="w-full space-y-4">
                 <input
                   type="text"
                   placeholder="Your Name"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-tinder-orange transition-colors"
                 />
                 <input
                   type="number"
                   placeholder="Age"
                   value={formData.age}
                   onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                   className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-tinder-orange transition-colors"
                 />
               </div>
            )}

            {step.id === 'interests' && (
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm transition-all duration-300",
                      formData.interests.includes(interest)
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
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-tinder-orange transition-colors"
                />
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
          disabled={loading}
          className="w-full py-5 rounded-full tinder-gradient text-white font-bold text-lg uppercase tracking-widest shadow-xl shadow-tinder-orange/30 active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'Setting up...' : (currentStep === STEPS.length - 1 ? 'Get Started' : 'Continue')}
        </button>
      </div>
    </div>
  );
}
