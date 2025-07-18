const QRCode = require('qrcode');

const generateQRCode = async (userId, eventId) => {
  try {
    const qrData = `user:${userId},event:${eventId}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    return qrCodeUrl;
  } catch (error) {
    throw new Error('Error generating QR code: ' + error.message);
  }
};

module.exports = { generateQRCode };