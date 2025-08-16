import express from 'express';
import { encryptMessage, decryptMessage } from '../utils/encryption.js';

const router = express.Router();

export default (db) => {
  router.post('/messages', (req, res) => {
    const { from, to, text } = req.body;
    console.log("bgggsgsgsg=========",req.body);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Empty message' });
    }

    try {
      const encrypted = encryptMessage(text);
      const timestamp = new Date();

      const query = `
        INSERT INTO messages (sender_email, receiver_email, text, timestamp) 
        VALUES (?, ?, ?, ?)
      `;

      db.query(query, [from, to, encrypted, timestamp], (err) => {
        if (err) {
          console.error('❌ DB Insert Error:', err);
          return res.status(500).json({ error: 'Database error while saving message' });
        }

        res.json({ success: true });
      });
    } catch (err) {
      console.error('❌ Encryption Error:', err.message);
      res.status(500).json({ error: 'Encryption failed' });
    }
  });

  // ✅ GET route to retrieve and decrypt chat history between two users
  router.get('/messages/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;

    const query = `
      SELECT * FROM messages 
      WHERE 
        (sender_email = ? AND receiver_email = ?) 
        OR 
        (sender_email = ? AND receiver_email = ?)
      ORDER BY timestamp ASC
    `;

    db.query(query, [user1, user2, user2, user1], (err, results) => {
      if (err) {
        console.error('❌ DB Fetch Error:', err);
        return res.status(500).json({ error: 'Database error while fetching messages' });
      }

      const decryptedMessages = results.map((msg) => ({
        from: msg.sender_email,
        to: msg.receiver_email,
        text: decryptMessage(msg.text),
        timestamp: msg.timestamp,
      }));

      res.json(decryptedMessages);
    });
  });

  return router;
};
