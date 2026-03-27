console.log('🔍 VERIFYING WEBHOOK ROUTE STRUCTURE...\n');

const fs = require('fs');
const path = require('path');

const webhookRoutePath = path.join(__dirname, 'app/api/webhook/github/route.ts');

if (fs.existsSync(webhookRoutePath)) {
  console.log('✅ Webhook route file exists:', webhookRoutePath);
  
  const content = fs.readFileSync(webhookRoutePath, 'utf8');
  
  // Check for POST export
  if (content.includes('export async function POST')) {
    console.log('✅ POST function is exported');
  } else {
    console.log('❌ POST function NOT found');
  }
  
  // Check for GET export (for testing)
  if (content.includes('export async function GET')) {
    console.log('✅ GET function is exported (for testing)');
  }
  
  // Check for the big console.log
  if (content.includes('🚀 WEBHOOK RECEIVED')) {
    console.log('✅ Debug logging added');
  } else {
    console.log('❌ Debug logging NOT found');
  }
  
  // Check for Next.js imports
  if (content.includes('NextRequest') && content.includes('NextResponse')) {
    console.log('✅ Next.js imports present');
  } else {
    console.log('❌ Next.js imports missing');
  }
  
} else {
  console.log('❌ Webhook route file NOT found:', webhookRoutePath);
}

// Check middleware
const middlewarePath = path.join(__dirname, 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  if (middlewareContent.includes('/api/webhook/github(.*)')) {
    console.log('✅ Webhook route is in public routes');
  } else {
    console.log('❌ Webhook route NOT in public routes');
  }
} else {
  console.log('❌ Middleware file not found');
}

console.log('\n🏁 ROUTE VERIFICATION COMPLETE');
