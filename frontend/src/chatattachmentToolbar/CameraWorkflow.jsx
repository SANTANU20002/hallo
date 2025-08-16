import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as fabricNs from 'fabric';
const fabric = fabricNs.default?.fabric || fabricNs; // Handle fabric import compatibility
import Webcam from 'react-webcam';
import {
  IconButton,
  Tooltip,
  Stack,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CropIcon from '@mui/icons-material/Crop';
import EditIcon from '@mui/icons-material/Edit';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import { HexColorPicker } from 'react-colorful';
import Cropper from 'react-easy-crop';
import './CameraWorkflow.css';

const videoConstraints = {
  facingMode: 'user',
  width: 1280,
  height: 720,
};

const CameraWorkflow = ({ onClose }) => {
  const [stage, setStage] = useState('capture');          // start in capture mode
  const [imageSrc, setImageSrc] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixels = useRef(null);

  /* ---------------------- helpers ---------------------- */

  const resetAll = () => {
    setStage('capture');
    setImageSrc(null);
    setEditedImage(null);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (canvasRef.current) {
      canvasRef.current.dispose();
      canvasRef.current = null;
    }
    if (onClose) onClose();                               // notify parent
  };

  const handleWebcamError = (e) => {
    setError('Failed to access webcam: ' + e.message);
    resetAll();
  };

  const handleSnap = () => {
    if (!webcamRef.current) return setError('Webcam is not initialized');
    const shot = webcamRef.current.getScreenshot();
    if (shot) {
      setImageSrc(shot);
      setEditedImage(null);
      setStage('preview');
    } else setError('Failed to capture image');
  };

  /* ---------------------- crop ---------------------- */

  const onCropComplete = useCallback((_, cropped) => {
    croppedAreaPixels.current = cropped;
  }, []);

  const makeCroppedImage = async () => {
    if (!croppedAreaPixels.current || !imageSrc) return null;
    const { width, height, x, y } = croppedAreaPixels.current;
    const img = new Image();
    img.src = imageSrc;
    await img.decode();
    const canvasTmp = document.createElement('canvas');
    canvasTmp.width = width;
    canvasTmp.height = height;
    const ctx = canvasTmp.getContext('2d');
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    return canvasTmp.toDataURL('image/jpeg');
  };

  const confirmCrop = async () => {
    try {
      const cropped = await makeCroppedImage();
      if (cropped) {
        setImageSrc(cropped);
        setEditedImage(null);
        setStage('preview');
      } else setError('Failed to crop image');
    } catch (err) {
      setError('Error cropping image: ' + err.message);
    }
  };

  /* ---------------------- fabric edit ---------------------- */

  const initFabric = useCallback(
    (node) => {
      if (!node || !imageSrc) return;

      if (canvasRef.current) canvasRef.current.dispose();

      canvasRef.current = new fabric.Canvas(node, {
        selection: false,
      });

      fabric.Image.fromURL(imageSrc, (img) => {
        if (!canvasRef.current) return;

        const parentW = node.parentElement?.clientWidth || img.width;
        const parentH = node.parentElement?.clientHeight || img.height;
        const scale = Math.min(parentW / img.width, parentH / img.height, 1);

        img.scale(scale);
        canvasRef.current.setWidth(img.width * scale);
        canvasRef.current.setHeight(img.height * scale);
        canvasRef.current.setBackgroundImage(
          img,
          canvasRef.current.renderAll.bind(canvasRef.current)
        );
      });
    },
    [imageSrc]
  );

  const enableDraw = () => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    c.isDrawingMode = !c.isDrawingMode;
    if (!c.freeDrawingBrush) c.freeDrawingBrush = new fabric.PencilBrush(c);
    c.freeDrawingBrush.color = brushColor;
    setIsDrawing(c.isDrawingMode);
  };

  const addText = () => {
    if (!canvasRef.current) return;
    const textbox = new fabric.IText('Tap to edit', {
      left: 50,
      top: 50,
      fill: brushColor,
      fontSize: 24,
    });
    canvasRef.current.add(textbox).setActiveObject(textbox);
  };

  const confirmEdit = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL({ format: 'jpeg' });
    setEditedImage(dataUrl);
    setStage('preview');
    setIsDrawing(false);
  };

  /* ---------------------- send / retake ---------------------- */

  const handleSend = () => {
    const dataUrl = editedImage || imageSrc;
    if (!dataUrl) return setError('No image to send');
    console.log('SEND:', dataUrl);
    resetAll();
  };

  const handleRetake = () => {
    setImageSrc(null);
    setEditedImage(null);
    setStage('capture');
  };

  /* ---------------------- cleanup ---------------------- */

  useEffect(() => () => {
    if (canvasRef.current) canvasRef.current.dispose();
  }, []);

  /* ---------------------- UI ---------------------- */

  const CloseBtn = () => (
    <IconButton className="camera_close-btn" onClick={resetAll}>
      <CloseIcon />
    </IconButton>
  );

  return (
    <div className="test-container">
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {stage === 'capture' && (
        <div className="camera-overlay">
          <CloseBtn />
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam-view"
            style={{ transform: 'scaleX(-1)' }}
            onUserMediaError={handleWebcamError}
            width="100%"
            height="100%"
          />
          <div className="action-bar">
            <IconButton className="capture-btn" onClick={handleSnap}>
              <CameraAltIcon fontSize="large" />
            </IconButton>
          </div>
        </div>
      )}

      {stage === 'preview' && (
        <div className="camera-overlay">
          <CloseBtn />
          <img
            src={editedImage || imageSrc}
            alt="Preview"
            className="preview-image"
          />
          <div className="action-bar">
            <Tooltip title="Crop">
              <IconButton onClick={() => setStage('crop')}>
                <CropIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton onClick={() => setStage('edit')}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Retake">
              <IconButton onClick={handleRetake}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send">
              <IconButton onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}

      {stage === 'crop' && (
        <div className="camera-overlay">
          <CloseBtn />
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="crop-bar">
            <IconButton onClick={() => setStage('preview')}>
              <RestartAltIcon />
            </IconButton>
            <IconButton onClick={confirmCrop}>
              <CheckIcon />
            </IconButton>
          </div>
        </div>
      )}

      {stage === 'edit' && (
        <div className="camera-overlay">
          <CloseBtn />
          <canvas ref={initFabric} className="fabric-canvas" />
          <Stack direction="row" className="toolbar">
            <Tooltip title="Pencil / Draw">
              <IconButton
                color={isDrawing ? 'primary' : 'default'}
                onClick={enableDraw}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Text">
              <IconButton onClick={addText}>
                <TextFieldsIcon />
              </IconButton>
            </Tooltip>
            <HexColorPicker
              color={brushColor}
              onChange={setBrushColor}
              style={{ width: 120, height: 120 }}
            />
            <Tooltip title="Confirm Edit">
              <IconButton onClick={confirmEdit}>
                <CheckIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </div>
      )}
    </div>
  );
};

export default CameraWorkflow;