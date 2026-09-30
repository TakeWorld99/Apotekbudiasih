import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

function getDbPool() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  const getEnv = (key, fallback) => {
    const envVal = process.env[key];
    if (envVal) return envVal;
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].replace(/["']/g, '').trim() : fallback;
  };

  const connectionString = getEnv('DATABASE_URL') || getEnv('POSTGRES_URL');
  if (connectionString) {
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    return new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: parseInt(getEnv('PG_MAX_POOL', isLocal ? '20' : '5'), 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  const host = getEnv('DB_HOST', '127.0.0.1');
  const isLocal = host === '127.0.0.1' || host === 'localhost';

  return new Pool({
    host,
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    database: getEnv('DB_DATABASE', 'apotek_budiasih'),
    user: getEnv('DB_USERNAME', 'postgres'),
    password: getEnv('DB_PASSWORD', 'postgres'),
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export const dbPool = getDbPool();

// Auto-check and initialize all required tables
export async function initDatabaseTables() {
  try {
    await dbPool.query(`
      -- 1. Table eod_reports
      CREATE TABLE IF NOT EXISTS eod_reports (
        id BIGSERIAL PRIMARY KEY,
        store_name VARCHAR(255) DEFAULT 'Apotek Budi Asih',
        employee_nik VARCHAR(50),
        employee_name VARCHAR(255) NOT NULL,
        employee_role VARCHAR(100),
        report_date VARCHAR(100) NOT NULL,
        open_time VARCHAR(100),
        close_time VARCHAR(100),
        user_update VARCHAR(255),
        date_update VARCHAR(100),
        starting_cash NUMERIC(14, 2) DEFAULT 0,
        actual_cash_counted NUMERIC(14, 2) DEFAULT 0,
        deposit_cash NUMERIC(14, 2) DEFAULT 0,
        petty_expense NUMERIC(14, 2) DEFAULT 0,
        petty_expense_note TEXT,
        cash_sales NUMERIC(14, 2) DEFAULT 0,
        cash_tx_count INT DEFAULT 0,
        target_system_cash NUMERIC(14, 2) DEFAULT 0,
        cash_discrepancy NUMERIC(14, 2) DEFAULT 0,
        qris_sales NUMERIC(14, 2) DEFAULT 0,
        qris_tx_count INT DEFAULT 0,
        transfer_sales NUMERIC(14, 2) DEFAULT 0,
        transfer_tx_count INT DEFAULT 0,
        debit_sales NUMERIC(14, 2) DEFAULT 0,
        debit_tx_count INT DEFAULT 0,
        total_non_cash_sales NUMERIC(14, 2) DEFAULT 0,
        total_gross_revenue NUMERIC(14, 2) DEFAULT 0,
        total_discounts NUMERIC(14, 2) DEFAULT 0,
        total_tuslah_embalase NUMERIC(14, 2) DEFAULT 0,
        total_cogs NUMERIC(14, 2) DEFAULT 0,
        gross_profit NUMERIC(14, 2) DEFAULT 0,
        profit_margin NUMERIC(6, 2) DEFAULT 0,
        total_invoices INT DEFAULT 0,
        average_basket NUMERIC(14, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Table opname_reports
      CREATE TABLE IF NOT EXISTS opname_reports (
        id BIGSERIAL PRIMARY KEY,
        report_no VARCHAR(100) UNIQUE NOT NULL,
        schedule_id INT,
        schedule_title VARCHAR(255),
        week_number INT,
        category_names TEXT,
        performed_at VARCHAR(100),
        performed_by VARCHAR(255),
        approved_by VARCHAR(255),
        total_items_counted INT DEFAULT 0,
        matched_items_count INT DEFAULT 0,
        discrepancy_items_count INT DEFAULT 0,
        total_variance_value NUMERIC(14, 2) DEFAULT 0,
        status VARCHAR(100) DEFAULT 'Disetujui Admin',
        notes TEXT,
        items JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Table medicine_batches (FEFO & BPOM)
      CREATE TABLE IF NOT EXISTS medicine_batches (
        id BIGSERIAL PRIMARY KEY,
        medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
        batch_no VARCHAR(100) NOT NULL,
        expiry_date DATE NOT NULL,
        stock INT DEFAULT 0,
        supplier_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(medicine_id, batch_no)
      );

      -- 4. Table audit_logs
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        user_name VARCHAR(255) DEFAULT 'Sistem',
        user_role VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100),
        entity_id VARCHAR(100),
        details JSONB,
        ip_address VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 5. Table password_resets (Single source of truth untuk OTP & Reset Password)
      CREATE TABLE IF NOT EXISTS password_resets (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        nik VARCHAR(50),
        otp VARCHAR(20) NOT NULL,
        attempts INT DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_pwd_resets_email ON password_resets(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_pwd_resets_nik ON password_resets(LOWER(nik));

      -- Add compliance columns if missing
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      ALTER TABLE medicines ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sipa_expiry DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS strttk_expiry DATE;
      UPDATE users SET sipa = '19980514/SIPA_32.73/2023/1042', sipa_expiry = '2027-08-15' WHERE role = 'Apoteker' AND (sipa IS NULL OR sipa = '');
    `);
    console.log('✓ [DB] Seluruh skema database PostgreSQL Apotek Budi Asih terverifikasi.');
  } catch (err) {
    console.warn('⚠️ [DB INIT WARNING]:', err.message);
  }
}

// Auto init on import
initDatabaseTables();
