const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function quickTest() {
  try {
    console.log('🧪 QUICK DB TEST...\n');
    
    // Test 1: Simple repo query
    console.log('1. Testing simple repo query...');
    const simpleRepos = await sql`SELECT id, name, full_name FROM repos LIMIT 3`;
    console.log('   Simple repos:', simpleRepos);
    
    // Test 2: Query with user filter
    console.log('\n2. Testing with user filter...');
    const userId = 'user_3BQsQmiUma7XJ3WY8nyukKvvEoZ';
    const userRepos = await sql`SELECT id, name, full_name FROM repos WHERE user_id = ${userId}`;
    console.log('   User repos:', userRepos);
    
    // Test 3: Query specific repo
    console.log('\n3. Testing specific repo (ID: 4)...');
    const specificRepo = await sql`SELECT id, name, full_name, user_id FROM repos WHERE id = 4`;
    console.log('   Specific repo:', specificRepo);
    
    // Test 4: Test the exact API query
    console.log('\n4. Testing exact API query...');
    const apiQuery = await sql`
      SELECT 
        repos.id, repos.name, repos.full_name, repos.user_id,
        users.clerk_id
      FROM repos
      LEFT JOIN users ON repos.user_id = users.clerk_id
      WHERE repos.id = 4 AND repos.user_id = ${userId}
      LIMIT 1
    `;
    console.log('   API query result:', apiQuery);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

quickTest();
