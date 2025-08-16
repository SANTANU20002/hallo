import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contactslist.js';
import profileRoutes from './routes/profile.js';
import connectDB from './config/db.js';
import groupRoutes from './routes/groupRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup CORS for Express
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

(async () => {
  try {
    const db = await connectDB();
    console.log('✅ Database connected successfully');

    const MySQLStore = mysqlSession(session);
    const sessionStore = new MySQLStore({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hallo',
    });

    const sessionMiddleware = session({
      secret: process.env.SESSION_SECRET || 'your-secret',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    });

    app.use(sessionMiddleware);
    io.engine.use(sessionMiddleware);

    // Routes
    app.use('/api', authRoutes(db));
    app.use('/api', contactRoutes(db));
    app.use('/api', profileRoutes(db));
    app.use('/api', groupRoutes(db));

    app.get('/api/check-session', (req, res) => {
      if (req.session.user) {
        res.json({ user: req.session.user });
      } else {
        res.status(401).json({ error: 'No active session' });
      }
    });

    app.get('/api/data', (req, res) => {
      if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ error: 'Unauthorized: No session user' });
      }
      const userId = req.session.user.id;
      db.query(
        'SELECT id, name, email FROM contactslist WHERE id = ?',
        [userId],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          if (results.length === 0) return res.status(404).json({ error: 'User not found' });
          res.json(results[0]);
        }
      );
    });

    // ⚡ Socket.IO Logic
    const emailToSocketMap = {};

    io.on('connection', (socket) => {
      const userEmail = socket.handshake.auth?.email;

      if (userEmail) {
        emailToSocketMap[userEmail] = socket.id;
        console.log(`✅ Socket connected from user: ${userEmail} (socket ID: ${socket.id})`);
      } else {
        console.log(`⚠️ Unauthenticated socket connected: ${socket.id}`);
      }

      socket.on('register', (email) => {
        emailToSocketMap[email] = socket.id;
        console.log(`📌 Registered ${email} → ${socket.id}`);
      });

      // 📩 Private messaging
      socket.on('private-message', ({ toEmail, message }) => {
        const targetSocketId = emailToSocketMap[toEmail];
        if (targetSocketId) {
          io.to(targetSocketId).emit('message', {
            ...message,
            status: 'delivered',
          });

          const senderSocketId = emailToSocketMap[message.from];
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-delivered', {
              timestamp: message.timestamp,
              status: 'delivered',
            });
          }

          console.log(`📨 Sent message from ${message.from} to ${toEmail}`);
        } else {
          console.log(`❌ Target socket for ${toEmail} not found.`);
        }
      });

      // 📬 Message read status
      socket.on('message-read', ({ toEmail, messageId }) => {
        const targetSocketId = emailToSocketMap[toEmail];
        if (targetSocketId) {
          io.to(targetSocketId).emit('message-status', { messageId, status: 'read' });
        }
      });

      // 📹 WebRTC signaling
      socket.on('call-user', ({ to, from, offer }) => {
        const targetSocketId = emailToSocketMap[to];
        if (targetSocketId) {
          io.to(targetSocketId).emit('incoming-call', { from, offer });
        } else {
          socket.emit('call-failed', { reason: 'User is offline' });
        }
      });

      socket.on('answer-call', ({ to, answer }) => {
        const targetSocketId = emailToSocketMap[to];
        if (targetSocketId) {
          io.to(targetSocketId).emit('call-accepted', { answer });
        }
      });

      socket.on('reject-call', ({ to }) => {
        const targetSocketId = emailToSocketMap[to];
        if (targetSocketId) {
          io.to(targetSocketId).emit('call-rejected', { from: userEmail });
        }
      });

      socket.on('ice-candidate', ({ to, candidate }) => {
        const targetSocketId = emailToSocketMap[to];
        if (targetSocketId) {
          io.to(targetSocketId).emit('ice-candidate', { candidate });
        }
      });

      // ❌ Disconnection
      socket.on('disconnect', () => {
        for (const [email, id] of Object.entries(emailToSocketMap)) {
          if (id === socket.id) {
            delete emailToSocketMap[email];
            console.log(`❌ Disconnected & unregistered: ${email}`);
            break;
          }
        }
        console.log(`⚠️ Socket disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err.message);
  res.status(500).json({ error: 'Internal server error' });
});
