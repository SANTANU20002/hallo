import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TimerIcon from '@mui/icons-material/Timer';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import DeleteIcon from '@mui/icons-material/Delete';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SendIcon from '@mui/icons-material/Send';
import './RecordingOutput.css';
const RecordingOutput = ({
  recording,
  paused,
  audioUrl,
  isPlaying,
  recordingTime,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onDeleteRecording,
  onTogglePlayback,
  onSendRecording,
  canvasRef,
  audioRef,
}) => {
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className='voice_recordings_container'
      style={{
        
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        {recording && !paused && (
          <>
            <button className='voiceRecoring_icons' onClick={onPauseRecording}><PauseIcon /></button>
            <button className='voiceRecoring_icons' onClick={onStopRecording}><DownloadDoneIcon /></button>
          </>
        )}

        {paused && (
          <>
            <button className='voiceRecoring_icons' onClick={onResumeRecording}><PlayArrowIcon /></button>
            <button className='voiceRecoring_icons' onClick={onStopRecording}><DownloadDoneIcon /></button>
          </>
        )}

        {audioUrl && !recording && (
          <>
            <button onClick={onTogglePlayback} className='voiceRecoring_icons'>
              {isPlaying ? <StopCircleIcon /> : <PlayArrowIcon />}
            </button>
            <button onClick={onSendRecording} className='voiceRecoring_icons'><SendIcon /></button>
          </>
        )}

        {(paused || audioUrl) && (
          <button onClick={onDeleteRecording} className='voiceRecoring_detete_icons'><DeleteIcon /></button>
        )}
      </div>

      {(recording || paused) && (
        <div style={{ marginBottom: '10px' }}><TimerIcon className='voiceRecoring_timer_icons' /> {formatTime(recordingTime)}
        </div>
      )}

      {((recording && !paused) || isPlaying) && (
        <canvas
          ref={canvasRef}
          width="300"
          height="60"
          style={{
            borderRadius: '100px',
            background: 'linear-gradient(45deg, #4f2a8e, #262273)',
            display: 'block',
            margin: '0 auto',
          }}
        />
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => {}}
          onPause={() => {}}
          onEnded={() => {}}
        />
      )}
    </div>
  );
};

export default RecordingOutput;