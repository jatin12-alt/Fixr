const http = require('http');

const testData = {
  "test": "webhook_route_test",
  "timestamp": new Date().toISOString()
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhook/github',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-hub-signature-256': 'sha256=test123',
    'x-github-event': 'push'
  }
};

console.log('🧪 TESTING WEBHOOK ROUTE...');

const req = http.request(options, (res) => {
  console.log(`📊 STATUS: ${res.statusCode}`);
  console.log(`📋 HEADERS:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📤 RESPONSE: ${data}`);
    if (res.statusCode === 200) {
      console.log('✅ WEBHOOK ROUTE IS ACCESSIBLE!');
    } else {
      console.log('❌ WEBHOOK ROUTE RETURNED ERROR');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ REQUEST ERROR: ${e.message}`);
});

req.write(postData);
req.end();
