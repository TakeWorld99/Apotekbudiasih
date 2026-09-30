-- =============================================================================
-- SKEMA DATABASE MYSQL / MARIADB - APOTEK BUDI ASIH
-- Kompatibel: MySQL 8.0+, MariaDB 10.4+, XAMPP, Laragon & DBeaver
-- =============================================================================

CREATE DATABASE IF NOT EXISTS apotek_budiasih;
USE apotek_budiasih;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS stock_logs;
DROP TABLE IF EXISTS transaction_details;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TABEL: users
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(50) UNIQUE NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Apoteker', 'Kasir') NOT NULL DEFAULT 'Kasir',
    phone VARCHAR(50) NULL,
    avatar VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL: categories
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL: medicines
CREATE TABLE medicines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    bpom_number VARCHAR(100) NULL,
    type ENUM('Obat Keras', 'Obat Bebas Terbatas', 'Obat Bebas', 'Obat Jamu', 'Obat Fitofarmaka') NOT NULL DEFAULT 'Obat Bebas',
    unit ENUM('Sachet', 'Biji', 'Box', 'Tube', 'Pot', 'Flask') NOT NULL DEFAULT 'Biji',
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    expiry_date DATE NOT NULL,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_medicines_cat_type (category_id, type),
    INDEX idx_medicines_expiry (expiry_date),
    INDEX idx_medicines_stock (stock),
    CONSTRAINT fk_medicines_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL: prescriptions
CREATE TABLE prescriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NULL,
    doctor_name VARCHAR(255) NULL,
    image_path VARCHAR(500) NOT NULL,
    status ENUM('Pending', 'Verified', 'Rejected', 'Processed') NOT NULL DEFAULT 'Pending',
    notes TEXT NULL,
    verified_by BIGINT UNSIGNED NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prescriptions_status (status),
    CONSTRAINT fk_prescriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescriptions_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL: transactions
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Pelanggan Umum',
    prescription_id BIGINT UNSIGNED NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    change_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Paid',
    payment_method ENUM('Cash', 'QRIS', 'Debit', 'Transfer') NOT NULL DEFAULT 'Cash',
    notes TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tx_invoice (invoice_number),
    INDEX idx_tx_created_status (created_at, payment_status),
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tx_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL: transaction_details
CREATE TABLE transaction_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT UNSIGNED NOT NULL,
    medicine_id BIGINT UNSIGNED NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_td_tx_med (transaction_id, medicine_id),
    CONSTRAINT fk_td_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_td_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL: stock_logs
CREATE TABLE stock_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    medicine_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    type ENUM('In', 'Out', 'Adjust') NOT NULL DEFAULT 'Adjust',
    qty INT NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    reason VARCHAR(255) NULL,
    reference_id VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sl_med_created (medicine_id, created_at),
    CONSTRAINT fk_sl_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    CONSTRAINT fk_sl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA AWAL REALISTIS
-- =============================================================================

