import React, { useState, useEffect } from 'react';
import './SidebarChatlist.css';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

const SidebarChatlist = ({ onSelectContact }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [emailNumber, setEmailNumber] = useState('');
  const [friendName, setFriendName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);

  const fetchContactsWithAvatars = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');
      const contactList = await response.json();

      // Fetch avatar for each contact
      const updatedContacts = await Promise.all(
        contactList.map(async (contact) => {
          try {
            const res = await fetch(
              `http://localhost:5000/api/profile-avatar-by-email?email=${encodeURIComponent(contact.email)}`,
              {
                credentials: 'include',
              }
            );
            const data = await res.json();
            return { ...contact, avatar: data.avatar };
          } catch (avatarErr) {
            console.error(`Failed to fetch avatar for ${contact.email}:`, avatarErr);
            return { ...contact, avatar: null };
          }
        })
      );

      setContacts(updatedContacts);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error.message);
      setError('Unable to load contacts. Please try again.');
    }
  };

  useEffect(() => {
    fetchContactsWithAvatars();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    if (!friendName.trim() || !emailNumber.trim()) {
      setError('Name and email are required.');
      return;
    }

    const newContact = {
      name: friendName,
      email: emailNumber,
    };

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        const savedContact = await response.json();
        setContacts((prev) => [...prev, { ...savedContact, avatar: null }]);
        setEmailNumber('');
        setFriendName('');
        setShowInviteForm(false);
        setError(null);
        console.log('Contact added successfully:', savedContact);
      } else {
        const errorText = await response.text();
        setError(`Failed to add contact: ${errorText}`);
      }
    } catch (err) {
      console.error('Server error:', err.message);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="px-3 mt-3">
      <div className="row mb-3">
        <div className="col-6 chat_heading">
          <h3>Chats</h3>
        </div>
        <div className="col-6 add_chat text-end">
          <button onClick={() => setShowInviteForm(!showInviteForm)}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {showInviteForm && (
        <form className="my-3" onSubmit={handleInviteSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            className="mb-2 custom-textfield"
            value={emailNumber}
            onChange={(e) => setEmailNumber(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            className="mb-2 custom-textfield"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
          />
          <button type="submit" className="invite_frm_btn w-100">
            Invite
          </button>
        </form>
      )}

      {contacts.map((contact, index) => (
        <div
          key={contact._id || `${contact.email}_${index}`}
          className="chatContact shadow-sm mb-2 pe-3"
          onClick={() => onSelectContact(contact)}
        >
          <div className="row align-items-center px-2 py-2">
            <div className="col-2">
              <div className="chatContact_profile">
                {contact.avatar ? (
                  <img
                    src={`http://localhost:5000${contact.avatar}`}
                    alt="avatar"
                    className="img-fluid rounded-circle"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(contact.name || 'A')
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="col-10 chatContact_name_msgs ps-3">
              <p className="name mb-0">{contact.name || 'Anonymous'}</p>
              {/* You can show last message preview here in future */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

SidebarChatlist.propTypes = {
  onSelectContact: PropTypes.func.isRequired,
};

export default SidebarChatlist;
