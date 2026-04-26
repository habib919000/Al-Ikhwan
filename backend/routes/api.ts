import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { pool } from '../db.js';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const apiRouter = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage logic to use UUIDs to prevent path traversal
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (!ext) ext = ''; // default fallback
    cb(null, crypto.randomUUID() + ext);
  }
});

// Add file filter to prevent malicious script uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ storage, fileFilter });

// --- Auth Info ---
apiRouter.get('/me', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    if (req.user.role === 'admin') {
      return res.json({ role: 'admin', user: req.user });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    const [transactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions WHERE memberId = ? ORDER BY date DESC', [req.user.id]);
    const [files] = await pool.query<RowDataPacket[]>('SELECT * FROM files WHERE memberId = ? ORDER BY uploadDate DESC', [req.user.id]);

    res.json({ 
      role: 'member', 
      member: rows[0],
      transactions,
      files
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Generic pagination helper
function getPagination(req: AuthRequest) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // hard cap
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// --- Stats API ---
apiRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  try {
    const [members] = await pool.query<RowDataPacket[]>('SELECT * FROM members');
    const [transactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions');
    const [events] = await pool.query<RowDataPacket[]>('SELECT * FROM events');
    const [announcements] = await pool.query<RowDataPacket[]>('SELECT * FROM announcements ORDER BY date DESC LIMIT 5');

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingDues = members.reduce((acc, m) => acc + Number(m.dues), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyCollection = transactions
      .filter(t => {
        const d = new Date(t.date);
        return Number(t.amount) > 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const recentExpenses = Math.abs(transactions
      .filter(t => {
        const d = new Date(t.date);
        return Number(t.amount) < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + Number(t.amount), 0));

    // Recent Activity mapping
    const recentActivity = [
      ...transactions.slice(0, 5).map(t => ({
        id: t.id,
        title: Number(t.amount) > 0 ? 'Payment Received' : 'Expense Recorded',
        desc: Number(t.amount) > 0 ? `${t.name} paid ৳${t.amount}` : `${t.name}: ৳${Math.abs(Number(t.amount))}`,
        date: t.date
      })),
      ...members.slice(-3).map(m => ({
        id: m.id,
        title: 'New Member',
        desc: `${m.name} joined the association`,
        date: m.joinedDate
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Chart Data (Last 6 months)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      const collection = transactions
        .filter(t => {
          const td = new Date(t.date);
          return Number(t.amount) > 0 && td.getMonth() === monthIdx && td.getFullYear() === year;
        })
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const expenses = Math.abs(transactions
        .filter(t => {
          const td = new Date(t.date);
          return Number(t.amount) < 0 && td.getMonth() === monthIdx && td.getFullYear() === year;
        })
        .reduce((acc, t) => acc + Number(t.amount), 0));

      chartData.push({ name: month, collection, expenses });
    }

    const totalBalance = transactions.reduce((acc, t) => acc + Number(t.amount), 0);

    res.json({
      totalMembers, activeMembers, monthlyCollection, pendingDues,
      upcomingEvents: events.filter(e => e.status === 'published').length,
      recentExpenses, recentActivity, announcements, chartData, totalBalance
    });
  } catch (error) {
    console.error('[GEt /stats]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Announcements API ---
apiRouter.get('/announcements', async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM announcements ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM announcements');
    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.post('/announcements', async (req: Request, res: Response) => {
  const { title, message, type } = req.body;
  const id = crypto.randomUUID();
  const date = new Date().toISOString();

  try {
    await pool.query('INSERT INTO announcements (id, title, message, type, date) VALUES (?, ?, ?, ?, ?)', [id, title, message, type, date]);
    const [newAnn] = await pool.query<RowDataPacket[]>('SELECT * FROM announcements WHERE id = ?', [id]);
    res.status(201).json(newAnn[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Members API ---
apiRouter.get('/members', async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM members ORDER BY name ASC LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM members');
    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.get('/members/:id/profile', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [memberRows] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE id = ?', [id]);
    if (memberRows.length === 0) return res.status(404).json({ error: 'Member not found' });
    const member = memberRows[0];

    const [transactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions WHERE memberId = ? ORDER BY date DESC', [id]);
    const [files] = await pool.query<RowDataPacket[]>('SELECT * FROM files WHERE memberId = ? ORDER BY uploadDate DESC', [id]);

    const totalDeposits = transactions.filter(t => t.type === 'Deposit').reduce((acc, t) => acc + Number(t.amount), 0);

    res.json({ member, transactions, files, totalDeposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.post('/members', async (req: Request, res: Response) => {
  const { name, phone, email, address, bloodGroup } = req.body;
  const id = crypto.randomUUID();
  
  try {
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM members');
    const membershipId = `IK-${(countRows[0].count + 1).toString().padStart(3, '0')}`;
    const joinedDate = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO members (id, name, membershipId, status, phone, email, address, bloodGroup, dues, joinedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, membershipId, 'active', phone, email, address, bloodGroup, 0, joinedDate]
    );

    const [newMem] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE id = ?', [id]);
    res.status(201).json(newMem[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.put('/members/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, status, dues, membershipId, joinedDate, email, address, bloodGroup } = req.body;
  try {
    await pool.query(
      'UPDATE members SET name = ?, phone = ?, status = ?, dues = ?, membershipId = ?, joinedDate = ?, email = ?, address = ?, bloodGroup = ? WHERE id = ?',
      [name, phone, status, dues, membershipId, joinedDate, email, address, bloodGroup, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.delete('/members/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Error' });
  }
});

// --- File Upload ---
apiRouter.post('/members/:id/files', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileId = crypto.randomUUID();
  try {
    await pool.query(
      'INSERT INTO files (id, memberId, name, type, size, path, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fileId, req.params.id, file.originalname, file.mimetype, file.size, `/uploads/${file.filename}`, new Date().toISOString()]
    );
    const [newFile] = await pool.query<RowDataPacket[]>('SELECT * FROM files WHERE id = ?', [fileId]);
    res.status(201).json(newFile[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Transactions & Payments ---
apiRouter.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM transactions');
    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.post('/payments', async (req: Request, res: Response) => {
  const { memberId, amount, method } = req.body;
  try {
    const [m] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE id = ?', [memberId]);
    if (m.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const transactionId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO transactions (id, memberId, name, type, amount, date, status, method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, memberId, m[0].name, 'Deposit', Number(amount), new Date().toISOString(), 'completed', method]
    );

    const newDues = Math.max(0, Number(m[0].dues) - Number(amount));
    await pool.query('UPDATE members SET dues = ? WHERE id = ?', [newDues, memberId]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/expenses', async (req: Request, res: Response) => {
  const { name, amount, category, date, method } = req.body;
  try {
    await pool.query(
      'INSERT INTO transactions (id, memberId, name, type, amount, date, status, method) VALUES (?, null, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), name, category || 'Expense', -Math.abs(Number(amount)), date || new Date().toISOString(), 'completed', method]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Events ---
apiRouter.get('/events', async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM events ORDER BY date DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM events');
    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' });
  }
});

apiRouter.post('/events', async (req: Request, res: Response) => {
  const { title, date, location, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO events (id, title, date, location, attendees, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), title, date, location, 0, 'published', description]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' });
  }
});
