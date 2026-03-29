const { spawn } = require('child_process');
const child = spawn('npm', ['run', 'dev'], { 
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true 
});

child.on('error', (error) => {
  console.error('Error:', error);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
