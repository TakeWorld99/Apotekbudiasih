const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Pool } = require('pg');

function getEnv(key, fallback = '') {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return fallback;
  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].replace(/["']/g, '').trim() : fallback;
}

const DB_HOST = getEnv('DB_HOST', '127.0.0.1');
const DB_PORT = getEnv('DB_PORT', '5432');
const DB_NAME = getEnv('DB_DATABASE', 'apotek_budiasih');
const DB_USER = getEnv('DB_USERNAME', 'postgres');
const DB_PASS = getEnv('DB_PASSWORD', 'postgres');

const BACKUP_DIR = path.resolve(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function getFormattedTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

async function runBackup() {
  const timestamp = getFormattedTimestamp();
  const backupFileName = `backup_${DB_NAME}_${timestamp}.sql`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  console.log(`\n======================================================`);
  console.log(`📦 MEMULAI CADANGAN DATABASE (BACKUP) POSTGRESQL`);
  console.log(`📁 Database : ${DB_NAME} (${DB_HOST}:${DB_PORT})`);
  console.log(`💾 File     : ${backupFileName}`);
  console.log(`======================================================\n`);

  let backupSuccess = false;

  // 1. Coba gunakan pg_dump (jika terpasang di sistem Windows)
  try {
    const pgDumpCmd = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F p -f "${backupFilePath}"`;
    execSync(pgDumpCmd, {
      env: { ...process.env, PGPASSWORD: DB_PASS },
      stdio: 'pipe',
    });
    console.log(`✓ [SUCCESS] Backup berhasil dibuat via pg_dump resmi!`);
    backupSuccess = true;
  } catch (pgErr) {
    console.log(`ℹ️ pg_dump CLI tidak terdeteksi di PATH, menggunakan Node PostgreSQL Table Dumper fallback...`);
  }

  // 2. Fallback table-by-table dumper jika pg_dump CLI tidak ada
  if (!backupSuccess) {
    const pool = new Pool({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASS,
    });

    try {
      const tablesRes = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      );
      const tables = tablesRes.rows.map(r => r.table_name);
      let sqlDump = `-- =====================================================\n`;
      sqlDump += `-- BACKUP DATABASE: ${DB_NAME}\n`;
      sqlDump += `-- TANGGAL: ${new Date().toLocaleString('id-ID')}\n`;
      sqlDump += `-- =====================================================\n\n`;

      for (const t of tables) {
        const rows = await pool.query(`SELECT * FROM ${t}`);
        sqlDump += `-- TABLE: ${t} (${rows.rows.length} rows)\n`;
        if (rows.rows.length > 0) {
          const cols = Object.keys(rows.rows[0]);
          for (const row of rows.rows) {
            const vals = cols.map(c => {
              const val = row[c];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'number') return val;
              if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              return `'${String(val).replace(/'/g, "''")}'`;
            });
            sqlDump += `INSERT INTO ${t} (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
          }
        }
        sqlDump += `\n`;
      }

      fs.writeFileSync(backupFilePath, sqlDump, 'utf-8');
      console.log(`✓ [SUCCESS] SQL Data Dump berhasil dibuat (${tables.length} tabel diekspor)!`);
      backupSuccess = true;
      await pool.end();
    } catch (dbErr) {
      console.error(`❌ Gagal membuat cadangan database:`, dbErr.message);
      await pool.end();
      return { success: false, error: dbErr.message };
    }
  }

  // 3. Rotasi cadangan: pertahankan 7 file cadangan terakhir, hapus yang lebih lama
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(`backup_${DB_NAME}_`) && f.endsWith('.sql'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
      const filesToDelete = files.slice(7);
      for (const f of filesToDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, f.name));
        console.log(`🗑️ Menghapus cadangan lama: ${f.name}`);
      }
    }
    console.log(`📂 Total cadangan tersimpan di folder backups/: ${Math.min(7, files.length)} file.`);
  } catch (cleanErr) {
    console.warn(`⚠️ Rotasi file cadangan peringatan:`, cleanErr.message);
  }

  console.log(`\n🎉 Proses cadangan database Apotek Budi Asih selesai: ${backupFilePath}\n`);
  return { success: backupSuccess, fileName: backupFileName, filePath: backupFilePath };
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup };
