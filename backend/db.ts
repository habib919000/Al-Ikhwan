import mysql, { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbName = process.env.DB_NAME || 'al_ikhwan';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

export async function initDb() {
  const initConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
  });
  await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await initConnection.end();

  // Create tables as before
  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      membershipId VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      bloodGroup VARCHAR(10),
      dues DECIMAL(10,2) DEFAULT 0,
      joinedDate VARCHAR(255),
      password_hash VARCHAR(255)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      attendees INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'published',
      description TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(255) PRIMARY KEY,
      memberId VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      date VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'completed',
      method VARCHAR(50),
      FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS files (
      id VARCHAR(255) PRIMARY KEY,
      memberId VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      size INT NOT NULL,
      path TEXT NOT NULL,
      uploadDate VARCHAR(255) NOT NULL,
      FOREIGN KEY(memberId) REFERENCES members(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'all',
      date VARCHAR(255) NOT NULL,
      author VARCHAR(255) DEFAULT 'Admin'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS monthly_dues_log (
      id VARCHAR(255) PRIMARY KEY,
      monthIndex INT NOT NULL,
      year INT NOT NULL,
      processedDate VARCHAR(255)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Initial Admin User
  const [adminCount] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM admins');
  if (adminCount[0].count === 0) {
    const adminPass = await bcrypt.hash('admin123', 10);
    await pool.query('INSERT INTO admins (id, email, password_hash) VALUES (UUID(), ?, ?)', ['admin@example.com', adminPass]);
    console.log('✅ Default admin created. Login: admin@example.com / admin123');
  }

  // Seed default members if empty
  const [memberCounts] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM members');
  if (memberCounts[0].count === 0) {
    const defaultMembers = [
      'Sajjad Hossain Prodhan', 'Abdullah', 'Hasan', 'Habibur Rahman', 'Shariful Islam',
      'Mosharaf Hossain', 'Altaf Hossain', 'Sohel', 'Abdus Salam', 'Mohammad Mozammel Haque',
      'Sheikh Nokibul Ahmed', 'Mizanur Rahman', 'Abul Khayer', 'Zahid Mina', 'Sultan Ahmed',
      'Mizanur Rahman Sheikh', 'Mizanur Rahman', 'Salauddin', 'Masum', 'Arif',
      'Redwan Ul Islam', 'Hosneara', 'Abdul Kader Dulal', 'Rezwan Islam', 'Amena Begum'
    ];
    const memberPass = await bcrypt.hash('member123', 10);
    for (let i = 0; i < defaultMembers.length; i++) {
        const membershipId = `IK-${(i + 1).toString().padStart(3, '0')}`;
        await pool.query(
            'INSERT INTO members (id, name, membershipId, status, phone, dues, joinedDate, password_hash) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
            [defaultMembers[i], membershipId, 'active', '', 0, new Date().toISOString().split('T')[0], memberPass]
        );
    }
  }

  return pool;
}
