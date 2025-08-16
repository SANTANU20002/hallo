// import express from 'express';
// const app = express();
// app.get('/', (req, res) => res.send('Hello'));
// app.listen(5000, () => console.log('✅ Test server running on port 5000'));


// import { createTransport } from 'nodemailer';

// let transporter = createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'santanugiri799@gmail.com',
//     pass: 'tbkl vkfc worq aeiv'  // App password
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// let mailOptions = {
//   from: 'santanugiri799@gmail.com',
//   to: 'dasshibsankar363@gmail.com',
//   subject: 'Sending Email for HALLO',
//   text: 'That was easy!'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log('Error occurred:', error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });



import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:5000');

// Replace with your actual logged-in user email (hardcoded for now)
const currentUserEmail = 'dev100@gmail.com';

function App() {
  const [data, setData] = useState([]);
  const [input, setInput] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [messagesByEmail, setMessagesByEmail] = useState({});

  // Fetch users
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/data')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
      });
  }, []);

  // Register current user with email on socket
  useEffect(() => {
    socket.emit('register', currentUserEmail);
  }, []);

  // Listen for messages
  useEffect(() => {
    socket.on('message', (msg) => {
      const fromEmail = msg.from;
      setMessagesByEmail((prev) => ({
        ...prev,
        [fromEmail]: [...(prev[fromEmail] || []), msg],
      }));
    });

    return () => {
      socket.off('message');
    };
  }, []);

  // Send private message to selected email
  const sendMessage = () => {
    if (input.trim() && selectedEmail) {
      const msg = {
        text: input,
        id: Date.now(),
        from: currentUserEmail,
      };

      socket.emit('private-message', {
        toEmail: selectedEmail,
        message: msg,
      });

      setMessagesByEmail((prev) => ({
        ...prev,
        [selectedEmail]: [...(prev[selectedEmail] || []), msg],
      }));

      setInput('');
    }
  };

  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1>Send Message To:</h1>

      {data.map((item) => (
        console.log("items rae====", item),
        <div key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
          <button onClick={() => setSelectedEmail(item.email)}>
            {/* {item.name} ({item.email}) */}
            {JSON.stringify(item.name)} ({JSON.stringify(item.email)})
          </button>

          <ul>
            {(messagesByEmail[item.email] || []).map((msg) => (
              <li key={msg.id}>
                <strong>{msg.from === currentUserEmail ? 'You' : msg.from}:</strong> {msg.text}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Sending to: {selectedEmail || 'None selected'}</h3>

      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage} disabled={!selectedEmail}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;