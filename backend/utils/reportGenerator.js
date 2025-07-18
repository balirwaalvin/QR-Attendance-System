const PDFDocument = require('pdfkit');
const excel = require('excel4node');

const generatePDFReport = (rows, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');
  doc.pipe(res);
  doc.fontSize(16).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  rows.forEach(row => {
    doc.text(`${row.userName} - ${row.eventName} - ${new Date(row.time).toLocaleString()}`);
    doc.moveDown(0.5);
  });
  doc.end();
};

const generateExcelReport = (rows, res) => {
  const wb = new excel.Workbook();
  const ws = wb.addWorksheet('Attendance');
  ws.cell(1, 1).string('User');
  ws.cell(1, 2).string('Event');
  ws.cell(1, 3).string('Time');
  rows.forEach((row, i) => {
    ws.cell(i + 2, 1).string(row.userName);
    ws.cell(i + 2, 2).string(row.eventName);
    ws.cell(i + 2, 3).string(new Date(row.time).toLocaleString());
  });
  wb.write(res, 'attendance.xlsx');
};

module.exports = { generatePDFReport, generateExcelReport };