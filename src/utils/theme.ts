import { CSSProperties } from 'react';

export const getThemeClasses = (theme: string) => {
  switch (theme) {
    case 'light':
      return {
        bgOverlay: 'bg-slate-100/15',
        card: 'bg-white/90 border border-slate-200/80 shadow-md backdrop-blur-md text-slate-800',
        textMuted: 'text-slate-500',
        input: 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500',
        buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
        accent: 'text-emerald-600',
        sidebar: 'bg-white/95 border-r border-slate-200 text-slate-800',
        sidebarActive: 'bg-slate-100 text-slate-900 border-l-4 border-emerald-500',
        sidebarHover: 'hover:bg-slate-50 text-slate-600',
        cardHeader: 'border-b border-slate-100 bg-slate-50/50',
      };
    case 'dark':
      return {
        bgOverlay: 'bg-slate-950/25',
        card: 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md text-slate-100',
        textMuted: 'text-slate-400',
        input: 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500',
        buttonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-950/30',
        accent: 'text-emerald-400',
        sidebar: 'bg-slate-950/95 border-r border-slate-900 text-slate-300',
        sidebarActive: 'bg-slate-900 text-emerald-400 border-l-4 border-emerald-500',
        sidebarHover: 'hover:bg-slate-900/60 text-slate-300',
        cardHeader: 'border-b border-slate-800/80 bg-slate-900/30',
      };
    case 'forest':
      return {
        bgOverlay: 'bg-emerald-950/20',
        card: 'bg-emerald-950/40 border border-emerald-800/50 shadow-xl backdrop-blur-lg text-emerald-50',
        textMuted: 'text-emerald-300/80',
        input: 'bg-emerald-950/60 border-emerald-800 text-emerald-100 placeholder-emerald-500 focus:ring-emerald-400 focus:border-emerald-400',
        buttonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm',
        accent: 'text-emerald-300',
        sidebar: 'bg-emerald-950/60 border-r border-emerald-900/50 text-emerald-200',
        sidebarActive: 'bg-emerald-900/50 text-emerald-100 border-l-4 border-emerald-400',
        sidebarHover: 'hover:bg-emerald-900/20 text-emerald-300',
        cardHeader: 'border-b border-emerald-800/30 bg-emerald-950/20',
      };
    case 'ocean':
      return {
        bgOverlay: 'bg-sky-950/20',
        card: 'bg-sky-950/40 border border-sky-800/50 shadow-xl backdrop-blur-lg text-sky-50',
        textMuted: 'text-sky-300/80',
        input: 'bg-sky-950/60 border-sky-800 text-sky-100 placeholder-sky-500 focus:ring-sky-400 focus:border-sky-400',
        buttonPrimary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm',
        accent: 'text-sky-300',
        sidebar: 'bg-sky-950/60 border-r border-sky-900/50 text-sky-200',
        sidebarActive: 'bg-sky-900/50 text-sky-100 border-l-4 border-sky-400',
        sidebarHover: 'hover:bg-sky-900/20 text-sky-300',
        cardHeader: 'border-b border-sky-800/30 bg-sky-950/20',
      };
    case 'purple':
      return {
        bgOverlay: 'bg-violet-950/20',
        card: 'bg-violet-950/40 border border-violet-800/50 shadow-xl backdrop-blur-lg text-violet-50',
        textMuted: 'text-violet-300/80',
        input: 'bg-violet-950/60 border-violet-800 text-violet-100 placeholder-violet-500 focus:ring-violet-400 focus:border-violet-400',
        buttonPrimary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-sm',
        accent: 'text-violet-300',
        sidebar: 'bg-violet-950/60 border-r border-violet-900/50 text-violet-200',
        sidebarActive: 'bg-violet-900/50 text-violet-100 border-l-4 border-violet-400',
        sidebarHover: 'hover:bg-violet-900/20 text-violet-300',
        cardHeader: 'border-b border-violet-800/30 bg-violet-950/20',
      };
    case 'sunset':
      return {
        bgOverlay: 'bg-orange-950/20',
        card: 'bg-orange-950/40 border border-orange-800/50 shadow-xl backdrop-blur-lg text-orange-50',
        textMuted: 'text-orange-300/80',
        input: 'bg-orange-950/60 border-orange-800 text-orange-100 placeholder-orange-500 focus:ring-orange-400 focus:border-orange-400',
        buttonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm',
        accent: 'text-orange-300',
        sidebar: 'bg-orange-950/60 border-r border-orange-900/50 text-orange-200',
        sidebarActive: 'bg-orange-900/50 text-orange-100 border-l-4 border-orange-400',
        sidebarHover: 'hover:bg-orange-900/20 text-orange-300',
        cardHeader: 'border-b border-orange-800/30 bg-orange-950/20',
      };
    case 'aurora':
      return {
        bgOverlay: 'bg-teal-950/20',
        card: 'bg-teal-950/40 border border-teal-800/50 shadow-xl backdrop-blur-lg text-teal-50',
        textMuted: 'text-teal-300/80',
        input: 'bg-teal-950/60 border-teal-800 text-teal-100 placeholder-teal-500 focus:ring-teal-400 focus:border-teal-400',
        buttonPrimary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm',
        accent: 'text-teal-300',
        sidebar: 'bg-teal-950/60 border-r border-teal-900/50 text-teal-200',
        sidebarActive: 'bg-teal-900/50 text-teal-100 border-l-4 border-teal-400',
        sidebarHover: 'hover:bg-teal-900/20 text-teal-300',
        cardHeader: 'border-b border-teal-800/30 bg-teal-950/20',
      };
    case 'galaxy':
      return {
        bgOverlay: 'bg-indigo-950/30',
        card: 'bg-indigo-950/50 border border-indigo-800/50 shadow-xl backdrop-blur-lg text-indigo-50',
        textMuted: 'text-indigo-300/80',
        input: 'bg-indigo-950/70 border-indigo-800 text-indigo-100 placeholder-indigo-500 focus:ring-indigo-400 focus:border-indigo-400',
        buttonPrimary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm',
        accent: 'text-indigo-300',
        sidebar: 'bg-indigo-950/70 border-r border-indigo-900/50 text-indigo-200',
        sidebarActive: 'bg-indigo-900/60 text-indigo-100 border-l-4 border-indigo-400',
        sidebarHover: 'hover:bg-indigo-900/30 text-indigo-300',
        cardHeader: 'border-b border-indigo-800/30 bg-indigo-950/30',
      };
    case 'cyberpunk':
      return {
        bgOverlay: 'bg-fuchsia-950/25',
        card: 'bg-fuchsia-950/45 border border-fuchsia-800/50 shadow-xl backdrop-blur-lg text-fuchsia-50',
        textMuted: 'text-fuchsia-300/80',
        input: 'bg-fuchsia-950/70 border-fuchsia-800 text-fuchsia-100 placeholder-fuchsia-500 focus:ring-fuchsia-400 focus:border-fuchsia-400',
        buttonPrimary: 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-sm',
        accent: 'text-fuchsia-300',
        sidebar: 'bg-fuchsia-950/70 border-r border-fuchsia-900/50 text-fuchsia-200',
        sidebarActive: 'bg-fuchsia-900/60 text-fuchsia-100 border-l-4 border-fuchsia-400',
        sidebarHover: 'hover:bg-fuchsia-900/30 text-fuchsia-300',
        cardHeader: 'border-b border-fuchsia-800/30 bg-fuchsia-950/30',
      };
    case 'green-nature':
      return {
        bgOverlay: 'bg-lime-950/20',
        card: 'bg-lime-950/40 border border-lime-800/50 shadow-xl backdrop-blur-lg text-lime-50',
        textMuted: 'text-lime-300/80',
        input: 'bg-lime-950/60 border-lime-800 text-lime-100 placeholder-lime-500 focus:ring-lime-400 focus:border-lime-400',
        buttonPrimary: 'bg-lime-600 hover:bg-lime-700 text-white shadow-sm',
        accent: 'text-lime-300',
        sidebar: 'bg-lime-950/60 border-r border-lime-900/50 text-lime-200',
        sidebarActive: 'bg-lime-900/50 text-lime-100 border-l-4 border-lime-400',
        sidebarHover: 'hover:bg-lime-900/20 text-lime-300',
        cardHeader: 'border-b border-lime-800/30 bg-lime-950/20',
      };
    case 'coffee':
      return {
        bgOverlay: 'bg-amber-950/25',
        card: 'bg-amber-950/45 border border-amber-800/50 shadow-xl backdrop-blur-lg text-amber-50',
        textMuted: 'text-amber-300/80',
        input: 'bg-amber-950/70 border-amber-800 text-amber-100 placeholder-amber-500 focus:ring-amber-400 focus:border-amber-400',
        buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
        accent: 'text-amber-300',
        sidebar: 'bg-amber-950/70 border-r border-amber-900/50 text-amber-200',
        sidebarActive: 'bg-amber-900/60 text-amber-100 border-l-4 border-amber-400',
        sidebarHover: 'hover:bg-amber-900/30 text-amber-300',
        cardHeader: 'border-b border-amber-800/30 bg-amber-950/30',
      };
    case 'pink-blossom':
      return {
        bgOverlay: 'bg-pink-950/20',
        card: 'bg-pink-950/40 border border-pink-800/50 shadow-xl backdrop-blur-lg text-pink-50',
        textMuted: 'text-pink-300/80',
        input: 'bg-pink-950/60 border-pink-800 text-pink-100 placeholder-pink-500 focus:ring-pink-400 focus:border-pink-400',
        buttonPrimary: 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm',
        accent: 'text-pink-300',
        sidebar: 'bg-pink-950/60 border-r border-pink-900/50 text-pink-200',
        sidebarActive: 'bg-pink-900/50 text-pink-100 border-l-4 border-pink-400',
        sidebarHover: 'hover:bg-pink-900/20 text-pink-300',
        cardHeader: 'border-b border-pink-800/30 bg-pink-950/20',
      };
    case 'minimal':
      return {
        bgOverlay: 'bg-white/15',
        card: 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-none',
        textMuted: 'text-slate-400',
        input: 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-black focus:border-black rounded-none',
        buttonPrimary: 'bg-black hover:bg-zinc-800 text-white rounded-none',
        accent: 'text-black font-semibold',
        sidebar: 'bg-white border-r border-slate-200 text-slate-800 rounded-none',
        sidebarActive: 'bg-slate-100 text-black font-bold border-l-2 border-black',
        sidebarHover: 'hover:bg-slate-50 text-slate-600 rounded-none',
        cardHeader: 'border-b border-slate-100 bg-slate-50',
      };
    case 'black':
      return {
        bgOverlay: 'bg-black/35',
        card: 'bg-black border border-zinc-800 text-zinc-100 shadow-lg',
        textMuted: 'text-zinc-500',
        input: 'bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-zinc-400 focus:border-zinc-400',
        buttonPrimary: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 shadow-md',
        accent: 'text-zinc-300',
        sidebar: 'bg-black border-r border-zinc-800 text-zinc-300',
        sidebarActive: 'bg-zinc-900 text-zinc-100 border-l-4 border-zinc-400',
        sidebarHover: 'hover:bg-zinc-900 text-zinc-400',
        cardHeader: 'border-b border-zinc-900 bg-zinc-950',
      };
    case 'glass':
    default:
      return {
        bgOverlay: 'bg-black/20',
        card: 'bg-black/35 border border-white/10 shadow-2xl backdrop-blur-xl text-white',
        textMuted: 'text-slate-300',
        input: 'bg-black/30 border-white/10 text-white placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500',
        buttonPrimary: 'bg-emerald-500/85 hover:bg-emerald-600 text-white shadow-md shadow-emerald-950/20',
        accent: 'text-emerald-400',
        sidebar: 'bg-black/40 border-r border-white/5 text-slate-200 backdrop-blur-xl',
        sidebarActive: 'bg-white/10 text-white border-l-4 border-emerald-400',
        sidebarHover: 'hover:bg-white/5 text-slate-300',
        cardHeader: 'border-b border-white/5 bg-white/2',
      };
  }
};

