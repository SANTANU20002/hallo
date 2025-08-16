import { io } from 'socket.io-client';

const email = sessionStorage.getItem('email');

const socket = io('http://localhost:5000', {
  auth: { email },
  transports: ['websocket'],
  withCredentials: true,
});
export default socket;