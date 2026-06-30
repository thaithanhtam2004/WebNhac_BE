const pool = require("./src/infras/db/connection").promise();

async function addIsHiddenColumn() {
  try {
    const checkSql = `
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_schema = DATABASE() 
        AND table_name = 'Song' 
        AND column_name = 'isHidden'
    `;
    const [rows] = await pool.query(checkSql);
    
    if (rows[0].count === 0) {
      console.log("Adding isHidden column...");
      await pool.query("ALTER TABLE Song ADD COLUMN isHidden BOOLEAN DEFAULT FALSE;");
      console.log("Column added successfully.");
    } else {
      console.log("Column isHidden already exists.");
    }
  } catch (err) {
    console.error("Error updating schema:", err);
  } finally {
    process.exit(0);
  }
}

addIsHiddenColumn();
