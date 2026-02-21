import React, { useState, useRef } from 'react';
import { Settings, Pencil, Shield, CreditCard, LogOut, ChevronRight, Heart, Save, X, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { api } from '../api';

export default function ProfileView() {
  const { user, logout, updateProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    age: user?.profile?.age || 18,
    bio: user?.profile?.bio || '',
    job: user?.profile?.job || '',
    school: user?.profile?.school || '',
    images: user?.profile?.images || [],
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await api.uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, images: [url, ...prev.images] }));
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!user || !user.profile) return null;

  return (
    <div className="h-full flex flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-3xl font-bold">Profile</h1>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 rounded-full border border-white/10 text-red-500">
              <X size={24} />
            </button>
            <button onClick={handleSave} className="p-2 bg-white/5 rounded-full border border-white/10 text-green-500">
              <Save size={24} />
            </button>
          </div>
        ) : (
          <button className="p-2 bg-white/5 rounded-full border border-white/10">
            <Settings size={24} className="text-white/60" />
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="px-6 mb-12">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 tinder-gradient relative">
              <img
                src={formData.images[0] || user.profile.images[0] || "https://picsum.photos/400/400"}
                alt="My Profile"
                className="w-full h-full rounded-full object-cover border-4 border-black"
                referrerPolicy="no-referrer"
              />
              {isEditing && (
                <div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload size={24} className="text-white" />
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-black text-black"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="w-full mt-4 space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
              />
              <textarea
                placeholder="Bio"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-24"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mt-4">{user.profile.name}, {user.profile.age}</h2>
              <p className="text-white/40 text-sm mt-1">{user.profile.bio}</p>
            </>
          )}
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
