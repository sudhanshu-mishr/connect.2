import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Send, Phone, Video } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Chat() {
  const { matches, activeMatchId, setActiveMatch, messages, sendMessage, user } = useAppContext();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const match = matches.find(m => m.id === activeMatchId);
  const matchMessages = activeMatchId ? (messages[activeMatchId] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [matchMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeMatchId) return;
    sendMessage(activeMatchId, inputText);
    setInputText('');
  };

  if (!match) return null;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-black/50 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveMatch(null)}
            className="p-2 -ml-2 text-white/60 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={match.profile.images[0] || "https://picsum.photos/200/200"}
                alt={match.profile.name}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{match.profile.name}</h3>
              <span className="text-xs text-white/40">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/60">
          <Phone size={20} />
          <Video size={20} />
          <MoreVertical size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-28 pb-4 space-y-4">
        <div className="text-center text-xs text-white/30 my-6">
          You matched with {match.profile.name}
        </div>

        {matchMessages.map((msg, i) => {
          const isMe = msg.senderId === user?.id || msg.senderId === 'me' || Number(msg.senderId) === user?.id;
          return (
            <div
              key={msg.id || i}
              className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed",
                isMe
                  ? "bg-tinder-orange text-white rounded-tr-none"
                  : "bg-zinc-900 text-white rounded-tl-none border border-white/5"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 pb-8 bg-black border-t border-white/5">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-full p-1.5 pr-2 border border-white/10 focus-within:border-white/20 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              inputText.trim()
                ? "bg-tinder-orange text-white shadow-lg shadow-tinder-orange/20 rotate-0 scale-100"
                : "bg-white/5 text-white/20 rotate-90 scale-90"
            )}
          >
            <Send size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
