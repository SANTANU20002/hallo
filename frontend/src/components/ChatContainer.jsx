import React, { useState, useEffect } from 'react';
import './ChatContainer.css';
import PropTypes from 'prop-types';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const ChatContainer = ({ messages, currentUserEmail }) => {
  const [displayMessages, setDisplayMessages] = useState(messages);

  useEffect(() => {
    console.log('Messages updated in ChatContainer:', messages); // Debug log
    setDisplayMessages(messages);
  }, [messages]);

  return (
    <div className="chat-container">
      {displayMessages.map((msg, index) => {
        const isSent = msg.from === currentUserEmail;
        const messageStatus = msg.status || 'sent';
        console.log(`Rendering message ${index}: status = ${messageStatus}`); // Debug log

        return (
          <div key={index} className={`message-wrapper ${isSent ? 'sent-wrapper' : 'received-wrapper'}`}>
            <div className={`message ${isSent ? 'sent' : 'received'}`}>
              <span className="message-text">{msg.text}</span>
              <div className="timestamp d-flex align-items-center justify-content-end gap-2">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isSent && (
                  <span className="checkmarks">
                    {(() => {
                      if (messageStatus === 'sent') {
                        return <CheckIcon className="single" />;
                      } else if (messageStatus === 'delivered') {
                        return <DoneAllIcon className="double" />;
                      } else if (messageStatus === 'read') {
                        return <DoneAllIcon className="double read" />;
                      }
                      return null;
                    })()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

ChatContainer.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['sent', 'delivered', 'read']),
    })
  ).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};

export default ChatContainer;