INSERT INTO users (id, nik, name, email, password, role, phone) VALUES
(1, '2026010188', 'Afin Riyandika', 'admin@apotekbudiasih.com', '$2y$12$40N8qPzI74i6sC7H4r0kDe193zN8J1f.3h8Q4d3s2a1', 'Admin', '081234567890'),
(2, '2026011542', 'Apt. Sarah Maulida, S.Farm', 'apoteker@apotekbudiasih.com', '$2y$12$40N8qPzI74i6sC7H4r0kDe193zN8J1f.3h8Q4d3s2a1', 'Apoteker', '081298765432'),
(3, '2026020119', 'Budi Santoso', 'kasir@apotekbudiasih.com', '$2y$12$40N8qPzI74i6sC7H4r0kDe193zN8J1f.3h8Q4d3s2a1', 'Kasir', '085712345678')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Obat Bebas', 'obat-bebas', 'Obat berlogo hijau dapat dibeli tanpa resep dokter.'),
(2, 'Obat Bebas Terbatas', 'obat-bebas-terbatas', 'Obat berlogo biru dengan tanda peringatan P1-P6.'),
(3, 'Obat Keras (Resep)', 'obat-keras', 'Obat berlogo lingkaran merah K, wajib dengan resep dokter.'),
(4, 'Antibiotik & Antivirus', 'antibiotik', 'Obat antimikroba wajib pengawasan apoteker.'),
(5, 'Vitamin & Suplemen', 'vitamin-suplemen', 'Multivitamin dan suplemen daya tahan tubuh.'),
(6, 'Alat Kesehatan & P3K', 'alat-kesehatan', 'Plester luka, cairan antiseptik, perban steril, dll.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO medicines (id, category_id, name, sku_code, bpom_number, type, unit, price, purchase_price, stock, min_stock, expiry_date, description) VALUES
(1, 1, 'Paracetamol 500mg (Sanmol)', 'MED-SANM-500', 'DBL8822209110A1', 'Bebas', 'Strip', 4500.00, 3200.00, 120, 20, '2027-11-30', 'Meredakan sakit kepala dan menurunkan demam.'),
(2, 1, 'Promag Tablet Kunyah', 'MED-PROM-TAB', 'DBL9111601963A1', 'Bebas', 'Strip', 9500.00, 7500.00, 85, 15, '2027-08-15', 'Mengurangi asam lambung berlebih dan sakit maag.'),
(3, 2, 'Decolgen Flu & Batuk', 'MED-DECL-TAB', 'DTL1404522410A1', 'Bebas Terbatas', 'Strip', 6000.00, 4500.00, 48, 10, '2026-12-31', 'Meredakan gejala flu dan hidung tersumbat.'),
(4, 3, 'Amlodipine 10mg Hexpharm', 'MED-AMLO-010', 'GKL0708514010B1', 'Keras', 'Strip', 12000.00, 8500.00, 8, 15, '2027-04-20', 'Antihipertensi penurun tekanan darah.'),
(5, 4, 'Amoxicillin 500mg Bernofarm', 'MED-AMOX-500', 'GKL9802325304A1', 'Keras', 'Strip', 11000.00, 7800.00, 64, 20, '2027-09-10', 'Antibiotik berspektrum luas untuk infeksi bakteri.'),
(6, 3, 'Metformin HCl 500mg', 'MED-METF-500', 'GKL0305033710A1', 'Keras', 'Strip', 8000.00, 5500.00, 75, 15, '2027-01-30', 'Antidiabetes oral penderita DM Tipe 2.'),
(7, 5, 'Enervon-C Effervescent', 'MED-ENRV-EFF', 'SD011501161', 'Bebas', 'Tube', 38000.00, 29000.00, 30, 10, '2027-06-30', 'Suplemen Vitamin C 1000mg dan Vitamin B kompleks.'),
(8, 6, 'Hansaplast Plester Elastis (10s)', 'MED-HANS-010', 'AKL10902512613', 'Bebas', 'Pcs', 8500.00, 6000.00, 140, 25, '2028-12-31', 'Plester penutup luka elastis dan berpori.'),
(9, 6, 'Betadine Antiseptik Cair 30ml', 'MED-BETA-030', 'PKD20501710045', 'Bebas', 'Botol', 27000.00, 21000.00, 42, 10, '2027-10-15', 'Cairan antiseptik povidone-iodine 10% luka luar.'),
(10, 2, 'Cetirizine 10mg Tablet', 'MED-CETI-010', 'GTL0402337110A1', 'Bebas Terbatas', 'Strip', 7500.00, 5000.00, 5, 15, '2026-10-30', 'Antihistamin pereda alergi rinitis dan biduran.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO prescriptions (id, user_id, patient_name, patient_phone, doctor_name, image_path, status, notes, verified_by, verified_at) VALUES
(1, 1, 'Tn. Hendra Gunawan', '081298887766', 'dr. Bambang Sp.PD', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80', 'Pending', 'Resep Amlodipine 10mg 30 strip + Metformin 500mg 60 tablet. Rutin 1 bulan.', NULL, NULL),
(2, 1, 'Ny. Siti Rahmawati', '085733445566', 'dr. Anita Sp.A', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', 'Verified', 'Amoxicillin Sirup Forte + Paracetamol Drops. Siap ditebus di POS.', 2, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE patient_name=VALUES(patient_name);

INSERT INTO transactions (id, invoice_number, user_id, customer_name, subtotal, discount_amount, tax_amount, total_amount, paid_amount, change_amount, payment_status, payment_method, created_at) VALUES
(1, 'INV-20260826-0001', 3, 'Ibu Ratna', 45000.00, 0.00, 0.00, 45000.00, 50000.00, 5000.00, 'Paid', 'Cash', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 'INV-20260826-0002', 3, 'Tn. Joko Prasetyo', 35500.00, 0.00, 0.00, 35500.00, 35500.00, 0.00, 'Paid', 'QRIS', DATE_SUB(NOW(), INTERVAL 1 HOUR))
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

INSERT INTO transaction_details (id, transaction_id, medicine_id, qty, price, subtotal) VALUES
(1, 1, 1, 2, 4500.00, 9000.00),
(2, 1, 7, 1, 38000.00, 38000.00),
(3, 2, 9, 1, 27000.00, 27000.00),
(4, 2, 8, 1, 8500.00, 8500.00)
ON DUPLICATE KEY UPDATE id=VALUES(id);

INSERT INTO stock_logs (id, medicine_id, user_id, type, qty, current_stock, reason, reference_id) VALUES
(1, 1, 1, 'In', 120, 120, 'Penerimaan dari PBF Kimia Farma', 'PO-KF-202608'),
(2, 4, 3, 'Out', -2, 8, 'Penjualan POS INV-20260825-0010', 'INV-20260825-0010'),
(3, 10, 2, 'Adjust', -5, 5, 'Stock Opname Fisik Akhir Bulan', 'OPNAME-20260825')
ON DUPLICATE KEY UPDATE id=VALUES(id);
