const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function fixDatabase() {
  try {
    console.log('Adding missing columns to repos table...');
    
    // Add missing columns
    await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS auto_fix_enabled boolean DEFAULT false`;
    console.log('✓ Added auto_fix_enabled column');
    
    await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS health_status text DEFAULT 'pending'`;
    console.log('✓ Added health_status column');
    
    await sql`ALTER TABLE repos ADD COLUMN IF NOT EXISTS last_scan_at timestamp`;
    console.log('✓ Added last_scan_at column');
    
    console.log('\n✅ Database schema updated successfully!');
    
    // Verify columns exist
    const columns = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'repos' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Current repos table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

fixDatabase();
