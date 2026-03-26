// Simple test to check if database connection works
try {
  const { db } = require('./lib/db');
  console.log('Database imported successfully');
  console.log('DB object:', typeof db);
} catch (error) {
  console.error('Database import error:', error.message);
}

try {
  console.log('Testing Next.js import...');
  const next = require('next');
  console.log('Next.js imported successfully');
} catch (error) {
  console.error('Next.js import error:', error.message);
}

console.log('Basic test completed');
