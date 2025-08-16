import { randomBytes } from 'crypto';

const generateSecretKey = () => {
  return randomBytes(32).toString('hex'); // Generates a 64-character hex string
};

console.log('Generated Secret Key:', generateSecretKey());