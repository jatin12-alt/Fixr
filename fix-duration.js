const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  const original = fs.readFileSync(filePath, 'utf8');
  const replaced = original.replace(/duration-(150|200|300|500|700|1000)/g, 'duration-[120ms]');
  if (original !== replaced) {
    fs.writeFileSync(filePath, replaced);
    console.log(`Updated ${filePath}`);
  }
}

try {
  walkDir(path.join(__dirname, 'app'), processFile);
  walkDir(path.join(__dirname, 'components'), processFile);
  console.log('Done!');
} catch (e) {
  console.error(e);
}
