const mysql = require('mysql2/promise');

async function updateApplicationsTable() {
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

    // First, check what columns currently exist
    const [currentColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Applications' 
      AND TABLE_SCHEMA = 'jobquest'
    `);

    const existingCols = currentColumns.map(col => col.COLUMN_NAME);
    console.log('📋 Current columns:', existingCols);

    // Add missing columns
    const columnsToAdd = [
      { name: 'jobTitle', type: 'VARCHAR(255)', exists: false },
      { name: 'companyName', type: 'VARCHAR(255)', exists: false },
      { name: 'applicationMethod', type: 'VARCHAR(100)', exists: false },
      { name: 'contactEmail', type: 'VARCHAR(255)', exists: false },
      { name: 'emailSubject', type: 'TEXT', exists: false },
      { name: 'emailBody', type: 'LONGTEXT', exists: false },
      { name: 'notes', type: 'TEXT', exists: false }
    ];

    console.log('\n🔧 Adding missing columns...');

    for (const col of columnsToAdd) {
      if (!existingCols.includes(col.name)) {
        try {
          await connection.query(
            `ALTER TABLE Applications ADD COLUMN ${col.name} ${col.type} NULL DEFAULT NULL`
          );
          console.log(`✅ Added column: ${col.name}`);
        } catch (err) {
          console.error(`❌ Error adding ${col.name}:`, err.message);
        }
      } else {
        console.log(`⏭️ Column already exists: ${col.name}`);
      }
    }

    // Verify final structure
    console.log('\n📋 Final Applications table structure:');
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Applications' 
      AND TABLE_SCHEMA = 'jobquest'
      ORDER BY ORDINAL_POSITION
    `);

    finalColumns.forEach(col => {
      console.log(`  ✓ ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)'}`);
    });

    console.log('\n✅ Applications table updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateApplicationsTable();
