import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Matches() {
  const { matches, setActiveMatch, refreshMatches } = useAppContext();

  // Optionally refresh matches on mount
  React.useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const newMatches = matches.filter(m => !m.lastMessage);
  const messages = matches.filter(m => m.lastMessage);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-6 pt-12 pb-4">
        <h1 className="text-3xl font-bold mb-6">Matches</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search matches"
            className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
        {/* New Matches Row */}
        {newMatches.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-tinder-orange uppercase tracking-widest mb-4">New Matches</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {newMatches.map((match, i) => (
                <motion.button
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveMatch(match.id)}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  <div className="w-16 h-16 rounded-full p-0.5 tinder-gradient">
                    <img
                      src={match.profile.images[0] || "https://picsum.photos/200/200"}
                      alt={match.profile.name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-sm font-bold truncate w-full text-center">{match.profile.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        <div>
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Messages</h3>
          <div className="flex flex-col gap-2">
            {messages.map((match, i) => (
              <motion.button
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveMatch(match.id)}
                className="flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-zinc-900 transition-colors active:scale-[0.99]"
              >
                <div className="relative">
                  <img
                    src={match.profile.images[0] || "https://picsum.photos/200/200"}
                    alt={match.profile.name}
                    className="w-16 h-16 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {match.unread && (
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-tinder-orange rounded-full border-2 border-black" />
                  )}
                </div>

                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-lg">{match.profile.name}</h4>
                    {/* Timestamp parsing/formatting logic needed for real data */}
                    <span className="text-xs text-white/40">Recently</span>
                  </div>
                  <p className={cn(
                    "text-sm truncate",
                    match.unread ? "text-white font-semibold" : "text-white/50"
                  )}>
                    {match.lastMessage}
                  </p>
                </div>
              </motion.button>
            ))}

            {messages.length === 0 && newMatches.length === 0 && (
               <div className="text-center text-white/40 py-10">
                 No matches yet. Keep swiping!
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
