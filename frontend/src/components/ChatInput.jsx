import React, { useState, useEffect } from 'react';
import './ChatInput.css';
import EmojiPicker from 'emoji-picker-react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ChatToolbar from '../chatattachmentToolbar/ChatToolbar';
import Audio from '../voice/audio';
import PropTypes from 'prop-types';
import CryptoJS from 'crypto-js';

const SECRET_KEY = '2b2d3ebbc9f36d5488b8b27910ff811df1c39b05e2742cdaddc4ab16c47b59c8';

const ChatInput = ({ contact, updateMessages, socket, email }) => {
  const [message, setMessage] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (email) {
      socket.emit('register', email);
    }
  }, [email, socket]);

  const handleSend = () => {
    if (!message.trim() || !contact || !email) return;

    const encryptedText = CryptoJS.AES.encrypt(message.trim(), SECRET_KEY).toString();
    const msg = {
      from: email,
      to: contact.email,
      text: encryptedText,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    socket.emit('private-message', { toEmail: contact.email, message: msg });

    updateMessages(contact.email, { ...msg, text: message.trim(), status: 'sent' });
    setMessage('');
  };

  return (
    <div className="chat-input d-flex align-items-center p-2 shadow-sm rounded position-relative">
      <div className="chat-icons d-flex align-items-center me-2 gap-2">
        <ChatToolbar />
        <button className="btn p-1" type="button" onClick={() => setEmojiOpen((prev) => !prev)}>
          <i className="bi bi-emoji-smile fs-5"></i>
        </button>
        {emojiOpen && (
          <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
            <div style={{ position: 'absolute', top: '-458px', zIndex: 10 }}>
              <EmojiPicker
                onEmojiClick={(e) => {
                  setMessage((prev) => prev + e.emoji);
                  setEmojiOpen(false);
                }}
              />
            </div>
          </ClickAwayListener>
        )}
        <Audio />
      </div>

      <input
        type="text"
        placeholder="Type a message here..."
        className="form-control flex-grow-1 me-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />

      <button onClick={handleSend} className="send-btn btn btn-primary" type="button">
        <i className="bi bi-send-fill"></i>
      </button>
    </div>
  );
};

ChatInput.propTypes = {
  contact: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  updateMessages: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  email: PropTypes.string.isRequired,
};

export default ChatInput;