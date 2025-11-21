const mysql = require('mysql2/promise');

async function cleanupTable() {
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

    // First, let's see what columns currently exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'GuestApplications' 
      AND TABLE_SCHEMA = 'jobquest'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📋 Current columns in GuestApplications:');
    columns.forEach(col => console.log(`  - ${col.COLUMN_NAME}`));

    // List of columns that should exist based on the form and database
    const allowedColumns = [
      'id', 'email', 'firstName', 'lastName', 'phone', 'jobId', 
      'jobTitle', 'companyName', 'resume', 'coverLetter', 'status', 
      'appliedAt', 'createdAt', 'updatedAt', 'ipAddress', 'userAgent'
    ];

    console.log('\n🔍 Analyzing columns...');
    
    // Find columns to remove (columns that exist but shouldn't)
    const columnsToRemove = columns
      .map(col => col.COLUMN_NAME)
      .filter(colName => !allowedColumns.includes(colName));

    if (columnsToRemove.length > 0) {
      console.log(`\n❌ Found ${columnsToRemove.length} columns to remove:`);
      columnsToRemove.forEach(col => console.log(`  - ${col}`));

      // Drop unwanted columns
      for (const col of columnsToRemove) {
        try {
          await connection.query(`ALTER TABLE GuestApplications DROP COLUMN ${col}`);
          console.log(`✅ Dropped column: ${col}`);
        } catch (err) {
          console.error(`❌ Error dropping column ${col}:`, err.message);
        }
      }
    } else {
      console.log('\n✅ No unwanted columns found!');
    }

    // Check if required columns exist, create if missing
    console.log('\n🔧 Checking required columns...');
    const existingCols = columns.map(col => col.COLUMN_NAME);

    // Define column creation queries
    const requiredColumns = {
      'ipAddress': "VARCHAR(255) NULL DEFAULT NULL",
      'userAgent': "VARCHAR(500) NULL DEFAULT NULL"
    };

    for (const [colName, definition] of Object.entries(requiredColumns)) {
      if (!existingCols.includes(colName)) {
        try {
          await connection.query(`ALTER TABLE GuestApplications ADD COLUMN ${colName} ${definition}`);
          console.log(`✅ Added missing column: ${colName}`);
        } catch (err) {
          console.error(`❌ Error adding column ${colName}:`, err.message);
        }
      }
    }

    // Final verification
    console.log('\n📋 Final column structure:');
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'GuestApplications' 
      AND TABLE_SCHEMA = 'jobquest'
      ORDER BY ORDINAL_POSITION
    `);

    finalColumns.forEach(col => {
      console.log(`  ✓ ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)'}`);
    });

    console.log('\n✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupTable();
