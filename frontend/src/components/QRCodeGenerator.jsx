import React, { useState } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const [userId, setUserId] = useState('');
  const [eventId, setEventId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    if (!userId || !eventId) {
      setError('Please enter both User ID and Event ID.');
      toast.error('Please enter both User ID and Event ID.');
      return;
    }
    try {
      // Corrected QR data format to be consistent with the rest of the application.
      const qrData = `userId:${userId},eventId:${eventId}`;
      const qrCode = await QRCode.toDataURL(qrData);
      setQrCodeUrl(qrCode);
      toast.success('QR code generated successfully.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error generating QR code';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank', 'height=400,width=600');
    printWindow.document.write('<html><head><title>Print QR Code</title>');
    printWindow.document.write('<style>body { font-family: sans-serif; text-align: center; padding-top: 40px; } .qr-container { display: inline-block; border: 1px solid #ccc; padding: 20px; border-radius: 10px; } h2 { margin-bottom: 10px; } p { margin-top: 0; color: #555; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="qr-container">');
    printWindow.document.write('<h2>Event Attendance QR Code</h2>');
    printWindow.document.write(`<p>User ID: ${userId} | Event ID: ${eventId}</p>`);
    printWindow.document.write(`<img src="${qrCodeUrl}" alt="QR Code" />`);
    printWindow.document.write('</div>');
    printWindow.document.write('<script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }</script>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  const resetForm = () => {
    setUserId('');
    setEventId('');
    setQrCodeUrl('');
    setError('');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Generate QR Code</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700">User ID</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Event ID</label>
        <input
          type="number"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate QR Code
        </button>
        <button
          onClick={resetForm}
          className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      </div>
      {qrCodeUrl && (
        <div className="mt-6 p-4 border rounded-lg inline-block">
          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
          <button onClick={handlePrint} className="mt-4 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Print QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;