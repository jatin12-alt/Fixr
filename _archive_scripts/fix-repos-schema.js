const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixReposSchema() {
  try {
    console.log('🔧 FIXING REPOS TABLE SCHEMA...\n');
    
    // Add missing columns one by one
    const columns = [
      { name: 'auto_fix_enabled', type: 'BOOLEAN DEFAULT false' },
      { name: 'health_status', type: "TEXT DEFAULT 'pending'" },
      { name: 'last_scan_at', type: 'TIMESTAMP' },
      { name: 'webhook_id', type: 'TEXT' },
      { name: 'auto_mode', type: 'BOOLEAN DEFAULT false' },
      { name: 'team_id', type: 'INTEGER' }
    ];
    
    for (const column of columns) {
      try {
        console.log(`Adding column: ${column.name}...`);
        await sql.raw(`ALTER TABLE repos ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
        console.log(`✅ Added: ${column.name}`);
      } catch (error) {
        console.log(`⚠️ Could not add ${column.name}:`, error.message);
      }
    }
    
    // Verify the schema
    console.log('\n📋 VERIFYING REPOS TABLE SCHEMA...');
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'repos' 
      ORDER BY ordinal_position
    `;
    
    console.log('Current repos table columns:');
    result.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.column_default || ''}`);
    });
    
    // Test query
    console.log('\n🧪 TESTING QUERY...');
    try {
      const test = await sql`
        SELECT id, name, full_name, user_id, is_active, auto_fix_enabled, health_status, last_scan_at, webhook_id
        FROM repos 
        WHERE id = 4
      `;
      console.log('✅ Query successful:', test[0]);
    } catch (error) {
      console.log('❌ Query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ SCHEMA FIX ERROR:', error);
  }
}

fixReposSchema();
