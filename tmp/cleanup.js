const fs = require('fs');
const files = [
  'components/RepoManagementModal.tsx',
  'components/Logo3D.tsx',
  'components/FixrLogo3D.tsx',
  'components/FixrNavLogo3D.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    fs.unlinkSync(f);
    console.log(`Deleted ${f}`);
  } else {
    console.log(`File not found: ${f}`);
  }
});