export const getThemeBackgroundStyle = (user: any | null, defaultBgUrl: string): CSSProperties => {
  if (user?.customBackgroundImage) {
    return {
      backgroundImage: `url(${user.customBackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  }

  const theme = user?.themePreference || 'glass';
  switch (theme) {
    case 'dark':
      return { background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', backgroundAttachment: 'fixed' };
    case 'light':
      return { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', backgroundAttachment: 'fixed' };
    case 'ocean':
      return { background: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #020617 100%)', backgroundAttachment: 'fixed' };
    case 'forest':
      return { background: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #020617 100%)', backgroundAttachment: 'fixed' };
    case 'sunset':
      return { background: 'linear-gradient(135deg, #7c2d12 0%, #431407 50%, #1e1b4b 100%)', backgroundAttachment: 'fixed' };
    case 'aurora':
      return { background: 'linear-gradient(135deg, #134e4a 0%, #312e81 50%, #064e3b 100%)', backgroundAttachment: 'fixed' };
    case 'galaxy':
      return { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #020617 100%)', backgroundAttachment: 'fixed' };
    case 'minimal':
      return { background: '#ffffff', backgroundAttachment: 'fixed' };
    case 'cyberpunk':
      return { background: 'linear-gradient(135deg, #4a044e 0%, #1e1b4b 50%, #020617 100%)', backgroundAttachment: 'fixed' };
    case 'purple':
      return { background: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 50%, #0f172a 100%)', backgroundAttachment: 'fixed' };
    case 'green-nature':
      return { background: 'linear-gradient(135deg, #1a2e05 0%, #14532d 50%, #022c22 100%)', backgroundAttachment: 'fixed' };
    case 'coffee':
      return { background: 'linear-gradient(135deg, #451a03 0%, #291304 50%, #0c0a09 100%)', backgroundAttachment: 'fixed' };
    case 'pink-blossom':
      return { background: 'linear-gradient(135deg, #500724 0%, #3b0764 50%, #0f172a 100%)', backgroundAttachment: 'fixed' };
    case 'black':
      return { background: '#000000', backgroundAttachment: 'fixed' };
    case 'glass':
    default:
      return {
        backgroundImage: `url(${defaultBgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
  }
};
