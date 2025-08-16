import React, { useState, useRef, useEffect } from 'react';
import RecorderControls from './RecorderControls';
import RecordingOutput from './RecordingOutput';

const Audio = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      });

      mediaRecorderRef.current.start();
      await createAudioContext(stream);

      setRecording(true);
      setPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const createAudioContext = async (streamOrElement) => {
    await closeAudioContext();
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    if (streamOrElement instanceof MediaStream) {
      const source = audioContextRef.current.createMediaStreamSource(streamOrElement);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
    } else if (streamOrElement instanceof HTMLAudioElement) {
      const source = audioContextRef.current.createMediaElementSource(streamOrElement);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    analyserRef.current.fftSize = 64;
    dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
  };

  const closeAudioContext = async () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
        } catch (err) {
          console.warn('Error closing AudioContext:', err);
        }
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setPaused(false);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setPaused(false);
    clearInterval(timerRef.current);

    cancelAnimationFrame(animationIdRef.current);
    closeAudioContext();
  };

  const togglePlayback = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        cancelAnimationFrame(animationIdRef.current);
        await closeAudioContext();
      } else {
        await audioRef.current.play();
        await createAudioContext(audioRef.current);
        drawVisualizer();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setPaused(false);
    setIsPlaying(false);
    clearInterval(timerRef.current);

    cancelAnimationFrame(animationIdRef.current);
    closeAudioContext();
  };

  const sendRecording = () => {
    console.log('Sending audio:', audioUrl);
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      animationIdRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      const barWidth = canvas.width / dataArrayRef.current.length;

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const value = dataArrayRef.current[i];
        const percent = value / 256;
        const barHeight = percent * (canvas.height / 2);
        const x = i * barWidth;

        ctx.fillStyle = '#fff';
        ctx.fillRect(x, centerY - barHeight, barWidth * 0.2, barHeight);
        ctx.fillRect(x, centerY, barWidth * 0.2, barHeight);
      }
    };

    draw();
  };

  useEffect(() => {
    if ((recording && !paused) || isPlaying) {
      if (canvasRef.current && analyserRef.current) {
        drawVisualizer();
      }
    } else {
      cancelAnimationFrame(animationIdRef.current);
    }
  }, [recording, paused, isPlaying]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) =>
          console.warn('Error closing AudioContext on cleanup:', err)
        );
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div style={{ padding: '20px' }}>
      {!recording && !audioUrl && (
        <RecorderControls onStartRecording={startRecording} />
      )}

      {(recording || paused || audioUrl) && (
        <RecordingOutput
          recording={recording}
          paused={paused}
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          recordingTime={recordingTime}
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onStopRecording={stopRecording}
          onDeleteRecording={deleteRecording}
          onTogglePlayback={togglePlayback}
          onSendRecording={sendRecording}
          canvasRef={canvasRef}
          audioRef={audioRef}
        />
      )}
    </div>
  );
};

export default Audio;