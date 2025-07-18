import React, { useState, useRef } from 'react';
import api from 'api/axios';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const CardDesigner = () => {
  const [templateName, setTemplateName] = useState('');
  // Card style states
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [logoUrl, setLogoUrl] = useState('');

  // Other states
  const [isSaving, setIsSaving] = useState(false);
  const cardRef = useRef(null);

  // Sample data for preview
  const sampleData = {
    userName: 'John Doe',
    eventName: 'Annual Tech Conference',
    qrUrl: ''
  };

  // Generate a sample QR code for the preview, runs only once
  const [sampleQr, setSampleQr] = useState('');
  useState(() => {
    QRCode.toDataURL('sample-qr-code-for-preview', { width: 80, margin: 1 })
      .then(url => {
        setSampleQr(url);
      })
      .catch(err => {
        console.error('Failed to generate sample QR code', err);
      });
  }, []);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a temporary URL to display the logo in the preview
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!templateName) {
      return toast.error('Please provide a template name.');
    }
    setIsSaving(true);
    try {
      // The current approach saves a static image of the card.
      // A more flexible approach would be to save the style properties (colors, fonts)
      // as JSON, so the card can be dynamically generated with real user data later.
      // However, to stick to the existing structure, we'll continue with html2canvas.
      const canvas = await html2canvas(cardRef.current);
      const designJson = JSON.stringify({
        bgColor,
        textColor,
        fontFamily,
        // In a real scenario, you'd upload the logo and store its URL.
        // For this example, we'll embed the logo data if it exists.
        logoUrl,
        // Saving the canvas image as a fallback/preview
        image: canvas.toDataURL('image/png')
      });

      await api.post('/card-designs', { templateName, designJson });
      toast.success('Card design saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving card design');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const cardNode = cardRef.current;
    if (!cardNode) return;

    const printWindow = window.open('', '_blank', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Print Card</title>');
    // It's better to inline styles for printing to ensure they are applied correctly.
    printWindow.document.write('<style>body { margin: 0; } .card-print { border: 1px dashed #ccc; padding: 20px; width: 350px; height: 200px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; } </style>');
    printWindow.document.write('</head><body>');
    // Clone the node's content and styles to the new window
    const content = cardNode.innerHTML;
    const styles = cardNode.style.cssText;
    printWindow.document.write(`<div class="card-print" style="${styles}">${content}</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Column 1: Controls */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-2xl font-bold mb-6">Card Designer</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Conference Pass"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Background Color</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full p-1 h-10 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Text Color</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full p-1 h-10 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Upload Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="btn-primary w-full disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handlePrint}
            className="btn-secondary w-full"
          >
            Print Preview
          </button>
        </div>
      </div>

      {/* Column 2: Preview */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-600">Live Preview</h3>
        <div
          ref={cardRef}
          className="w-[350px] h-[200px] p-4 shadow-lg rounded-lg flex flex-col justify-between"
          style={{ backgroundColor: bgColor, color: textColor, fontFamily: fontFamily }}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-bold text-lg">{sampleData.eventName}</p>
              <p className="text-xs">ATTENDANCE CARD</p>
            </div>
            {logoUrl && <img src={logoUrl} alt="Logo" className="max-h-10 max-w-[100px]" />}
          </div>

          {/* Card Body */}
          <div className="flex items-center justify-start gap-4">
            {sampleQr && <img src={sampleQr} alt="Sample QR Code" className="w-20 h-20 bg-white p-1 rounded" />}
            <div>
              <p className="text-sm">Attendee:</p>
              <p className="font-bold text-xl">{sampleData.userName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDesigner;