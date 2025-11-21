const mysql = require('mysql2/promise');

async function checkApplicationsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'jobquest',
      port: 3306
    });

    console.log('✅ Connected to MySQL');

    // Check what columns actually exist in Applications table
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Applications' 
      AND TABLE_SCHEMA = 'jobquest'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Actual columns in Applications table:');
    columns.forEach(col => {
      console.log(`  ✓ ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)'}`);
    });

    // Define what columns the model is trying to use
    const modelColumns = [
      'id', 'userId', 'jobId', 'companyId', 'status', 
      'applicationMessage', 'resume', 'coverLetter', 'appliedAt',
      'createdAt', 'updatedAt'
    ];

    console.log('\n🔍 Columns that model expects:');
    modelColumns.forEach(col => console.log(`  - ${col}`));

    // Find mismatches
    const actualCols = columns.map(col => col.COLUMN_NAME);
    const missingFromDB = modelColumns.filter(col => !actualCols.includes(col));
    const extraInDB = actualCols.filter(col => !modelColumns.includes(col));

    if (missingFromDB.length > 0) {
      console.log('\n❌ Columns in model but NOT in database:');
      missingFromDB.forEach(col => console.log(`  - ${col}`));
    }

    if (extraInDB.length > 0) {
      console.log('\n⚠️ Extra columns in database (not in model):');
      extraInDB.forEach(col => console.log(`  - ${col}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkApplicationsTable();
