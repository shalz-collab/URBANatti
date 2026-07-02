export interface User {
  id: string;
  email: string;
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
  adminVote?: string; // ID of the roommate they voted for as Admin
  adminVotesCount?: number; // Total admin votes received
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
  estimatedTime: string;
  color: string;
}

export interface Schedule {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  teamId: string;
  choreId: string;
  status: 'Pending' | 'Completed' | 'Incomplete' | 'Overdue';
  completionTime?: string;
  comments?: string;
  photoProof?: string;
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
  userId: string;
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
  receiverId: string;
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

