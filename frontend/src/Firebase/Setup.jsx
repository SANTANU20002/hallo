
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCMO9ySSqOeSdSTLX06bh5E27VV1SQhdpY",
  authDomain: "hallo-live-chat.firebaseapp.com",
  projectId: "hallo-live-chat",
  storageBucket: "hallo-live-chat.firebasestorage.app",
  messagingSenderId: "866696752536",
  appId: "1:866696752536:web:a0ad2a0430e3fa335c8fed"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;