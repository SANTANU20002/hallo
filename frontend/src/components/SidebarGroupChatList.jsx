import React, { useEffect, useState } from 'react';
import './SidebarChatlist.css';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Select, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

const SidebarGroupChatlist = ({ onSelectGroup }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);

  const theme = useTheme();

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/contacts', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data);
      setError(null);
    } catch (err) {
      console.error('Fetch contacts error:', err.message);
      setError('Unable to load contacts. Please try again.');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/groups', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      setGroups(data);
      setError(null);
    } catch (err) {
      console.error('Fetch groups error:', err.message);
      setError('Unable to load groups. Please try again.');
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim() || selectedMembers.length === 0) {
      setError('Group name and at least one member are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('members', JSON.stringify(selectedMembers));
    if (groupImage) formData.append('image', groupImage);

    try {
      const res = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        setGroupName('');
        setSelectedMembers([]);
        setGroupImage(null);
        setShowInviteForm(false);
        setError(null);
        fetchGroups();
      } else {
        const errorText = await res.text();
        setError(`Failed to create group: ${errorText}`);
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
          <h3>Groups</h3>
        </div>
        <div className="col-6 add_chat text-end">
          <button onClick={() => setShowInviteForm(!showInviteForm)}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-2">{error}</div>}

      {showInviteForm && (
        <form className="my-3 sidebarGroupListform" onSubmit={handleCreateGroup}>
          <TextField
            label="Group name"
            variant="outlined"
            fullWidth
            className="mb-2 custom-textfield"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Select
            multiple
            displayEmpty
            fullWidth
            className="mb-2 custom-textfield"
            value={selectedMembers}
            onChange={(e) => setSelectedMembers(e.target.value)}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Select contacts</em>;
              }
              return selected.join(', ');
            }}
            MenuProps={MenuProps}
          >
            {contacts.map((contact) => (
              <MenuItem
                key={contact.email}
                value={contact.email}
                style={getStyles(contact.email, selectedMembers, theme)}
              >
                {contact.name}
              </MenuItem>
            ))}
          </Select>

          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => setGroupImage(e.target.files[0])}
          />

          <Button type="submit" fullWidth variant="contained">
            Create
          </Button>
        </form>
      )}

      {groups.map((group) => (
        <div
          key={group.id}
          className="chatContact shadow-sm mb-2 pe-3"
          onClick={() => onSelectGroup(group)}
          style={{ cursor: 'pointer' }}
        >
          <div className="row align-items-center px-2 py-2">
            <div className="col-2">
              <div className="chatContact_profile">
                {group.image ? (
                  <img
                    src={`http://localhost:5000${group.image}`}
                    alt="group"
                    className="img-fluid rounded-circle"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {group.name[0]?.toUpperCase() || 'G'}
                  </div>
                )}
              </div>
            </div>
            <div className="col-10 chatContact_name_msgs ps-3">
              <p className="name mb-0">{group.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

SidebarGroupChatlist.propTypes = {
  onSelectGroup: PropTypes.func.isRequired,
};

export default SidebarGroupChatlist;