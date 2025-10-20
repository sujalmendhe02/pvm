import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X, Loader2 } from 'lucide-react';

export default function QRScanner({ onScanSuccess, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setPermissionGranted(true);
      }

      const reader = codeReaderRef.current;

      reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText();

          const urlMatch = text.match(/machineKey=([A-Z0-9]+)/i);
          if (urlMatch) {
            onScanSuccess(urlMatch[1].toUpperCase());
            stopScanning();
          } else if (/^[A-Z0-9]{8}$/i.test(text)) {
            onScanSuccess(text.toUpperCase());
            stopScanning();
          } else {
            setError('Invalid QR code format');
          }
        }

        if (err && err.name !== 'NotFoundException') {
          console.error('Scan error:', err);
        }
      });
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to access camera. Please check your permissions.');
      }
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setPermissionGranted(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Scan QR Code</h3>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!permissionGranted && !scanning ? (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Position the QR code within the frame to scan
              </p>
              <button
                onClick={startScanning}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center space-x-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                <span>Start Camera</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '400px' }}
              />
              {scanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-white rounded-lg w-64 h-64 shadow-lg"></div>
                </div>
              )}
              {scanning && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Scanning...</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleClose}
            className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
