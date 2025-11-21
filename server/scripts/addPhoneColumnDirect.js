const mysql = require('mysql2/promise');

async function addPhoneColumn() {
  let connection;
  try {
    console.log('📱 Connecting to MySQL database...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'pass123',
      database: 'jobquest'
    });

    console.log('✅ Connected to MySQL');

    // Check if column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'GuestApplications' AND COLUMN_NAME = 'guestPhone'`
    );

    if (columns.length > 0) {
      console.log('✅ guestPhone column already exists');
      await connection.end();
      process.exit(0);
    }

    console.log('📝 Adding guestPhone column...');
    
    await connection.query(
      `ALTER TABLE GuestApplications ADD COLUMN guestPhone VARCHAR(20) NULL DEFAULT ''`
    );

    console.log('✅ Successfully added guestPhone column to GuestApplications table');
    
    // Verify the column was added
    const [newColumns] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'GuestApplications' AND COLUMN_NAME = 'guestPhone'`
    );

    if (newColumns.length > 0) {
      console.log('📋 Column Details:');
      console.log(`   - Column Name: ${newColumns[0].COLUMN_NAME}`);
      console.log(`   - Type: ${newColumns[0].COLUMN_TYPE}`);
      console.log(`   - Nullable: ${newColumns[0].IS_NULLABLE}`);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addPhoneColumn();
