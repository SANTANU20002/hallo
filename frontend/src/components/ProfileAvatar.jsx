import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import { deepOrange } from '@mui/material/colors';
import AvatarCropper from './AvatarCropper';
import axios from 'axios';

const ProfileAvatar = ({ name }) => {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [openCropper, setOpenCropper] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile-avatar', { withCredentials: true })
      .then(res => {
        setAvatarSrc(res.data.avatar);
      })
      .catch(err => console.error('Avatar fetch error:', err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setOpenCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (newAvatarPath) => {
    setAvatarSrc(newAvatarPath);
    const storedUser = JSON.parse(sessionStorage.getItem('userData'));
    storedUser.avatar = newAvatarPath;
    sessionStorage.setItem('userData', JSON.stringify(storedUser));
  };

  return (
    <>
      <ButtonBase component="label">

       {avatarSrc ? (
  <Avatar
    src={`http://localhost:5000${avatarSrc}`}
    alt="Upload new avatar"
    sx={{ width: 100, height: 100, bgcolor: deepOrange[500] }}
  />
) : (
  <Avatar
    sx={{ width: 100, height: 100, bgcolor: deepOrange[500] }}
  >
    {name ? name[0].toUpperCase() : 'U'}
  </Avatar>
)}

        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </ButtonBase>

      <AvatarCropper
        open={openCropper}
        imageSrc={rawImage}
        onClose={() => setOpenCropper(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default ProfileAvatar;
