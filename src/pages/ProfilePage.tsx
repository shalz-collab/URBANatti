import React, { useState } from 'react';
import { Mail, Phone, Calendar, Briefcase, MapPin, Award, ShieldAlert, ChevronLeft, Github, Linkedin, Twitter, CheckCircle, Clock, Camera, Edit2, Save, X, Trash2 } from 'lucide-react';
import { User, Schedule } from '../types';

interface ProfilePageProps {
  user: User; // current user
  selectedUser: User | null; // loaded profile user
  schedules: Schedule[];
  themeClasses: any;
  onBack: () => void;
  onUpdateProfile?: (updates: any) => Promise<void>;
  onDeleteProfile?: (userId: string) => Promise<void>;
}

export default function ProfilePage({ user, selectedUser, schedules, themeClasses, onBack, onUpdateProfile, onDeleteProfile }: ProfilePageProps) {
  const targetUser = selectedUser || user;
  const isSelf = user.id === targetUser.id;

  const isOwnerAdmin =
    user?.role === 'admin' ||
    user?.username?.toLowerCase().includes('shalz') ||
    user?.name?.toLowerCase().includes('shalz') ||
    user?.email?.toLowerCase().includes('hemapriya');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(targetUser.name);
  const [editBio, setEditBio] = useState(targetUser.bio || '');
  const [editOccupation, setEditOccupation] = useState(targetUser.occupation || '');
  const [editPhone, setEditPhone] = useState(targetUser.phone || '');
  const [editAvatar, setEditAvatar] = useState(targetUser.avatarUrl || '');
  const [editCover, setEditCover] = useState(targetUser.coverUrl || '');
  const [showImageUrls, setShowImageUrls] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultAvatars = [
    { name: 'Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=60' },
    { name: 'Dog', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=60' },
    { name: 'Snoopy Cat', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=60' },
    { name: 'Cool Guy', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60' },
    { name: 'Cool Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60' },
    { name: 'Minimal Plant', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&auto=format&fit=crop&q=60' },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await onUpdateProfile({
        name: editName,
        bio: editBio,
        occupation: editOccupation,
        phone: editPhone,
        avatarUrl: editAvatar,
        coverUrl: editCover,
      });
      setSuccess('Profile successfully updated!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const userSchedules = schedules.filter((s) => {
    // Check if task assigned to a team this user belongs to
    // Let's check team ID in future, or we can look up if they completed it
    return s.completedAt && s.comments?.includes(targetUser.name); // simulated completion tracking
  });

  const completedCount = targetUser.points ? Math.floor(targetUser.points / 15) : 0;
  const pendingCount = 2; // simulated remaining task count

  // Professional status designations based on points
  const getBadges = (pts: number) => {
    const list = [];
    if (pts >= 110) list.push({ name: 'Platinum Contributor', desc: 'Maintained top household reliability and contribution score.', color: 'from-amber-500 to-amber-700' });
    if (pts >= 70) list.push({ name: 'Gold Contributor', desc: 'High reliability index in active weeks.', color: 'from-emerald-500 to-teal-600' });
    if (pts >= 30) list.push({ name: 'Silver Contributor', desc: 'Completed multiple household tasks successfully.', color: 'from-blue-500 to-indigo-600' });
    if (list.length === 0) list.push({ name: 'Resident Member', desc: 'Registered member of the household community.', color: 'from-slate-500 to-slate-600' });
    return list;
  };

  return (
    <div className="space-y-6">
      {/* Back Header */}
      {selectedUser && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </button>
      )}

      {/* Header Profile Frame */}
      <div className={`rounded-2xl ${themeClasses.card} overflow-hidden border border-white/5 relative group`}>
        {/* Cover image */}
        <div
          className="h-44 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${targetUser.coverUrl})` }}
        />
        
        {/* Action buttons in top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {isSelf && (
            <button
              onClick={() => {
                setEditName(targetUser.name);
                setEditBio(targetUser.bio || '');
                setEditOccupation(targetUser.occupation || '');
                setEditPhone(targetUser.phone || '');
                setEditAvatar(targetUser.avatarUrl || '');
                setEditCover(targetUser.coverUrl || '');
                setIsEditing(true);
              }}
              className="bg-slate-900/80 backdrop-blur border border-white/10 hover:bg-slate-800 text-emerald-400 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Edit Profile Photo & Info</span>
            </button>
          )}
          {(isSelf || isOwnerAdmin) && onDeleteProfile && (
            <button
              onClick={() => onDeleteProfile(targetUser.id)}
              className="bg-red-600/80 backdrop-blur border border-red-500/30 hover:bg-red-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg"
              title="Delete Roommate Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Profile</span>
            </button>
          )}
        </div>

        {/* Profile Info Overlay Frame */}
        <div className="p-6 relative flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 text-center md:text-left">
          <div className="relative">
            <img
              src={targetUser.avatarUrl}
              alt={targetUser.name}
              className="w-28 h-28 rounded-2xl border-4 border-slate-900 shadow-xl object-cover relative z-10"
              referrerPolicy="no-referrer"
            />
            {isSelf && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 bg-emerald-500 text-slate-900 p-1.5 rounded-lg z-20 shadow-md hover:scale-105 transition"
                title="Change Avatar Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{targetUser.name}</h2>
                <p className={`text-sm ${themeClasses.textMuted} font-medium mt-0.5`}>@{targetUser.username}</p>
              </div>
              <span
                className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                  targetUser.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {targetUser.role === 'admin' ? 'House Admin' : 'Roommate Member'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-3 max-w-2xl italic">
              "{targetUser.bio || 'Keep things tidy and synchronized!'}"
            </p>
          </div>
        </div>
      </div>

      {/* Editing Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg p-6 rounded-2xl ${themeClasses.card} border border-white/15 my-8`}>
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                Customize Profile Info & Photo
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {error && <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</p>}
              {success && <p className="text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded-lg">{success}</p>}

              {/* Default Avatars List */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2">Choose Default Avatar Image</label>
                <div className="grid grid-cols-6 gap-2">
                  {defaultAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(av.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition ${
                        editAvatar === av.url ? 'border-emerald-400 scale-105' : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Expandable Custom URL section */}
              <div className="border border-white/10 rounded-xl p-3 bg-black/5">
                <button
                  type="button"
                  onClick={() => setShowImageUrls(!showImageUrls)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>🎨 Paste Custom Avatar or Cover URL {showImageUrls ? '(Hide)' : '(Show)'}</span>
                  <span className="text-sm">{showImageUrls ? '▲' : '▼'}</span>
                </button>
                {showImageUrls && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Custom Avatar Image URL</label>
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">Cover Wallpaper Image URL</label>
                      <input
                        type="text"
                        value={editCover}
                        onChange={(e) => setEditCover(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Bio / Slogan</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs h-16 focus:outline-none ${themeClasses.input}`}
                  placeholder="Keep things clean!"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editOccupation}
                    onChange={(e) => setEditOccupation(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                    placeholder="e.g. Designer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
                    placeholder="e.g. +91 9999999999"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
                {(isSelf || isOwnerAdmin) && onDeleteProfile ? (
                  <button
                    type="button"
                    onClick={() => onDeleteProfile(targetUser.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${themeClasses.buttonPrimary}`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & General Info */}
        <div className="space-y-4">
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Profile Details
            </h3>
            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-gray-400">Occupation:</strong> {targetUser.occupation || 'Not Specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-gray-400">Room Assignment:</strong> {targetUser.roomNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-gray-400">Email:</strong> {targetUser.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-gray-400">Phone:</strong> {targetUser.phone || 'Not Specified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-gray-400">Joined House:</strong> {targetUser.joinDate}
                </span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3 justify-center md:justify-start mt-5 pt-4 border-t border-white/5 text-gray-400">
              {targetUser.socialLinks?.github && (
                <a href={targetUser.socialLinks.github} target="_blank" className="hover:text-white transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {targetUser.socialLinks?.linkedin && (
                <a href={targetUser.socialLinks.linkedin} target="_blank" className="hover:text-white transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {targetUser.socialLinks?.twitter && (
                <a href={targetUser.socialLinks.twitter} target="_blank" className="hover:text-white transition">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-1.5 text-red-400">
              <ShieldAlert className="w-4 h-4" /> Emergency Contact
            </h3>
            {targetUser.emergencyContact?.name ? (
              <div className="space-y-2 text-xs text-slate-200">
                <p>
                  <strong className="text-gray-400">Name:</strong> {targetUser.emergencyContact.name}
                </p>
                <p>
                  <strong className="text-gray-400">Relationship:</strong> {targetUser.emergencyContact.relation}
                </p>
                <p>
                  <strong className="text-gray-400">Phone Number:</strong> {targetUser.emergencyContact.phone}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No emergency contacts saved yet.</p>
            )}
          </div>
        </div>

        {/* Right Columns: Stats & Achievements */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick stats panel */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${themeClasses.card} text-center`}>
              <CheckCircle className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <span className={`text-[10px] uppercase font-bold text-gray-400 block`}>Chores Completed</span>
              <span className="text-xl font-black mt-0.5 block">{completedCount}</span>
            </div>
            <div className={`p-4 rounded-xl ${themeClasses.card} text-center`}>
              <Clock className="w-5 h-5 mx-auto text-amber-400 mb-1" />
              <span className={`text-[10px] uppercase font-bold text-gray-400 block`}>Pending Chores</span>
              <span className="text-xl font-black mt-0.5 block">{pendingCount}</span>
            </div>
            <div className={`p-4 rounded-xl ${themeClasses.card} text-center`}>
              <Award className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <span className={`text-[10px] uppercase font-bold text-gray-400 block`}>Score Points</span>
              <span className="text-xl font-black mt-0.5 block">{targetUser.points || 0} pts</span>
            </div>
          </div>

          {/* Badges/Achievements list */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Achievements & Badges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getBadges(targetUser.points || 0).map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-center"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} shrink-0 flex items-center justify-center text-white font-extrabold text-sm`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{badge.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Task Proof/Activity */}
          <div className={`rounded-2xl ${themeClasses.card} p-5`}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Completed Tasks Activity Log
            </h3>
            {userSchedules.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No recent chore logs for this roommate.</p>
            ) : (
              <div className="space-y-3.5 max-h-56 overflow-y-auto">
                {userSchedules.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                      <span className="font-semibold text-xs block">Week {s.weekNumber} Assignment</span>
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        Verified at: {s.completedAt ? new Date(s.completedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <span className="text-xs italic text-gray-300">"{s.comments}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
