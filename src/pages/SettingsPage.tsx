import React, { useState } from 'react';
import { User as UserIcon, Shield, Key, Bell, Globe, Sparkles, Check, Trash2 } from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../translations';

interface SettingsPageProps {
  user: User;
  themeClasses: any;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onUpdateProfile: (updates: any) => Promise<void>;
  onDeleteProfile?: (userId: string) => Promise<void>;
}

export default function SettingsPage({ user, themeClasses, language = 'en', onLanguageChange, onUpdateProfile, onDeleteProfile }: SettingsPageProps) {
  const t = translations[language];
  // Form States
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(user.coverUrl || '');
  const [showImageUrls, setShowImageUrls] = useState(false);
  
  // Custom theme pref
  const [selectedTheme, setSelectedTheme] = useState(user.themePreference || 'glass');
  const [accentColor, setAccentColor] = useState(user.accentColor || '#10b981');
  const [customBackgroundImage, setCustomBackgroundImage] = useState(user.customBackgroundImage || '');

  // Emergency Contact
  const [emName, setEmName] = useState(user.emergencyContact?.name || '');
  const [emPhone, setEmPhone] = useState(user.emergencyContact?.phone || '');
  const [emRelation, setEmRelation] = useState(user.emergencyContact?.relation || '');

  // Notifications toggles
  const [notifSchedules, setNotifSchedules] = useState(true);
  const [notifGallery, setNotifGallery] = useState(true);
  const [notifChat, setNotifChat] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const themes = [
    { id: 'glass', name: 'Glass Default', color: 'bg-indigo-500/30' },
    { id: 'dark', name: 'Dark Slate', color: 'bg-slate-900 border-slate-800' },
    { id: 'light', name: 'Bright Light', color: 'bg-white border-slate-200' },
    { id: 'ocean', name: 'Ocean Blue', color: 'bg-sky-950/50 text-sky-400' },
    { id: 'forest', name: 'Forest Green', color: 'bg-emerald-950/50 text-emerald-400' },
    { id: 'sunset', name: 'Sunset Warm', color: 'bg-orange-950/50 text-orange-400' },
    { id: 'aurora', name: 'Aurora Teal', color: 'bg-teal-950/50 text-teal-400' },
    { id: 'galaxy', name: 'Galaxy Cosmic', color: 'bg-indigo-950/80 text-indigo-300' },
    { id: 'minimal', name: 'Minimal White', color: 'bg-slate-50 border-slate-200 shadow' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', color: 'bg-fuchsia-950/60 text-fuchsia-400' },
    { id: 'purple', name: 'Purple Gradient', color: 'bg-violet-950/50 text-violet-400' },
    { id: 'green-nature', name: 'Green Nature', color: 'bg-lime-950/50 text-lime-400' },
    { id: 'coffee', name: 'Coffee Espresso', color: 'bg-amber-950/60 text-amber-300' },
    { id: 'pink-blossom', name: 'Pink Blossom', color: 'bg-pink-950/50 text-pink-300' },
    { id: 'black', name: 'Obsidian Black', color: 'bg-black text-white border-zinc-800' },
  ];

  const accents = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#ef4444', // red
  ];

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1920;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setCustomBackgroundImage(optimizedDataUrl);
          setSuccess('Background image processed! Click "Save Settings" below to permanently apply.');
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = {
        name,
        bio,
        email,
        phone,
        occupation,
        avatarUrl,
        coverUrl,
        themePreference: selectedTheme,
        accentColor,
        customBackgroundImage,
        emergencyContact: {
          name: emName,
          phone: emPhone,
          relation: emRelation,
        },
      };

      if (password) {
        updates.password = password;
      }

      await onUpdateProfile(updates);
      setSuccess('Profile settings successfully saved!');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account & Theme Settings</h2>
        <p className={`${themeClasses.textMuted} text-sm mt-1`}>
          Configure your personal details, emergency listings, notification rules, and custom dashboard visuals.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Forms */}
        <div className="lg:col-span-2 space-y-4">
          {/* General Bio */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Personal Bio Info
            </h3>
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Occupation / Study</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Bio Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs h-20 focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="Tell your roommates a bit about yourself..."
                />
              </div>

              {/* Expandable Avatar & Cover Image URL section to keep UI clean and mobile-friendly */}
              <div className="border border-white/10 rounded-xl p-3 bg-black/5">
                <button
                  type="button"
                  onClick={() => setShowImageUrls(!showImageUrls)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>🎨 Custom Avatar & Cover Image URLs {showImageUrls ? '(Hide)' : '(Show)'}</span>
                  <span className="text-sm">{showImageUrls ? '▲' : '▼'}</span>
                </button>
                
                {showImageUrls && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Avatar Image URL</label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Cover Image URL</label>
                      <input
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Emergency Contact Listings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Father/Mother"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  value={emRelation}
                  onChange={(e) => setEmRelation(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="e.g. Brother / Sister"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={emPhone}
                  onChange={(e) => setEmPhone(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                  placeholder="+1 (555) 000"
                />
              </div>
            </div>
          </div>

          {/* Security & Password reset */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Security Update
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1">Update Account Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full max-w-sm px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 ${themeClasses.input}`}
                placeholder="Leave blank to keep existing"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Customizer Visual Controls */}
        <div className="space-y-4">
          {/* Multi-language selector */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> {t.languageSelect} / மொழி / భాష / भाषा
            </h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              Select your preferred language. The entire application interface will instantly update.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'en' as Language, name: 'English', native: 'English', flag: '🇬🇧' },
                { id: 'ta' as Language, name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
                { id: 'te' as Language, name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
                { id: 'hi' as Language, name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onLanguageChange?.(item.id)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 transition ${
                    language === item.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md'
                      : 'border-white/10 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <div className="text-left">
                      <p className="font-bold leading-tight">{item.native}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.name}</p>
                    </div>
                  </div>
                  {language === item.id && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme Selector */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Dashboard Accent & Theme
            </h3>

            {/* Custom Theme Selection circles */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold uppercase text-gray-400">{t.themePreference}</label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-between gap-1.5 transition ${
                      selectedTheme === t.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${t.color} shrink-0`} />
                    <span className="truncate w-full text-center">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent selection */}
            <div className="space-y-2.5 mt-5">
              <label className="block text-[10px] font-bold uppercase text-gray-400">{t.accentColor}</label>
              <div className="flex gap-2.5 justify-center flex-wrap items-center">
                {accents.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className="w-7 h-7 rounded-full relative shadow-md flex items-center justify-center text-white"
                  >
                    {accentColor === color && <Check className="w-4 h-4" />}
                  </button>
                ))}
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    title="Choose custom hex color"
                    className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-[9px] text-gray-400 ml-1 font-mono">{accentColor}</span>
                </div>
              </div>
            </div>

            {/* Custom Background Image Upload */}
            <div className="space-y-3 mt-6 pt-5 border-t border-white/5">
              <label className="block text-[10px] font-bold uppercase text-gray-400 flex items-center justify-between">
                <span>Custom Wallpaper (PNG, JPG, WEBP)</span>
                {customBackgroundImage && (
                  <button
                    type="button"
                    onClick={() => setCustomBackgroundImage('')}
                    className="text-red-400 hover:underline text-[9px]"
                  >
                    Remove Custom Wallpaper
                  </button>
                )}
              </label>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleBgImageUpload}
                  className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                />
                <p className="text-[10px] text-gray-400">
                  Upload any image from your Desktop, Laptop, or Mobile device. It will be automatically compressed, saved permanently, and loaded across your sessions without affecting other roommates.
                </p>
                {customBackgroundImage && (
                  <div className="mt-2 h-20 rounded-lg overflow-hidden border border-white/20 relative">
                    <img src={customBackgroundImage} alt="Wallpaper preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-emerald-400 font-bold">
                      Active Preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences Settings */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              General Preferences
            </h3>
            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block">Chore Scheduling Digests</span>
                  <span className="text-[10px] text-gray-400">Receive alert when chores rotate</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifSchedules}
                  onChange={(e) => setNotifSchedules(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block">Gallery Shared Notifications</span>
                  <span className="text-[10px] text-gray-400">Alert on roommate uploads</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifGallery}
                  onChange={(e) => setNotifGallery(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block">Read Receipts & Group chats</span>
                  <span className="text-[10px] text-gray-400">Turn on typing indicators</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifChat}
                  onChange={(e) => setNotifChat(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-emerald-400">{t.saveSuccess}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition ${themeClasses.buttonPrimary}`}
          >
            {loading ? 'Saving Changes...' : t.saveSettings}
          </button>

          {/* Danger Zone: Delete Profile */}
          {onDeleteProfile && (
            <div className="mt-8 pt-6 border-t border-red-500/30">
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div>
                  <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone: Delete My Account
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Permanently delete your account, profile information, uploaded images, personal settings, assigned chores, completed chores, notifications, activity history, and all related database records. This will log you out immediately and cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteProfile(user.id)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shrink-0"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
