const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function executeDirectSQL() {
  try {
    console.log('🔧 DIRECT SQL EXECUTION ON NEON...\n');
    
    // Test database connection first
    console.log('1. Testing database connection...');
    const testResult = await sql`SELECT NOW()`;
    console.log('✅ DB Connection OK:', testResult[0].now);
    
    // Check current pipeline_runs table structure
    console.log('\n2. Checking current pipeline_runs columns...');
    const currentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs'
      ORDER BY ordinal_position
    `;
    
    console.log('Current columns:');
    currentColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Execute the ALTER TABLE command
    console.log('\n3. Executing ALTER TABLE command...');
    const alterResult = await sql`
      ALTER TABLE pipeline_runs 
      ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
      ADD COLUMN IF NOT EXISTS ai_fix_suggestion TEXT,
      ADD COLUMN IF NOT EXISTS ai_code_fix TEXT,
      ADD COLUMN IF NOT EXISTS ai_severity TEXT,
      ADD COLUMN IF NOT EXISTS ai_category TEXT,
      ADD COLUMN IF NOT EXISTS ai_confidence INTEGER
    `;
    
    console.log('✅ ALTER TABLE executed successfully');
    
    // Verify the AI columns were added
    console.log('\n4. Verifying AI columns were added...');
    const aiColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs' 
      AND column_name LIKE 'ai_%'
      ORDER BY ordinal_position
    `;
    
    console.log('AI columns found:');
    if (aiColumns.length === 0) {
      console.log('   ❌ No AI columns found!');
    } else {
      aiColumns.forEach(col => {
        console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
      });
    }
    
    console.log(`\n🎉 SUCCESS: Added ${aiColumns.length} AI columns to pipeline_runs table`);
    
  } catch (error) {
    console.error('❌ SQL EXECUTION ERROR:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

executeDirectSQL();
