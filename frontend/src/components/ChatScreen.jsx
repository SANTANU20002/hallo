import React, { useEffect, useState } from 'react';
import './ChatScreen.css';
import ChatscreenHearder from './ChatscreenHearder';
import ChatInput from './ChatInput';
import ChatContainer from './ChatContainer';
import PropTypes from 'prop-types';
import logo from '../assets/logo.png';
// import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';

const SECRET_KEY = '2b2d3ebbc9f36d5488b8b27910ff811df1c39b05e2742cdaddc4ab16c47b59c8';
// const socket = io('http://localhost:5000', { withCredentials: true });

const ChatScreen = ({ contact, email, messages, updateMessages, socket }) => {
  const [localMessages, setLocalMessages] = useState(messages || []);

  useEffect(() => {
    if (email) {
      socket.emit('register', email);
      console.log(`Registered socket with email: ${email}`);
    }
  }, [email, socket]);

  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      const decryptedText = CryptoJS.AES.decrypt(msg.text, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      if (decryptedText) {
        const newMsg = { ...msg, text: decryptedText, status: msg.status || 'delivered' };
        const contactEmail = msg.from === email ? msg.to : msg.from;
        updateMessages(contactEmail, newMsg);
      }
    };

    const handleMessageDelivered = (deliveryInfo) => {
      console.log('Message delivered event:', deliveryInfo); // Debug log
      setLocalMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.timestamp === deliveryInfo.timestamp ? { ...msg, status: deliveryInfo.status } : msg
        );
        return updatedMessages; // Return new array to trigger re-render
      });
    };

    const handleMessageStatus = (statusUpdate) => {
      setLocalMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.timestamp === statusUpdate.messageId ? { ...msg, status: statusUpdate.status } : msg
        );
        return updatedMessages; // Return new array to trigger re-render
      });
    };

    socket.on('message', handleIncomingMessage);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('message-status', handleMessageStatus);

    return () => {
      socket.off('message', handleIncomingMessage);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('message-status', handleMessageStatus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, updateMessages]);

  if (!contact) {
    return (
      <div className="col-md-9 d-flex flex-column justify-content-center align-items-center default_chat_container">
        <img src={logo} alt="logo" />
        <p>Send and receive messages without keeping your phone online.</p>
      </div>
    );
  }

  return (
    <div className="col-md-9 chatscreen p-0">
      <ChatscreenHearder contact={contact} />
      <ChatContainer messages={localMessages} currentUserEmail={email} />
      <ChatInput
        contact={contact}
        updateMessages={updateMessages}
        socket={socket}
        email={email}
      />
    </div>
  );
};

ChatScreen.propTypes = {
  contact: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }),
  email: PropTypes.string,
  messages: PropTypes.array,
  updateMessages: PropTypes.func,
  socket: PropTypes.object.isRequired,
};

export default ChatScreen;