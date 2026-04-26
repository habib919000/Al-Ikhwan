import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { RowDataPacket } from 'mysql2';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_dev_key';

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, membershipId } = req.body;
    
    // Check if it's an admin login (via email) or member login (via membershipId)
    if (email) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM admins WHERE email = ?', [email]);
      if (rows.length === 0) return (res.status(401) as any).json({ error: 'Invalid credentials' });

      const admin = rows[0];
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (!isMatch) return (res.status(401) as any).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { id: admin.id, email: admin.email, role: 'admin' } });
    }

    if (membershipId) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE membershipId = ?', [membershipId]);
      if (rows.length === 0) return (res.status(401) as any).json({ error: 'Invalid credentials' });

      const member = rows[0];
      const isMatch = await bcrypt.compare(password, member.password_hash);
      if (!isMatch) return (res.status(401) as any).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: member.id, membershipId: member.membershipId, role: 'member' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { id: member.id, name: member.name, membershipId: member.membershipId, role: 'member' } });
    }

    return (res.status(400) as any).json({ error: 'Identification required' });
  } catch (error) {
    console.error('Login error:', error);
    (res.status(500) as any).json({ error: 'Internal Server Error' });
  }
});
