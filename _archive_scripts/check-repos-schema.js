const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkReposSchema() {
  try {
    console.log('🔍 CHECKING REPOS TABLE SCHEMA...\n');
    
    // Get all columns in repos table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'repos' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 REPOS TABLE COLUMNS:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Try to select a specific repo to see if there are schema issues
    console.log('\n🧪 TESTING SELECT QUERY...');
    try {
      const testSelect = await sql`
        SELECT id, name, full_name, user_id, is_active, auto_fix_enabled 
        FROM repos 
        WHERE id = 4
      `;
      console.log('✅ SELECT successful:', testSelect);
    } catch (selectError) {
      console.log('❌ SELECT failed:', selectError.message);
    }
    
    // Test the full select that might be failing
    console.log('\n🧪 TESTING FULL SELECT...');
    try {
      const fullSelect = await sql`
        SELECT * FROM repos WHERE id = 4
      `;
      console.log('✅ FULL SELECT successful:', fullSelect[0]);
    } catch (fullSelectError) {
      console.log('❌ FULL SELECT failed:', fullSelectError.message);
    }
    
  } catch (error) {
    console.error('❌ SCHEMA CHECK ERROR:', error);
  }
}

checkReposSchema();
