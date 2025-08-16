import React, { useEffect, useRef, useState } from 'react';
import './VideoCall.css';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import socket from '../Socket';

const VideoCall = ({ contactEmail, currentUserEmail, onClose }) => {
// useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         console.log('✅ Access granted:', stream);
//       })
//       .catch((error) => {
//         console.error('❌ Access error:', error);
//       });
//   }, []);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, incoming, connected
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    socket.on('incoming-call', ({ from, offer }) => {
      if (from === contactEmail) {
        setIncomingCall({ from, offer });
        setCallStatus('incoming');
      }
    });

    socket.on('call-accepted', async ({ answer }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStatus('connected');
    });

    socket.on('call-rejected', ({ from }) => {
      if (from === contactEmail) {
        setCallStatus('rejected');
        alert('Call was rejected');
        handleEndCall();
      }
    });

    socket.on('call-failed', ({ reason }) => {
      setCallStatus('failed');
      alert('Call failed: ' + reason);
      handleEndCall();
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (candidate) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: contactEmail, candidate: event.candidate });
      }
    };

    pc.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
      setCallStatus('connected');
    };

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-rejected');
      socket.off('call-failed');
      socket.off('ice-candidate');
      if (pc.current) pc.current.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [contactEmail]);

  const startCall = async () => {
  try {
    // Check for available devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInput = devices.find(device => device.kind === 'videoinput');
    const audioInput = devices.find(device => device.kind === 'audioinput');

    if (!videoInput) {
      alert('🚫 No camera device found.');
      return;
    }

    if (!audioInput) {
      alert('🚫 No microphone device found.');
      return;
    }

    // Try to get user media
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(localStream);

    localStream.getTracks().forEach(track => {
      pc.current.addTrack(track, localStream);
    });

    localVideoRef.current.srcObject = localStream;

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit('call-user', { to: contactEmail, from: currentUserEmail, offer });
    setCallStatus('calling');
  } catch (err) {
    console.error('❌ startCall error:', err);
    alert(`❌ Failed to start call: ${err.name} - ${err.message}`);
  }
};


  const acceptCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(localStream);
    localStream.getTracks().forEach((track) => pc.current.addTrack(track, localStream));
    localVideoRef.current.srcObject = localStream;

    await pc.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    socket.emit('answer-call', { to: incomingCall.from, answer });
    setIncomingCall(null);
    setCallStatus('connected');
  };

  const rejectCall = () => {
    socket.emit('reject-call', { to: incomingCall.from });
    setIncomingCall(null);
    setCallStatus('idle');
    handleEndCall();
  };

  const handleToggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const handleToggleMic = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicEnabled(audioTrack.enabled);
    }
  };

  const handleEndCall = () => {
    if (pc.current) pc.current.close();
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCallStatus('idle');
    onClose?.();
  };

  return (
    <div className="video-call-container">
        <h1>calling</h1>
      {callStatus === 'incoming' && (
        <div className="incoming-call-popup">
          <p>Incoming call from {incomingCall.from}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {callStatus === 'calling' && <p>Calling {contactEmail}...</p>}

      <div className="myVideo">
        <video ref={localVideoRef} autoPlay muted playsInline />
      </div>
      <div className="yourVideo">
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>

      <div className="controlers">
        <ul className="controlersOptions">
          {callStatus === 'idle' && (
            <li><button onClick={startCall}>Start Call</button></li>
          )}
          <li>
            <button onClick={handleToggleVideo}>
              {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon color="error" />}
            </button>
          </li>
          <li>
            <button onClick={handleEndCall}>End Call</button>
          </li>
          <li>
            <button onClick={handleToggleMic}>
              {micEnabled ? <MicIcon /> : <MicOffIcon color="error" />}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VideoCall;
