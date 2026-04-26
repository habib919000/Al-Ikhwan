import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const newMembers = [
  'Sajjad Hossain Prodhan',
  'Abdullah',
  'Hasan',
  'Habibur Rahman',
  'Shariful Islam',
  'Mosharaf Hossain',
  'Altaf Hossain',
  'Sohel',
  'Abdus Salam',
  'Mohammad Mozammel Haque',
  'Sheikh Nokibul Ahmed',
  'Mizanur Rahman',
  'Abul Khayer',
  'Zahid Mina',
  'Sultan Ahmed',
  'Mizanur Rahman Sheikh',
  'Mizanur Rahman',
  'Salauddin',
  'Masum',
  'Arif',
  'Redwan Ul Islam',
  'Hosneara',
  'Abdul Kader Dulal',
  'Rezwan Islam',
  'Amena Begum'
];

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
    database: process.env.DB_NAME || 'al_ikhwan',
  });

  console.log('⚠️ Clearing all existing members, files, and transactions...');
  await pool.query('DELETE FROM files');
  await pool.query('DELETE FROM transactions');
  await pool.query('DELETE FROM members');

  const memberPass = await bcrypt.hash('member123', 10);
  console.log(`✅ Inserting ${newMembers.length} new members...`);
  for (let i = 0; i < newMembers.length; i++) {
    const id = crypto.randomUUID();
    const name = newMembers[i];
    const membershipId = `IK-${(i + 1).toString().padStart(3, '0')}`;
    const joinedDate = new Date().toISOString().split('T')[0];
    
    await pool.query(
      'INSERT INTO members (id, name, membershipId, status, phone, dues, joinedDate, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, membershipId, 'active', '', 0, joinedDate, memberPass]
    );
  }
  
  console.log('🎉 Seed complete! Database is successfully updated.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
