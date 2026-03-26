const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testRepoAPI() {
  try {
    console.log('🧪 TESTING REPO API LOGIC...\n');
    
    const repoId = 4; // Testing with PixelPureAI
    const userId = 'user_3BQsQmiUma7XJ3WY8nyukKvvEoZ'; // From your output
    
    console.log('🔍 INPUT DATA:');
    console.log(`   Repo ID: ${repoId}`);
    console.log(`   User ID: ${userId}`);
    
    // Step 1: Check if repo exists
    console.log('\n📋 STEP 1: CHECKING IF REPO EXISTS...');
    const repoCheck = await sql`
      SELECT id, name, full_name, user_id FROM repos WHERE id = ${repoId}
    `;
    
    console.log(`   Found ${repoCheck.length} repo(s) with ID ${repoId}`);
    if (repoCheck.length > 0) {
      console.log('   Repo details:', repoCheck[0]);
    }
    
    // Step 2: Check if user has access to this repo
    console.log('\n👤 STEP 2: CHECKING USER ACCESS...');
    const userRepoCheck = await sql`
      SELECT id, name, full_name, user_id 
      FROM repos 
      WHERE id = ${repoId} AND user_id = ${userId}
    `;
    
    console.log(`   Found ${userRepoCheck.length} repo(s) for this user`);
    if (userRepoCheck.length > 0) {
      console.log('   User repo details:', userRepoCheck[0]);
    } else {
      console.log('   ❌ USER DOES NOT HAVE ACCESS TO THIS REPO');
      
      // Show what repos this user has
      const userRepos = await sql`
        SELECT id, name, full_name FROM repos WHERE user_id = ${userId}
      `;
      console.log('   This user has these repos:');
      userRepos.forEach(repo => {
        console.log(`     - ID: ${repo.id}, Name: ${repo.name}`);
      });
    }
    
    // Step 3: Test the exact query from the API
    console.log('\n🔬 STEP 3: TESTING EXACT API QUERY...');
    const apiQuery = await sql`
      SELECT 
        repos.id, repos.name, repos.full_name, repos.user_id,
        users.clerk_id
      FROM repos
      LEFT JOIN users ON repos.user_id = users.clerk_id
      WHERE repos.id = ${repoId} AND repos.user_id = ${userId}
      LIMIT 1
    `;
    
    console.log(`   API query found ${apiQuery.length} result(s)`);
    if (apiQuery.length > 0) {
      console.log('   API query result:', apiQuery[0]);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

testRepoAPI();
