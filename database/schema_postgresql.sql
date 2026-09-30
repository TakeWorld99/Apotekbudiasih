-- =============================================================================
-- SKEMA DATABASE POSTGRESQL LENGKAP - APOTEK BUDI ASIH
-- Kompatibel: Supabase Cloud, Neon.tech, PostgreSQL 14+, 15+, 16+ & DBeaver
-- =============================================================================

-- 1. Bersihkan tabel lama jika ada (urutan aman cascade)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS medicine_batches CASCADE;
DROP TABLE IF EXISTS opname_reports CASCADE;
DROP TABLE IF EXISTS eod_reports CASCADE;
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS transaction_details CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 2. TABEL: users (Owner & Apoteker)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nik VARCHAR(50) UNIQUE NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Apoteker' CHECK (role IN ('Admin', 'Apoteker', 'Owner', 'Kasir')),
    phone VARCHAR(50) NULL,
    avatar VARCHAR(500) NULL,
    title VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    sipa VARCHAR(100) NULL,
    strttk VARCHAR(100) NULL,
    sipa_expiry DATE NULL,
    strttk_expiry DATE NULL,
    permissions JSONB NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_nik ON users(nik);
CREATE INDEX idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 3. TABEL: categories (Kategori Obat Standar BPOM)
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100) NULL,
    description TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. TABEL: medicines (Master Katalog & Stok Obat Multi-Unit)
-- -----------------------------------------------------------------------------
CREATE TABLE medicines (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    bpom_number VARCHAR(100) NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Bebas',
    unit VARCHAR(50) NOT NULL DEFAULT 'Tablet',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medicines_category_type ON medicines(category_id, type);
CREATE INDEX idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX idx_medicines_stock ON medicines(stock);
CREATE INDEX idx_medicines_is_active ON medicines(is_active);

-- -----------------------------------------------------------------------------
-- 5. TABEL: medicine_batches (FEFO & BPOM Tracing)
-- -----------------------------------------------------------------------------
CREATE TABLE medicine_batches (
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

CREATE INDEX idx_batches_med_expiry ON medicine_batches(medicine_id, expiry_date);

-- -----------------------------------------------------------------------------
-- 6. TABEL: prescriptions (Lembar Resep Dokter)
-- -----------------------------------------------------------------------------
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NULL,
    doctor_name VARCHAR(255) NULL,
    image_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'Processed')),
    notes TEXT NULL,
    verified_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- -----------------------------------------------------------------------------
-- 7. TABEL: transactions (Faktur Kasir POS)
-- -----------------------------------------------------------------------------
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Pelanggan Umum',
    prescription_id BIGINT NULL REFERENCES prescriptions(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    change_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'QRIS', 'Debit', 'Transfer')),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_invoice ON transactions(invoice_number);
CREATE INDEX idx_transactions_created_status ON transactions(created_at, payment_status);

