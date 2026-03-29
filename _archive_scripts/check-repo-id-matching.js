const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkRepoIdMatching() {
  try {
    console.log('🔍 CHECKING GITHUB ID MATCHING...\n');
    
    // Get all repos for the user
    const userId = 'user_3BQsQmiUma7XJ3WY8nyukKvvEoZ';
    
    const repos = await sql`
      SELECT id, name, full_name, github_id, user_id 
      FROM repos 
      WHERE user_id = ${userId}
    `;
    
    console.log('📋 REPOSITORIES IN DATABASE:');
    repos.forEach(repo => {
      console.log(`   ID: ${repo.id}, Name: ${repo.name}, GitHub ID: ${repo.github_id} (type: ${typeof repo.github_id})`);
    });
    
    // The GitHub ID that should be sent in webhooks
    const expectedGithubId = '1182288720';
    console.log(`\n🎯 EXPECTED GITHUB ID FROM WEBHOOK: ${expectedGithubId} (type: ${typeof expectedGithubId})`);
    
    // Check for exact matches
    const exactMatch = repos.find(repo => repo.github_id === expectedGithubId);
    if (exactMatch) {
      console.log('✅ EXACT MATCH FOUND:', exactMatch);
    } else {
      console.log('❌ NO EXACT MATCH FOUND');
      
      // Check for numeric matches
      const numericMatch = repos.find(repo => parseInt(repo.github_id) === parseInt(expectedGithubId));
      if (numericMatch) {
        console.log('⚠️ NUMERIC MATCH FOUND (but type mismatch):', numericMatch);
        console.log('💡 FIX: Convert githubId to string in database or comparison');
      }
    }
    
    // Check pipeline runs for this repo
    if (exactMatch) {
      const pipelineRuns = await sql`
        SELECT id, status, github_run_id, created_at 
        FROM pipeline_runs 
        WHERE repo_id = ${exactMatch.id}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      console.log('\n📊 RECENT PIPELINE RUNS:');
      pipelineRuns.forEach(run => {
        console.log(`   Run ID: ${run.id}, Status: ${run.status}, GitHub Run: ${run.github_run_id}, Created: ${run.created_at}`);
      });
    }
    
    console.log('\n🏁 ID MATCHING CHECK COMPLETE');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
}

checkRepoIdMatching();
