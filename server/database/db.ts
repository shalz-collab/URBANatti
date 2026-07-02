import fs from 'fs';
import path from 'path';

// Define DB file path
const DB_FILE = path.join(process.cwd(), 'server-db.json');

// Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  username: string;
  phone: string;
  bio: string;
  occupation: string;
  joinDate: string;
  roomNumber: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  role: 'admin' | 'member';
  adminVote?: string;
  adminVotesCount?: number;
  status: 'online' | 'offline';
  avatarUrl: string;
  coverUrl: string;
  themePreference: string;
  accentColor: string;
  customBackgroundImage?: string;
  points: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // User IDs
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  frequency: 'Every Week' | 'Every 2 Weeks' | 'Monthly' | 'Custom';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string; // e.g. "30 mins", "1 hour"
  color: string; // Tailwind color class or hex
}

export interface Schedule {
  id: string;
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  teamId: string;
  choreId: string;
  status: 'Pending' | 'Completed' | 'Incomplete';
  completionTime?: string;
  comments?: string;
  photoProof?: string; // base64 or path
  completedAt?: string;
}

export interface GalleryPhoto {
  id: string;
  userId: string;
  albumName: string;
  photoUrl: string;
  title: string;
  uploadedAt: string;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific user id
  title: string;
  message: string;
  type: 'info' | 'chore' | 'gallery' | 'chat' | 'announcement';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string; // 'group' or user id
  message: string;
  imageUrl?: string;
  fileUrl?: string;
  isGroup: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: 'chore' | 'announcement' | 'reward' | 'info';
  title: string;
  description: string;
  completedBy: string;
  completedAt: string;
  status: 'completed' | 'deleted';
  category?: string;
}

export interface DBState {
  users: User[];
  teams: Team[];
  chores: Chore[];
  schedules: Schedule[];
  gallery: GalleryPhoto[];
  albums: Album[];
  notifications: Notification[];
  announcements: Announcement[];
  chatMessages: ChatMessage[];
  history: HistoryItem[];
}

// Initial seed data
const getInitialState = (): DBState => {
  const users: User[] = [
    {
      id: 'user-shalzz-admin',
      email: 'hemapriyaachandran06@gmail.com',
      passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
      name: 'Shalzz',
      username: 'shalzz',
      phone: '+91 8220911995',
      bio: 'House Owner & Admin. Welcome to our shared apartment!',
      occupation: 'Software Engineer',
      joinDate: '2026-07-01',
      roomNumber: 'H-1109',
      socialLinks: {},
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
      role: 'admin',
      status: 'online',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shalzz',
      coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      themePreference: 'glass',
      accentColor: '#10b981',
      points: 100,
    },
  ];

  const teams: Team[] = [];
  const chores: Chore[] = [];
  const schedules: Schedule[] = [];
  const gallery: GalleryPhoto[] = [];
  const albums: Album[] = [];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'all',
      title: 'Welcome to adengappa 7 peru',
      message: 'Explore your new apartment dashboard and manage chores effortlessly!',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const announcements: Announcement[] = [];
  const chatMessages: ChatMessage[] = [];
  const history: HistoryItem[] = [];

  return {
    users,
    teams,
    chores,
    schedules,
    gallery,
    albums,
    notifications,
    announcements,
    chatMessages,
    history,
  };
};


