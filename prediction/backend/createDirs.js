// backend/createDirs.js
const fs = require('fs');
const path = require('path');

const dirs = [
  'uploads/avatars',
  'uploads/documents',
  'uploads/prescriptions',
  'uploads/reports',
  'uploads/medical-reports',
  'uploads/chat-files',
  'logs'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${fullPath}`);
  }
});
