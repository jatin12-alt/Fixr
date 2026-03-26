const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addSampleRepo() {
  try {
    console.log('🔧 ADDING SAMPLE REPOSITORY...\n');
    
    // First, let's check if user exists (you'll need to replace with actual Clerk ID)
    const clerkUserId = 'user_123456789'; // Replace with actual Clerk user ID
    
    // Check if user exists
    const users = await sql`
      SELECT clerk_id FROM users WHERE clerk_id = ${clerkUserId}
    `;
    
    if (users.length === 0) {
      console.log('❌ USER NOT FOUND. Creating user first...');
      await sql`
        INSERT INTO users (clerk_id, email) 
        VALUES (${clerkUserId}, 'test@example.com')
      `;
      console.log('✅ USER CREATED');
    }
    
    // Add sample repository
    const [repo] = await sql`
      INSERT INTO repos (
        name, 
        full_name, 
        user_id, 
        github_id, 
        url, 
        is_active, 
        auto_fix_enabled, 
        health_status,
        created_at
      ) VALUES (
        'sample-repo',
        'test-user/sample-repo',
        ${clerkUserId},
        '123456789',
        'https://github.com/test-user/sample-repo',
        true,
        true,
        'healthy',
        NOW()
      )
      RETURNING id, name, full_name, user_id
    `;
    
    console.log('✅ SAMPLE REPOSITORY ADDED:');
    console.log(`   ID: ${repo.id}`);
    console.log(`   Name: ${repo.name}`);
    console.log(`   Full Name: ${repo.full_name}`);
    console.log(`   User ID: ${repo.user_id}`);
    
    console.log('\n🎯 You can now test the modal with repo ID:', repo.id);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

addSampleRepo();
