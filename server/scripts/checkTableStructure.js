const mysql = require('mysql2/promise');

async function checkTableStructure() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'jobquest'
    });

    console.log('📊 Checking GuestApplications table structure...\n');
    
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'GuestApplications' ORDER BY ORDINAL_POSITION`
    );

    console.log('Columns in GuestApplications table:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, ${col.IS_NULLABLE === 'YES' ? 'nullable' : 'required'})`);
    });

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

checkTableStructure();