class DB {
  private data: DBState;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading DB file, resetting to initial state', e);
        this.data = getInitialState();
        this.save();
      }
    } else {
      this.data = getInitialState();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB file', e);
    }
  }

  // Getters
  getUsers(): User[] {
    return this.data.users;
  }

  getTeams(): Team[] {
    return this.data.teams;
  }

  getChores(): Chore[] {
    return this.data.chores;
  }

  getSchedules(): Schedule[] {
    return this.data.schedules;
  }

  getGallery(): GalleryPhoto[] {
    return this.data.gallery;
  }

  getAlbums(): Album[] {
    return this.data.albums;
  }

  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  getChatMessages(): ChatMessage[] {
    return this.data.chatMessages;
  }

  getHistory(): HistoryItem[] {
    return this.data.history || [];
  }

  // Users
  addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  deleteUser(id: string) {
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.data.teams = this.data.teams
      .map((t) => ({ ...t, members: t.members.filter((m) => m !== id) }))
      .filter((t) => t.members.length > 0);
    const validTeamIds = new Set(this.data.teams.map((t) => t.id));
    this.data.schedules = this.data.schedules.filter((s) => validTeamIds.has(s.teamId));
    
    // Clean up associated user records to prevent orphaned references
    this.data.gallery = this.data.gallery.filter((g) => g.userId !== id);
    this.data.albums = this.data.albums.filter((a) => a.userId !== id);
    this.data.announcements = this.data.announcements.filter((a) => a.authorId !== id);
    this.data.chatMessages = this.data.chatMessages.filter((c) => c.senderId !== id);
    this.data.notifications = this.data.notifications.filter((n) => n.userId !== id);
    if (this.data.history) {
      this.data.history = this.data.history.filter((h) => h.completedBy !== id && !h.completedBy.includes(id));
    }
    this.data.users = this.data.users.map((u) => u.adminVote === id ? { ...u, adminVote: undefined } : u);
    
    this.save();
  }

  // Teams
  addTeam(team: Team) {
    this.data.teams.push(team);
    this.save();
  }

  updateTeam(id: string, updates: Partial<Team>) {
    const idx = this.data.teams.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.data.teams[idx] = { ...this.data.teams[idx], ...updates };
      this.save();
      return this.data.teams[idx];
    }
    return null;
  }

  deleteTeam(id: string) {
    this.data.teams = this.data.teams.filter((t) => t.id !== id);
    this.save();
  }

  // Chores
  addChore(chore: Chore) {
    this.data.chores.push(chore);
    this.save();
  }

  updateChore(id: string, updates: Partial<Chore>) {
    const idx = this.data.chores.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.chores[idx] = { ...this.data.chores[idx], ...updates };
      this.save();
      return this.data.chores[idx];
    }
    return null;
  }

  deleteChore(id: string) {
    this.data.chores = this.data.chores.filter((c) => c.id !== id);
    this.data.schedules = this.data.schedules.filter((s) => s.choreId !== id);
    this.save();
  }

  // Schedules
  addSchedule(schedule: Schedule) {
    this.data.schedules.push(schedule);
    this.save();
  }

  updateSchedule(id: string, updates: Partial<Schedule>) {
    const idx = this.data.schedules.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.schedules[idx] = { ...this.data.schedules[idx], ...updates };
      this.save();
      return this.data.schedules[idx];
    }
    return null;
  }

  deleteSchedule(id: string) {
    this.data.schedules = this.data.schedules.filter((s) => s.id !== id);
    this.save();
  }

  // Gallery
  addGalleryPhoto(photo: GalleryPhoto) {
    this.data.gallery.push(photo);
    this.save();
  }

  deleteGalleryPhoto(id: string) {
    this.data.gallery = this.data.gallery.filter((p) => p.id !== id);
    this.save();
  }

  // Albums
  addAlbum(album: Album) {
    this.data.albums.push(album);
    this.save();
  }

  deleteAlbum(id: string) {
    const alb = this.data.albums.find((a) => a.id === id);
    if (alb) {
      this.data.albums = this.data.albums.filter((a) => a.id !== id);
      // Delete photos in album too
      this.data.gallery = this.data.gallery.filter((p) => p.albumName !== alb.name);
      this.save();
    }
  }

  updateAlbum(id: string, newName: string) {
    const idx = this.data.albums.findIndex((a) => a.id === id);
    if (idx !== -1) {
      const oldName = this.data.albums[idx].name;
      this.data.albums[idx].name = newName;
      // Update photos inside this album
      this.data.gallery = this.data.gallery.map((p) => {
        if (p.albumName === oldName) {
          return { ...p, albumName: newName };
        }
        return p;
      });
      this.save();
    }
  }

  // Notifications
  addNotification(notif: Notification) {
    this.data.notifications.unshift(notif); // Prepend so new are first
    this.save();
  }

  markNotificationRead(id: string) {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].read = true;
      this.save();
    }
  }

  markAllNotificationsRead(userId: string) {
    this.data.notifications = this.data.notifications.map((n) => {
      if (n.userId === 'all' || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    this.save();
  }

  // Announcements
  addAnnouncement(ann: Announcement) {
    this.data.announcements.unshift(ann);
    this.save();
  }

  deleteAnnouncement(id: string) {
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    this.save();
  }

  // History
  addHistory(item: HistoryItem) {
    if (!this.data.history) this.data.history = [];
    this.data.history.unshift(item);
    this.save();
  }

  deleteHistory(id: string) {
    if (!this.data.history) return;
    this.data.history = this.data.history.filter((h) => h.id !== id);
    this.save();
  }

  clearHistory() {
    this.data.history = [];
    this.save();
  }

  // Chats
  addChatMessage(msg: ChatMessage) {
    this.data.chatMessages.push(msg);
    this.save();
  }

  // System State Reset
  resetState(usersToKeep: User[]) {
    this.data = {
      users: usersToKeep,
      teams: [],
      chores: [],
      schedules: [],
      gallery: [],
      albums: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: 'all',
          title: 'System Reset Completed',
          message: 'The apartment house data has been completely reset. Welcome to your new clean space!',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
        }
      ],
      announcements: [],
      chatMessages: [],
      history: [],
    };
    this.save();
  }
}

export const db = new DB();
