// This script generates preview images for the quotation templates
// It creates simple colored rectangles with template numbers as placeholders
// Run this script in the browser console when viewing the templates

const canvas = document.createElement('canvas');
canvas.width = 210;  // A4 width ratio
canvas.height = 297; // A4 height ratio
const ctx = canvas.getContext('2d');

// Generate preview images for 9 templates
for (let i = 1; i <= 9; i++) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set background color based on template number
  const colors = [
    '#f0f9ff', // blue-50
    '#f0fdf4', // green-50
    '#faf5ff', // purple-50
  ];
  ctx.fillStyle = colors[(i - 1) % 3];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add a header area
  ctx.fillStyle = ['#dbeafe', '#dcfce7', '#f3e8ff'][(i - 1) % 3]; // blue-100, green-100, purple-100
  ctx.fillRect(10, 10, canvas.width - 20, 40);
  
  // Add template number
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = ['#2563eb', '#16a34a', '#9333ea'][(i - 1) % 3]; // blue-600, green-600, purple-600
  ctx.textAlign = 'center';
  ctx.fillText(`Template ${i}`, canvas.width / 2, 35);
  
  // Add company info section
  ctx.fillStyle = '#f8fafc'; // slate-50
  ctx.fillRect(10, 60, canvas.width - 20, 40);
  
  // Add client info section
  ctx.fillStyle = '#f8fafc'; // slate-50
  ctx.fillRect(10, 110, canvas.width - 20, 40);
  
  // Add items table
  ctx.fillStyle = '#ffffff'; // white
  ctx.fillRect(10, 160, canvas.width - 20, 80);
  
  // Add table header
  ctx.fillStyle = ['#eff6ff', '#f0fdf4', '#faf5ff'][(i - 1) % 3]; // blue-50, green-50, purple-50
  ctx.fillRect(10, 160, canvas.width - 20, 20);
  
  // Add table rows
  for (let row = 0; row < 3; row++) {
    ctx.beginPath();
    ctx.moveTo(10, 180 + row * 20);
    ctx.lineTo(canvas.width - 10, 180 + row * 20);
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.stroke();
  }
  
  // Add table columns
  for (let col = 1; col < 4; col++) {
    const x = 10 + (col * (canvas.width - 20) / 4);
    ctx.beginPath();
    ctx.moveTo(x, 160);
    ctx.lineTo(x, 240);
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.stroke();
  }
  
  // Add footer
  ctx.fillStyle = ['#dbeafe', '#dcfce7', '#f3e8ff'][(i - 1) % 3]; // blue-100, green-100, purple-100
  ctx.fillRect(10, 250, canvas.width - 20, 30);
  
  // Convert to image and download
  const dataUrl = canvas.toDataURL('image/png');
  
  // In browser, this would download the image
  console.log(`Template ${i} preview generated: ${dataUrl.substring(0, 50)}...`);
  
  // For demonstration, output the data URL that would be used to create the image
  console.log(`Template ${i} data URL (first 50 chars): ${dataUrl.substring(0, 50)}...`);
}

console.log('Preview generation script completed. In a browser environment, this would generate downloadable images.');
