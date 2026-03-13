import 'dotenv/config';
import db from './src/models/db.js';
import fs from 'fs';

async function runSetup() {
  try {
    const sql = fs.readFileSync('./src/models/setup.sql', 'utf8');
    await db.query(sql);
    console.log('Setup completed successfully');
  } catch (err) {
    console.error('Error running setup:', err);
  } finally {
    process.exit();
  }
}

runSetup();