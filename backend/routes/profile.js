import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export default function (db) {
  const router = express.Router();

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    },
  });

  const upload = multer({ storage });

  // POST: Upload avatar
  router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const imagePath = `/uploads/${req.file.filename}`;
    try {
      await db.execute('UPDATE users SET avatar = ? WHERE id = ?', [imagePath, userId]);
      res.json({ avatarUrl: imagePath });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET: Load avatar for current user
  router.get('/profile-avatar', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const [rows] = await db.execute('SELECT avatar FROM users WHERE id = ?', [userId]);
      res.json({ avatar: rows[0]?.avatar || '' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });


    // GET: Load avatar for a user by email (used in contact list)
  router.get('/profile-avatar-by-email', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      const [rows] = await db.execute('SELECT avatar FROM users WHERE email = ?', [email]);
      if (rows.length > 0 && rows[0].avatar) {
        res.json({ avatar: rows[0].avatar });
      } else {
        res.json({ avatar: null });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });


  return router;
}
