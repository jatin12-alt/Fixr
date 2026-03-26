console.log('Starting simple DB test...');

try {
  const { neon } = require('@neondatabase/serverless');
  require('dotenv').config({ path: '.env.local' });
  
  console.log('Loaded neon and dotenv');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL is missing from .env.local');
    process.exit(1);
  }
  
  console.log('DATABASE_URL found, connecting...');
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Testing connection...');
  sql`SELECT NOW()`.then(result => {
    console.log('✅ Connection successful:', result[0]);
    
    console.log('Checking pipeline_runs table...');
    return sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pipeline_runs' AND column_name LIKE 'ai_%'
    `;
  }).then(columns => {
    console.log('AI columns found:', columns.length);
    columns.forEach(col => console.log('  -', col.column_name));
    
    if (columns.length === 0) {
      console.log('Adding AI columns...');
      return sql`
        ALTER TABLE pipeline_runs 
        ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
        ADD COLUMN IF NOT EXISTS ai_fix_suggestion TEXT,
        ADD COLUMN IF NOT EXISTS ai_code_fix TEXT,
        ADD COLUMN IF NOT EXISTS ai_severity TEXT,
        ADD COLUMN IF NOT EXISTS ai_category TEXT,
        ADD COLUMN IF NOT EXISTS ai_confidence INTEGER
      `;
    } else {
      console.log('AI columns already exist');
    }
  }).then(() => {
    console.log('✅ Migration completed successfully');
  }).catch(error => {
    console.error('❌ Error:', error.message);
  });
  
} catch (error) {
  console.error('❌ Setup error:', error.message);
}
