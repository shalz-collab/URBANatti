import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, File, CheckCheck, Users, Search, MessageSquare, AlertCircle, X, ChevronLeft, Menu } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatPageProps {
  user: User;
  users: User[];
  chatMessages: ChatMessage[];
  themeClasses: any;
  onSendMessage: (message: string, receiverId: string, isGroup: boolean, imageUrl?: string) => void;
}

export default function ChatPage({ user, users, chatMessages, themeClasses, onSendMessage }: ChatPageProps) {
  const [activeChannel, setActiveChannel] = useState<{ id: string; name: string; isGroup: boolean; avatarUrl?: string }>({
    id: 'group',
    name: 'House Group Chat',
    isGroup: true,
  });

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChannels, setShowMobileChannels] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when virtual keyboard resizes on mobile touch devices
  useEffect(() => {
    const handleResize = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Filter messages for active channel
  const filteredMessages = chatMessages.filter((m) => {
    if (activeChannel.isGroup) {
      return m.isGroup && m.receiverId === 'group';
    } else {
      // Private message
      return (
        !m.isGroup &&
        ((m.senderId === user.id && m.receiverId === activeChannel.id) ||
          (m.senderId === activeChannel.id && m.receiverId === user.id))
      );
    }
  });

  // Scroll to bottom on load or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChannel, isTyping]);

  // Handle message send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !uploadBase64) return;

    onSendMessage(messageText, activeChannel.id, activeChannel.isGroup, uploadBase64 || undefined);
    
    // Reset states
    setMessageText('');
    setUploadBase64(null);
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadBase64(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getSenderDetails = (senderId: string) => {
    return users.find((u) => u.id === senderId);
  };

  return (
    <div className={`rounded-2xl ${themeClasses.card} overflow-hidden border border-white/5 flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[480px] max-h-[750px] md:h-[620px] relative`} style={{ id: 'chat-container-frame' }}>
      {/* Sidebar: Channels & Members (responsive for touch devices) */}
      <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 flex-col bg-slate-900 md:bg-black/10 shrink-0 z-20 ${showMobileChannels ? 'flex absolute inset-0 md:relative md:inset-auto' : 'hidden md:flex'}`}>
        {/* Mobile close channels button */}
        <div className="p-3 border-b border-white/5 flex items-center justify-between md:hidden bg-black/20">
          <span className="font-bold text-xs text-emerald-400 flex items-center gap-2">
            <Users className="w-4 h-4" /> Select Chat Channel
          </span>
          <button
            onClick={() => setShowMobileChannels(false)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>

        {/* Search Roommates */}
        <div className="p-3 border-b border-white/5 relative">
          <Search className="absolute left-6 top-5.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none ${themeClasses.input}`}
          />
        </div>

        {/* Channel/DM List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mb-1">
            House Channels
          </span>
          
          <button
            onClick={() => { setActiveChannel({ id: 'group', name: 'House Group Chat', isGroup: true }); setShowMobileChannels(false); }}
            className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeChannel.id === 'group' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate flex-1">
              <p className="font-bold">Common Room</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">Active Shared Workspace</p>
            </div>
          </button>

          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block mt-4 mb-1">
            Private Roommates
          </span>

          {users
            .filter((u) => u.id !== user.id && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((u) => (
              <button
                key={u.id}
                onClick={() => { setActiveChannel({ id: u.id, name: u.name, isGroup: false, avatarUrl: u.avatarUrl }); setShowMobileChannels(false); }}
                className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeChannel.id === u.id ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-8 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${u.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                </div>
                <div className="truncate flex-1">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate">{u.occupation || 'Roommate'}</p>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/5 min-w-0 h-full">
        {/* Chat Active Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileChannels(true)}
              className="md:hidden p-2 -ml-1 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-400 flex items-center gap-1.5 text-xs font-bold shrink-0 min-w-[44px] min-h-[44px]"
            >
              <Users className="w-4 h-4" />
              <span>Channels</span>
            </button>
            {activeChannel.isGroup ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            ) : (
              <img
                src={activeChannel.avatarUrl}
                alt={activeChannel.name}
                className="w-9 h-9 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h3 className="font-bold text-sm">{activeChannel.name}</h3>
              <p className="text-[10px] text-gray-400 font-medium truncate max-w-[280px] sm:max-w-[450px]">
                {activeChannel.isGroup
                  ? `${users.length + 1} connected: ${[user, ...users].map((u) => u.name).join(', ')}`
                  : 'Encrypted Private DM'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Message Scroll list optimized for touch devices */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain [webkit-overflow-scrolling:touch] touch-pan-y">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-gray-400">
              <MessageSquare className="w-10 h-10 text-gray-500 mb-2" />
              <span>No messages in this chat. Say hello to start the conversation!</span>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const sender = getSenderDetails(msg.senderId);
              const isMe = msg.senderId === user.id;

              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <img
                      src={sender?.avatarUrl}
                      alt={sender?.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="space-y-1">
                    {!isMe && (
                      <span className="text-[10px] font-bold text-gray-400 block px-1">
                        {sender?.name}
                      </span>
                    )}
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-emerald-500/85 text-white rounded-tr-none' : 'bg-white/10 text-slate-100 rounded-tl-none'}`}>
                      {msg.message}
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="attached media"
                          className="mt-2 rounded-lg max-w-xs object-cover border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[9px] text-gray-400 px-1 ${isMe ? 'justify-end' : ''}`}>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="bg-white/5 text-gray-400 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attached preview */}
        {uploadBase64 && (
          <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40">
              <img src={uploadBase64} alt="Attached Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setUploadBase64(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full transition"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-[10px] text-gray-400">Attached Image Ready to Send</span>
          </div>
        )}

        {/* Send Input Panel optimized for touch and virtual keyboard */}
        <form onSubmit={handleSend} className="p-3 bg-black/20 backdrop-blur-md border-t border-white/5 flex gap-2 items-center shrink-0 sticky bottom-0 z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageAttach}
            className="hidden"
            id="chat-image-uploader"
          />
          <label
            htmlFor="chat-image-uploader"
            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]"
            title="Attach image"
          >
            <Image className="w-5 h-5" />
          </label>

          <input
            type="text"
            placeholder={`Message ${activeChannel.name}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-[16px] sm:text-xs focus:outline-none ${themeClasses.input}`}
          />

          <button
            type="submit"
            className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
