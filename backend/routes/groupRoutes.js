import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export default function (db) {
  const router = express.Router();

  // Ensure uploads dir exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
      cb(null, filename);
    },
  });

  const upload = multer({ storage });

  // POST: Create group
  router.post('/groups', upload.single('image'), async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, members } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await db.execute(
        'INSERT INTO groups (name, members, image, created_by) VALUES (?, ?, ?, ?)',
        [name, members, imagePath, userId]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // GET: Fetch groups by current user
  router.get('/groups', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const [groups] = await db.execute(
        'SELECT * FROM groups WHERE created_by = ? ORDER BY created_at DESC',
        [userId]
      );
      res.json(groups);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });

  return router;
}
