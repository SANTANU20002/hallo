// import ProfileAvatar from "./components/ProfileAvatar";
// const Test = () => {
//   return (
//     <div style={{ padding: 40 }}>
//       <ProfileAvatar />
//     </div>
//   );
// }
// export default Test;

// import * as React from 'react';
// import Alert from '@mui/material/Alert';
// import CheckIcon from '@mui/icons-material/Check';

// export default function Test() {
//   return (
//     <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
//       Here is a gentle confirmation that your action was successful.
//     </Alert>
//   );
// }

// import React, { useState } from 'react';
// import EmojiPicker from 'emoji-picker-react';

// const Test = () => {
//   const [open, setOpen] = useState(false);

//   const togglePicker = () => setOpen((prev) => !prev);

//   return (
//     <>
//       <button onClick={togglePicker}>
//         {open ? 'Close Picker' : 'Pick Emoji'}
//       </button>

//       {open && (
//         <div  style={{ position: 'absolute', top: '-458px', right: 0, zIndex: 1000 }}>
//           <EmojiPicker className='emojiBox'
//             onEmojiClick={(emojiData) => {
//               console.log('Selected emoji:', emojiData.emoji);
//               setOpen(false);
//             }}
//           />
//         </div>
//       )}
//     </>
//   );
// };

// export default Test;


// import ChatToolbar from './chatattachmentToolbar/ChatToolbar';

// const Test = () => {
//   return (
//     <footer style={{ padding: 8 }}>
//       <ChatToolbar />
//     </footer>
//   );
// }

// export default Test;

// Test.jsx (parent component)
// import React, { useState } from 'react';
// import { Button } from '@mui/material';
// import CameraWorkflow from './chatattachmentToolbar/CameraWorkflow';

// const Test = () => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       {!open && (
//         <Button variant="contained" onClick={() => setOpen(true)}>
//           Open Camera
//         </Button>
//       )}

//       {open && <CameraWorkflow onClose={() => setOpen(false)} />}
//     </>
//   );
// };

// export default Test;



// VoiceRecorder.js
// VoiceRecorder.jsx
// import React from 'react';

// const Test = ({ onStart }) => (
//   <button onClick={onStart}>🎙️ Start Record</button>
// );

// export default Test;




// login register
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Stack,
} from '@mui/material';

const LoginRegisterForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    otp: '',
    password: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setAlert({ type: '', message: '' });
    setForm({ name: '', phone: '', otp: '', password: '' });
    setOtpSent(false);
  };

  const handleLogin = () => {
    if (!form.phone || !form.password) {
      setAlert({ type: 'error', message: 'All fields are required' });
      return;
    }
    // Dummy login check
    setAlert({ type: 'success', message: 'Logged in successfully!' });
  };

  const handleSendOtp = () => {
    if (!form.name || !form.phone) {
      setAlert({ type: 'error', message: 'Name and phone are required' });
      return;
    }

    // ✅ Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    console.log('Generated OTP:', generatedOtp);

    // OTP Sent state
    setOtpSent(true);
    setAlert({ type: 'success', message: 'OTP sent successfully' });
  };

  const handleRegister = () => {
    if (!form.name || !form.phone || !form.otp || !form.password) {
      setAlert({ type: 'error', message: 'All fields are required' });
      return;
    }
    // Dummy registration success
    setAlert({ type: 'success', message: 'Registered successfully!' });
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {isLogin ? 'Login' : 'Register'}
      </Typography>

      <Stack spacing={2}>
        {!isLogin && (
          <>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
            <Button onClick={handleSendOtp} variant="outlined">
              Get OTP
            </Button>
            {otpSent && (
              <TextField
                label="Enter OTP"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                fullWidth
              />
            )}
            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
            />
            <Button variant="contained" onClick={handleRegister}>
              Register
            </Button>
            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <Button onClick={handleToggle}>Login</Button>
            </Typography>
          </>
        )}

        {isLogin && (
          <>
            <TextField
              label="Name or Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
            />
            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>
            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <Button onClick={handleToggle}>Register</Button>
            </Typography>
          </>
        )}
      </Stack>

      {alert.message && (
        <Alert severity={alert.type} sx={{ mt: 2 }}>
          {alert.message}
        </Alert>
      )}
    </Box>
  );
};

export default LoginRegisterForm;

