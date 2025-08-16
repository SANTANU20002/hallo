import React, { useState } from "react";
import './ChatscreenHearder.css';
import Avatar from "@mui/material/Avatar";
import VideoCall from './VideoCall';
const ChatscreenHearder = ({ contact }) => {
const [showVidecall, setShowVidecall] = useState(false);

  if (!contact) return null;

  const initials = contact.name
    ? contact.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : "U";

    return(
        <div className="col chatscreen_header px-2">
  <div className="d-flex align-items-center justify-content-between p-2">
    
    
    <div className="chatscreen_user_profile">
      {contact.avatar ? (
            <Avatar src={`http://localhost:5000${contact.avatar}`} />
          ) : (
            <Avatar sx={{ backgroundImage: 'var(--theam-color)' }}>{initials}</Avatar>
          )}
     {/* <Avatar sx={{ bgcolor: deepOrange[500] }}>AJ</Avatar> */}
     {/* <Avatar src="" /> */}
    </div>

   
    <div className="chatscreen_user_info flex-grow-1 mx-3">
      <div className="fw-semibold">{contact.name}</div>
      <div className="text small">Last seen 3 hours ago</div>
    </div>

    
    <div className="chatscreen_activity">
      <ul className="list-unstyled d-flex mb-0 gap-3 align-items-center">
        <li><a href="#" aria-label="Call"><i className="bi bi-telephone-fill fs-5"></i></a></li>
        <li><a href="#" onClick={(e) => {e.preventDefault(); setShowVidecall(true);}} aria-label="Video" className="videoCall"><i className="bi bi-camera-video-fill fs-5"></i></a></li>
        <li><a href="#" aria-label="More"><i className="bi bi-three-dots fs-5"></i></a></li>
      </ul>
    </div>

  </div>
  {showVidecall && <VideoCall onClose={() => setShowVidecall(false)} />}
</div>

    )
}
export default ChatscreenHearder;