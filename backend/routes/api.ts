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

const upload = multer({ storage, fileFilter: fileFilter as any });

// --- Auth Info ---
apiRouter.get('/me', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    if (req.user.role === 'admin') {
      return res.json({ role: 'admin', user: req.user });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, membershipId, status, phone, email, dues, joinedDate FROM members WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    const [transactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions WHERE memberId = ? ORDER BY date DESC', [req.user.id]);
    const [files] = await pool.query<RowDataPacket[]>('SELECT id, name, type, size, uploadDate FROM files WHERE memberId = ? ORDER BY uploadDate DESC', [req.user.id]);

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

// Admin access check helper
const isAdmin = (req: AuthRequest, res: Response, next: () => void) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
};

// Generic pagination helper
function getPagination(req: AuthRequest) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // hard cap
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// --- Stats API ---
apiRouter.get('/stats', isAdmin as any, async (req: AuthRequest, res: Response) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // MySQL months are 1-based in some contexts but we'll use string formatting
    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}%`;

    // Using SQL aggregations for performance
    const [statsRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM members) as totalMembers,
        (SELECT COUNT(*) FROM members WHERE status = 'active') as activeMembers,
        (SELECT SUM(dues) FROM members) as pendingDues,
        (SELECT SUM(amount) FROM transactions WHERE amount > 0 AND date LIKE ?) as monthlyCollection,
        (SELECT SUM(ABS(amount)) FROM transactions WHERE amount < 0 AND date LIKE ?) as recentExpenses,
        (SELECT SUM(amount) FROM transactions) as totalBalance
      FROM DUAL
    `, [currentMonthStr, currentMonthStr]);

    const stats = statsRows[0];

    // Recent Activity mapping (Limited fetch)
    const [recentTransactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions ORDER BY date DESC LIMIT 5');
    const [recentMembers] = await pool.query<RowDataPacket[]>('SELECT * FROM members ORDER BY joinedDate DESC LIMIT 3');
    const [announcements] = await pool.query<RowDataPacket[]>('SELECT * FROM announcements ORDER BY date DESC LIMIT 5');
    const [events] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as upcoming FROM events WHERE status = "published"');

    const recentActivity = [
      ...recentTransactions.map(t => ({
        id: t.id,
        title: Number(t.amount) > 0 ? 'Payment Received' : 'Expense Recorded',
        desc: Number(t.amount) > 0 ? `${t.name} paid ৳${t.amount}` : `${t.name}: ৳${Math.abs(Number(t.amount))}`,
        date: t.date
      })),
      ...recentMembers.map(m => ({
        id: m.id,
        title: 'New Member',
        desc: `${m.name} joined the association`,
        date: m.joinedDate
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Chart Data (Last 6 months using SQL for each)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthIdx = (d.getMonth() + 1).toString().padStart(2, '0');
      const searchStr = `${year}-${monthIdx}%`;

      const [monthStats] = await pool.query<RowDataPacket[]>(`
        SELECT 
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as collection,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses
        FROM transactions WHERE date LIKE ?
      `, [searchStr]);

      chartData.push({ 
        name: monthLabel, 
        collection: Number(monthStats[0].collection || 0), 
        expenses: Number(monthStats[0].expenses || 0) 
      });
    }

    res.json({
      totalMembers: stats.totalMembers,
      activeMembers: stats.activeMembers,
      monthlyCollection: Number(stats.monthlyCollection || 0),
      pendingDues: Number(stats.pendingDues || 0),
      upcomingEvents: events[0].upcoming,
      recentExpenses: Number(stats.recentExpenses || 0),
      recentActivity,
      announcements,
      chartData,
      totalBalance: Number(stats.totalBalance || 0)
    });
  } catch (error) {
    console.error('[GET /stats]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Announcements API ---
apiRouter.get('/announcements', async (req: AuthRequest, res: Response) => {
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

apiRouter.post('/announcements', isAdmin as any, async (req: AuthRequest, res: Response) => {
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
apiRouter.get('/members', isAdmin as any, async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, membershipId, status, phone, email, dues, joinedDate FROM members ORDER BY name ASC LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM members');
    res.json({ data: rows, total: countRows[0].total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.get('/members/:id/profile', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // RBAC + IDOR Protection
  if (req.user?.role !== 'admin' && req.user?.id !== id) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own profile' });
  }

  try {
    const [memberRows] = await pool.query<RowDataPacket[]>('SELECT id, name, membershipId, status, phone, email, address, bloodGroup, dues, joinedDate FROM members WHERE id = ?', [id]);
    if (memberRows.length === 0) return res.status(404).json({ error: 'Member not found' });
    const member = memberRows[0];

    const [transactions] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions WHERE memberId = ? ORDER BY date DESC', [id]);
    const [files] = await pool.query<RowDataPacket[]>('SELECT id, name, type, size, uploadDate FROM files WHERE memberId = ? ORDER BY uploadDate DESC', [id]);

    const totalDeposits = transactions.filter(t => t.type === 'Deposit').reduce((acc, t) => acc + Number(t.amount), 0);

    res.json({ member, transactions, files, totalDeposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.post('/members', isAdmin as any, async (req: AuthRequest, res: Response) => {
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

    const [newMem] = await pool.query<RowDataPacket[]>('SELECT id, name, membershipId FROM members WHERE id = ?', [id]);
    res.status(201).json(newMem[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

apiRouter.put('/members/:id', isAdmin as any, async (req: AuthRequest, res: Response) => {
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

apiRouter.delete('/members/:id', isAdmin as any, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Error' });
  }
});

// --- File Upload ---
apiRouter.post('/members/:id/files', upload.single('file'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // IDOR Protection
  if (req.user?.role !== 'admin' && req.user?.id !== id) {
    return res.status(403).json({ error: 'Forbidden: You can only upload files to your own profile' });
  }

  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileId = crypto.randomUUID();
  try {
    await pool.query(
      'INSERT INTO files (id, memberId, name, type, size, path, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fileId, id, file.originalname, file.mimetype, file.size, `/uploads/${file.filename}`, new Date().toISOString()]
    );
    const [newFile] = await pool.query<RowDataPacket[]>('SELECT id, name, type, size, uploadDate FROM files WHERE id = ?', [fileId]);
    res.status(201).json(newFile[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Transactions & Payments ---
apiRouter.get('/transactions', isAdmin as any, async (req: AuthRequest, res: Response) => {
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

apiRouter.post('/payments', isAdmin as any, async (req: AuthRequest, res: Response) => {
  const { memberId, amount, method } = req.body;
  if (!memberId || !amount) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const [m] = await pool.query<RowDataPacket[]>('SELECT * FROM members WHERE id = ?', [memberId]);
    if (m.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const transactionId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO transactions (id, memberId, name, type, amount, date, status, method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, memberId, m[0].name, 'Deposit', Number(amount), new Date().toISOString(), 'completed', method || 'Cash']
    );

    const newDues = Math.max(0, Number(m[0].dues) - Number(amount));
    await pool.query('UPDATE members SET dues = ? WHERE id = ?', [newDues, memberId]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/expenses', isAdmin as any, async (req: AuthRequest, res: Response) => {
  const { name, amount, category, date, method } = req.body;
  if (!name || !amount) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await pool.query(
      'INSERT INTO transactions (id, memberId, name, type, amount, date, status, method) VALUES (?, null, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), name, category || 'Expense', -Math.abs(Number(amount)), date || new Date().toISOString(), 'completed', method || 'Cash']
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Events ---
apiRouter.get('/events', async (req: AuthRequest, res: Response) => {
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

apiRouter.post('/events', isAdmin as any, async (req: AuthRequest, res: Response) => {
  const { title, date, location, description } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Missing required fields' });

  try {
    await pool.query(
      'INSERT INTO events (id, title, date, location, attendees, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), title, date, location || 'TBD', 0, 'published', description || '']
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' });
  }
});
