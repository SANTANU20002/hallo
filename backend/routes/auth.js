import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import bcrypt from 'bcrypt';
import { generateOtp } from '../utils/otp.js';
import nodemailer from 'nodemailer';

const router = express.Router();

export default function (db) {
  router.post('/get-otp', async (req, res) => {
    
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await db.execute(
        'INSERT INTO otps (email, otp, created_at) VALUES (?, ?, ?)',
        [email, otp, expiresAt]
      );
      res.json({ message: 'OTP sent successfully', otp });
      // mail otp send
      let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'santanugiri799@gmail.com',
        pass: 'tbkl vkfc worq aeiv'
      },
      tls: {
      rejectUnauthorized: false
    }
    });

    let mailOptions = {
    from: 'santanugiri799@gmail.com',
    to: email,
    subject: 'Your OTP for Hallo Live Chat Verification',
    html:`
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f3ff; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(136, 106, 228, 0.15); overflow: hidden;">
        <div style="background-color: #d9c9ff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #442ec1ff;">Hallo Live Chat</h2>
          <p style="margin: 5px 0 0; font-size: 16px; color: #3f2e82;">OTP Verification</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #444;">
            Use the One-Time Password (OTP) below to verify your identity and join the Hallo Live Chat:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; background-color: #ede7f6; color: #442ec1ff; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 2px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>2 minutes</strong>.</p>
          <p style="font-size: 14px; color: #888;">
            If you didn't request this, please ignore this email.
          </p>
          <br>
          <p style="font-size: 14px; color: #555;">Thanks,<br><strong>Hallo Live Chat Team</strong></p>
        </div>
      </div>
    </div>
  `
  };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

        } catch (err) {
          res.status(500).json({ error: 'Failed to generate OTP' });
        }
      });

  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
      const [rows] = await db.execute(
        'SELECT * FROM otps WHERE email = ? AND otp = ? AND created_at > NOW() - INTERVAL 5 MINUTE',
        [email, otp]
      );
      if (rows.length > 0) {
        await db.execute('DELETE FROM otps WHERE email = ?', [email]);
        res.json({ message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    } catch (err) {
      res.status(500).json({ error: 'OTP verification failed' });
    }
  });

  // router.post('/register', async (req, res) => {
  //   const { name, email, password } = req.body;
  //   if (!name || !email || !password) {
  //     return res.status(400).json({ error: 'All fields are required' });
  //   }
  //   try {
  //     const hashed = await bcrypt.hash(password, 10);
  //     await db.execute(
  //       'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
  //       [name, email, hashed]
  //     );
  //     res.json({ message: 'User registered successfully' });
  //   } catch (err) {
  //     res.status(500).json({ error: 'Registration failed' });
  //   }
  // });

  router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashed]
    );
    console.log("user info==========",result);
    res.json({ message: 'User registered successfully',id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

  router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ? OR name = ?',
        [emailOrUsername, emailOrUsername]
      );
      if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Incorrect password' });

      req.session.user = { id: user.id, name: user.name, email: user.email };
      res.json({ message: 'Login successful', user: req.session.user });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.get('/check-session', (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: 'Session expired or not logged in' });
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed' });
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  return router;
}
