const { pool } = require('../src/config/database');

async function testInsert() {
  try {
    const userId = 1;
    const title = 'test.pdf';
    const filePath = 'uploads/resumes/test.pdf';
    const isPrimary = 1;
    const parsedData = JSON.stringify({ fullName: 'Test User', email: 'test@example.com' });

    console.log('Attempting INSERT with userId:', userId);
    console.log('parsed_data:', parsedData);

    const [result] = await pool.query(
      `INSERT INTO resumes (user_id, title, file_path, is_primary, parsed_data) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, filePath, isPrimary, parsedData]
    );

    console.log('Insert successful! ID =', result.insertId);
  } catch (error) {
    console.error('Insert failed:', error);
  } finally {
    await pool.end();
  }
}

testInsert();