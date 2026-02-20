import React from 'react';
import { Settings, Pencil, Shield, CreditCard, LogOut, ChevronRight, Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function ProfileView() {
  const { logout } = useAppContext();

  return (
    <div className="h-full flex flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button className="p-2 bg-white/5 rounded-full border border-white/10">
          <Settings size={24} className="text-white/60" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-12">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 tinder-gradient">
              <img
                src="https://picsum.photos/seed/user123/400/400"
                alt="My Profile"
                className="w-full h-full rounded-full object-cover border-4 border-black"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-black text-black">
              <Pencil size={18} />
            </button>
          </div>
          <h2 className="text-2xl font-bold mt-4">John, 28</h2>
          <p className="text-white/40 text-sm">Product Designer at TechCo</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 pb-12 flex flex-col gap-2">
        <MenuItem icon={Heart} label="My Likes" />
        <MenuItem icon={Shield} label="Safety Center" />
        <MenuItem icon={CreditCard} label="Payment Settings" />
        <MenuItem icon={LogOut} label="Logout" color="text-red-500" onClick={logout} />
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, color = "text-white/60", onClick }: { icon: any, label: string, color?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-colors group active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-xl bg-white/5", color)}>
          <Icon size={20} />
        </div>
        <span className="font-bold text-white/80">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
    </button>
  );
}
