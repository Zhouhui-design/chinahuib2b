const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG (base64 encoded)
const smallPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create 192x192 icon (repeating the small PNG won't work, so we'll create a simple one)
// For simplicity, we'll use a placeholder PNG
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), smallPng);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), smallPng);

console.log('Icons generated successfully!');