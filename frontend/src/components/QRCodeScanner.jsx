import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { showSuccess, showError } from '../utils/notifications';
// ...existing code...

const QRCodeScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let stream = null;
    let animationFrameId = null;

    const startScanning = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const scan = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              setResult(code.data);
              handleScan(code.data);
            }
          }
          animationFrameId = requestAnimationFrame(scan);
        };
        animationFrameId = requestAnimationFrame(scan);
      } catch (err) {
        setError('Error accessing camera');
        showError('Error accessing camera');
      }
    };

    if (scanning) {
      startScanning();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [scanning]);

  const handleScan = async (data) => {
    try {
      // Rely on the global axios instance for auth headers and proxy.
      await axios.post('/api/attendance/record', { qrData: data });
      showSuccess('Attendance recorded');
      setResult('');
      setScanning(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Error recording attendance');
      setResult('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">QR Code Scanner</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {result && <p className="text-green-500 mb-4">Scanned: {result}</p>}
      <video ref={videoRef} className="w-full max-w-md mb-4" style={{ display: scanning ? 'block' : 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={() => setScanning(!scanning)}
        className="btn-orange p-2 rounded"
      >
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
    </div>
  );
};

export default QRCodeScanner;