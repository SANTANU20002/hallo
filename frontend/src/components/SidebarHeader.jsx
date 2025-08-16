import React, { useState, useEffect } from 'react';
import './SidebarHeader.css';
import UserProfile from './UserProfile';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Badge from '@mui/material/Badge';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import GroupIcon from '@mui/icons-material/Group';
import Avatar from '@mui/material/Avatar';


const SidebarHeader = ({ active, onChange, setIsAuthenticated, loginIdentifier }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [value, setValue] = useState('recents');
  const [isLoggedin, setIsloggedin] = useState(false);
  const [initials, setInitials] = useState('');

  const [contactCount, setContactCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  const handleClick = (e, view) => {
    e.preventDefault();
    onChange(view);
    setValue(view);
  };

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setIsloggedin(true);
      const userInitials = parsedUser.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
      setInitials(userInitials);
    } else {
      setIsloggedin(false);
    }
  }, []);

  useEffect(() => {
    // Fetch contacts count
    const fetchContacts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/contacts', { credentials: 'include' });
        const data = await res.json();
        setContactCount(data.length || 0);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      }
    };

    // Fetch groups count
    const fetchGroups = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/groups', { credentials: 'include' });
        const data = await res.json();
        setGroupCount(data.length || 0);
      } catch (err) {
        console.error('Failed to load groups:', err);
      }
    };

    fetchContacts();
    fetchGroups();
  }, []);

  return (
    <div className="sidebar_hearer">
      <BottomNavigation value={value} onChange={(e, newValue) => setValue(newValue)}>
        <BottomNavigationAction
          icon={
            <Badge badgeContent={contactCount > 0 ? contactCount : "0"} sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#8e4cff', color: '#fff', height: '14px', minWidth: '12px',
                width: '14px', fontSize: '0.65rem',
              },
            }}>
              <ChatBubbleIcon
                onClick={(e) => handleClick(e, 'chats')}
                sx={{ color: active === 'chats' ? '#6224ffff' : '#c8b2ffff', cursor: 'pointer' }}
              />
            </Badge>
          }
        />

        <BottomNavigationAction
          icon={
            <Badge badgeContent={contactCount > 0 ? groupCount : "1"} sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#8e4cff', color: '#fff', height: '14px', minWidth: '12px',
                width: '14px', fontSize: '0.65rem',
              },
            }}>
              <GroupIcon
                onClick={(e) => handleClick(e, 'groups')}
                sx={{ color: active === 'groups' ? '#6224ffff' : '#c8b2ffff', cursor: 'pointer' }}
              />
            </Badge>
          }
        />

        <BottomNavigationAction
          icon={
            <Badge badgeContent={2} sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#8e4cff', color: '#fff', height: '14px', minWidth: '12px',
                width: '14px', fontSize: '0.65rem',
              },
            }}>
              <TipsAndUpdatesIcon
                onClick={(e) => handleClick(e, 'calls')}
                sx={{ color: active === 'calls' ? '#6224ffff' : '#c8b2ffff', cursor: 'pointer' }}
              />
            </Badge>
          }
        />

        <BottomNavigationAction
          onClick={() => setIsProfileOpen(true)}
          icon={
            <Avatar sx={{ backgroundImage: 'var(--theam-color)' }} className="sidebar_header_user_dp">
              {isLoggedin ? initials : 'X'}
            </Avatar>
          }
        />
      </BottomNavigation>

      <UserProfile
        open={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        setIsAuthenticated={setIsAuthenticated}
        loginIdentifier={loginIdentifier}
      />
    </div>
  );
};

export default SidebarHeader;
