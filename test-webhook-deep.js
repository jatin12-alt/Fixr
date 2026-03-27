const http = require('http');

// Simulate a GitHub workflow_run failure webhook
const webhookPayload = {
  "action": "completed",
  "workflow_run": {
    "id": 123456789,
    "name": "CI/CD Pipeline",
    "head_branch": "main",
    "head_commit": {
      "message": "feat: add new feature",
      "id": "abc123"
    },
    "status": "completed",
    "conclusion": "failure",
    "created_at": "2024-03-27T14:30:00Z",
    "repository": {
      "id": 1182288720,
      "name": "CodeSense-AI",
      "full_name": "jatin12-alt/CodeSense-AI",
      "owner": {
        "login": "jatin12-alt"
      }
    }
  },
  "repository": {
    "id": 1182288720,
    "name": "CodeSense-AI", 
    "full_name": "jatin12-alt/CodeSense-AI",
    "owner": {
      "login": "jatin12-alt"
    }
  }
};

const payloadString = JSON.stringify(webhookPayload);
const crypto = require('crypto');
const secret = 'fixr-webhook-secret'; // Must match your WEBHOOK_SECRET

// Create GitHub signature
const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

console.log('🧪 TESTING WEBHOOK WITH DEEP LOGGING...');
console.log('🔑 SIGNATURE:', signature);
console.log('📦 PAYLOAD_SIZE:', payloadString.length);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhook/github',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString),
    'x-hub-signature-256': signature,
    'x-github-event': 'workflow_run',
    'User-Agent': 'GitHub-Hookshot/abc123'
  }
};

const req = http.request(options, (res) => {
  console.log(`📊 RESPONSE STATUS: ${res.statusCode}`);
  console.log(`📋 RESPONSE HEADERS:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📤 RESPONSE BODY: ${data}`);
    
    if (res.statusCode === 200) {
      console.log('✅ WEBHOOK SUCCESSFUL!');
      console.log('🔍 CHECK YOUR TERMINAL FOR DETAILED LOGS');
      console.log('🔍 Look for these messages:');
      console.log('   🚀 WEBHOOK RECEIVED!');
      console.log('   📥 RECEIVED EVENT: workflow_run');
      console.log('   🔍 REPO ID FROM GITHUB: 1182288720');
      console.log('   🔄 WORKFLOW STATUS: completed');
      console.log('   🔄 WORKFLOW CONCLUSION: failure');
    } else {
      console.log('❌ WEBHOOK FAILED WITH STATUS:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ REQUEST ERROR: ${e.message}`);
  console.log('💡 Make sure your dev server is running on port 3000');
});

req.write(payloadString);
req.end();

console.log('⏳ WEBHOOK SENT - CHECK TERMINAL FOR LOGS...');
