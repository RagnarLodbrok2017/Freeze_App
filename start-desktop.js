const { spawn } = require('child_process');
const path = require('path');

// Set environment to production
process.env.NODE_ENV = 'production';

// Start Electron with the built application
const electronPath = process.platform === 'win32' 
  ? path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
  : path.join(__dirname, 'node_modules', '.bin', 'electron');

const mainPath = path.join(__dirname, 'dist', 'main.js');

console.log('Starting Freeze Guard Desktop Application...');
console.log('Electron path:', electronPath);
console.log('Main path:', mainPath);

const electronProcess = spawn(electronPath, [mainPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

electronProcess.on('close', (code) => {
  console.log(`Freeze Guard exited with code ${code}`);
});

electronProcess.on('error', (err) => {
  console.error('Failed to start Freeze Guard:', err);
});