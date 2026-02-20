import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, Phone, Send, Smile, Image as ImageIcon, Mic } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Chat() {
  const { activeMatchId, matches, messages, sendMessage, setActiveMatch, setActiveTab } = useAppContext();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const activeMessages = activeMatchId ? messages[activeMatchId] || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeMatchId) return;
    sendMessage(activeMatchId, inputText);
    setInputText('');
  };

  const handleBack = () => {
    setActiveMatch(null);
    setActiveTab('matches');
  };

  if (!activeMatch) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ArrowLeft size={40} className="text-white/20" />
        </div>
        <h3 className="text-xl font-bold mb-2">Select a match</h3>
        <p className="text-white/40 mb-8">Go to your matches to start a conversation.</p>
        <button 
          onClick={() => setActiveTab('matches')}
          className="px-8 py-3 rounded-full tinder-gradient font-bold uppercase tracking-wider"
        >
          Go to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={activeMatch.profile.images[0]}
              alt={activeMatch.profile.name}
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-base leading-none mb-1">{activeMatch.profile.name}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Online</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Video size={20} className="text-white/60" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Phone size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="text-center my-4">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Today</span>
        </div>

        {activeMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] flex flex-col gap-1",
              msg.senderId === 'me' ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={cn(
                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                msg.senderId === 'me'
                  ? "bg-tinder-orange text-white rounded-tr-none"
                  : "bg-zinc-800 text-white rounded-tl-none"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-white/20 font-medium">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-white/10">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-2 border border-white/5">
          <button className="text-white/40 hover:text-white transition-colors">
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-white/20"
          />
          <button className="text-white/40 hover:text-white transition-colors">
            <Smile size={20} />
          </button>
          {inputText ? (
            <button 
              onClick={handleSend}
              className="w-8 h-8 rounded-full tinder-gradient flex items-center justify-center text-white"
            >
              <Send size={16} />
            </button>
          ) : (
            <button className="text-white/40 hover:text-white transition-colors">
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
