import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Mail, Lock, User, Phone, Shield, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: any, token: string) => void;
  themeClasses: any;
}

export default function AuthPage({ onLogin, themeClasses }: AuthPageProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        
        if (rememberMe) {
          localStorage.setItem('roommate_token', data.token);
        } else {
          localStorage.setItem('roommate_token', data.token);
        }
        onLogin(data.user, data.token);
      } else if (view === 'register') {
        if (!name.trim()) {
          throw new Error('Full Name is required');
        }
        
        let finalUsername = username.trim();
        if (!finalUsername) {
          finalUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
        } else {
          if (finalUsername.includes(' ')) {
            throw new Error('Username cannot contain spaces');
          }
          if (finalUsername.length < 3) {
            throw new Error('Username must be at least 3 characters long');
          }
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error('Please enter a valid email address');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        const finalRoomNumber = roomNumber.trim() || 'Unassigned';

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            name, 
            username: finalUsername, 
            roomNumber: finalRoomNumber, 
            phone, 
            role: 'member' 
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        
        localStorage.setItem('roommate_token', data.token);
        setSuccess('Registration successful! Logging in...');
        setTimeout(() => {
          onLogin(data.user, data.token);
        }, 1500);
      } else if (view === 'forgot') {
        // Simulate email verification / link
        setSuccess('Reset link sent! In a live environment, an email verification is processed.');
        setTimeout(() => {
          setView('reset');
        }, 2000);
      } else if (view === 'reset') {
        // Simulate password reset
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          setView('login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md rounded-2xl ${themeClasses.card} p-8 relative overflow-hidden`}
        style={{ id: 'auth-card' }}
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">adengappa 7 peru</h1>
          <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
            Smart Apartment & Roommate Management
          </p>
        </div>

        {/* Auth Mode Switcher Tabs */}
        {(view === 'login' || view === 'register') && (
          <div className="grid grid-cols-2 p-1 bg-black/30 rounded-xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setError(''); setSuccess(''); setView('login'); }}
              className={`py-2 text-xs font-bold rounded-lg transition ${view === 'login' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setError(''); setSuccess(''); setView('register'); }}
              className={`py-2 text-xs font-bold rounded-lg transition ${view === 'register' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Register New Roommate
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                    placeholder="Alex Johnson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                  Username (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                    placeholder="e.g. shalzz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                    Room No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                    placeholder="e.g. A-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                      placeholder="+1 (555) 019"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                * Username and Room No. will be auto-assigned if left blank.
              </p>
            </>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot') && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                {view === 'login' ? 'Email Address or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type={view === 'login' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                  placeholder={view === 'login' ? "hemapriyaachandran06@gmail.com or shalzz" : "hemapriyaachandran06@gmail.com"}
                />
              </div>
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'reset') && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1">
                {view === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${themeClasses.input}`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {view === 'login' && (
            <div className="flex items-center justify-between text-xs mt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className={themeClasses.textMuted}>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-emerald-400 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition ${themeClasses.buttonPrimary} disabled:opacity-50 mt-4`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {view === 'login' && 'Sign In'}
                {view === 'register' && 'Create Account'}
                {view === 'forgot' && 'Send Verification'}
                {view === 'reset' && 'Reset Password'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs">
          {view === 'login' ? (
            <p className={themeClasses.textMuted}>
              Don't have an apartment setup yet?{' '}
              <button
                type="button"
                onClick={() => setView('register')}
                className="text-emerald-400 hover:underline font-medium"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p className={themeClasses.textMuted}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-emerald-400 hover:underline font-medium"
              >
                Sign In Instead
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
