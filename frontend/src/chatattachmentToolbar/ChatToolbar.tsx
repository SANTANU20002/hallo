// ChatToolbar.tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { styled } from '@mui/material/styles';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import CameraWorkflow from './CameraWorkflow';

const TransparentSpeedDial = styled(SpeedDial)(() => ({
  position: 'static',
  '& .MuiFab-primary': {
    minHeight: 'auto',
    minWidth: 'auto',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
  },
}));

const ChatToolbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [openWebcam, setOpenWebcam] = useState(false);

  // ⭐ Store selected file
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null); // ✅ Selected photo file
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null); // ✅ Selected video file
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null); // ✅ Selected document file

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const openFileDialog = (accept: string, callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        callback(file);
      }
    };
    input.click();
  };

  const handleAction = (name: string) => {
    close(); // Always close after clicking

    switch (name) {
      case 'Photo':
        openFileDialog('image/*', (file) => {
          setSelectedPhoto(file); // ✅ store selected photo
          console.log('Selected Photo:', file);
        });
        break;
      case 'Video':
        openFileDialog('video/*', (file) => {
          setSelectedVideo(file); // ✅ store selected video
          console.log('Selected Video:', file);
        });
        break;
      case 'Camera':
        setOpenWebcam(true);
        break;
      case 'Document':
        openFileDialog(
          '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv',
          (file) => {
            setSelectedDocument(file); // ✅ store selected document
            console.log('Selected Document:', file);
          }
        );
        break;
      default:
        break;
    }
  };

  const actions = [
    { icon: <PhotoLibraryIcon />, name: 'Photo' },
    { icon: <VideoCameraBackIcon />, name: 'Video' },
    { icon: <CameraAltIcon />, name: 'Camera' },
    { icon: <InsertDriveFileIcon />, name: 'Document' },
  ];

  return (
    <>
      <ClickAwayListener onClickAway={close}>
        <Box display="flex" alignItems="center">
          <TransparentSpeedDial
            ariaLabel="attachment actions"
            icon={<AttachFileIcon sx={{ color: 'var(--text-color)' }} />}
            direction="up"
            open={open}
            onClick={toggle}
            FabProps={{ size: 'small' }}
          >
            {actions.map(({ icon, name }) => (
              <SpeedDialAction
                key={name}
                icon={icon}
                tooltipTitle={name}
                onClick={() => handleAction(name)}
                sx={{
                  background: 'linear-gradient(45deg, #a100ff, #6c00ff)',
                  color: '#fff',
                  boxShadow: 'none',
                  transition: '.3s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #6c00ff, #a100ff)',
                  },
                  '&:focus': {
                    background: 'linear-gradient(90deg, #6c00ff, #a100ff)',
                  },
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}
              />
            ))}
          </TransparentSpeedDial>
        </Box>
      </ClickAwayListener>

      {openWebcam && <CameraWorkflow onClose={() => setOpenWebcam(false)} />}
    </>
  );
};

export default ChatToolbar;
