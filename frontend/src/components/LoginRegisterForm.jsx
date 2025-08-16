
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import './LoginRegisterForm.css';
import LightRays from '../lightrays/LightRays';
// import DotGrid from '../lightrays/DotGrid';

const LoginRegisterForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    password: '',
    loginemailOrUsername: '',
    loginPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [user, setUser] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0); // time in seconds
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer <= 0) {
      clearInterval(interval);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [otpTimer, timerActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Check session on component mount
  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/check-session', {
        withCredentials: true,
      });

      if (res.data.user) {
        const userData = {
          name: res.data.user.name || 'Unknown',
          email: res.data.user.email || 'N/A',
          avatar: res.data.user.avatar || null,
          ...res.data.user,
        };
        setUser(userData);
        sessionStorage.setItem('userData', JSON.stringify(userData));
        setMessage('Session restored: User data retrieved');
        onLogin(true);
      } else {
        sessionStorage.removeItem('userData');
        onLogin(false);
      }
    } catch (err) {
      console.error('Session check error on mount:', err);
      sessionStorage.removeItem('userData');
      onLogin(false);
    }
  };

  checkSession();
}, [onLogin]);


  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      otp: '',
      password: '',
      loginemailOrUsername: '',
      loginPassword: '',
    });
    setMessage('');
    setError('');
    setShowOtp(false);
    setIsOtpVerified(false);
    setUser(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetOtp = async () => {
    setShowOtp(true);
    setOtpTimer(120); // 2 minutes = 120 seconds
    setTimerActive(true);
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/get-otp', {
        email: formData.email,
        name: formData.name,
      });
      setMessage(res.data.message);
      setError('');
      setShowOtp(true);
      console.log('Generated OTP:', res.data.otp); // Remove in production
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check server status.');
    }
  };

  const handleVerifyOtp = async () => {
    setIsOtpVerified(true);
    setTimerActive(false);
    setOtpTimer(0);
    if (!formData.email || !formData.otp) {
      setError('Email and OTP are required');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });
      setMessage(res.data.message);
      setError('');
      setIsOtpVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (isLogin) {
      if (!formData.loginemailOrUsername || !formData.loginPassword) {
        setError('All fields are required');
        return;
      }
      try {
        const res = await axios.post(
          'http://localhost:5000/api/login',
          {
            emailOrUsername: formData.loginemailOrUsername,
            password: formData.loginPassword,
          },
          { withCredentials: true }
        );

        if (res.data.user && typeof res.data.user === 'object' && (res.data.user.name || res.data.user.email)) {
          const userData = {
            name: res.data.user.name || 'Unknown',
            email: res.data.user.email || 'N/A',
            ...res.data.user,
          };
          setUser(userData);
          sessionStorage.setItem('userData', JSON.stringify(userData)); // Store in sessionStorage
          onLogin(true); // Notify App of login
          setMessage(res.data.message || 'Login successful');
          setFormData({
            name: '',
            email: '',
            otp: '',
            password: '',
            loginemailOrUsername: '',
            loginPassword: '',
          });
        } else {
          setError('Server returned incomplete user data. Please try again.');
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          (err.response?.status === 401
            ? 'Invalid credentials. Please check your email/username or password.'
            : err.code === 'ERR_NETWORK'
            ? 'Network error: Server is unreachable. Please ensure the backend is running at http://localhost:5000.'
            : 'Login failed. Please check server status or try again.');
        setError(errorMessage);
        console.error('Login error:', err);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('All fields are required');
        return;
      }
      if (!isOtpVerified) {
        setError('Please verify OTP first');
        return;
      }
      try {
        const res = await axios.post('http://localhost:5000/api/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setMessage(res.data.message);
        setFormData({
          name: '',
          email: '',
          otp: '',
          password: '',
          loginemailOrUsername: '',
          loginPassword: '',
        });
        setShowOtp(false);
        setIsOtpVerified(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed');
        console.error('Registration error:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      setUser(null);
      sessionStorage.removeItem('userData'); // Clear sessionStorage
      setMessage('Logged out successfully');
      setError('');
      onLogin(false); // Notify App of logout
    } catch (err) {
      setError(err.response?.data?.error || 'Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <LightRays
        raysOrigin="top-center"
        raysColor="#bd8bffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />

      {/* <DotGrid
    dotSize={10}
    gap={15}
    baseColor="#5227FF"
    activeColor="#5227FF"
    proximity={120}
    shockRadius={250}
    shockStrength={5}
    resistance={750}
    returnDuration={1.5}
  /> */}

      <Box
        sx={{
          backgroundColor: '#0b0217ff',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Login/Register Form Card */}
          <Card
            sx={{
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#ffffff2f',
              backdropFilter: 'blur(2px)',
              border: '.1px solid #ffffff87;',
            }}
          >
            <CardContent sx={{ padding: 4 }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: 'bold', color: '#efeaffff' }}
              >
                {isLogin ? 'Login' : 'Register'}
              </Typography>

              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {isLogin ? (
                  <>
                    <TextField
                      fullWidth
                      label="Email or Username"
                      name="loginemailOrUsername"
                      value={formData.loginemailOrUsername}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      className="custom-textfield"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      name="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.loginPassword}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      className="custom-textfield"
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end" color="#fff">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: 20,
                        textTransform: 'none',
                        backgroundColor: '#7048ffff',
                        '&:hover': { backgroundColor: '#6135ffff' },
                      }}
                    >
                      Login
                    </Button>
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ mt: 2, color: '#e3dcffff' }}
                    >
                      I don't have an account!  <span onClick={toggleForm} style={{marginTop: '2px',
                        color: 'rgba(247, 245, 255, 1)',
                        cursor: 'pointer'}}>Register</span> 
                    </Typography>
                  </>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      className="custom-textfield"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      type="email"
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      className="custom-textfield"
                      sx={{ mb: 2 }}
                    />
                    <div className="otptimer"></div>
                    {!showOtp && (
                      <Button
                        onClick={handleGetOtp}
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 1,
                          py: 1.5,
                          borderRadius: 20,
                          backgroundColor: '#fff',
                          textTransform: 'none',
                          color: '#13083aff'

                        }}
                      >
                        Get OTP
                      </Button>
                    )}
                    {showOtp && (
                      <>
                        <TextField
                          fullWidth
                          label="OTP"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          margin="normal"
                          variant="outlined"
                          className="custom-textfield"
                          sx={{ mb: 2 }}
                        />
                        {timerActive && (
                          <div className="otptimer text-center text-muted mb-2">
                            OTP expires in: <strong>{formatTime(otpTimer)}</strong>
                          </div>
                        )}
                        <Button
                          onClick={handleVerifyOtp}
                          variant="contained"
                          color="secondary"
                          fullWidth
                          sx={{
                            mb: 2,
                            py: 1.5,
                            borderRadius: 20,
                            backgroundColor: '#fff',
                          textTransform: 'none',
                          color: '#13083aff'
                          }}
                        >
                          Verify OTP
                        </Button>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          margin="normal"
                          variant="outlined"
                          className="custom-textfield"
                          sx={{ mb: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={!isOtpVerified}
                          sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: 20,
                            textTransform: 'none',
                            backgroundColor: isOtpVerified ? '#7048ffff' : '#bdbdbd',
                            '&:hover': {
                              backgroundColor: isOtpVerified ? '#6135ffff' : '#bdbdbd',
                            },
                          }}
                        >
                          Register
                        </Button>
                        <Typography
                          variant="body2"
                          align="center"
                          sx={{ mt: 2, color: '#e3dcffff', cursor: 'pointer' }}
                          
                        >
                          I have an account. <span onClick={toggleForm} style={{marginTop: '2px',
                        color: 'rgba(247, 245, 255, 1)',
                        cursor: 'pointer'}}>Login</span>
                        </Typography>
                      </>
                    )}
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Logged-in User Panel */}
          {user && (
            <Card
              sx={{
                maxWidth: 300,
                width: '100%',
                padding: 3,
                backgroundColor: '#ffffffdd',
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom color="primary">
                Logged In User
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Name:</strong> {user.name || 'N/A'}
                <br />
                <strong>Email:</strong> {user.email || 'N/A'}
              </Alert>
              <Button
                onClick={handleLogout}
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 20, textTransform: 'none' }}
              >
                Logout
              </Button>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
};

export default LoginRegisterForm;
