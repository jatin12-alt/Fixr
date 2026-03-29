const fs = require('fs');

try {
  fs.unlinkSync('c:\\Dev\\Fixr\\app\\sign-in\\page.tsx');
  console.log('Deleted sign-in/page.tsx');
} catch (e) {
  console.error('Error deleting sign-in/page.tsx:', e.message);
}

try {
  fs.unlinkSync('c:\\Dev\\Fixr\\app\\sign-up\\page.tsx');
  console.log('Deleted sign-up/page.tsx');
} catch (e) {
  console.error('Error deleting sign-up/page.tsx:', e.message);
}
