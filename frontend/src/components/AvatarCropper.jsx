import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import getCroppedImg from '../utils/CropUtils';
import axios from 'axios';

const AvatarCropper = ({ open, imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleDone = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await axios.post('http://localhost:5000/api/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (onCropComplete) onCropComplete(res.data.avatarUrl);
      onClose();
    } catch (err) {
      console.error('❌ Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </Box>
      <Box sx={{ px: 3, py: 2 }}>
        <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, z) => setZoom(z)} />
        <Button variant="contained" onClick={handleDone} disabled={uploading}>
          {uploading ? 'Saving...' : 'Crop & Save'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AvatarCropper;
