const { spawn } = require('child_process');

console.log('Starting Next.js dev server...');

const child = spawn('cmd.exe', ['/c', 'npm run dev'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: false
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

child.on('error', (error) => {
  console.error('SPAWN ERROR:', error);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Keep the script running
setTimeout(() => {
  console.log('Timeout reached, killing process...');
  child.kill();
  process.exit(0);
}, 15000);
