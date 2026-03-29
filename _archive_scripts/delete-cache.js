const fs = require('fs');
try {
  fs.rmSync('c:\\Dev\\Fixr\\.next', { recursive: true, force: true });
  console.log('Cleaned .next directory');
} catch (e) {
  console.error('Error cleaning .next:', e.message);
}
