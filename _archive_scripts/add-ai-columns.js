const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addAIColumns() {
  try {
    console.log('🤖 Adding AI analysis columns to pipeline_runs table...');
    
    // Add AI analysis columns
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_explanation text`;
    console.log('✓ Added ai_explanation column');
    
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_fix_suggestion text`;
    console.log('✓ Added ai_fix_suggestion column');
    
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_code_fix text`;
    console.log('✓ Added ai_code_fix column');
    
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_severity text`;
    console.log('✓ Added ai_severity column');
    
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_category text`;
    console.log('✓ Added ai_category column');
    
    await sql`ALTER TABLE pipeline_runs ADD COLUMN IF NOT EXISTS ai_confidence integer`;
    console.log('✓ Added ai_confidence column');
    
    console.log('\n✅ AI columns added successfully!');
    
    // Verify columns exist
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs' 
      AND column_name LIKE 'ai_%'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 AI columns in pipeline_runs table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding AI columns:', error);
    process.exit(1);
  }
}

addAIColumns();
