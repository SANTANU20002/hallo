import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Sidebar from './components/Sidebar';
import LoginRegisterForm from './components/LoginRegisterForm';
import ChatScreen from './components/ChatScreen';
import { io } from 'socket.io-client';

function App() {
  const socket = io('http://localhost:5000', { withCredentials: true });

  const [isLoggedin, setIsloggedin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messagesPerContact, setMessagesPerContact] = useState({});

  const sessionUser = sessionStorage.getItem('userData');
  const email = sessionUser ? JSON.parse(sessionUser).email : null;

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      setIsloggedin(true);
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = (status) => {
    setIsloggedin(status);
    if (status) {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('userData');
      setIsloggedin(false);
      setSelectedContact(null);
      setMessagesPerContact({});
      socket.emit('register', null);
    } catch (err) {
      console.error('logout error', err);
      alert('Logout failed, please try again later');
    }
  };

  return (
    <>
      {!isLoggedin ? (
        <LoginRegisterForm onLogin={handleLogin} />
      ) : loading ? (
        <div className="container-fluid loader_body">
          <div className="loader">
            <div className="light"></div>
            <div className="black_overlay"></div>
          </div>
        </div>
      ) : (
        <div className="chat_main-container container-fluid">
          <div style={{ position: 'fixed', bottom: '0' }}>
            <button onClick={handleLogout} className="btn btn-danger">
              Log out
            </button>
          </div>
          <div className="row">
            <Sidebar onSelectContact={setSelectedContact} />
            <ChatScreen
              contact={selectedContact}
              socket={socket}
              email={email}
              messages={messagesPerContact[selectedContact?.email] || []}
              updateMessages={(contactEmail, newMsg) => {
                setMessagesPerContact((prev) => ({
                  ...prev,
                  [contactEmail]: [...(prev[contactEmail] || []), newMsg],
                }));
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;