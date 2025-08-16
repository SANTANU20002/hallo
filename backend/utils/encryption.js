import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';

// Ensure secret key is 32 bytes (256 bits) for aes-256
const secretKey = crypto.createHash('sha256').update(process.env.CHAT_SECRET_KEY).digest();

export const encryptMessage = (text) => {
  const iv = crypto.randomBytes(16); // New IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptMessage = (encrypted) => {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
};
