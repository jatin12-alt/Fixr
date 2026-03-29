const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function executeSQLMigration() {
  try {
    console.log('🔧 EXECUTING DIRECT SQL MIGRATION...\n');
    
    // Execute the SQL to add AI columns to pipeline_runs
    const migrationSQL = `
      ALTER TABLE pipeline_runs 
      ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
      ADD COLUMN IF NOT EXISTS ai_fix_suggestion TEXT,
      ADD COLUMN IF NOT EXISTS ai_code_fix TEXT,
      ADD COLUMN IF NOT EXISTS ai_severity TEXT,
      ADD COLUMN IF NOT EXISTS ai_category TEXT,
      ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;
    `;
    
    console.log('📋 Executing SQL:', migrationSQL);
    
    await sql.query(migrationSQL);
    
    console.log('✅ SQL MIGRATION COMPLETED SUCCESSFULLY!');
    
    // Verify the columns were added
    console.log('\n🔍 VERIFYING COLUMNS...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs' 
      AND column_name LIKE 'ai_%'
      ORDER BY ordinal_position
    `;
    
    console.log('✅ AI Columns in pipeline_runs:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    if (columns.length === 0) {
      console.log('❌ No AI columns found - migration may have failed');
    } else {
      console.log(`✅ Found ${columns.length} AI columns - migration successful!`);
    }
    
  } catch (error) {
    console.error('❌ SQL MIGRATION FAILED:', error);
    throw error;
  }
}

executeSQLMigration();
