const { execSync } = require('child_process');
const fs = require('fs');

try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  fs.writeFileSync('c:\\Dev\\Fixr\\git_branch_info.txt', branch);
} catch (e) {
  fs.writeFileSync('c:\\Dev\\Fixr\\git_branch_info.txt', 'Error: ' + e.message);
}
