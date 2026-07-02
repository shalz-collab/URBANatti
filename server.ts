import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, User, Team, Chore, Schedule, GalleryPhoto, Album, Notification, Announcement, ChatMessage } from './server/database/db';
import { hashPassword, generateToken, verifyToken } from './server/utils/auth';
import { generateSchedulesForWeek, generateFutureSchedules } from './server/services/scheduler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers - allow large limits for gallery uploads via base64
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper middleware for auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();
  };

  // Helper to dynamically calculate elected admin based on roommate votes
  const getElectedAdminId = (usersList: any[]): string | null => {
    const votes: Record<string, number> = {};
    let maxVotes = 0;
    let electedId: string | null = null;

    for (const u of usersList) {
      if (u.adminVote) {
        votes[u.adminVote] = (votes[u.adminVote] || 0) + 1;
      }
    }

    for (const userId in votes) {
      if (votes[userId] > maxVotes) {
        maxVotes = votes[userId];
        electedId = userId;
      }
    }

    return electedId;
  };

  const getEnrichedUsers = () => {
    const rawUsers = db.getUsers();
    const electedAdminId = getElectedAdminId(rawUsers);
    
    // Count votes for everyone
    const voteCounts: Record<string, number> = {};
    for (const u of rawUsers) {
      if (u.adminVote) {
        voteCounts[u.adminVote] = (voteCounts[u.adminVote] || 0) + 1;
      }
    }

    return rawUsers.map((u, idx) => {
      const { passwordHash, ...rest } = u;
      const isOwner = u.username?.toLowerCase().includes('shalz') || u.name?.toLowerCase().includes('shalz') || u.email?.toLowerCase().includes('hemapriya') || idx === 0 || u.role === 'admin';
      const isAdmin = (electedAdminId && u.id === electedAdminId) || isOwner;
      return {
        ...rest,
        role: isAdmin ? ('admin' as const) : ('member' as const),
        adminVotesCount: voteCounts[u.id] || 0,
      };
    });
  };

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    let { email, password, name, username, role, roomNumber, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and Full Name are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let cleanUsername = username ? username.trim().toLowerCase() : '';
    if (!cleanUsername) {
      cleanUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    }

    const users = db.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ error: 'An account with this email or username already exists' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      name: name.trim(),
      username: cleanUsername,
      phone: phone ? phone.trim() : '',
      bio: 'New roommate here!',
      occupation: '',
      joinDate: new Date().toISOString().split('T')[0],
      roomNumber: roomNumber ? roomNumber.trim() : 'Unassigned',
      socialLinks: {},
      emergencyContact: { name: '', phone: '', relation: '' },
      role: role || 'member',
      status: 'online',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      themePreference: 'glass',
      accentColor: '#10b981',
      points: 0,
    };

    db.addUser(newUser);
    const enriched = getEnrichedUsers();
    const registeredEnriched = enriched.find((u) => u.id === newUser.id) || newUser;
    const token = generateToken({ id: newUser.id, email: newUser.email, role: registeredEnriched.role });

    // Send notifications
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'New Member Joined',
      message: `${name} (${newUser.roomNumber}) has joined adengappa 7 peru! Welcome them to the house.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ user: registeredEnriched, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const cleanInput = email.trim().toLowerCase();
    const users = db.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(400).json({ error: 'Invalid email/username or password' });
    }

    // Set online
    db.updateUser(user.id, { status: 'online' });

    const enriched = getEnrichedUsers();
    const loggedInEnriched = enriched.find((u) => u.id === user.id) || user;

    const token = generateToken({ id: user.id, email: user.email, role: loggedInEnriched.role });
    res.json({ user: loggedInEnriched, token });
  });

  app.all('/api/auth/me', authenticateToken, (req: any, res) => {
    const enriched = getEnrichedUsers();
    const user = enriched.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });

  // Users / Roommates Directory
  app.get('/api/users', authenticateToken, (req, res) => {
    res.json(getEnrichedUsers());
  });

  // Vote for House Admin
  app.post('/api/users/vote', authenticateToken, (req: any, res) => {
    const { voteForId } = req.body;
    const voterId = req.user.id;

    if (!voteForId) {
      return res.status(400).json({ error: 'voteForId is required' });
    }

    // Verify target user exists
    const rawUsers = db.getUsers();
    const target = rawUsers.find((u) => u.id === voteForId);
    if (!target) {
      return res.status(404).json({ error: 'Roommate to vote for was not found' });
    }

    // Save vote
    db.updateUser(voterId, { adminVote: voteForId });

    // Retrieve enriched users to return updated state
    const enriched = getEnrichedUsers();
    const updatedUser = enriched.find((u) => u.id === voterId);

    // Send a real-time notification about the vote
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: '🗳️ House Admin Vote Cast',
      message: `A roommate cast their vote for ${target.name} to be the House Admin! Check the Roommate Directory to see the latest standings.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, user: updatedUser, users: enriched });
  });

  app.put('/api/users/:id', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    
    // Authorization: any logged-in roommate can update profile details
    const updates = req.body;
    
    if (updates.password) {
      updates.passwordHash = hashPassword(updates.password);
      delete updates.password;
    }

    const updated = db.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const enriched = getEnrichedUsers();
    const updatedEnriched = enriched.find((u) => u.id === id);

    res.json({ user: updatedEnriched });
  });

  app.delete('/api/users/:id', authenticateToken, (req: any, res) => {
    const requesterId = req.user?.id;
    const targetId = req.params.id;
    const enriched = getEnrichedUsers();
    const requester = enriched.find((u) => u.id === requesterId);

    const isSelf = requesterId === targetId;
    const isOwnerAdmin =
      requester?.role === 'admin' ||
      req.user?.role === 'admin' ||
      requester?.username?.toLowerCase().includes('shalz') ||
      req.user?.username?.toLowerCase().includes('shalz') ||
      requester?.name?.toLowerCase().includes('shalz') ||
      req.user?.name?.toLowerCase().includes('shalz') ||
      requester?.email?.toLowerCase().includes('hemapriya') ||
      req.user?.email?.toLowerCase().includes('hemapriya');

    if (!isSelf && !isOwnerAdmin) {
      return res.status(403).json({ error: 'Only the House Owner/Admin can delete other roommate profiles.' });
    }

    db.deleteUser(targetId);
    res.json({ success: true });
  });

  // Teams API
  app.get('/api/teams', authenticateToken, (req, res) => {
    res.json(db.getTeams());
  });

  app.post('/api/teams', authenticateToken, (req: any, res) => {
    const { name, members } = req.body;
    if (!name || !members || members.length !== 2) {
      return res.status(400).json({ error: 'Teams must have exactly two members' });
    }
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      members,
    };
    db.addTeam(newTeam);
    res.status(201).json(newTeam);
  });

  app.put('/api/teams/:id', authenticateToken, (req: any, res) => {
    const updated = db.updateTeam(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Team not found' });
    res.json(updated);
  });

  app.delete('/api/teams/:id', authenticateToken, (req: any, res) => {
    db.deleteTeam(req.params.id);
    res.json({ success: true });
  });

  // Chores API
  app.get('/api/chores', authenticateToken, (req, res) => {
    res.json(db.getChores());
  });

  app.post('/api/chores', authenticateToken, (req: any, res) => {
    const { title, description, frequency, priority, estimatedTime, color } = req.body;
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      title,
      description,
      frequency,
      priority,
      estimatedTime,
      color: color || 'indigo',
    };
    db.addChore(newChore);

    // Announce new chore via global notifications
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'New Chore Published',
      message: `A new chore "${title}" has been published. Frequency: ${frequency}, Priority: ${priority}.`,
      type: 'chore',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newChore);
  });

  app.put('/api/chores/:id', authenticateToken, (req: any, res) => {
    const updated = db.updateChore(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Chore not found' });
    res.json(updated);
  });

  app.delete('/api/chores/:id', authenticateToken, (req: any, res) => {
    const chore = db.getChores().find((c) => c.id === req.params.id);
    if (chore) {
      db.addHistory({
        id: `hist-${Date.now()}`,
        type: 'chore',
        title: chore.title,
        description: chore.description || `Frequency: ${chore.frequency}`,
        completedBy: req.user?.email || 'Roommate',
        completedAt: new Date().toISOString(),
        status: 'deleted',
        category: chore.frequency,
      });
    }
    db.deleteChore(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/chores/:id/complete', authenticateToken, (req: any, res) => {
    const chore = db.getChores().find((c) => c.id === req.params.id);
    if (!chore) return res.status(404).json({ error: 'Chore not found' });

    const { completedBy, comments, photoProof } = req.body;
    const completionName = completedBy || req.user?.name || req.user?.email || 'Roommate';

    db.addHistory({
      id: `hist-${Date.now()}`,
      type: 'chore',
      title: chore.title,
      description: comments || `Completed via Mark Complete Module`,
      completedBy: completionName,
      completedAt: new Date().toISOString(),
      status: 'completed',
      category: chore.frequency,
    });

    // Reward points to user who completed it if matching name/email
    const users = db.getUsers();
    const userMatch = users.find((u) => u.name?.toLowerCase() === completionName?.toLowerCase() || u.email?.toLowerCase() === req.user?.email?.toLowerCase());
    if (userMatch) {
      db.updateUser(userMatch.id, { points: (userMatch.points || 0) + 15 });
    }

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'Chore Completed',
      message: `"${chore.title}" was completed by ${completionName}! +15 reward points earned.`,
      type: 'chore',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      link: '/history',
    });

    res.json({ success: true, message: 'Chore completed successfully' });
  });

  // Rewards API - Anyone can assign points/rewards to anyone
  app.post('/api/rewards/award', authenticateToken, (req: any, res) => {
    const { recipientId, points = 10, title, awardedBy, remarks } = req.body;
    const users = db.getUsers();
    const recipient = users.find((u) => u.id === recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient roommate not found' });
    }

    const ptsNum = Number(points) || 10;
    const assignerName = awardedBy || req.user?.name || req.user?.email || 'Roommate';
    const rewardTitle = title || 'Household Achievement Reward';

    db.updateUser(recipient.id, { points: (recipient.points || 0) + ptsNum });

    db.addHistory({
      id: `hist-${Date.now()}`,
      type: 'info',
      title: `Reward Awarded: ${rewardTitle}`,
      description: `${recipient.name} was awarded +${ptsNum} pts by ${assignerName}! ${remarks ? `Note: "${remarks}"` : ''}`,
      completedBy: assignerName,
      completedAt: new Date().toISOString(),
      status: 'completed',
      category: 'reward',
    });

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'Reward Points Awarded!',
      message: `${recipient.name} just earned +${ptsNum} pts for "${rewardTitle}", awarded by ${assignerName}!`,
      type: 'info',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      link: '/rewards',
    });

    res.json({ success: true, message: `Successfully awarded +${ptsNum} points to ${recipient.name}!` });
  });

  // Schedules API
  app.get('/api/schedules', authenticateToken, (req, res) => {
    res.json(db.getSchedules());
  });

  app.post('/api/schedules/generate', authenticateToken, (req: any, res) => {
    const { count } = req.body; // e.g. 1, 4, 52
    const generated = generateFutureSchedules(count || 1);
    res.json(generated);
  });

  app.put('/api/schedules/:id', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, comments, photoProof } = req.body;

    const schedules = db.getSchedules();
    const sched = schedules.find((s) => s.id === id);
    if (!sched) return res.status(404).json({ error: 'Schedule item not found' });

    // Allow any roommate to update the schedule
    const teams = db.getTeams();
    const team = teams.find((t) => t.id === sched.teamId);

    const updates: Partial<Schedule> = { status };
    if (status === 'Completed') {
      updates.completedAt = new Date().toISOString();
      updates.comments = comments || 'Task completed!';
      updates.photoProof = photoProof || '';
      updates.completionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const chore = db.getChores().find((c) => c.id === sched.choreId);
      db.addHistory({
        id: `hist-${Date.now()}`,
        type: 'chore',
        title: chore?.title || 'Chore Task Completed',
        description: comments || `Completed by Team ${team?.name || 'Assigned Roommates'}`,
        completedBy: team?.name || req.user?.email || 'Roommate',
        completedAt: new Date().toISOString(),
        status: 'completed',
        category: chore?.frequency || 'Weekly',
      });

      // Reward points to team members!
      if (team) {
        team.members.forEach((memberId) => {
          const m = db.getUsers().find((u) => u.id === memberId);
          if (m) {
            db.updateUser(memberId, { points: (m.points || 0) + 15 });
          }
        });
      }

      // Notify other roommates
      db.addNotification({
        id: `notif-${Date.now()}`,
        userId: 'all',
        title: 'Chore Completed',
        message: `Team ${team?.name || ''} has completed: ${db.getChores().find((c) => c.id === sched.choreId)?.title || 'Assigned Chore'}.`,
        type: 'chore',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      updates.completedAt = undefined;
      updates.comments = undefined;
      updates.photoProof = undefined;
      updates.completionTime = undefined;
    }

    const updated = db.updateSchedule(id, updates);
    res.json(updated);
  });

  // Gallery Photo & Albums API
  app.get('/api/gallery', authenticateToken, (req, res) => {
    res.json(db.getGallery());
  });

  app.post('/api/gallery', authenticateToken, (req: any, res) => {
    const { photoUrl, title, albumName } = req.body;
    if (!photoUrl || !title || !albumName) {
      return res.status(400).json({ error: 'Photo URL, title and album name are required' });
    }

    const newPhoto: GalleryPhoto = {
      id: `gal-${Date.now()}`,
      userId: req.user.id,
      albumName,
      photoUrl, // Expects Base64 image data or remote URL
      title,
      uploadedAt: new Date().toISOString(),
    };

    db.addGalleryPhoto(newPhoto);

    // Ensure Album exists
    const albums = db.getAlbums();
    if (!albums.some((a) => a.name.toLowerCase() === albumName.toLowerCase() && a.userId === req.user.id)) {
      db.addAlbum({
        id: `alb-${Date.now()}`,
        userId: req.user.id,
        name: albumName,
        createdAt: new Date().toISOString(),
      });
    }

    // Add general notification
    const u = db.getUsers().find((u) => u.id === req.user.id);
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'New Gallery Upload',
      message: `${u?.name || 'A roommate'} uploaded "${title}" to the gallery in album "${albumName}".`,
      type: 'gallery',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newPhoto);
  });

  app.delete('/api/gallery/:id', authenticateToken, (req: any, res) => {
    const photos = db.getGallery();
    const photo = photos.find((p) => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Allow any roommate to delete gallery photos
    db.deleteGalleryPhoto(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/albums', authenticateToken, (req, res) => {
    res.json(db.getAlbums());
  });

  app.post('/api/albums', authenticateToken, (req: any, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Album name is required' });

    const newAlbum: Album = {
      id: `alb-${Date.now()}`,
      userId: req.user.id,
      name,
      createdAt: new Date().toISOString(),
    };
    db.addAlbum(newAlbum);
    res.status(201).json(newAlbum);
  });

  app.put('/api/albums/:id', authenticateToken, (req: any, res) => {
    const { name } = req.body;
    db.updateAlbum(req.params.id, name);
    res.json({ success: true });
  });

  app.delete('/api/albums/:id', authenticateToken, (req: any, res) => {
    db.deleteAlbum(req.params.id);
    res.json({ success: true });
  });

  // Announcements API
  app.get('/api/announcements', authenticateToken, (req, res) => {
    res.json(db.getAnnouncements());
  });

  app.post('/api/announcements', authenticateToken, (req: any, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
    };

    db.addAnnouncement(newAnn);

    // Notify all members
    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: 'New Announcement',
      message: `${title}`,
      type: 'announcement',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newAnn);
  });

  app.delete('/api/announcements/:id', authenticateToken, (req: any, res) => {
    const ann = db.getAnnouncements().find((a) => a.id === req.params.id);
    if (ann) {
      db.addHistory({
        id: `hist-${Date.now()}`,
        type: 'announcement',
        title: ann.title,
        description: ann.content,
        completedBy: req.user?.email || 'Roommate',
        completedAt: new Date().toISOString(),
        status: 'deleted',
        category: 'Notice',
      });
    }
    db.deleteAnnouncement(req.params.id);
    res.json({ success: true });
  });

  // History API
  app.get('/api/history', authenticateToken, (req, res) => {
    res.json(db.getHistory());
  });

  app.delete('/api/history/:id', authenticateToken, (req: any, res) => {
    db.deleteHistory(req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/history', authenticateToken, (req: any, res) => {
    db.clearHistory();
    res.json({ success: true });
  });

  // Notifications API
  app.get('/api/notifications', authenticateToken, (req: any, res) => {
    const all = db.getNotifications();
    const filtered = all.filter((n) => n.userId === 'all' || n.userId === req.user.id);
    res.json(filtered);
  });

  app.post('/api/notifications/read', authenticateToken, (req: any, res) => {
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  });

  // Chat API
  app.get('/api/chats', authenticateToken, (req: any, res) => {
    const messages = db.getChatMessages();
    // Filter messages for group or the specific private user chat
    const filtered = messages.filter(
      (m) =>
        m.receiverId === 'group' ||
        m.senderId === req.user.id ||
        m.receiverId === req.user.id
    );
    res.json(filtered);
  });

  app.post('/api/chats', authenticateToken, (req: any, res) => {
    const { message, receiverId, imageUrl, fileUrl, isGroup } = req.body;
    if (!message && !imageUrl && !fileUrl) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: req.user.id,
      receiverId: receiverId || 'group',
      message: message || '',
      imageUrl,
      fileUrl,
      isGroup: isGroup !== false,
      createdAt: new Date().toISOString(),
    };

    db.addChatMessage(newMsg);
    res.status(201).json(newMsg);
  });

  // Analytics API
  app.get('/api/analytics', authenticateToken, (req, res) => {
    const users = db.getUsers();
    const schedules = db.getSchedules();
    const chores = db.getChores();
    const teams = db.getTeams();

    // Leaderboard
    const leaderboard = [...users]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .map((u) => ({ id: u.id, name: u.name, points: u.points, avatarUrl: u.avatarUrl }));

    // Task Completion Rate
    const totalSchedules = schedules.length;
    const completedSchedules = schedules.filter((s) => s.status === 'Completed').length;
    const pendingSchedules = schedules.filter((s) => s.status === 'Pending').length;
    const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 100;

    // Chore completion stats
    const choreStats = chores.map((c) => {
      const choreScheds = schedules.filter((s) => s.choreId === c.id);
      const total = choreScheds.length;
      const done = choreScheds.filter((s) => s.status === 'Completed').length;
      return {
        choreId: c.id,
        title: c.title,
        total,
        completed: done,
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    res.json({
      leaderboard,
      completionRate,
      completedSchedules,
      pendingSchedules,
      totalSchedules,
      choreStats,
    });
  });

  // Reset system database state (Any roommate can perform a factory reset)
  app.post('/api/admin/reset', authenticateToken, (req: any, res) => {
    const currentUserId = req.user.id;
    const users = db.getUsers();
    const currentUser = users.find((u) => u.id === currentUserId);
    
    // Reset DB state, keeping only the current user
    db.resetState(currentUser ? [currentUser] : []);

    res.json({ success: true });
  });

  // Global error handler to prevent returning HTML on backend errors
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message || 'An unexpected server error occurred' });
  });

  // Ensure unmatched API routes never return HTML SPA fallback
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // Serve static UI assets and handle dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
