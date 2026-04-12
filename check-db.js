
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function check() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
  
  if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    return;
  }
  
  const sql = neon(dbUrlMatch[1]);
  try {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    console.log('Columns in users table:');
    console.log(JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error('Error fetching columns:', err);
  }
}

check();
