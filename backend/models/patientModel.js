const db = require('../database/db');

class PatientModel {
  /**
   * Create a new patient with auto-incrementing sequential token starting from 1
   */
  static create({ patient_name, age, mobile, symptoms }) {
    const insertTransaction = db.transaction(() => {
      // Get current max token and compute next token (starts from 1)
      const maxTokenRow = db.prepare('SELECT COALESCE(MAX(token), 0) AS maxToken FROM patients').get();
      const nextToken = maxTokenRow.maxToken + 1;

      const stmt = db.prepare(`
        INSERT INTO patients (token, patient_name, age, mobile, symptoms)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(nextToken, patient_name, Number(age), mobile.trim(), symptoms.trim());

      const createdPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
      return createdPatient;
    });

    return insertTransaction();
  }

  /**
   * Get paginated list of patients with search, sorting, and pagination
   */
  static findAll({ search = '', page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' }) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort fields for security
    const allowedSortFields = {
      'created_at': 'created_at',
      'token': 'token',
      'patient_name': 'patient_name',
      'age': 'age'
    };

    const sortColumn = allowedSortFields[sortBy] || 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = '';
    const params = [];

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      const isNumber = /^\d+$/.test(searchTerm);

      if (isNumber) {
        whereClause = 'WHERE token = ? OR mobile LIKE ? OR patient_name LIKE ?';
        params.push(parseInt(searchTerm), `%${searchTerm}%`, `%${searchTerm}%`);
      } else {
        whereClause = 'WHERE patient_name LIKE ? OR symptoms LIKE ?';
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }
    }

    // Count total matching records
    const countSql = `SELECT COUNT(*) AS total FROM patients ${whereClause}`;
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.total : 0;

    // Fetch data with limit and offset
    const dataSql = `
      SELECT * FROM patients
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const data = db.prepare(dataSql).all(...params, limitNum, offset);
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    };
  }

  /**
   * Find a single patient by token number
   */
  static findByToken(token) {
    return db.prepare('SELECT * FROM patients WHERE token = ?').get(parseInt(token));
  }

  /**
   * Get summary dashboard stats
   */
  static getStats() {
    const totalPatientsRow = db.prepare('SELECT COUNT(*) AS total FROM patients').get();
    const todayPatientsRow = db.prepare(`
      SELECT COUNT(*) AS today 
      FROM patients 
      WHERE DATE(created_at) = DATE('now', 'localtime')
    `).get();

    const latestTokenRow = db.prepare('SELECT COALESCE(MAX(token), 0) AS latestToken FROM patients').get();

    return {
      totalPatients: totalPatientsRow ? totalPatientsRow.total : 0,
      todayPatients: todayPatientsRow ? todayPatientsRow.today : 0,
      latestToken: latestTokenRow ? latestTokenRow.latestToken : 0
    };
  }
}

module.exports = PatientModel;
