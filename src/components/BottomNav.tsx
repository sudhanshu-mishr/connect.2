import React from 'react';
import { Flame, Star, MessageCircle, User, Heart } from 'lucide-react';
import { AppTab } from '../types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: AppTab; icon: React.ElementType; label: string }[] = [
    { id: 'discovery', icon: Flame, label: 'Discovery' },
    { id: 'matches', icon: Heart, label: 'Matches' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="h-20 bg-black border-t border-white/10 flex items-center justify-around px-4 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "scale-110" : "opacity-50 hover:opacity-80"
            )}
          >
            <Icon
              size={28}
              strokeWidth={isActive ? 2.5 : 2}
              className={cn(isActive && "text-tinder-orange")}
            />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", isActive ? "text-tinder-orange" : "text-white/40")}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
