const fs = require('fs');
const files = [
  'add-ai-columns.js', 'add-missing-columns.sql', 'add-sample-repo.js', 'capture_dev_output.bat', 
  'capture_output.bat', 'check-ai-columns.js', 'check-fixr.bat', 'check-production-ready.bat', 
  'check-production-ready.sh', 'check-repo-id-matching.js', 'check-repos-schema.js', 'check-repos.js', 
  'debug_dev.js', 'delete-cache.js', 'delete.js', 'diagnose.bat', 'diagnose.sh', 'execute-sql-migration.js', 
  'fix-database.js', 'fix-repos-schema.js', 'install-analytics.bat', 'install-analytics.sh', 'install-testing-deps.bat', 
  'install-testing-deps.sh', 'manual-ai-columns.sql', 'quick-db-test.js', 'run_dev.js', 'setup-prisma.bat', 
  'setup-prisma.sh', 'show_dev_output.bat', 'show_output.bat', 'simple-db-test.js', 'start_server.bat', 
  'start-fixr.bat', 'test_imports.js', 'test-dashboard.js', 'test-repo-api.js', 'test-server.bat', 
  'test-webhook-deep.js', 'test-webhook.js', 'verify-analytics.js', 'verify-webhook-route.js'
];

if (!fs.existsSync('_archive_scripts')) {
  fs.mkdirSync('_archive_scripts');
}

let moved = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    fs.renameSync(f, '_archive_scripts/' + f);
    console.log('Moved:', f);
    moved++;
  }
});

console.log('Successfully archived', moved, 'files.');