-- -----------------------------------------------------------------------------
-- 8. TABEL: transaction_details (Item Faktur Kasir)
-- -----------------------------------------------------------------------------
CREATE TABLE transaction_details (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    qty INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tx_details_tx_med ON transaction_details(transaction_id, medicine_id);

-- -----------------------------------------------------------------------------
-- 9. TABEL: stock_logs (Audit Trail Mutasi Stok)
-- -----------------------------------------------------------------------------
CREATE TABLE stock_logs (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Adjust' CHECK (type IN ('In', 'Out', 'Adjust')),
    qty INTEGER NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(255) NULL,
    reference_id VARCHAR(100) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_logs_med_created ON stock_logs(medicine_id, created_at);

-- -----------------------------------------------------------------------------
-- 10. TABEL: eod_reports (Tutup Kasir End of Day)
-- -----------------------------------------------------------------------------
CREATE TABLE eod_reports (
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

-- -----------------------------------------------------------------------------
-- 11. TABEL: opname_reports (Stock Opname Rutin)
-- -----------------------------------------------------------------------------
CREATE TABLE opname_reports (
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

-- -----------------------------------------------------------------------------
-- 12. TABEL: audit_logs (Rekam Jejak Keamanan Sistem)
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- 13. FUNCTION & TRIGGER: Auto Generate NIK Karyawan (Tanggal Masuk + 2 Digit Acak)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_user_nik()
RETURNS TRIGGER AS $$
DECLARE
    v_date_prefix TEXT;
    v_random TEXT;
    v_new_nik TEXT;
    v_exists BOOLEAN;
BEGIN
    IF NEW.nik IS NULL OR NEW.nik = '' THEN
        LOOP
            v_date_prefix := TO_CHAR(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMMDD');
            v_random      := LPAD(FLOOR(RANDOM() * 90 + 10)::TEXT, 2, '0');
            v_new_nik     := v_date_prefix || v_random;
            
            SELECT EXISTS(SELECT 1 FROM users WHERE nik = v_new_nik) INTO v_exists;
            IF NOT v_exists THEN
                NEW.nik := v_new_nik;
                EXIT;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_user_nik ON users;
CREATE TRIGGER trg_generate_user_nik
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_user_nik();

-- =============================================================================
-- 14. DATA AWAL (SEED DATA REALISTIS)
-- =============================================================================

-- Seed Users: Afin (Owner) & Indana Farhah (Apoteker), password default: password123
INSERT INTO users (id, nik, name, email, password, role, title, phone, avatar, status, sipa, sipa_expiry, permissions) VALUES
(1, '2026010188', 'Afin Riyandika', 'skibidibisnis@gmail.com', '$2b$10$FJ45HndOHJngJ1boW78LJeIrRnFXDnKKkrvlCyWxzsk0SySjh0fAa', 'Owner', 'Pemilik Sarana Apotek (Owner & Kontrol Finansial)', '081234567890', 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272110/apotek_budiasih/avatars/avatar_admin_afin.jpg', 'Aktif', NULL, NULL, '["all"]'::jsonb),
(2, '2026020119', 'Indana Farhah', 'indanafarhahh@gmail.com', '$2b$10$FJ45HndOHJngJ1boW78LJeIrRnFXDnKKkrvlCyWxzsk0SySjh0fAa', 'Apoteker', 'Apoteker Penanggung Jawab & Kasir Cabang (07.00 - 20.00)', '081298765432', 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272134/apotek_budiasih/avatars/avatar_apoteker_sarah.jpg', 'Aktif', '19980514/SIPA_32.73/2023/1042', '2027-08-15', '["overview","pos","inventory","reports","eod","opname"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Obat Bebas', 'obat-bebas', 'Obat berlogo hijau dapat dibeli tanpa resep dokter.'),
(2, 'Obat Bebas Terbatas', 'obat-bebas-terbatas', 'Obat berlogo biru dengan tanda peringatan P1-P6.'),
(3, 'Obat Keras (Resep)', 'obat-keras', 'Obat berlogo lingkaran merah K, wajib dengan resep dokter.'),
(4, 'Antibiotik & Antivirus', 'antibiotik', 'Obat antimikroba wajib pengawasan apoteker.'),
(5, 'Vitamin & Suplemen', 'vitamin-suplemen', 'Multivitamin dan suplemen daya tahan tubuh.'),
(6, 'Alat Kesehatan & P3K', 'alat-kesehatan', 'Plester luka, cairan antiseptik, perban steril, dll.')
ON CONFLICT (id) DO NOTHING;

-- Seed Medicines
INSERT INTO medicines (id, category_id, name, sku_code, bpom_number, type, unit, price, purchase_price, stock, min_stock, expiry_date, description, is_active) VALUES
(1, 1, 'Paracetamol 500mg (Sanmol)', 'MED-SANM-500', 'DBL8822209110A1', 'Bebas', 'Strip', 4500.00, 3200.00, 120, 20, '2027-11-30', 'Meredakan sakit kepala dan menurunkan demam.', true),
(2, 1, 'Promag Tablet Kunyah', 'MED-PROM-TAB', 'DBL9111601963A1', 'Bebas', 'Strip', 9500.00, 7500.00, 85, 15, '2027-08-15', 'Mengurangi asam lambung berlebih dan sakit maag.', true),
(3, 2, 'Decolgen Flu & Batuk', 'MED-DECL-TAB', 'DTL1404522410A1', 'Bebas Terbatas', 'Strip', 6000.00, 4500.00, 48, 10, '2026-12-31', 'Meredakan gejala flu dan hidung tersumbat.', true),
(4, 3, 'Amlodipine 10mg Hexpharm', 'MED-AMLO-010', 'GKL0708514010B1', 'Keras', 'Strip', 12000.00, 8500.00, 8, 15, '2027-04-20', 'Antihipertensi penurun tekanan darah.', true),
(5, 4, 'Amoxicillin 500mg Bernofarm', 'MED-AMOX-500', 'GKL9802325304A1', 'Keras', 'Strip', 11000.00, 7800.00, 64, 20, '2027-09-10', 'Antibiotik berspektrum luas untuk infeksi bakteri.', true),
(6, 3, 'Metformin HCl 500mg', 'MED-METF-500', 'GKL0305033710A1', 'Keras', 'Strip', 8000.00, 5500.00, 75, 15, '2027-01-30', 'Antidiabetes oral penderita DM Tipe 2.', true),
(7, 5, 'Enervon-C Effervescent', 'MED-ENRV-EFF', 'SD011501161', 'Bebas', 'Tube', 38000.00, 29000.00, 30, 10, '2027-06-30', 'Suplemen Vitamin C 1000mg dan Vitamin B kompleks.', true),
(8, 6, 'Hansaplast Plester Elastis (10s)', 'MED-HANS-010', 'AKL10902512613', 'Bebas', 'Pcs', 8500.00, 6000.00, 140, 25, '2028-12-31', 'Plester penutup luka elastis dan berpori.', true),
(9, 6, 'Betadine Antiseptik Cair 30ml', 'MED-BETA-030', 'PKD20501710045', 'Bebas', 'Botol', 27000.00, 21000.00, 42, 10, '2027-10-15', 'Cairan antiseptik povidone-iodine 10% luka luar.', true),
(10, 2, 'Cetirizine 10mg Tablet', 'MED-CETI-010', 'GTL0402337110A1', 'Bebas Terbatas', 'Strip', 7500.00, 5000.00, 5, 15, '2026-10-30', 'Antihistamin pereda alergi rinitis dan biduran.', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Medicine Batches (FEFO)
INSERT INTO medicine_batches (id, medicine_id, batch_no, expiry_date, stock, supplier_name) VALUES
(1, 1, 'BATCH-SANM-01', '2027-11-30', 120, 'PBF Kimia Farma'),
(2, 2, 'BATCH-PROM-01', '2027-08-15', 85, 'PBF Kalbe Farma'),
(3, 4, 'BATCH-AMLO-01', '2027-04-20', 8, 'PBF Dexa Medica'),
(4, 5, 'BATCH-AMOX-01', '2027-09-10', 64, 'PBF Bernofarm')
ON CONFLICT (id) DO NOTHING;

-- Seed Prescriptions
INSERT INTO prescriptions (id, user_id, patient_name, patient_phone, doctor_name, image_path, status, notes, verified_by, verified_at) VALUES
(1, 1, 'Tn. Hendra Gunawan', '081298887766', 'dr. Bambang Sp.PD', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80', 'Pending', 'Resep Amlodipine 10mg 30 strip + Metformin 500mg 60 tablet. Rutin 1 bulan.', NULL, NULL),
(2, 1, 'Ny. Siti Rahmawati', '085733445566', 'dr. Anita Sp.A', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', 'Verified', 'Amoxicillin Sirup Forte + Paracetamol Drops. Siap ditebus di POS.', 2, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Transactions
INSERT INTO transactions (id, invoice_number, user_id, customer_name, subtotal, discount_amount, tax_amount, total_amount, paid_amount, change_amount, payment_status, payment_method, created_at) VALUES
(1, 'INV-20260826-0001', 2, 'Ibu Ratna', 45000.00, 0.00, 0.00, 45000.00, 50000.00, 5000.00, 'Paid', 'Cash', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(2, 'INV-20260826-0002', 2, 'Tn. Joko Prasetyo', 35500.00, 0.00, 0.00, 35500.00, 35500.00, 0.00, 'Paid', 'QRIS', CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Seed Transaction Details
INSERT INTO transaction_details (id, transaction_id, medicine_id, qty, price, subtotal) VALUES
(1, 1, 1, 2, 4500.00, 9000.00),
(2, 1, 7, 1, 38000.00, 38000.00),
(3, 2, 9, 1, 27000.00, 27000.00),
(4, 2, 8, 1, 8500.00, 8500.00)
ON CONFLICT (id) DO NOTHING;

-- Seed Stock Logs
INSERT INTO stock_logs (id, medicine_id, user_id, type, qty, current_stock, reason, reference_id) VALUES
(1, 1, 1, 'In', 120, 120, 'Penerimaan dari PBF Kimia Farma', 'PO-KF-202608'),
(2, 4, 2, 'Out', -2, 8, 'Penjualan POS INV-20260825-0010', 'INV-20260825-0010'),
(3, 10, 2, 'Adjust', -5, 5, 'Stock Opname Fisik Akhir Bulan', 'OPNAME-20260825')
ON CONFLICT (id) DO NOTHING;

-- Atur ulang Sequence ID otomatis PostgreSQL
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('medicines_id_seq', COALESCE((SELECT MAX(id) FROM medicines), 1));
SELECT setval('medicine_batches_id_seq', COALESCE((SELECT MAX(id) FROM medicine_batches), 1));
SELECT setval('prescriptions_id_seq', COALESCE((SELECT MAX(id) FROM prescriptions), 1));
SELECT setval('transactions_id_seq', COALESCE((SELECT MAX(id) FROM transactions), 1));
SELECT setval('transaction_details_id_seq', COALESCE((SELECT MAX(id) FROM transaction_details), 1));
SELECT setval('stock_logs_id_seq', COALESCE((SELECT MAX(id) FROM stock_logs), 1));
