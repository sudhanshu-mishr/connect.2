import React from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Matches() {
  const { matches, setActiveMatch } = useAppContext();

  return (
    <div className="h-full flex flex-col p-6 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Matches</h1>
        <button className="p-2 bg-white/5 rounded-full">
          <Search size={20} className="text-white/60" />
        </button>
      </div>

      {/* New Matches Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-tinder-orange">New Matches</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div className="flex-shrink-0 w-24 flex flex-col items-center gap-2">
            <div className="w-20 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
              <div className="w-12 h-12 rounded-full bg-tinder-orange/20 flex items-center justify-center">
                <span className="text-tinder-orange font-bold text-xl">{matches.length}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-white/40">Likes</span>
          </div>

          {matches.map(match => (
            <button 
              key={match.id} 
              onClick={() => setActiveMatch(match.id)}
              className="flex-shrink-0 w-24 flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="w-20 h-24 rounded-2xl overflow-hidden relative border border-white/10">
                <img
                  src={match.profile.images[0]}
                  alt={match.profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-bold">{match.profile.name}</span>
                {match.unread && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-tinder-orange rounded-full border-2 border-black" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Messages</h2>
        <div className="flex flex-col gap-6">
          {matches.map(match => (
            <button 
              key={match.id} 
              onClick={() => setActiveMatch(match.id)}
              className="flex items-center gap-4 text-left group active:opacity-70 transition-opacity"
            >
              <div className="relative">
                <img
                  src={match.profile.images[0]}
                  alt={match.profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-tinder-orange transition-colors"
                  referrerPolicy="no-referrer"
                />
                {match.unread && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-tinder-orange rounded-full border-2 border-black" />
                )}
              </div>
              <div className="flex-1 border-b border-white/5 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-lg">{match.profile.name}</span>
                  <span className="text-xs text-white/40">{match.timestamp}</span>
                </div>
                <p className={cn(
                  "text-sm line-clamp-1",
                  match.unread ? "text-white font-medium" : "text-white/40"
                )}>
                  {match.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
