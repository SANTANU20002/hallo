import express from 'express';
import nodemailer from 'nodemailer';

import checkSession from '../middleware/checkSession.js';

const router = express.Router();

export default function contactRoutes(db) {
  // ✅ GET all contacts for current session user
  router.get('/contacts', checkSession, async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM contactslist WHERE user_id = ?', [req.session.user.id]);
      res.json(rows);
    } catch (err) {
      console.error('❌ Failed to fetch contacts:', err);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // ✅ POST to add a contact
  router.post('/contacts', checkSession, async (req, res) => {
    const { name, email } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO contactslist (user_id, name, email) VALUES (?, ?, ?)',
        [req.session.user.id, name, email]
      );

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
          subject: 'You’re Invited to Join Hallo Live Chat!',
          html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f3ff; padding: 40px;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
                      
                      <div style="background-color: #d9c9ff; padding: 30px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #442ec1ff;">🎉 You’re Invited!</h1>
                        <p style="margin: 10px 0 0; font-size: 18px; color: #3f2e82;">Join Hallo Live Chat</p>
                      </div>
                      
                      <div style="padding: 30px 40px;">
                        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; color: #444;">
                          You have been invited to join <strong>Hallo Live Chat</strong> — a modern, secure, and fun chat experience built just for you.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="#" target="_blank" style="background-color: #442ec1ff; color: #fff; padding: 14px 28px; font-size: 16px; border-radius: 8px; text-decoration: none; display: inline-block;">
                            Join Now
                          </a>
                        </div>

                        <p style="font-size: 14px; color: #888; text-align: center;">
                          If you did not request this invitation, you can safely ignore this email.
                        </p>

                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

                        <p style="font-size: 14px; color: #555;">Looking forward to chatting with you,<br><strong>– The Hallo Team</strong></p>
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
      res.status(201).json({ id: result.insertId, name, email });
    } catch (err) {
      console.error('❌ Failed to add contact:', err);
      res.status(500).json({ error: 'Failed to add contact' });
    }
  });

  return router;
}
