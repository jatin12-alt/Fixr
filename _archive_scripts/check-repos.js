const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkRepos() {
  try {
    console.log('🔍 CHECKING REPOSITORIES IN DATABASE...\n');
    
    // Get all repos
    const repos = await sql`
      SELECT id, name, full_name, user_id, is_active, auto_fix_enabled 
      FROM repos 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 REPOSITORIES FOUND:');
    repos.forEach((repo, index) => {
      console.log(`${index + 1}. ID: ${repo.id}, Name: ${repo.name}, Full: ${repo.full_name}`);
      console.log(`   User: ${repo.user_id}, Active: ${repo.is_active}, AutoFix: ${repo.auto_fix_enabled}`);
    });
    
    if (repos.length === 0) {
      console.log('❌ NO REPOSITORIES FOUND IN DATABASE');
      console.log('\n💡 You may need to add repositories first via the /repos page');
    }
    
    console.log('\n🔍 CHECKING PIPELINE RUNS...');
    
    // Get recent pipeline runs
    const runs = await sql`
      SELECT id, repo_id, status, created_at, ai_explanation 
      FROM pipeline_runs 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    console.log('📊 RECENT PIPELINE RUNS:');
    runs.forEach((run, index) => {
      console.log(`${index + 1}. Run ID: ${run.id}, Repo ID: ${run.repo_id}, Status: ${run.status}`);
      console.log(`   Created: ${run.created_at}, AI: ${run.ai_explanation ? 'Yes' : 'No'}`);
    });
    
    if (runs.length === 0) {
      console.log('❌ NO PIPELINE RUNS FOUND');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

checkRepos();
