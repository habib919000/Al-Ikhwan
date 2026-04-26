import mysql, { RowDataPacket } from 'mysql2/promise';

export async function processMonthlyDues(pool: mysql.Pool) {
  const startYear = 2026;
  const startMonth = 0; // January is 0

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let iterYear = startYear;
  let iterMonth = startMonth;

  while (iterYear < currentYear || (iterYear === currentYear && iterMonth < currentMonth)) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM monthly_dues_log WHERE monthIndex = ? AND year = ?',
      [iterMonth, iterYear]
    );

    if (rows.length === 0) {
      const id = `${iterYear}-${iterMonth}`;
      console.log(`Processing 1,000 TK monthly dues for ${iterMonth + 1}/${iterYear}...`);
      
      // Fix: only charge members whose joinedDate is logically before or around that month
      // For simplicity in this string-based joinedDate, we just charge active members.
      // Wait, we need to handle joined date strings. 
      // Ideal standard SQL: WHERE status = "active" AND STR_TO_DATE(joinedDate, '%Y-%m-%d') <= STR_TO_DATE(?, '%Y-%m-%d')
      const targetDateStr = `${iterYear}-${String(iterMonth + 1).padStart(2, '0')}-28`;

      await pool.query(
        "UPDATE members SET dues = dues + 1000 WHERE status = 'active' AND STR_TO_DATE(joinedDate, '%Y-%m-%d') <= STR_TO_DATE(?, '%Y-%m-%d')",
        [targetDateStr]
      );

      const processedDate = new Date().toISOString();
      await pool.query(
        'INSERT INTO monthly_dues_log (id, monthIndex, year, processedDate) VALUES (?, ?, ?, ?)',
        [id, iterMonth, iterYear, processedDate]
      );
    }

    iterMonth++;
    if (iterMonth > 11) {
      iterMonth = 0;
      iterYear++;
    }
  }
}
