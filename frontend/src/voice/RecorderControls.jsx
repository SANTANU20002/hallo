import React from 'react';

const RecorderControls = ({ onStartRecording }) => {
  return (
    <button onClick={onStartRecording} className="btn" type="button" style={{padding: '0 !important', color: 'var(--text-color)'}}>
          <i className="bi bi-mic fs-5"></i>
        </button>
  );
};

export default RecorderControls;