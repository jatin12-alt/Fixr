const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkAIColumns() {
  try {
    console.log('🔍 CHECKING AI COLUMNS IN pipeline_runs TABLE...\n');
    
    // Check if AI columns exist
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs' 
      AND column_name LIKE 'ai_%'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      console.log('❌ NO AI COLUMNS FOUND');
      return;
    }
    
    console.log('✅ AI COLUMNS FOUND:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n📊 CHECKING REPOSITORIES...');
    
    // Get repositories
    const repos = await sql`
      SELECT id, name, full_name, user_id, is_active, auto_fix_enabled 
      FROM repos 
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log('📋 REPOSITORIES:');
    repos.forEach((repo, index) => {
      console.log(`${index + 1}. ID: ${repo.id}, Name: ${repo.name}, AutoFix: ${repo.auto_fix_enabled}`);
    });
    
    if (repos.length > 0) {
      console.log('\n🎯 TEST THESE REPO IDs IN THE MODAL:');
      repos.forEach(repo => {
        console.log(`   - Repo ID: ${repo.id} (${repo.name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

checkAIColumns();
