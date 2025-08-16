import { useState, useEffect } from 'react';
import ProfileAvatar from './ProfileAvatar';
import axios from 'axios';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DoneTwoToneIcon from '@mui/icons-material/DoneTwoTone';
import TextField from '@mui/material/TextField';
import { Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './UserProfile.css';
import { Color } from 'fabric';

const UserProfile = ({ open, setIsProfileOpen, setIsAuthenticated }) => {
  const [profile, setProfile] = useState({ name: '', about: '', email: '', avatar: '' });
  const [editing, setEditing] = useState({ field: null, value: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedin, setIsloggedin] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData) {
        setProfile({
          name: userData.name || '',
          about: userData.about || '',
          email: userData.email || '',
          avtar: userData.email || '',
        });
        setIsloggedin(true);
      } else {
        setError('No user data found in sessionStorage');
        setIsloggedin(false);
      }
    } catch (err) {
      setError('Error retrieving user data');
      console.error('Error retrieving user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startEdit = (field) => setEditing({ field, value: profile[field] });

  const cancelOrSave = async (save) => {
    if (save && editing.field) {
      setLoading(true);
      setError('');
      try {
        const updatedProfile = { ...profile, [editing.field]: editing.value };
        setProfile(updatedProfile);
        sessionStorage.setItem('userData', JSON.stringify(updatedProfile));
      } catch (err) {
        setError('Error saving user data');
        console.error('Error saving user data:', err);
      } finally {
        setLoading(false);
      }
    }
    setEditing({ field: null, value: '' });
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('userData');
      setIsloggedin(false);
      if (typeof setIsAuthenticated === 'function') {
        setIsAuthenticated(false);
      }
      setIsProfileOpen(false); // Close profile on logout
    } catch (err) {
      console.error('Logout error', err);
      alert('Logout failed, please try again later');
    }
  };

  const draftInput = (multiline = false) => (
    <TextField
      variant="standard"
      size="small"
      fullWidth
      autoFocus
      multiline={multiline}
      value={editing.value}
      onChange={(e) =>
        setEditing((prev) => ({ ...prev, value: e.target.value }))
      }
      onBlur={() => cancelOrSave(true)}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') cancelOrSave(true);
        if (e.key === 'Escape') cancelOrSave(false);
      }}
    />
  );

  const editBtn = (field) =>
    editing.field === field ? (
      <DoneTwoToneIcon
        className="done-icon"
        sx={{color: 'var(--text-color)'}}
        role="button"
        onClick={() => cancelOrSave(true)}
      />
    ) : (
      <EditTwoToneIcon
        className="edit-icon"
        sx={{color: 'var(--text-color)'}}
        role="button"
        onClick={() => startEdit(field)}
      />
    );

  if (!open) return null;

  return (
    <div className="profile-card">
      {loading && (
        <div className="text-center mb-3">
          <CircularProgress size={24} />
        </div>
      )}
      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <ProfileAvatar className="mx-auto" name={profile.name} avatar={profile.avatar}>

      </ProfileAvatar>

<div className="profile_close">
      <Button onClick={() => setIsProfileOpen(false)} className="logreg-btn mb-3">
        < CloseIcon />
      </Button>
      </div>

      <div className="row align-items-center mb-2 mt-3">
        <div className="col-6" style={{color: 'var(--text-color)'}}>
          {editing.field === 'name'
            ? draftInput()
            : <h4 className="m-0">{profile.name || 'No Name'}</h4>}
        </div>
        <div className="col-6 text-end">{editBtn('name')}</div>
      </div>

      <div className="row align-items-start mb-2">
        <div className="col-6 info-label">
          <h6 className="m-0" style={{color: '#bababaff'}}>About</h6>
          {editing.field === 'about'
            ? draftInput(true)
            : <span className="info-value" style={{color: 'var(--text-color)'}}>{profile.about || 'No About'}</span>}
        </div>
        <div className="col-6 text-end">{editBtn('about')}</div>
      </div>

      <div className="row align-items-center mb-3">
        <div className="col-12 info-label" style={{color: '#bababaff'}}>Email</div>
        <div className="col-12 info-value" style={{color: 'var(--text-color)'}}>{profile.email || 'No email'}</div>
      </div>

      <Button
        fullWidth
        variant="contained"
        onClick={handleLogout}
        className="logreg-btn mt-3"
        sx={{
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#6a1bff',
          '&:hover': { backgroundColor: '#5a14cc' },
        }}
        disabled={loading}
      >
        {isLoggedin ? (loading ? <CircularProgress size={24} /> : 'Log out') : 'Log out'}
      </Button>

      <p className="logout-note text-center mt-2">
        Chat history on this computer will be cleared when you log out.
      </p>
    </div>
  );
};

export default UserProfile;
