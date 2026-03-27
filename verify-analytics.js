const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verifyAnalytics() {
  try {
    console.log('🔍 VERIFYING DASHBOARD ANALYTICS...\n');
    
    const userId = 'user_3BQsQmiUma7XJ3WY8nyukKvvEoZ'; // From earlier logs
    
    // 1. Check total pipeline runs
    console.log('1. TOTAL PIPELINE RUNS:');
    const totalRuns = await sql`
      SELECT COUNT(*) as count FROM pipeline_runs pr
      JOIN repos r ON pr.repo_id = r.id
      WHERE r.user_id = ${userId}
    `;
    console.log(`   Total runs: ${totalRuns[0].count}`);
    
    // 2. Check successful fixes (fixed_and_merged)
    console.log('\n2. SUCCESSFUL FIXES:');
    const fixesApplied = await sql`
      SELECT COUNT(*) as count FROM pipeline_runs pr
      JOIN repos r ON pr.repo_id = r.id
      WHERE r.user_id = ${userId} AND pr.status = 'fixed_and_merged'
    `;
    console.log(`   Fixed & merged: ${fixesApplied[0].count}`);
    
    // 3. Calculate expected metrics
    const fixesCount = parseInt(fixesApplied[0].count);
    const timeReclaimed = fixesCount * 0.5;
    const savings = timeReclaimed * 50;
    
    console.log('\n3. EXPECTED DASHBOARD METRICS:');
    console.log(`   Auto-Fixes: ${fixesCount}`);
    console.log(`   Time Reclaimed: ${timeReclaimed}h`);
    console.log(`   Total Savings: $${savings}`);
    
    // 4. Check 7-day data
    console.log('\n4. LAST 7 DAYS ANALYTICS:');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7Days = await sql`
      SELECT 
        pr.status,
        pr.created_at,
        DATE(pr.created_at) as date
      FROM pipeline_runs pr
      JOIN repos r ON pr.repo_id = r.id
      WHERE r.user_id = ${userId} AND pr.created_at >= ${sevenDaysAgo}
      ORDER BY pr.created_at DESC
    `;
    
    const failures = last7Days.filter(run => 
      run.status === 'failure' || run.status === 'failed'
    ).length;
    
    const fixes = last7Days.filter(run => 
      run.status === 'fixed_and_merged' || run.status === 'fixed'
    ).length;
    
    console.log(`   Last 7 days failures: ${failures}`);
    console.log(`   Last 7 days fixes: ${fixes}`);
    
    // 5. Check for any AI commits that should be filtered
    console.log('\n5. LOOP BREAKER VERIFICATION:');
    const aiCommits = await sql`
      SELECT COUNT(*) as count FROM pipeline_runs pr
      JOIN repos r ON pr.repo_id = r.id
      WHERE r.user_id = ${userId} 
      AND (pr.error_message LIKE '%🤖%' OR pr.ai_fix_suggestion LIKE '%🤖%')
    `;
    console.log(`   Potential AI commits in DB: ${aiCommits[0].count}`);
    
    console.log('\n✅ ANALYTICS VERIFICATION COMPLETE');
    console.log('📊 Refresh your dashboard to see these numbers!');
    
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error);
  }
}

verifyAnalytics();
