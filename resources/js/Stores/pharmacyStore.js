import { defineStore } from 'pinia';

// Cross-Account / Cross-Tab Realtime Synchronization Channel
export const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('apotek_budi_asih_sync')
  : null;

const getCustomAvatars = () => {
  try {
    const saved = localStorage.getItem('apotek_user_avatars');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('apotek_auth_user') || sessionStorage.getItem('apotek_auth_user');
    if (!saved) return null;
    const user = JSON.parse(saved);
    const customAvatars = getCustomAvatars();
    const customAvatar = (user.nik && customAvatars[user.nik]) || (user.id && customAvatars[user.id]);
    if (customAvatar) {
      user.avatar = customAvatar;
    }
    return user;
  } catch (e) {
    return null;
  }
};

const initialUser = getStoredUser() || null;

export const SYSTEM_MODULES = [
  { id: 'overview', label: 'Dashboard & Analitik', code: 'MENU-01', desc: 'Statistik eksekutif, grafik omzet harian & analitik toko' },
  { id: 'pos', label: 'Kasir', code: 'MENU-02', desc: 'Transaksi kasir cepat eceran bebas & tebus resep dokter' },
  { id: 'inventory', label: 'Stok & Produk Obat', code: 'MENU-03', desc: 'Katalog master obat, multi-satuan, batas stok kritis & kartu stok' },
  { id: 'reports', label: 'Laporan Penjualan', code: 'MENU-04', desc: 'Riwayat faktur penjualan, analitik margin laba kotor & ekspor data' },
  { id: 'eod', label: 'Laporan End Of Day(EOD)', code: 'MENU-05', desc: 'Rekonsiliasi kas laci kasir harian & hitung fisik uang closing shift' },
  { id: 'opname', label: 'Stok Opname(SO)', code: 'MENU-06', desc: 'Jadwal opname bergilir kategori, audit fisik mingguan & Berita Acara Selisih' },
  { id: 'users', label: 'Hak Akses & Pengguna', code: 'MENU-07', desc: 'Manajemen jabatan toko, hak akses modul, dan akun staf' },
];

// 6 Modul Operasional yang dapat dikonfigurasi Owner untuk Apoteker (Modul users paten hanya milik Owner)
export const ASSIGNABLE_MODULES = SYSTEM_MODULES.filter(m => m.id !== 'users');

const defaultUsersList = [
  {
    id: 1,
    name: 'Afin Riyandika',
    nik: '2026010188',
    role: 'Owner',
    title: 'Pemilik Sarana Apotek (Owner & Kontrol Finansial)',
    email: 'skibidibisnis@gmail.com',
    password: 'password123',
    phone: '081234567890',
    status: 'Aktif',
    avatar: 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272110/apotek_budiasih/avatars/avatar_admin_afin.jpg',
    permissions: ['all'],
  },
  {
    id: 2,
    name: 'Indana Farhah',
    nik: '2026020119',
    sipa: '19980514/SIPA_32.73/2023/1042',
    sipa_expiry: '2027-08-15',
    role: 'Apoteker',
    title: 'Apoteker Penanggung Jawab & Kasir Cabang (07.00 - 20.00)',
    email: 'indanafarhahh@gmail.com',
    phone: '081298765432',
    password: 'password123',
    status: 'Aktif',
    avatar: 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272134/apotek_budiasih/avatars/avatar_apoteker_sarah.jpg',
    permissions: ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname'],
  },
];

const getInitializedUsersList = () => {
  const customAvatars = getCustomAvatars();
  let baseList = defaultUsersList;
  try {
    const stored = localStorage.getItem('apotek_users_list');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Kunci hanya 2 akun resmi ini (Afin & Indana), dan pertahankan password yang telah diubah pengguna
        const afinStored = parsed.find(u => u.nik === '2026010188' || (u.email && u.email.toLowerCase() === 'skibidibisnis@gmail.com'));
        const indanaStored = parsed.find(u => u.nik === '2026020119' || (u.email && u.email.toLowerCase() === 'indanafarhahh@gmail.com'));

        baseList = [
          {
            ...defaultUsersList[0],
            password: (afinStored && afinStored.password) ? afinStored.password : defaultUsersList[0].password,
          },
          {
            ...defaultUsersList[1],
            password: (indanaStored && indanaStored.password) ? indanaStored.password : defaultUsersList[1].password,
          },
        ];
        localStorage.setItem('apotek_users_list', JSON.stringify(baseList));
      }
    } else {
      localStorage.setItem('apotek_users_list', JSON.stringify(defaultUsersList));
    }
  } catch (e) {}

  return baseList.map(u => {
    const custom = (u.nik && customAvatars[u.nik]) || (u.id && customAvatars[u.id]);
    return custom ? { ...u, avatar: custom } : { ...u };
  });
};

const getStoredShift = () => {
  try {
    const raw = localStorage.getItem('apotek_cashier_shift');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.isOpen && (!parsed.startTime || parsed.startTime.startsWith('00.00') || parsed.startTime.startsWith('00:00'))) {
        parsed.startTime = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()).replace('.', ':') + ' WIB';
        try {
          localStorage.setItem('apotek_cashier_shift', JSON.stringify(parsed));
        } catch (e) {}
      }
      return parsed;
    }
  } catch (e) {}
  return {
    isOpen: false,
    cashierName: '',
    startTime: '',
    startDate: '',
    startingCash: 0,
    totalCashSales: 0,
    totalNonCashSales: 0,
    transactionCount: 0,
    countedCash: 0,
    closedAt: null,
    notes: '',
  };
};

export const usePharmacyStore = defineStore('pharmacy', {
  state: () => ({
    isAuthenticated: Boolean(getStoredUser()),
    currentUser: initialUser,

    // ===== 1. USERS & RBAC =====
    usersList: getInitializedUsersList(),

    // ===== 2. CATEGORIES =====
    categories: [
      { id: 1, name: 'Obat Bebas', slug: 'obat-bebas', color: 'emerald', iconName: 'Pill', description: 'Obat berlogo lingkaran hijau yang dapat dibeli bebas tanpa resep dokter.' },
      { id: 2, name: 'Obat Bebas Terbatas', slug: 'obat-bebas-terbatas', color: 'blue', iconName: 'AlertCircle', description: 'Obat lingkaran biru dengan tanda peringatan khusus P1-P6.' },
      { id: 3, name: 'Obat Keras (Resep)', slug: 'obat-keras', color: 'rose', iconName: 'FileText', description: 'Obat lingkaran merah huruf K, wajib dengan resep dokter atau pengawasan apoteker.' },
      { id: 4, name: 'Antibiotik & Antivirus', slug: 'antibiotik', color: 'indigo', iconName: 'ShieldCheck', description: 'Obat antimikroba berspektrum khusus dengan pengawasan apoteker.' },
      { id: 5, name: 'Vitamin & Suplemen', slug: 'vitamin-suplemen', color: 'amber', iconName: 'Sparkles', description: 'Multivitamin dan suplemen daya tahan tubuh.' },
      { id: 6, name: 'Alat Kesehatan & P3K', slug: 'alat-kesehatan', color: 'cyan', iconName: 'Cross', description: 'Plester luka, cairan antiseptik, perban steril, dll.' },
    ],

    // ===== 2.1 SELLING UNITS (SATUAN JUAL RESMI) =====
    sellingUnits: ['Sachet', 'Biji', 'Box', 'Tube', 'Pot', 'Flask'],

    // ===== 3. MEDICINES MASTER DATA =====
    medicines: [
      {
        id: 1,
        category_id: 3,
        name: 'Paracetamol 500mg (Sanmol)',
        sku_code: 'MED-SANM-500',
        bpom_number: 'DBL8822209110A1',
        type: 'Bebas',
        unit: 'Biji',
        packaging: '1 Biji (Tablet 500mg)',
        rack_location: 'Rak C-01 (Analgetik Bebas)',
        price: 500,
        purchase_price: 320,
        stock: 120,
        min_stock: 25,
        expiry_date: '2026-12-31',
        active_substance: 'Paracetamol 500mg',
        manufacturer: 'PT Sanbe Farma',
        description: 'Meredakan rasa sakit kepala, sakit gigi, dan menurunkan demam.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-01 08:30:00',
        updated_at: '2026-09-05 14:15:00',
      },
      {
        id: 2,
        category_id: 3,
        name: 'Promag Tablet Kunyah (Dus)',
        sku_code: 'MED-PROM-TAB',
        bpom_number: 'DBL9111601963A1',
        type: 'Bebas',
        unit: 'Box',
        packaging: '1 Box @ 3 Strip (30 Tablet Kunyah)',
        rack_location: 'Rak C-02 (Antasida Bebas)',
        price: 28500,
        purchase_price: 22500,
        stock: 85,
        min_stock: 20,
        expiry_date: '2027-08-15',
        active_substance: 'Hydrotalcite 200mg, Mg(OH)2 150mg, Simethicone 50mg',
        manufacturer: 'PT Kalbe Farma',
        description: 'Meredakan gejala sakit maag karena asam lambung berlebih dan kembung.',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-03 09:15:00',
        updated_at: '2026-09-02 11:30:00',
      },
      {
        id: 3,
        category_id: 2,
        name: 'Decolgen Flu & Batuk Tablet',
        sku_code: 'MED-DECL-TAB',
        bpom_number: 'DTL1404522410A1',
        type: 'Bebas Terbatas',
        unit: 'Biji',
        packaging: '1 Biji (Tablet Flu)',
        rack_location: 'Rak B-01 (Flu & Batuk)',
        price: 1500,
        purchase_price: 1100,
        stock: 48,
        min_stock: 15,
        expiry_date: '2026-12-31',
        active_substance: 'Paracetamol 400mg, Phenylpropanolamine HCl 12.5mg, Chlorpheniramine Maleate 1mg',
        manufacturer: 'PT Darya-Varia Laboratoria',
        description: 'Meredakan gejala flu seperti bersin, hidung tersumbat, dan sakit kepala.',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-05 10:45:00',
        updated_at: '2026-09-04 16:20:00',
      },
      {
        id: 4,
        category_id: 1,
        name: 'Amlodipine 10mg Hexpharm',
        sku_code: 'MED-AMLO-010',
        bpom_number: 'GKL0708514010B1',
        type: 'Keras',
        unit: 'Biji',
        packaging: '1 Biji (Tablet 10mg)',
        rack_location: 'Lemari Khusus Keras A-01',
        price: 1200,
        purchase_price: 850,
        stock: 80, // Low Stock alert
        min_stock: 30,
        expiry_date: '2027-04-20',
        active_substance: 'Amlodipine Besilate 10mg',
        manufacturer: 'PT Hexpharm Jaya',
        description: 'Obat antihipertensi calcium channel blocker untuk menurunkan tekanan darah tinggi.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-08 11:20:00',
        updated_at: '2026-09-01 10:10:00',
      },
      {
        id: 5,
        category_id: 1,
        name: 'Amoxicillin 500mg Bernofarm',
        sku_code: 'MED-AMOX-500',
        bpom_number: 'GKL9802325304A1',
        type: 'Keras',
        unit: 'Biji',
        packaging: '1 Biji (Kaplet 500mg)',
        rack_location: 'Lemari Khusus Antibiotik A-02',
        price: 1100,
        purchase_price: 780,
        stock: 64,
        min_stock: 25,
        expiry_date: '2027-09-10',
        active_substance: 'Amoxicillin Trihydrate 500mg',
        manufacturer: 'PT Bernofarm',
        description: 'Antibiotik berspektrum luas untuk infeksi bakteri saluran nafas, kemih, dan kulit.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-10 13:00:00',
        updated_at: '2026-09-06 09:40:00',
      },
      {
        id: 6,
        category_id: 1,
        name: 'Metformin HCl 500mg Dexa',
        sku_code: 'MED-METF-500',
        bpom_number: 'GKL0305033710A1',
        type: 'Keras',
        unit: 'Biji',
        packaging: '1 Biji (Tablet 500mg)',
        rack_location: 'Lemari Khusus Keras A-03',
        price: 800,
        purchase_price: 550,
        stock: 75,
        min_stock: 20,
        expiry_date: '2027-01-30',
        active_substance: 'Metformin Hydrochloride 500mg',
        manufacturer: 'PT Dexa Medica',
        description: 'Obat antidiabetes oral lini pertama penderita Diabetes Melitus Tipe 2.',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-12 14:10:00',
        updated_at: '2026-09-03 15:30:00',
      },
      {
        id: 7,
        category_id: 4,
        name: 'Tolak Angin Cair Herbal',
        sku_code: 'MED-TLK-ANG',
        bpom_number: 'TR032622221',
        type: 'Jamu',
        unit: 'Sachet',
        packaging: '1 Sachet Cair @ 15 ml',
        rack_location: 'Rak D-01 (Obat Jamu Tradisional)',
        price: 4000,
        purchase_price: 3000,
        stock: 150,
        min_stock: 30,
        expiry_date: '2028-05-20',
        active_substance: 'Ekstrak Jahe, Daun Mint, Daun Cengkeh, Madu, Adas',
        manufacturer: 'PT Industri Jamu dan Farmasi Sido Muncul Tbk',
        description: 'Obat jamu herbal terstandar BPOM TR untuk meredakan masuk angin, perut mual, kembung, dan pegal.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-15 08:50:00',
        updated_at: '2026-09-07 11:15:00',
      },
      {
        id: 8,
        category_id: 4,
        name: 'Antangin JRG Cair Herbal',
        sku_code: 'MED-ANT-JRG',
        bpom_number: 'TR162692241',
        type: 'Jamu',
        unit: 'Sachet',
        packaging: '1 Sachet Cair @ 15 ml',
        rack_location: 'Rak D-02 (Obat Jamu Tradisional)',
        price: 3500,
        purchase_price: 2600,
        stock: 120,
        min_stock: 25,
        expiry_date: '2028-02-15',
        active_substance: 'Zingiberis Rhizoma (Jahe Merah), Ginseng, Royal Jelly, Madu',
        manufacturer: 'PT Deltomed Laboratories',
        description: 'Jamu herbal dengan jahe merah, royal jelly, dan ginseng untuk menghangatkan badan dan daya tahan.',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-18 10:20:00',
        updated_at: '2026-09-08 13:45:00',
      },
      {
        id: 9,
        category_id: 2,
        name: 'Betadine Antiseptik Cair 30ml',
        sku_code: 'MED-BETA-030',
        bpom_number: 'PKD20501710045',
        type: 'Bebas Terbatas',
        unit: 'Flask',
        packaging: '1 Flask / Botol @ 30 ml',
        rack_location: 'Rak B-03 (Antiseptik Luka)',
        price: 27000,
        purchase_price: 21000,
        stock: 42,
        min_stock: 15,
        expiry_date: '2027-10-15',
        active_substance: 'Povidone Iodine 10%',
        manufacturer: 'PT Mundipharma Healthcare Indonesia',
        description: 'Cairan antiseptik povidone-iodine 10% untuk membersihkan dan mencegah infeksi luka.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-20 15:30:00',
        updated_at: '2026-09-05 10:00:00',
      },
      {
        id: 10,
        category_id: 2,
        name: 'Cetirizine HCl 10mg Tablet (10s)',
        sku_code: 'MED-CETI-010',
        bpom_number: 'GTL0402337110A1',
        type: 'Bebas Terbatas',
        unit: 'Biji',
        packaging: '1 Biji (Tablet 10mg)',
        rack_location: 'Rak B-02 (Antialergi)',
        price: 1000,
        purchase_price: 600,
        stock: 5, // Low stock & near expiry sample
        min_stock: 15,
        expiry_date: '2026-09-25', // Near expiry (<30 hari)
        active_substance: 'Cetirizine Dihydrochloride 10mg',
        manufacturer: 'PT Novell Pharmaceutical Laboratories',
        description: 'Antihistamin generasi ke-2 non-sedatif untuk rinitis alergi dan urtikaria (gatal).',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-22 09:00:00',
        updated_at: '2026-09-09 14:00:00',
      },
      {
        id: 11,
        category_id: 5,
        name: 'Stimuno Forte 50mg Box (Dus 30s)',
        sku_code: 'MED-STM-50M',
        bpom_number: 'FF152300641',
        type: 'Fitofarmaka',
        unit: 'Box',
        packaging: '1 Box @ 30 Kapsul (3 Strip @ 10)',
        rack_location: 'Rak E-01 (Fitofarmaka Uji Klinis)',
        price: 88000,
        purchase_price: 72000,
        stock: 28,
        min_stock: 10,
        expiry_date: '2027-12-10',
        active_substance: 'Ekstrak Tanaman Meniran (Phyllanthus niruri) 50mg',
        manufacturer: 'PT Dexa Medica',
        description: 'Obat Fitofarmaka ekstrak meniran teruji klinis untuk mengoptimalkan kekebalan dan daya tahan imun tubuh.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-25 09:30:00',
        updated_at: '2026-09-09 15:20:00',
      },
      {
        id: 12,
        category_id: 5,
        name: 'Tensigard Kapsul Antihipertensi Box',
        sku_code: 'MED-TNS-GRD',
        bpom_number: 'FF142300581',
        type: 'Fitofarmaka',
        unit: 'Box',
        packaging: '1 Box @ 30 Kapsul',
        rack_location: 'Rak E-02 (Fitofarmaka Antihipertensi)',
        price: 115000,
        purchase_price: 95000,
        stock: 22,
        min_stock: 8,
        expiry_date: '2027-08-30',
        active_substance: 'Ekstrak Apium graveolens (Seledri) & Orthosiphon stamineus (Kumis Kucing)',
        manufacturer: 'PT Phapros Tbk',
        description: 'Obat Fitofarmaka ekstrak herbal teruji klinis untuk memelihara kestabilan tekanan darah penderita hipertensi.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-26 11:00:00',
        updated_at: '2026-09-08 16:40:00',
      },
      {
        id: 13,
        category_id: 2,
        name: 'Bioplacenton Gel Luka Bakar 15g',
        sku_code: 'MED-BIOP-GEL',
        bpom_number: 'DTL7211601828A1',
        type: 'Bebas Terbatas',
        unit: 'Tube',
        packaging: '1 Tube @ 15 gram',
        rack_location: 'Rak B-04 (Salep & Gel Tube)',
        price: 28000,
        purchase_price: 21500,
        stock: 35,
        min_stock: 10,
        expiry_date: '2028-04-15',
        active_substance: 'Placenta Extract 10%, Neomycin Sulfate 0.5%',
        manufacturer: 'PT Kalbe Farma',
        description: 'Gel luka bakar dan infeksi kulit dalam kemasan sediaan tube aluminium.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-28 09:00:00',
        updated_at: '2026-09-09 16:00:00',
      },
      {
        id: 14,
        category_id: 3,
        name: 'Salep 2-4 Antijamur Kulit 30g',
        sku_code: 'MED-SLP24-POT',
        bpom_number: 'DBL8304104230A1',
        type: 'Bebas',
        unit: 'Pot',
        packaging: '1 Pot Plastik @ 30 gram',
        rack_location: 'Rak C-03 (Salep Bebas Pot)',
        price: 12500,
        purchase_price: 8500,
        stock: 40,
        min_stock: 10,
        expiry_date: '2027-11-20',
        active_substance: 'Acidum Salicylicum 2%, Sulfur Praecipitatum 4%',
        manufacturer: 'PT Ciubros Farma',
        description: 'Salep kulit untuk gatal, kudis, dan jamur kulit dalam wadah pot plastik.',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80',
        created_at: '2026-08-28 10:00:00',
        updated_at: '2026-09-09 16:30:00',
      },
    ].sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })),

    // ===== 4. FEFO & BATCH TRACKING =====
    batches: [
      {
        id: 101,
        batch_number: 'B2026-W34-SAN',
        medicine_id: 1,
        medicine_name: 'Paracetamol 500mg (Sanmol)',
        sku_code: 'MED-SANM-500',
        stock: 20,
        initial_qty: 50,
        received_date: '2026-08-20',
        expiry_date: '2026-12-31',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
      {
        id: 102,
        batch_number: 'B2026-W36-SAN',
        medicine_id: 1,
        medicine_name: 'Paracetamol 500mg (Sanmol)',
        sku_code: 'MED-SANM-500',
        stock: 100,
        initial_qty: 100,
        received_date: '2026-09-05',
        expiry_date: '2027-11-30',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
      {
        id: 103,
        batch_number: 'B2026-W35-PRO',
        medicine_id: 2,
        medicine_name: 'Promag Tablet Kunyah (Dus)',
        sku_code: 'MED-PROM-TAB',
        stock: 85,
        initial_qty: 100,
        received_date: '2026-09-02',
        expiry_date: '2027-08-15',
        pbf_name: 'PT Enseval Putera Megatrading Tbk',
        status: 'Aman',
      },
      {
        id: 104,
        batch_number: 'B2026-W35-DEC',
        medicine_id: 3,
        medicine_name: 'Decolgen Flu & Batuk Tablet',
        sku_code: 'MED-DECL-TAB',
        stock: 48,
        initial_qty: 60,
        received_date: '2026-09-04',
        expiry_date: '2026-12-31',
        pbf_name: 'PT Anugrah Argon Medica',
        status: 'Aman',
      },
      {
        id: 105,
        batch_number: 'B2026-W35-AML',
        medicine_id: 4,
        medicine_name: 'Amlodipine 10mg Hexpharm',
        sku_code: 'MED-AMLO-010',
        stock: 80,
        initial_qty: 100,
        received_date: '2026-09-01',
        expiry_date: '2027-04-20',
        pbf_name: 'PT Mensa Bina Sukses',
        status: 'Aman',
      },
      {
        id: 106,
        batch_number: 'B2026-W36-AMX',
        medicine_id: 5,
        medicine_name: 'Amoxicillin 500mg Bernofarm',
        sku_code: 'MED-AMOX-500',
        stock: 64,
        initial_qty: 80,
        received_date: '2026-09-06',
        expiry_date: '2027-09-10',
        pbf_name: 'PT Enseval Putera Megatrading Tbk',
        status: 'Aman',
      },
      {
        id: 107,
        batch_number: 'B2026-W35-MET',
        medicine_id: 6,
        medicine_name: 'Metformin HCl 500mg Dexa',
        sku_code: 'MED-METF-500',
        stock: 75,
        initial_qty: 100,
        received_date: '2026-09-03',
        expiry_date: '2027-01-30',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
      {
        id: 108,
        batch_number: 'B2026-W36-TLK',
        medicine_id: 7,
        medicine_name: 'Tolak Angin Cair Herbal',
        sku_code: 'MED-TLK-ANG',
        stock: 150,
        initial_qty: 150,
        received_date: '2026-09-07',
        expiry_date: '2028-05-20',
        pbf_name: 'PT Enseval Putera Megatrading Tbk',
        status: 'Aman',
      },
      {
        id: 109,
        batch_number: 'B2026-W36-ANT',
        medicine_id: 8,
        medicine_name: 'Antangin JRG Cair Herbal',
        sku_code: 'MED-ANT-JRG',
        stock: 120,
        initial_qty: 120,
        received_date: '2026-09-08',
        expiry_date: '2028-02-15',
        pbf_name: 'PT Mensa Bina Sukses',
        status: 'Aman',
      },
      {
        id: 110,
        batch_number: 'B2026-W36-BET',
        medicine_id: 9,
        medicine_name: 'Betadine Antiseptik Cair 30ml',
        sku_code: 'MED-BETA-030',
        stock: 42,
        initial_qty: 50,
        received_date: '2026-09-05',
        expiry_date: '2027-10-15',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
      {
        id: 111,
        batch_number: 'B2025-W38-CET',
        medicine_id: 10,
        medicine_name: 'Cetirizine HCl 10mg Tablet (10s)',
        sku_code: 'MED-CETI-010',
        stock: 5,
        initial_qty: 40,
        received_date: '2025-09-20',
        expiry_date: '2026-09-25', // Expiring soon (<30 days)
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Mendekati Kedaluwarsa',
      },
      {
        id: 112,
        batch_number: 'B2026-W35-STM',
        medicine_id: 11,
        medicine_name: 'Stimuno Forte 50mg Box (Dus 30s)',
        sku_code: 'MED-STM-50M',
        stock: 28,
        initial_qty: 30,
        received_date: '2026-08-25',
        expiry_date: '2027-12-10',
        pbf_name: 'PT Anugrah Argon Medica (AAM)',
        status: 'Aman',
      },
      {
        id: 113,
        batch_number: 'B2026-W35-TNS',
        medicine_id: 12,
        medicine_name: 'Tensigard Kapsul Antihipertensi Box',
        sku_code: 'MED-TNS-GRD',
        stock: 22,
        initial_qty: 25,
        received_date: '2026-08-26',
        expiry_date: '2027-08-30',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
      {
        id: 114,
        batch_number: 'B2026-W36-BIO',
        medicine_id: 13,
        medicine_name: 'Bioplacenton Gel Luka Bakar 15g',
        sku_code: 'MED-BIOP-GEL',
        stock: 35,
        initial_qty: 40,
        received_date: '2026-08-28',
        expiry_date: '2028-04-15',
        pbf_name: 'PT Kalbe Farma',
        status: 'Aman',
      },
      {
        id: 115,
        batch_number: 'B2026-W36-SLP',
        medicine_id: 14,
        medicine_name: 'Salep 2-4 Antijamur Kulit 30g',
        sku_code: 'MED-SLP24-POT',
        stock: 40,
        initial_qty: 50,
        received_date: '2026-08-28',
        expiry_date: '2027-11-20',
        pbf_name: 'PT Kimia Farma Trading & Distribution',
        status: 'Aman',
      },
    ],

    // ===== 5. PBF & SUPPLIERS =====
    suppliers: [
      {
        id: 1,
        name: 'PT Kimia Farma Trading & Distribution',
        code: 'PBF-KF-01',
        sip_cdob: 'PBF/124/CDOB/JABAR/2023',
        contact_person: 'Rahmat Hidayat (Sales Rep)',
        phone: '0811-2233-4455',
        email: 'order.bandung@kimiafarma.co.id',
        address: 'Jl. Pajajaran No. 45, Bandung',
        lead_time_days: 2,
        status: 'Aktif',
      },
      {
        id: 2,
        name: 'PT Enseval Putera Megatrading Tbk',
        code: 'PBF-ENS-02',
        sip_cdob: 'PBF/889/CDOB/JABAR/2022',
        contact_person: 'Dewi Lestari',
        phone: '0812-3344-5566',
        email: 'sales.bdg@enseval.com',
        address: 'Kawasan Industri Soekarno Hatta No. 120, Bandung',
        lead_time_days: 1,
        status: 'Aktif',
      },
      {
        id: 3,
        name: 'PT Anugrah Argon Medica (AAM)',
        code: 'PBF-AAM-03',
        sip_cdob: 'PBF/567/CDOB/JABAR/2024',
        contact_person: 'Fajar Nugraha',
        phone: '0813-7788-9900',
        email: 'orders@anugrah-argon.com',
        address: 'Jl. Rumah Sakit No. 78, Cinambo, Bandung',
        lead_time_days: 2,
        status: 'Aktif',
      },
      {
        id: 4,
        name: 'PT Mensa Bina Sukses (MBS)',
        code: 'PBF-MBS-04',
        sip_cdob: 'PBF/341/CDOB/JABAR/2023',
        contact_person: 'Irwan Setiawan',
        phone: '0815-6677-8899',
        email: 'cs.mbs@mensa.co.id',
        address: 'Jl. Terusan Buah Batu No. 201, Bandung',
        lead_time_days: 3,
        status: 'Aktif',
      },
    ],

    // ===== 6. PURCHASE ORDERS (PROCUREMENT PBF) =====
    purchaseOrders: [
      {
        id: 1,
        po_number: 'SP-202608-001',
        supplier_id: 1,
        supplier_name: 'PT Kimia Farma Trading & Distribution',
        order_type: 'Reguler',
        order_date: '2026-08-25',
        expected_delivery: '2026-08-27',
        payment_terms: 'Tempo 30 Hari',
        due_date: '2026-09-25',
        payment_status: 'Belum Lunas',
        status: 'Diterima & Selesai',
        notes: 'Restock rutin Paracetamol dan Cetirizine.',
        items: [
          { medicine_id: 1, name: 'Paracetamol 500mg (Sanmol)', qty: 100, unit: 'Biji', unit_price: 320, subtotal: 32000 },
          { medicine_id: 10, name: 'Cetirizine HCl 10mg Tablet (10s)', qty: 50, unit: 'Biji', unit_price: 600, subtotal: 30000 },
        ],
        total_amount: 62000,
        received_at: '2026-08-27 10:30:00',
        received_by: 'Apt. Sarah Maulida, S.Farm',
        invoice_pbf_no: 'FAK-KF-88921',
      },
      {
        id: 2,
        po_number: 'SP-202608-002',
        supplier_id: 4,
        supplier_name: 'PT Mensa Bina Sukses (MBS)',
        order_type: 'Obat Keras',
        order_date: '2026-08-27',
        expected_delivery: '2026-08-30',
        payment_terms: 'Cash',
        due_date: '2026-08-30',
        payment_status: 'Lunas',
        status: 'Dikirim PBF',
        notes: 'Restock Darurat Amlodipine 10mg (Stok sisa 8).',
        items: [
          { medicine_id: 4, name: 'Amlodipine 10mg Hexpharm', qty: 50, unit: 'Biji', unit_price: 850, subtotal: 42500 },
        ],
        total_amount: 42500,
        received_at: null,
        received_by: null,
        invoice_pbf_no: null,
      },
    ],

    // ===== 7. PRESCRIPTIONS & COMPOUNDING =====
    prescriptions: [
      {
        id: 1,
        recipe_number: 'RXP-202608-001',
        user_id: 1,
        patient_name: 'Tn. Hendra Gunawan',
        patient_age: 54,
        patient_phone: '0812-9888-7766',
        patient_address: 'Jl. Cijagra No. 14, Buahbatu, Bandung',
        doctor_name: 'dr. Bambang Sulistyo, Sp.PD',
        doctor_sip: 'SIP.440/1209/Dinkes-Bdg/2021',
        clinic_name: 'Klinik Utama Asih Sehat',
        image_path: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        prescription_type: 'Non-Racikan',
        status: 'Antrean',
        clinical_screening: {
          admin_valid: true,
          indication_valid: true,
          dosage_valid: true,
          interaction_safe: true,
        },
        items: [
          { medicine_id: 4, name: 'Amlodipine 10mg Hexpharm', qty: 30, unit: 'Biji', dosage_instruction: '1 x 1 biji tiap pagi setelah makan' },
          { medicine_id: 6, name: 'Metformin HCl 500mg Dexa', qty: 60, unit: 'Biji', dosage_instruction: '2 x 1 biji bersama makanan' },
        ],
        tuslah_fee: 5000,
        embalase_fee: 2000,
        notes: 'Resep obat kronis hipertensi & diabetes 30 hari.',
        created_at: '2026-08-28 08:15:00',
        verified_by: null,
        verified_at: null,
      },
      {
        id: 2,
        recipe_number: 'RXP-202608-002',
        user_id: 2,
        patient_name: 'Ananda Kevin Pratama',
        patient_age: 7,
        patient_phone: '0857-3344-5566',
        patient_address: 'Komp. Batununggal Indah No. 8',
        doctor_name: 'dr. Anita Wijaya, Sp.A',
        doctor_sip: 'SIP.440/0942/Dinkes-Bdg/2022',
        clinic_name: 'RSIA Hermina Pasteur',
        image_path: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        prescription_type: 'Racikan Puyer',
        status: 'Siap Diambil',
        clinical_screening: {
          admin_valid: true,
          indication_valid: true,
          dosage_valid: true,
          interaction_safe: true,
        },
        items: [
          { medicine_id: 1, name: 'Paracetamol 500mg (dosis 250mg)', qty: 5, unit: 'Biji', dosage_instruction: '3 x 1/2 biji jika demam > 38C' },
          { medicine_id: 3, name: 'Decolgen Flu (dosis 1/2 tab)', qty: 5, unit: 'Biji', dosage_instruction: '3 x 1/2 biji sesudah makan' },
        ],
        tuslah_fee: 10000, // Tuslah racik puyer
        embalase_fee: 3000, // Kertas puyer & plastik klip
        notes: 'Racikan puyer batuk pilek & demam anak 10 bungkus. Pasien BB 22kg.',
        created_at: '2026-08-28 07:45:00',
        verified_by: 'Apt. Sarah Maulida, S.Farm',
        verified_at: '2026-08-28 08:00:15',
      },
    ],

    // ===== 8. TRANSACTIONS & SALES =====
    transactions: [
      {
        id: 1,
        invoice_number: 'INV-20260828-0001',
        user_id: 3,
        cashier_name: 'Budi Santoso',
        customer_name: 'Ibu Ratna Kumalasari',
        customer_phone: '0812-3344-1122',
        prescription_id: null,
        subtotal: 51000,
        tuslah_fee: 0,
        embalase_fee: 0,
        discount_amount: 1000,
        tax_amount: 0,
        total_amount: 50000,
        paid_amount: 50000,
        change_amount: 0,
        payment_status: 'Paid',
        payment_method: 'Cash',
        created_at: '2026-08-28 08:30:20',
        details: [
          { id: 1, medicine_id: 1, name: 'Paracetamol 500mg (Sanmol)', qty: 2, price: 4500, subtotal: 9000 },
          { id: 2, medicine_id: 7, name: 'Tolak Angin Cair Herbal (Dus 12 Sachet)', qty: 1, price: 42000, subtotal: 42000 },
        ],
      },
      {
        id: 2,
        invoice_number: 'INV-20260828-0002',
        user_id: 3,
        cashier_name: 'Budi Santoso',
        customer_name: 'Tn. Joko Prasetyo',
        customer_phone: '0878-1122-3344',
        prescription_id: null,
        subtotal: 34500,
        tuslah_fee: 0,
        embalase_fee: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: 34500,
        paid_amount: 35000,
        change_amount: 500,
        payment_status: 'Paid',
        payment_method: 'QRIS',
        created_at: '2026-08-28 09:15:45',
        details: [
          { id: 3, medicine_id: 9, name: 'Betadine Antiseptik Cair 30ml', qty: 1, price: 27000, subtotal: 27000 },
          { id: 4, medicine_id: 10, name: 'Cetirizine HCl 10mg Tablet (10s)', qty: 1, price: 7500, subtotal: 7500 },
        ],
      },
      {
        id: 3,
        invoice_number: 'INV-20260828-0003',
        user_id: 3,
        cashier_name: 'Budi Santoso',
        customer_name: 'Ny. Dewi Sartika',
        customer_phone: '0813-9988-7766',
        prescription_id: null,
        subtotal: 28500,
        tuslah_fee: 0,
        embalase_fee: 0,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: 28500,
        paid_amount: 28500,
        change_amount: 0,
        payment_status: 'Paid',
        payment_method: 'Transfer Bank (BCA)',
        created_at: '2026-08-28 09:50:10',
        details: [
          { id: 5, medicine_id: 2, name: 'Promag Tablet Kunyah (Dus 3 Strip)', qty: 3, price: 9500, subtotal: 28500 },
        ],
      },
    ],

    // ===== 9. STOCK MUTATION LOGS =====
    stockLogs: [
      {
        id: 1,
        medicine_id: 1,
        medicine_name: 'Paracetamol 500mg (Sanmol)',
        batch_no: 'BATCH-SAN-2024A',
        type: 'In',
        qty: 120,
        current_stock: 120,
        reason: 'Penerimaan Faktur PBF Kimia Farma SP-202608-001',
        reference_id: 'SP-202608-001',
        created_at: '2026-08-27 10:30:00',
        user_name: 'Apt. Sarah Maulida, S.Farm',
      },
      {
        id: 2,
        medicine_id: 1,
        medicine_name: 'Paracetamol 500mg (Sanmol)',
        batch_no: 'BATCH-SAN-2024A',
        type: 'Out',
        qty: -2,
        current_stock: 118,
        reason: 'Penjualan Kasir POS INV-20260828-0001',
        reference_id: 'INV-20260828-0001',
        created_at: '2026-08-28 08:30:20',
        user_name: 'Budi Santoso',
      },
      {
        id: 3,
        medicine_id: 10,
        medicine_name: 'Cetirizine HCl 10mg Tablet (10s)',
        batch_no: 'BATCH-CET-2023E',
        type: 'Adjust',
        qty: -5,
        current_stock: 5,
        reason: 'Stock Opname Fisik (Koreksi Selisih Fisik Rak B-01)',
        reference_id: 'OPNAME-20260827',
        created_at: '2026-08-27 17:00:00',
        user_name: 'Apt. Sarah Maulida, S.Farm',
      },
    ],

    // ===== 10. AUDIT TRAIL =====
    auditLogs: [
      {
        id: 1,
        user_name: 'Afin Riyandika',
        role: 'Admin',
        action: 'LOGIN',
        module: 'Autentikasi',
        details: 'User login berhasil ke sistem Apotek Budi Asih',
        timestamp: '2026-08-28 07:00:15',
        ip: '192.168.1.10',
      },
      {
        id: 2,
        user_name: 'Budi Santoso',
        role: 'Kasir',
        action: 'SHIFT_START',
        module: 'Kasir POS',
        details: 'Buka Shift Kasir Pagi (Kas Awal: Rp 250.000)',
        timestamp: '2026-08-28 07:30:00',
        ip: '192.168.1.15',
      },
      {
        id: 3,
        user_name: 'Apt. Sarah Maulida, S.Farm',
        role: 'Apoteker',
        action: 'PRESCRIPTION_VERIFY',
        module: 'Resep Dokter',
        details: 'Verifikasi & persetujuan resep racikan RXP-202608-002',
        timestamp: '2026-08-28 08:00:15',
        ip: '192.168.1.12',
      },
    ],

    // ===== 11. CURRENT CASHIER SHIFT =====
    currentShift: getStoredShift(),

    // ===== 12. WEEKLY ROTATING STOCK OPNAME (CYCLIC SO) =====
    opnameSchedules: [
      {
        id: 1,
        week_number: 1,
        title: 'Minggu ke-1: Obat Bebas & Obat Bebas Terbatas',
        category_ids: [2, 3],
        category_names: 'Obat Bebas Terbatas, Obat Bebas',
        day: 'Selasa',
        time: '08:30',
        assigned_user: 'Budi Santoso',
        notes: 'Fokus cek kemasan strip rusak & obat fast-moving etalase kasir',
        status: 'Selesai',
        last_performed: '2026-09-01 09:15',
        total_items: 5,
        discrepancy_count: 0,
      },
      {
        id: 2,
        week_number: 2,
        title: 'Minggu ke-2: Obat Keras (Ethical & Resep)',
        category_ids: [1],
        category_names: 'Obat Keras',
        day: 'Selasa',
        time: '08:30',
        assigned_user: 'Apt. Sarah Maulida, S.Farm',
        notes: 'Wajib teliti kesesuaian resep dokter dan kartu stok lemari khusus obat keras BPOM',
        status: 'Siap Dikerjakan',
        last_performed: null,
        total_items: 3,
        discrepancy_count: 0,
      },
      {
        id: 3,
        week_number: 3,
        title: 'Minggu ke-3: Obat Jamu (Herbal Tradisional)',
        category_ids: [4],
        category_names: 'Obat Jamu',
        day: 'Selasa',
        time: '08:30',
        assigned_user: 'Siti Rahmawati',
        notes: 'Pemeriksaan integritas sachet jamu herbal, nomor izin edar BPOM TR dan masa simpan (ED)',
        status: 'Terjadwal',
        last_performed: null,
        total_items: 2,
        discrepancy_count: 0,
      },
      {
        id: 4,
        week_number: 4,
        title: 'Minggu ke-4: Obat Fitofarmaka (Uji Klinis Modern)',
        category_ids: [5],
        category_names: 'Obat Fitofarmaka',
        day: 'Selasa',
        time: '08:30',
        assigned_user: 'Afin Riyandika',
        notes: 'Penutup siklus audit bulanan sediaan fitofarmaka berstandar uji klinis BPOM FF',
        status: 'Terjadwal',
        last_performed: null,
        total_items: 2,
        discrepancy_count: 0,
      },
    ],

    opnameReports: [
      {
        id: 101,
        report_number: 'BASO-202609-W01',
        schedule_id: 1,
        schedule_title: 'Minggu ke-1: Obat Bebas & Obat Bebas Terbatas',
        category_names: 'Obat Bebas Terbatas, Obat Bebas',
        performed_at: '2026-09-01 09:15',
        performed_by: 'Budi Santoso',
        approved_by: 'Afin Riyandika (Admin)',
        total_items_counted: 4,
        matched_items_count: 4,
        discrepancy_items_count: 0,
        total_variance_value: 0,
        status: 'Disetujui Admin',
        notes: 'Seluruh stok fisik di rak etalase kasir 100% cocok dengan saldo sistem.',
        items: [
          { medicine_id: 1, name: 'Paracetamol 500mg (Sanmol)', category_id: 3, category_name: 'Obat Bebas', unit: 'Biji', system_stock: 120, physical_stock: 120, variance: 0, price: 320, variance_value: 0, reason: 'Sesuai' },
          { medicine_id: 2, name: 'Promag Tablet Kunyah (Dus)', category_id: 3, category_name: 'Obat Bebas', unit: 'Box', system_stock: 85, physical_stock: 85, variance: 0, price: 22500, variance_value: 0, reason: 'Sesuai' },
          { medicine_id: 3, name: 'Decolgen Flu & Batuk Tablet', category_id: 2, category_name: 'Obat Bebas Terbatas', unit: 'Biji', system_stock: 48, physical_stock: 48, variance: 0, price: 1100, variance_value: 0, reason: 'Sesuai' },
          { medicine_id: 10, name: 'Cetirizine HCl 10mg Tablet (10s)', category_id: 2, category_name: 'Obat Bebas Terbatas', unit: 'Biji', system_stock: 5, physical_stock: 5, variance: 0, price: 600, variance_value: 0, reason: 'Sesuai' },
        ],
      },
      {
        id: 100,
        report_number: 'BASO-202608-W04',
        schedule_id: 4,
        schedule_title: 'Minggu ke-4: Obat Fitofarmaka (Agustus)',
        category_names: 'Obat Fitofarmaka',
        performed_at: '2026-08-28 17:30',
        performed_by: 'Afin Riyandika',
        approved_by: 'Apt. Sarah Maulida, S.Farm (Admin)',
        total_items_counted: 2,
        matched_items_count: 1,
        discrepancy_items_count: 1,
        total_variance_value: -72000,
        status: 'Disetujui Admin',
        notes: 'Ditemukan 1 botol/kotak Stimuno Forte kemasan luar penyok saat pengiriman dan telah disesuaikan.',
        items: [
          { medicine_id: 11, name: 'Stimuno Forte 50mg (Dus 30 Kapsul)', category_id: 5, category_name: 'Obat Fitofarmaka', unit: 'Box', system_stock: 28, physical_stock: 27, variance: -1, price: 72000, variance_value: -72000, reason: 'Kemasan Rusak / Cacat Display' },
          { medicine_id: 12, name: 'Tensigard Kapsul Antihipertensi (Dus 30s)', category_id: 5, category_name: 'Obat Fitofarmaka', unit: 'Box', system_stock: 22, physical_stock: 22, variance: 0, price: 95000, variance_value: 0, reason: 'Sesuai' },
        ],
      },
    ],
    eodReports: [],
  }),

  getters: {
    isOwner: (state) => {
      const role = state.currentUser?.role;
      return role === 'Owner' || role === 'Admin';
    },
    allowedTabs: (state) => {
      if (!state.currentUser) return [];
      const role = state.currentUser.role;
      if (role === 'Owner' || role === 'Admin') return ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname', 'users'];
      const perms = Array.isArray(state.currentUser.permissions) ? state.currentUser.permissions : [];
      if (perms.includes('all') || perms.includes('*')) return ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname', 'users'];
      return perms;
    },
    lowStockMedicines: (state) => {
      return state.medicines.filter((m) => m.stock <= m.min_stock);
    },
    expiredOrNearExpiryMedicines: (state) => {
      const now = new Date();
      const threeMonths = new Date();
      threeMonths.setMonth(now.getMonth() + 3);

      return state.medicines.filter((m) => {
        const exp = new Date(m.expiry_date);
        return exp <= threeMonths;
      });
    },
    pendingPrescriptionsCount: (state) => {
      return state.prescriptions.filter((p) => p.status === 'Antrean' || p.status === 'Pending').length;
    },
    totalRevenueToday: (state) => {
      return state.transactions.reduce((acc, curr) => acc + curr.total_amount, 0);
    },
    totalProfitToday: (state) => {
      let profit = 0;
      state.transactions.forEach((tx) => {
        tx.details.forEach((d) => {
          const med = state.medicines.find((m) => m.id === d.medicine_id);
          const buyPrice = med ? med.purchase_price : d.price * 0.7;
          profit += (d.price - buyPrice) * d.qty;
        });
        profit += (tx.tuslah_fee || 0) + (tx.embalase_fee || 0);
      });
      return profit;
    },
    totalTransactionsCount: (state) => {
      return state.transactions.length;
    },
    categoryMap: (state) => {
      const map = {};
      state.categories.forEach((c) => { map[c.id] = c; });
      return map;
    },
    fefoSortedBatches: (state) => {
      return [...state.batches].sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    },
    getActiveBatchesForMed: (state) => (medicineId) => {
      return state.batches
        .filter((b) => b.medicine_id === medicineId && b.stock > 0)
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    },
    getNearestExpiryForMed: (state) => (medicineId) => {
      const active = state.batches
        .filter((b) => b.medicine_id === medicineId && b.stock > 0)
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
      return active.length > 0 ? active[0].expiry_date : null;
    },
  },

  actions: {
    // ===== AUTH & SAVED ACCOUNTS ACTIONS =====
    // ==================== REALTIME CROSS-ACCOUNT / TAB SYNC ====================
    broadcastChange(type, payload = {}) {
      try {
        syncChannel?.postMessage({
          type,
          user: this.currentUser?.name,
          role: this.currentUser?.role,
          timestamp: Date.now(),
          ...payload
        });
      } catch (e) {}
    },

    initSyncListener() {
      if (!syncChannel || this._syncListenerInitialized) return;
      this._syncListenerInitialized = true;

      syncChannel.onmessage = async (event) => {
        const data = event.data || {};
        console.log(`📡 [REALTIME SYNC] Menerima sinyal "${data.type}" dari ${data.user || 'perangkat lain'}`);
        if (data.type === 'MEDICINES_CHANGED') {
          await this.fetchMedicinesFromDb();
        } else if (data.type === 'TRANSACTIONS_CHANGED') {
          await this.fetchTransactionsFromDb();
        } else if (data.type === 'OPNAME_CHANGED') {
          await this.fetchOpnameReportsFromDb();
        } else if (data.type === 'USERS_CHANGED' || data.type === 'PASSWORD_CHANGED') {
          await this.fetchUsersFromDb();
        }
      };
    },

    getSavedAccounts() {
      try {
        const saved = localStorage.getItem('apotek_saved_accounts');
        let list = saved ? JSON.parse(saved) : [];
        if (Array.isArray(list)) {
          // Hanya izinkan 2 akun resmi (Afin & Indana)
          list = list.filter(a => a.nik === '2026010188' || a.nik === '2026020119' || a.email === 'skibidibisnis@gmail.com' || a.email === 'indanafarhahh@gmail.com');
          localStorage.setItem('apotek_saved_accounts', JSON.stringify(list));
        }
        return list.map(acc => {
          const found = this.usersList.find(
            (u) => (u.nik && u.nik === acc.nik) || (u.email && u.email.toLowerCase() === (acc.email || '').toLowerCase())
          );
          return {
            ...acc,
            name: found ? found.name : acc.name,
            password: (found && found.password) ? found.password : (acc.password || ''),
          };
        });
      } catch (e) {
        return [];
      }
    },

    saveAccountToStorage(user, password = '') {
      if (!user) return;
      try {
        const accounts = this.getSavedAccounts();
        const existingIndex = accounts.findIndex(
          (a) => (a.nik && a.nik === user.nik) || (a.email && a.email === user.email)
        );

        const accountData = {
          id: user.id,
          nik: user.nik || '',
          name: user.name,
          email: user.email || '',
          role: user.role || 'Kasir',
          sipa: user.sipa || null,
          avatar: user.avatar || '',
          password: password || user.password || '',
          lastLogin: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          accounts[existingIndex] = { ...accounts[existingIndex], ...accountData };
        } else {
          accounts.unshift(accountData);
        }

        // Limit maximum saved accounts to 6
        const trimmed = accounts.slice(0, 6);
        localStorage.setItem('apotek_saved_accounts', JSON.stringify(trimmed));
        return trimmed;
      } catch (e) {
        console.error('Failed to save account:', e);
        return [];
      }
    },

    removeSavedAccount(nikOrEmail) {
      try {
        const accounts = this.getSavedAccounts().filter(
          (a) => a.nik !== nikOrEmail && a.email !== nikOrEmail
        );
        localStorage.setItem('apotek_saved_accounts', JSON.stringify(accounts));
        return accounts;
      } catch (e) {
        return [];
      }
    },

    clearAllSavedAccounts() {
      try {
        localStorage.removeItem('apotek_saved_accounts');
      } catch (e) {
        console.error('Failed to clear saved accounts:', e);
      }
    },

    async verifyUser(nikOrEmail, password) {
      const query = String(nikOrEmail || '').toLowerCase().trim();
      let userCandidate = null;

      // 1. Try Laravel DB API if available
      try {
        const isEmail = query.includes('@');
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            nik: isEmail ? null : query,
            email: isEmail ? query : null,
            password: password,
            remember: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const fallbackAvatar = this.usersList.find(
              (u) => u.email === data.user.email || u.nik === data.user.nik
            )?.avatar || 'https://images.unsplash.com/photo-1594824813590-7853112d7b68?w=150&auto=format&fit=crop&q=80';

            let userPerms = data.user.permissions;
            if (typeof userPerms === 'string') {
              try { userPerms = JSON.parse(userPerms); } catch (e) { userPerms = []; }
            }
            const isOwner = data.user.role === 'Owner' || data.user.role === 'Admin';
            if (!Array.isArray(userPerms) || userPerms.length === 0) {
              userPerms = isOwner ? ['all'] : ['pos', 'inventory', 'eod', 'opname'];
            }

            userCandidate = {
              id: data.user.id,
              name: data.user.name,
              nik: data.user.nik || (isEmail ? '' : query),
              email: data.user.email,
              role: isOwner ? 'Owner' : (data.user.role || 'Apoteker'),
              sipa: data.user.sipa || null,
              avatar: data.user.avatar || fallbackAvatar,
              permissions: isOwner ? ['all'] : userPerms.filter(p => p !== 'users'),
            };
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'NIK Karyawan atau kata sandi tidak sesuai.');
          throw new Error(errorMsg);
        }
      } catch (err) {
        const isSystemOrNetwork =
          !err.message ||
          err.message.includes('fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Failed to fetch') ||
          err.message.includes('kesalahan sistem') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('relation "users" does not exist') ||
          err.message.includes('Connection');

        if (!isSystemOrNetwork) {
          throw err;
        }
      }

      // 2. Fallback to Store usersList (hanya jika backend tidak dapat diakses sama sekali)
      if (!userCandidate) {
        const user = this.usersList.find((u) => {
          const uNik = String(u.nik || '').toLowerCase().trim();
          const uEmail = String(u.email || '').toLowerCase().trim();
          return uNik === query || uEmail === query;
        });

        if (!user) {
          throw new Error('NIK Karyawan atau email belum terdaftar di sistem Apotek Budi Asih.');
        }

        if (user.password !== password) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }

        userCandidate = {
          id: user.id,
          name: user.name,
          nik: user.nik,
          email: user.email,
          role: user.role,
          sipa: user.sipa || null,
          avatar: user.avatar,
          permissions: user.permissions || ['all'],
        };
      }

      if (userCandidate) {
        const customAvatars = getCustomAvatars();
        const custom = (userCandidate.nik && customAvatars[userCandidate.nik]) || (userCandidate.id && customAvatars[userCandidate.id]);
        if (custom) {
          userCandidate.avatar = custom;
        }
      }

      return userCandidate;
    },



    async fetchCategoriesFromDb() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          if (list.length > 0) {
            const categoryMetaMap = {
              'obat-bebas': { color: 'emerald', iconName: 'Pill' },
              'obat-bebas-terbatas': { color: 'blue', iconName: 'AlertCircle' },
              'obat-keras': { color: 'rose', iconName: 'FileText' },
              'antibiotik': { color: 'indigo', iconName: 'ShieldCheck' },
              'vitamin-suplemen': { color: 'amber', iconName: 'Sparkles' },
              'alat-kesehatan': { color: 'cyan', iconName: 'Cross' },
              'obat-jamu': { color: 'amber', iconName: 'Sparkles' },
              'obat-fitofarmaka': { color: 'purple', iconName: 'ShieldCheck' },
            };

            this.categories = list.map((c) => {
              const meta = categoryMetaMap[c.slug] || { color: 'slate', iconName: 'Pill' };
              return {
                id: Number(c.id),
                name: c.name,
                slug: c.slug,
                color: meta.color,
                iconName: meta.iconName,
                description: c.description || '',
              };
            });
            console.log(`🏷️ [STORE] Berhasil memuat ${this.categories.length} kategori obat langsung dari PostgreSQL.`);
          }
        }
      } catch (e) {
        console.warn('⚠️ [STORE] Gagal memuat kategori dari DB:', e.message);
      }
    },

    async fetchMedicinesFromDb() {
      try {
        const res = await fetch('/api/medicines');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          if (list.length > 0) {
            this.medicines = list.map((m) => ({
              id: Number(m.id),
              category_id: Number(m.category_id),
              name: m.name,
              sku_code: m.sku_code,
              bpom_number: m.bpom_number || '',
              type: m.type || 'Bebas',
              unit: m.unit || 'Tablet',
              price: Number(m.price) || 0,
              purchase_price: Number(m.purchase_price) || 0,
              stock: Number(m.stock) || 0,
              min_stock: Number(m.min_stock) || 10,
              expiry_date: typeof m.expiry_date === 'string' ? m.expiry_date.slice(0, 10) : '2027-12-31',
              description: m.description || '',
              manufacturer: m.manufacturer || '-',
              image: m.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
              created_at: m.created_at,
              updated_at: m.updated_at,
            }));

            // Sinkronkan batch FEFO dinamis dari master obat PostgreSQL
            const existingBatchMedIds = new Set(this.batches.map(b => b.medicine_id));
            this.medicines.forEach(med => {
              if (!existingBatchMedIds.has(med.id) && med.stock > 0) {
                const bYear = med.expiry_date ? med.expiry_date.slice(0, 4) : '2027';
                const bMonth = med.expiry_date ? med.expiry_date.slice(5, 7) : '12';
                this.batches.push({
                  id: 200 + med.id,
                  medicine_id: med.id,
                  medicine_name: med.name,
                  batch_number: `BCH-${bYear}${bMonth}-${med.sku_code ? med.sku_code.replace('MED-', '') : med.id}`,
                  stock: med.stock,
                  expiry_date: med.expiry_date,
                  received_date: '2026-01-10',
                  supplier_name: 'PBF Kimia Farma Trading',
                  storage_location: 'Etalase Utama A-01',
                  status: 'Aman',
                });
              } else {
                const medBatches = this.batches.filter(b => b.medicine_id === med.id);
                if (medBatches.length === 1) {
                  medBatches[0].stock = med.stock;
                  medBatches[0].expiry_date = med.expiry_date;
                }
              }
            });

            console.log(`✅ [STORE] Berhasil memuat ${this.medicines.length} master obat langsung dari PostgreSQL.`);
          }
        }
      } catch (e) {
        console.warn('⚠️ [STORE] Gagal memuat data obat dari DB:', e.message);
      }
    },

    async fetchPrescriptionsFromDb() {
      try {
        const res = await fetch('/api/prescriptions');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          if (list.length > 0) {
            this.prescriptions = list.map((p) => {
              let uiStatus = 'Antrean';
              if (p.status === 'Verified') uiStatus = 'Siap Diambil';
              else if (p.status === 'Rejected') uiStatus = 'Ditolak';
              else if (p.status === 'Processed') uiStatus = 'Selesai';
              else uiStatus = 'Antrean';

              const rxpNumber = `RXP-${new Date(p.created_at || Date.now()).toISOString().slice(0, 7).replace('-', '')}-${String(p.id).padStart(3, '0')}`;

              return {
                id: Number(p.id),
                recipe_number: rxpNumber,
                user_id: p.user_id ? Number(p.user_id) : null,
                patient_name: p.patient_name || 'Pasien Umum',
                patient_age: 30,
                patient_phone: p.patient_phone || '-',
                patient_address: 'Bandung',
                doctor_name: p.doctor_name || 'dr. Umum',
                doctor_sip: 'SIP.440/Dinkes/2023',
                clinic_name: 'Praktik Dokter Spesialis',
                image_path: p.image_path || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
                prescription_type: (p.notes && p.notes.toLowerCase().includes('puyer')) ? 'Racikan Puyer' : 'Non-Racikan',
                status: uiStatus,
                clinical_screening: {
                  admin_valid: true,
                  indication_valid: true,
                  dosage_valid: true,
                  interaction_safe: true,
                },
                items: [],
                tuslah_fee: (p.notes && p.notes.toLowerCase().includes('puyer')) ? 10000 : 5000,
                embalase_fee: 2000,
                notes: p.notes || '',
                created_at: typeof p.created_at === 'string' ? p.created_at.slice(0, 19).replace('T', ' ') : new Date(p.created_at).toISOString().slice(0, 19).replace('T', ' '),
                verified_by: p.verified_by_name || (p.verified_by ? `Apoteker #${p.verified_by}` : null),
                verified_at: p.verified_at ? (typeof p.verified_at === 'string' ? p.verified_at.slice(0, 19).replace('T', ' ') : new Date(p.verified_at).toISOString().slice(0, 19).replace('T', ' ')) : null,
              };
            });
            console.log(`📋 [STORE] Berhasil memuat ${this.prescriptions.length} antrean resep dokter langsung dari PostgreSQL.`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal memuat resep dari DB:', err.message);
      }
    },

    async fetchStockLogsFromDb() {
      try {
        const res = await fetch('/api/stock-logs');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : [];
          if (list.length > 0) {
            this.stockLogs = list.map((l) => ({
              id: Number(l.id),
              medicine_id: Number(l.medicine_id),
              medicine_name: l.medicine_name || `Obat #${l.medicine_id}`,
              batch_no: l.reference_id || `LOG-${l.id}`,
              type: l.type,
              qty: Number(l.qty),
              current_stock: Number(l.current_stock),
              reason: l.reason || 'Mutasi Stok',
              reference_id: l.reference_id || `LOG-${l.id}`,
              created_at: typeof l.created_at === 'string' ? l.created_at.slice(0, 19).replace('T', ' ') : new Date(l.created_at).toISOString().slice(0, 19).replace('T', ' '),
              user_name: l.user_name || 'Petugas Farmasi',
            }));
            console.log(`✅ [STORE] Berhasil memuat ${this.stockLogs.length} riwayat mutasi kartu stok dari PostgreSQL.`);
          }
        }
      } catch (e) {
        console.warn('⚠️ [STORE] Gagal memuat kartu stok dari DB:', e.message);
      }
    },

    findUserByEmail(email) {
      const query = String(email || '').toLowerCase().trim();
      return this.usersList.find((u) => {
        const uEmail = String(u.email || '').toLowerCase().trim();
        const uNik = String(u.nik || '').toLowerCase().trim();
        return uEmail === query || uNik === query;
      }) || null;
    },

    async resetUserPassword(emailOrNik, newPassword) {
      const query = String(emailOrNik || '').toLowerCase().trim();

      // Panggil backend API jika server Laravel aktif
      try {
        await fetch('/api/forgot-password/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            identifier: query,
            password: newPassword,
          }),
        });
      } catch (e) {
        // Fallback ke penyimpanan reaktif lokal Pinia jika offline
      }

      const user = this.usersList.find((u) => {
        const uEmail = String(u.email || '').toLowerCase().trim();
        const uNik = String(u.nik || '').toLowerCase().trim();
        return uEmail === query || uNik === query;
      });

      if (user) {
        user.password = newPassword;
        this.logActivity('SECURITY', 'Autentikasi', `Reset password berhasil untuk akun ${user.name} (${user.email}).`);
        return { success: true, user, message: `Kata sandi untuk ${user.name} berhasil diatur ulang.` };
      }

      // If user not in default list, still allow success for dynamic users
      this.logActivity('SECURITY', 'Autentikasi', `Reset password berhasil untuk email ${query}.`);
      return { success: true, user: { email: query, name: query.split('@')[0] }, message: 'Kata sandi berhasil diatur ulang.' };
    },

    async login(nikOrEmail, password, rememberMe = false, saveAccount = false, turnstileToken = null) {
      const query = String(nikOrEmail || '').toLowerCase().trim();
      let authenticatedUser = null;

      // 1. Try Laravel DB API if available
      try {
        const isEmail = query.includes('@');
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            nik: isEmail ? null : query,
            email: isEmail ? query : null,
            password: password,
            remember: rememberMe,
            turnstile_token: turnstileToken,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            const fallbackAvatar = this.usersList.find(
              (u) => u.email === data.user.email || u.nik === data.user.nik
            )?.avatar || 'https://images.unsplash.com/photo-1594824813590-7853112d7b68?w=150&auto=format&fit=crop&q=80';

            let userPerms = data.user.permissions;
            if (typeof userPerms === 'string') {
              try { userPerms = JSON.parse(userPerms); } catch (e) { userPerms = []; }
            }
            const isOwner = data.user.role === 'Owner' || data.user.role === 'Admin';
            if (!Array.isArray(userPerms) || userPerms.length === 0) {
              userPerms = isOwner ? ['all'] : ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname'];
            }

            authenticatedUser = {
              id: data.user.id,
              name: data.user.name,
              nik: data.user.nik || (isEmail ? '' : query),
              email: data.user.email,
              role: isOwner ? 'Owner' : (data.user.role || 'Apoteker'),
              sipa: data.user.sipa || null,
              avatar: data.user.avatar || fallbackAvatar,
              permissions: isOwner ? ['all'] : userPerms.filter(p => p !== 'users'),
            };

            const uIdx = this.usersList.findIndex(u => Number(u.id) === Number(data.user.id) || u.nik === data.user.nik);
            if (uIdx !== -1) {
              this.usersList[uIdx] = {
                ...this.usersList[uIdx],
                ...data.user,
                role: authenticatedUser.role,
                permissions: authenticatedUser.permissions,
              };
              this.saveUsersList();
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : 'NIK Karyawan atau kata sandi tidak sesuai.');
          throw new Error(errorMsg);
        }
      } catch (err) {
        const isSystemOrNetwork =
          !err.message ||
          err.message.includes('fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Failed to fetch') ||
          err.message.includes('kesalahan sistem') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('relation "users" does not exist') ||
          err.message.includes('Connection');

        if (!isSystemOrNetwork) {
          throw err;
        }
      }

      // 2. Fallback to Store usersList (hanya jika backend tidak dapat diakses sama sekali)
      if (!authenticatedUser) {
        const user = this.usersList.find((u) => {
          const uNik = String(u.nik || '').toLowerCase().trim();
          const uEmail = String(u.email || '').toLowerCase().trim();
          return uNik === query || uEmail === query;
        });

        if (!user) {
          throw new Error('NIK Karyawan atau email belum terdaftar di sistem Apotek Budi Asih.');
        }

        if (user.password !== password) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }

        const isOwner = user.role === 'Owner' || user.role === 'Admin';
        const userPerms = Array.isArray(user.permissions) ? user.permissions : ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname'];
        authenticatedUser = {
          id: user.id,
          name: user.name,
          nik: user.nik,
          email: user.email,
          role: isOwner ? 'Owner' : user.role,
          sipa: user.sipa || null,
          avatar: user.avatar,
          permissions: isOwner ? ['all'] : userPerms.filter(p => p !== 'users'),
        };
      }

      this.currentUser = authenticatedUser;
      this.isAuthenticated = true;

      // Sesi aktif perangkat
      if (rememberMe) {
        localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
      } else {
        sessionStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
        localStorage.removeItem('apotek_auth_user');
      }

      // Simpan Akun ke riwayat perangkat HANYA jika dipilih (saveAccount = true)
      if (saveAccount) {
        this.saveAccountToStorage(this.currentUser, password);
      }

      this.logActivity('LOGIN', 'Autentikasi', `Pengguna ${authenticatedUser.name} berhasil masuk.`);
      return this.currentUser;
    },

    logout() {
      const userName = this.currentUser ? this.currentUser.name : 'Pengguna';
      this.logActivity('LOGOUT', 'Autentikasi', `Pengguna ${userName} keluar dari sistem.`);
      this.isAuthenticated = false;
      this.currentUser = null;
      localStorage.removeItem('apotek_auth_user');
      sessionStorage.removeItem('apotek_auth_user');
    },

    switchRole(roleName) {
      const target = (roleName || '').toLowerCase();
      const found = this.usersList.find((u) => {
        const uRole = (u.role || '').toLowerCase();
        if (target === 'owner' || target === 'admin') {
          return uRole === 'owner' || uRole === 'admin';
        }
        return uRole === target;
      });
      if (found) {
        const customAvatars = getCustomAvatars();
        const customAvatar = (found.nik && customAvatars[found.nik]) || (found.id && customAvatars[found.id]);
        this.currentUser = {
          id: found.id,
          name: found.name,
          nik: found.nik,
          email: found.email,
          role: found.role,
          sipa: found.sipa || null,
          avatar: customAvatar || found.avatar,
          permissions: found.permissions || ['all'],
        };
        localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
        this.logActivity('SWITCH_ROLE', 'Hak Akses', `Beralih peran aktif ke: ${found.role}`);

        const isOwnerRole = found.role === 'Owner' || (typeof found.role === 'string' && found.role.toLowerCase() === 'owner');
        if (isOwnerRole) {
          this.fetchOpnameReportsFromDb();
        } else {
          this.opnameReports = [];
        }
      }
    },

    saveUsersList() {
      try {
        localStorage.setItem('apotek_users_list', JSON.stringify(this.usersList));
      } catch (e) {}
    },

    async createUser(userData) {
      const newId = this.usersList.length > 0 ? Math.max(...this.usersList.map(u => Number(u.id) || 0)) + 1 : 1;
      const newUser = {
        id: newId,
        name: userData.name,
        nik: userData.nik || `20260${Math.floor(1000 + Math.random() * 9000)}`,
        role: userData.role || 'Asisten Apoteker',
        title: userData.title || (userData.role === 'Admin' ? 'Pemilik Sarana Apotek (Owner)' : userData.role === 'Apoteker' ? 'Apoteker Penanggung Jawab' : userData.role === 'Asisten Apoteker' ? 'Tenaga Teknis Kefarmasian' : 'Kasir Toko'),
        sipa: userData.sipa || null,
        strttk: userData.strttk || null,
        email: userData.email || '',
        password: userData.password || 'password123',
        status: userData.status || 'Aktif',
        avatar: userData.avatar || 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272112/apotek_budiasih/avatars/avatar_kasir_indana.jpg',
        permissions: userData.permissions || ['pos', 'inventory', 'defekta'],
      };
      this.usersList.push(newUser);
      this.saveUsersList();
      this.logActivity('CREATE_USER', 'Manajemen Pengguna', `Menambahkan pengguna baru: ${newUser.name} (${newUser.role})`);

      // Sinkronisasi otomatis ke Database PostgreSQL (DBeaver)
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newUser.name,
            nik: newUser.nik,
            email: newUser.email,
            role: newUser.role,
            title: newUser.title,
            status: newUser.status,
            sipa: newUser.sipa,
            strttk: newUser.strttk,
            permissions: newUser.permissions,
            phone: userData.phone || '081234567890',
            password: newUser.password,
            avatar: newUser.avatar,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.user && resData.user.id) {
            newUser.id = Number(resData.user.id);
            newUser.nik = resData.user.nik;
            this.saveUsersList();
            console.log(`✅ [STORE] Karyawan ${newUser.name} tersimpan permanen di PostgreSQL DB (ID: ${newUser.id})`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal simpan karyawan ke PostgreSQL:', err.message);
      }

      return newUser;
    },

    async updateUserData(id, updatedData) {
      const idx = this.usersList.findIndex(u => Number(u.id) === Number(id));
      if (idx !== -1) {
        this.usersList[idx] = { ...this.usersList[idx], ...updatedData };
        this.saveUsersList();

        if (this.currentUser && Number(this.currentUser.id) === Number(id)) {
          this.currentUser = { ...this.currentUser, ...updatedData };
          try {
            localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
          } catch (e) {}
        }
        this.logActivity('UPDATE_USER', 'Manajemen Pengguna', `Memperbarui data pengguna: ${this.usersList[idx].name}`);

        // Sinkronisasi update ke PostgreSQL DB (DBeaver)
        try {
          const res = await fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedData }),
          });
          const result = await res.json();
          if (result.success && result.user) {
            let perms = result.user.permissions;
            if (typeof perms === 'string') {
              try { perms = JSON.parse(perms); } catch (e) { perms = null; }
            }
            this.usersList[idx] = {
              ...this.usersList[idx],
              ...result.user,
              permissions: Array.isArray(perms) ? perms : this.usersList[idx].permissions,
            };
            if (this.currentUser && Number(this.currentUser.id) === Number(id)) {
              this.currentUser.permissions = this.usersList[idx].permissions;
              this.currentUser.role = this.usersList[idx].role;
              try {
                localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
              } catch (e) {}
            }
            this.saveUsersList();
            console.log(`✅ [STORE] Perubahan user ID ${id} (${this.usersList[idx].name}) tersimpan permanen di PostgreSQL DB.`);
          }
          return result;
        } catch (err) {
          console.warn('⚠️ [STORE] Gagal update user di PostgreSQL:', err.message);
          throw err;
        }
      }
    },

    async deleteUser(id) {
      const idx = this.usersList.findIndex(u => Number(u.id) === Number(id));
      if (idx !== -1) {
        const deletedName = this.usersList[idx].name;
        this.usersList.splice(idx, 1);
        this.saveUsersList();
        this.logActivity('DELETE_USER', 'Manajemen Pengguna', `Menghapus data pengguna: ${deletedName}`);

        // Sinkronisasi hapus ke PostgreSQL DB (DBeaver)
        try {
          const res = await fetch('/api/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          const result = await res.json();
          console.log(`✅ [STORE] User ID ${id} (${deletedName}) berhasil dihapus dari PostgreSQL DB.`);
          return result;
        } catch (err) {
          console.warn('⚠️ [STORE] Gagal hapus user di PostgreSQL:', err.message);
          throw err;
        }
      }
    },

    resetToDualOperatorModel() {
      const afinCurrent = this.usersList.find(u => u.nik === '2026010188');
      const indanaCurrent = this.usersList.find(u => u.nik === '2026020119');

      this.usersList = [
        {
          id: 1,
          name: 'Afin Riyandika',
          nik: '2026010188',
          role: 'Admin',
          title: 'Pemilik Sarana Apotek (Owner & Kontrol Finansial)',
          email: 'skibidibisnis@gmail.com',
          password: (afinCurrent && afinCurrent.password) ? afinCurrent.password : 'password123',
          phone: '081234567890',
          status: 'Aktif',
          avatar: 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272110/apotek_budiasih/avatars/avatar_admin_afin.jpg',
          permissions: ['all'],
        },
        {
          id: 2,
          name: 'Indana Farhah',
          nik: '2026020119',
          sipa: '19980514/SIPA_32.73/2023/1042',
          sipa_expiry: '2027-08-15',
          role: 'Apoteker / Kasir',
          title: 'Apoteker & Kasir Penjaga Cabang (Full Time 07.00 - 20.00)',
          email: 'indanafarhahh@gmail.com',
          phone: '081298765432',
          password: (indanaCurrent && indanaCurrent.password) ? indanaCurrent.password : 'password123',
          status: 'Aktif',
          avatar: 'https://res.cloudinary.com/yuqz5iha/image/upload/v1788272134/apotek_budiasih/avatars/avatar_apoteker_sarah.jpg',
          permissions: ['pos', 'inventory', 'fefo', 'prescriptions', 'defekta', 'petty_cash', 'eod', 'opname'],
        },
      ];
      this.saveUsersList();
      this.logActivity('RESET_USERS', 'Manajemen Pengguna', 'Menerapkan struktur 2 pengelola apotek cabang dari database PostgreSQL.');
      return this.usersList;
    },

    switchUserById(userId) {
      const found = this.usersList.find((u) => u.id === Number(userId));
      if (found) {
        const customAvatars = getCustomAvatars();
        const customAvatar = (found.nik && customAvatars[found.nik]) || (found.id && customAvatars[found.id]);
        this.currentUser = {
          id: found.id,
          name: found.name,
          nik: found.nik,
          email: found.email,
          role: found.role,
          title: found.title || found.role,
          sipa: found.sipa || null,
          strttk: found.strttk || null,
          avatar: customAvatar || found.avatar,
          permissions: found.permissions || ['all'],
        };
        localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
        this.logActivity('SWITCH_USER', 'Hak Akses', `Beralih sesi pengguna aktif ke: ${found.name} (${found.role})`);
      }
    },

    updateUserAvatar(newAvatarUrl, targetUser = null) {
      if (!newAvatarUrl) return;

      const user = targetUser || this.currentUser;
      if (!user) return;

      const nik = user.nik;
      const id = user.id;

      // 1. Update in currentUser if matches
      if (this.currentUser && ((id && this.currentUser.id === id) || (nik && this.currentUser.nik === nik))) {
        this.currentUser.avatar = newAvatarUrl;
      }

      // 2. Update in usersList
      const userInList = this.usersList.find(u => (id && u.id === id) || (nik && u.nik === nik));
      if (userInList) {
        userInList.avatar = newAvatarUrl;
      }

      // 3. Persist to custom avatars registry in localStorage
      try {
        const customMap = getCustomAvatars();
        if (nik) customMap[nik] = newAvatarUrl;
        if (id) customMap[id] = newAvatarUrl;
        localStorage.setItem('apotek_user_avatars', JSON.stringify(customMap));
      } catch (e) {
        console.error('Failed to save to apotek_user_avatars:', e);
      }

      // 4. Update active auth session in localStorage & sessionStorage
      try {
        const localAuth = localStorage.getItem('apotek_auth_user');
        if (localAuth) {
          const parsed = JSON.parse(localAuth);
          if ((id && parsed.id === id) || (nik && parsed.nik === nik)) {
            parsed.avatar = newAvatarUrl;
            localStorage.setItem('apotek_auth_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {}

      try {
        const sessionAuth = sessionStorage.getItem('apotek_auth_user');
        if (sessionAuth) {
          const parsed = JSON.parse(sessionAuth);
          if ((id && parsed.id === id) || (nik && parsed.nik === nik)) {
            parsed.avatar = newAvatarUrl;
            sessionStorage.setItem('apotek_auth_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {}

      // 5. Update saved accounts list
      try {
        const savedAccounts = this.getSavedAccounts();
        const updatedAccounts = savedAccounts.map(acc => {
          if ((id && acc.id === id) || (nik && acc.nik === nik)) {
            return { ...acc, avatar: newAvatarUrl };
          }
          return acc;
        });
        localStorage.setItem('apotek_saved_accounts', JSON.stringify(updatedAccounts));
      } catch (e) {}

      // 6. Backward compatibility for legacy key
      try {
        if (this.currentUser) {
          localStorage.setItem('apotek_user', JSON.stringify(this.currentUser));
        }
      } catch (e) {}

      this.logActivity('UPDATE_PROFILE', 'Profil Akun', `Foto profil ${user.name || user.nik} berhasil diperbarui.`);
    },

    resetUserAvatar(targetUser = null) {
      const user = targetUser || this.currentUser;
      if (!user) return;
      const nik = user.nik;
      const id = user.id;

      const defaultUser = defaultUsersList.find(u => (id && u.id === id) || (nik && u.nik === nik) || (u.role === user.role));
      const defaultUrl = defaultUser ? defaultUser.avatar : '';

      try {
        const customMap = getCustomAvatars();
        if (nik) delete customMap[nik];
        if (id) delete customMap[id];
        localStorage.setItem('apotek_user_avatars', JSON.stringify(customMap));
      } catch (e) {}

      this.updateUserAvatar(defaultUrl, user);
    },

    logActivity(action, module, details) {
      this.auditLogs.unshift({
        id: Date.now() + Math.floor(Math.random() * 100),
        user_name: this.currentUser ? this.currentUser.name : 'System',
        role: this.currentUser ? this.currentUser.role : 'Guest',
        action,
        module,
        details,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        ip: '192.168.1.10',
      });
    },

    // ===== MEDICINES & INVENTORY ACTIONS =====
    async addMedicine(medicineData) {
      const nextId = this.medicines.length ? Math.max(...this.medicines.map(m => m.id)) + 1 : 1;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const generatedSku = medicineData.sku_code || `MED-${String(nextId).padStart(4, '0')}`;
      const newMed = {
        ...medicineData,
        id: nextId,
        sku_code: generatedSku,
        bpom_number: medicineData.bpom_number || '',
        rack_location: medicineData.rack_location || '',
        stock: Number(medicineData.stock) || 0,
        min_stock: Number(medicineData.min_stock) || 10,
        price: Number(medicineData.price) || 0,
        purchase_price: Number(medicineData.purchase_price) || 0,
        expiry_date: medicineData.expiry_date || '2027-12-31',
        created_at: now,
        updated_at: now,
        image: medicineData.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
      };
      this.medicines.unshift(newMed);

      // Create initial batch if stock > 0
      if (newMed.stock > 0) {
        const batchNo = 'B' + new Date().getFullYear() + '-INIT-' + String(nextId).padStart(3, '0');
        this.batches.unshift({
          id: Date.now(),
          batch_number: batchNo,
          medicine_id: newMed.id,
          medicine_name: newMed.name,
          sku_code: newMed.sku_code,
          stock: newMed.stock,
          initial_qty: newMed.stock,
          received_date: now.slice(0, 10),
          expiry_date: newMed.expiry_date || '2027-12-31',
          pbf_name: medicineData.manufacturer || 'Pendaftaran Master Baru',
          status: 'Aman',
        });

        this.stockLogs.unshift({
          id: Date.now(),
          medicine_id: newMed.id,
          medicine_name: newMed.name,
          batch_no: batchNo,
          type: 'In',
          qty: newMed.stock,
          current_stock: newMed.stock,
          reason: 'Pendaftaran Master Obat Baru',
          reference_id: batchNo,
          created_at: now,
          user_name: this.currentUser ? this.currentUser.name : 'Apoteker',
        });
      }

      this.logActivity('CREATE_MEDICINE', 'Katalog Obat', `Menambahkan obat baru: ${newMed.name}`);

      // Sinkronisasi otomatis ke Database PostgreSQL (DBeaver)
      try {
        const res = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newMed,
            user_id: this.currentUser ? this.currentUser.id : 1,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.medicine && resData.medicine.id) {
            newMed.id = Number(resData.medicine.id);
            newMed.created_at = resData.medicine.created_at || newMed.created_at;
            newMed.updated_at = resData.medicine.updated_at || newMed.updated_at;
            console.log(`✅ [STORE] Obat ${newMed.name} tersimpan permanen di PostgreSQL DB (ID: ${newMed.id})`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal simpan obat ke PostgreSQL:', err.message);
      }

      await this.fetchMedicinesFromDb();
      this.broadcastChange('MEDICINES_CHANGED', { medicine_name: newMed.name, action: 'add' });
      return newMed;
    },

    async updateMedicine(id, updatedData) {
      const index = this.medicines.findIndex(m => m.id === id);
      if (index !== -1) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.medicines[index] = { 
          ...this.medicines[index], 
          ...updatedData,
          updated_at: now
        };
        this.logActivity('UPDATE_MEDICINE', 'Katalog Obat', `Memperbarui data obat ID ${id}: ${this.medicines[index].name}`);

        // Sinkronisasi update ke PostgreSQL DB (DBeaver)
        try {
          await fetch('/api/medicines/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updatedData }),
          });
          console.log(`✅ [STORE] Perubahan data obat ID ${id} tersimpan di PostgreSQL DB.`);
        } catch (err) {
          console.warn('⚠️ [STORE] Gagal update obat ke PostgreSQL:', err.message);
        }

        await this.fetchMedicinesFromDb();
        this.broadcastChange('MEDICINES_CHANGED', { medicine_id: id, action: 'update' });
      }
    },

    async deleteMedicine(id) {
      const med = this.medicines.find(m => m.id === id);
      const name = med ? med.name : `ID ${id}`;
      this.medicines = this.medicines.filter(m => m.id !== id);
      this.batches = this.batches.filter(b => b.medicine_id !== id);
      this.logActivity('DELETE_MEDICINE', 'Katalog Obat', `Menghapus obat dari sistem: ${name}`);

      // Sinkronisasi hapus ke PostgreSQL DB (DBeaver)
      try {
        await fetch('/api/medicines/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        console.log(`✅ [STORE] Obat ID ${id} (${name}) berhasil dihapus dari PostgreSQL DB.`);
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal hapus obat di PostgreSQL:', err.message);
      }

      await this.fetchMedicinesFromDb();
      this.broadcastChange('MEDICINES_CHANGED', { medicine_id: id, action: 'delete' });
    },

    async importMedicinesBatch(items) {
      try {
        const res = await fetch('/api/medicines/batch-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify({ items })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mengimpor data obat');

        await this.fetchMedicinesFromDb();
        this.broadcastChange('MEDICINES_CHANGED', { count: items.length, action: 'import' });
        this.logActivity('IMPORT_MEDICINES', 'Katalog Obat', `Impor massal ${items.length} obat dari spreadsheet Excel.`);
        return data;
      } catch (err) {
        console.error('❌ [STORE IMPORT ERROR]:', err);
        throw err;
      }
    },

    async adjustMedicineStock(medicineId, type, qty, reason) {
      const med = this.medicines.find(m => m.id === medicineId);
      if (!med) throw new Error("Obat tidak ditemukan");

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      let numQty = Number(qty);
      if (type === 'In') {
        med.stock += numQty;
      } else if (type === 'Out') {
        if (med.stock < numQty) throw new Error(`Stok ${med.name} tidak cukup (sisa: ${med.stock})`);
        med.stock -= numQty;
        numQty = -numQty;
      } else if (type === 'Adjust') {
        numQty = numQty - med.stock;
        med.stock = Number(qty);
      }
      med.updated_at = now;

      const refId = 'OPNAME-' + Date.now().toString().slice(-6);
      this.stockLogs.unshift({
        id: Date.now(),
        medicine_id: med.id,
        medicine_name: med.name,
        batch_no: 'MUTASI-OPNAME',
        type: type,
        qty: numQty,
        current_stock: med.stock,
        reason: reason || 'Koreksi Stok Opname Fisik',
        reference_id: refId,
        created_at: now,
        user_name: this.currentUser ? this.currentUser.name : 'Apoteker',
      });

      this.logActivity('STOCK_ADJUST', 'Manajemen Stok', `Koreksi stok ${med.name}: ${type} ${Math.abs(numQty)} (${reason})`);

      // Sinkronisasi penyesuaian stok & kartu stok ke PostgreSQL DB (DBeaver)
      try {
        const res = await fetch('/api/medicines/adjust-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicine_id: med.id,
            type: type,
            qty: Number(qty),
            reason: reason || 'Koreksi Stok Opname Fisik',
            user_id: this.currentUser ? this.currentUser.id : 1,
            reference_id: refId,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.medicine && resData.medicine.stock !== undefined) {
            med.stock = Number(resData.medicine.stock);
            console.log(`✅ [STORE] Koreksi stok ${med.name} tersimpan di PostgreSQL DB (Stok Akhir: ${med.stock})`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal adjust stok ke PostgreSQL:', err.message);
      }

      return med;
    },

    restockBatchMedicine(medicineId, payload) {
      const med = this.medicines.find(m => m.id === medicineId);
      if (!med) throw new Error("Obat tidak ditemukan");
      const qtyNum = Number(payload.qty || payload) || 0;
      if (qtyNum <= 0) throw new Error("Jumlah restock harus lebih dari 0");

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      med.stock += qtyNum;
      med.updated_at = now;

      // Unique new batch tracking for this arrival
      const nextBatchId = this.batches.length ? Math.max(...this.batches.map(b => b.id)) + 1 : 101;
      const expiryDate = payload.expiry_date || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10);
      const weekNumber = Math.ceil(new Date().getDate() / 7);
      const batchNo = payload.batch_number || ('B' + new Date().getFullYear() + '-W' + String(weekNumber).padStart(2, '0') + '-' + Math.floor(100 + Math.random() * 900));
      const pbfName = payload.pbf_name || 'PT Kimia Farma Trading & Distribution';
      const recDate = payload.received_date || now.slice(0, 10);

      const newBatch = {
        id: nextBatchId,
        batch_number: batchNo,
        medicine_id: med.id,
        medicine_name: med.name,
        sku_code: med.sku_code || `MED-${med.id}`,
        stock: qtyNum,
        initial_qty: qtyNum,
        received_date: recDate,
        expiry_date: expiryDate,
        pbf_name: pbfName,
        status: 'Aman',
      };
      this.batches.unshift(newBatch);

      // Recalculate nearest active expiry date for the medicine
      const activeBatches = this.batches.filter(b => b.medicine_id === med.id && b.stock > 0);
      if (activeBatches.length > 0) {
        activeBatches.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        med.expiry_date = activeBatches[0].expiry_date;
      }

      this.stockLogs.unshift({
        id: Date.now() + Math.random(),
        medicine_id: med.id,
        medicine_name: med.name,
        batch_no: batchNo,
        type: 'In',
        qty: qtyNum,
        current_stock: med.stock,
        reason: payload.reason || `Kedatangan Batch Mingguan (${batchNo} · Exp: ${expiryDate})`,
        reference_id: batchNo,
        created_at: now,
        user_name: this.currentUser ? this.currentUser.name : 'Apoteker',
      });

      this.logActivity('STOCK_RESTOCK', 'Inventory', `Kedatangan batch baru "${med.name}" +${qtyNum} ${med.unit} (Batch: ${batchNo}, ED: ${expiryDate})`);
      return med;
    },

    quickRestockMedicine(medicineId, addQty, note = 'Restock Toko Cepat') {
      return this.restockBatchMedicine(medicineId, {
        qty: addQty,
        reason: note,
      });
    },

    recordSimpleProcurement(data) {
      const nextId = this.purchaseOrders.length ? Math.max(...this.purchaseOrders.map(p => p.id)) + 1 : 1;
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const count = this.purchaseOrders.length + 1;
      const poNumber = `SP-${dateStr}-${String(count).padStart(3, '0')}`;

      const total = data.items.reduce((acc, it) => acc + (it.qty * it.unit_price), 0);

      // Increase medicine stocks automatically
      data.items.forEach(item => {
        const med = this.medicines.find(m => m.id === item.medicine_id);
        if (med) {
          med.stock += Number(item.qty);
          if (item.unit_price && item.unit_price > 0) {
            med.purchase_price = Number(item.unit_price);
          }

          this.stockLogs.unshift({
            id: Date.now() + Math.random(),
            medicine_id: med.id,
            medicine_name: med.name,
            batch_no: `FAK-${data.invoice_pbf_no || dateStr}`,
            type: 'In',
            qty: Number(item.qty),
            current_stock: med.stock,
            reason: `Kulakan PBF ${data.supplier_name} (${data.invoice_pbf_no || poNumber})`,
            reference_id: data.invoice_pbf_no || poNumber,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            user_name: this.currentUser.name,
          });
        }
      });

      const newPO = {
        id: nextId,
        po_number: poNumber,
        supplier_id: data.supplier_id || 1,
        supplier_name: data.supplier_name || 'PBF Distributor',
        order_type: 'Kulakan Toko',
        order_date: data.order_date || new Date().toISOString().slice(0, 10),
        expected_delivery: data.order_date || new Date().toISOString().slice(0, 10),
        payment_terms: data.payment_terms || 'Tempo 30 Hari',
        due_date: data.due_date || '',
        payment_status: data.payment_status || 'Belum Lunas',
        status: 'Diterima & Selesai',
        notes: data.notes || '',
        items: data.items,
        total_amount: total,
        received_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        received_by: this.currentUser.name,
        invoice_pbf_no: data.invoice_pbf_no || `FAK-${Date.now().toString().slice(-6)}`,
      };

      this.purchaseOrders.unshift(newPO);
      this.logActivity('PROCUREMENT_RECEIVED', 'Kulakan Toko', `Penerimaan kulakan PBF ${newPO.supplier_name} No Faktur: ${newPO.invoice_pbf_no} senilai Rp ${total.toLocaleString()}`);
      return newPO;
    },

    // ===== FEFO & BATCH ACTIONS =====
    addBatch(batchPayload) {
      const nextId = this.batches.length ? Math.max(...this.batches.map(b => b.id)) + 1 : 101;
      const med = this.medicines.find(m => m.id === batchPayload.medicine_id);
      if (med) {
        med.stock += Number(batchPayload.stock);
      }
      const newBatch = {
        id: nextId,
        batch_number: batchPayload.batch_number,
        medicine_id: batchPayload.medicine_id,
        medicine_name: med ? med.name : batchPayload.medicine_name,
        sku_code: med ? med.sku_code : '',
        stock: Number(batchPayload.stock),
        initial_qty: Number(batchPayload.stock),
        received_date: batchPayload.received_date || new Date().toISOString().slice(0, 10),
        expiry_date: batchPayload.expiry_date,
        pbf_name: batchPayload.pbf_name || 'PT PBF Mandiri',
        status: 'Aman',
      };
      this.batches.unshift(newBatch);
      this.logActivity('ADD_BATCH', 'FEFO Inventaris', `Batch baru ${newBatch.batch_number} untuk ${newBatch.medicine_name} (${newBatch.stock} unit)`);
      return newBatch;
    },

    disposeBatch(batchId, reason) {
      const batch = this.batches.find(b => b.id === batchId);
      if (!batch) return;
      const med = this.medicines.find(m => m.id === batch.medicine_id);
      if (med) {
        med.stock = Math.max(0, med.stock - batch.stock);
      }
      this.stockLogs.unshift({
        id: Date.now(),
        medicine_id: batch.medicine_id,
        medicine_name: batch.medicine_name,
        batch_no: batch.batch_number,
        type: 'Disposal',
        qty: -batch.stock,
        current_stock: med ? med.stock : 0,
        reason: `Pemusnahan/Retur Batch: ${reason}`,
        reference_id: 'DISP-' + batch.batch_number,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        user_name: this.currentUser.name,
      });
      batch.stock = 0;
      batch.status = 'Dimusnahkan / Retur';
      this.logActivity('DISPOSE_BATCH', 'FEFO Inventaris', `Pemusnahan batch ${batch.batch_number}: ${reason}`);
    },

    // ===== PROCUREMENT & PBF ACTIONS =====
    createPurchaseOrder(poData) {
      const nextId = this.purchaseOrders.length ? Math.max(...this.purchaseOrders.map(p => p.id)) + 1 : 1;
      const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
      const count = this.purchaseOrders.length + 1;
      const poNumber = `SP-${dateStr}-${String(count).padStart(3, '0')}`;

      const total = poData.items.reduce((acc, it) => acc + (it.qty * it.unit_price), 0);

      const newPO = {
        id: nextId,
        po_number: poNumber,
        supplier_id: poData.supplier_id,
        supplier_name: poData.supplier_name,
        order_type: poData.order_type || 'Reguler',
        order_date: poData.order_date || new Date().toISOString().slice(0, 10),
        expected_delivery: poData.expected_delivery || '',
        payment_terms: poData.payment_terms || 'Tempo 30 Hari',
        due_date: poData.due_date || '',
        payment_status: 'Belum Lunas',
        status: 'Diajukan',
        notes: poData.notes || '',
        items: poData.items,
        total_amount: total,
        received_at: null,
        received_by: null,
        invoice_pbf_no: null,
      };

      this.purchaseOrders.unshift(newPO);
      this.logActivity('CREATE_PO', 'Pengadaan PBF', `Membuat Surat Pesanan ${poNumber} ke ${poData.supplier_name}`);
      return newPO;
    },

    receivePurchaseOrder(poId, invoiceNumber, receivedItems) {
      const po = this.purchaseOrders.find(p => p.id === poId);
      if (!po) throw new Error("Purchase Order tidak ditemukan");

      po.status = 'Diterima & Selesai';
      po.invoice_pbf_no = invoiceNumber || `FAK-PBF-${Date.now().toString().slice(-5)}`;
      po.received_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      po.received_by = this.currentUser.name;

      // Update medicine stocks and batch records
      po.items.forEach((item) => {
        const med = this.medicines.find(m => m.id === item.medicine_id);
        if (med) {
          med.stock += item.qty;
          const batchNo = `BATCH-${item.medicine_id}-${Date.now().toString().slice(-4)}`;
          const expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 2);

          this.batches.unshift({
            id: Date.now() + Math.random(),
            batch_number: batchNo,
            medicine_id: med.id,
            medicine_name: med.name,
            sku_code: med.sku_code,
            stock: item.qty,
            initial_qty: item.qty,
            received_date: new Date().toISOString().slice(0, 10),
            expiry_date: expDate.toISOString().slice(0, 10),
            pbf_name: po.supplier_name,
            status: 'Aman',
          });

          this.stockLogs.unshift({
            id: Date.now() + Math.random(),
            medicine_id: med.id,
            medicine_name: med.name,
            batch_no: batchNo,
            type: 'In',
            qty: item.qty,
            current_stock: med.stock,
            reason: `Penerimaan Faktur PBF ${po.invoice_pbf_no} (${po.po_number})`,
            reference_id: po.po_number,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            user_name: this.currentUser.name,
          });
        }
      });

      this.logActivity('RECEIVE_PO', 'Pengadaan PBF', `Penerimaan barang Surat Pesanan ${po.po_number} No Faktur: ${po.invoice_pbf_no}`);
      return po;
    },

    payPurchaseOrder(poId) {
      const po = this.purchaseOrders.find(p => p.id === poId);
      if (po) {
        po.payment_status = 'Lunas';
        this.logActivity('PAY_PO', 'Pengadaan PBF', `Pelunasan tagihan PBF untuk ${po.po_number} (Rp ${po.total_amount.toLocaleString()})`);
      }
    },

    // ===== PRESCRIPTIONS & COMPOUNDING ACTIONS =====
    async uploadPrescription(data) {
      const count = this.prescriptions.length + 1;
      const rxpNumber = `RXP-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(count).padStart(3, '0')}`;

      const newPrescription = {
        id: Date.now(),
        recipe_number: rxpNumber,
        user_id: this.currentUser ? this.currentUser.id : null,
        patient_name: data.patient_name || 'Pasien Umum',
        patient_age: data.patient_age || 30,
        patient_phone: data.patient_phone || '08123456789',
        patient_address: data.patient_address || 'Bandung',
        doctor_name: data.doctor_name || 'dr. Umum',
        doctor_sip: data.doctor_sip || 'SIP.440/Dinkes/2023',
        clinic_name: data.clinic_name || 'Praktik Dokter Mandiri',
        image_path: data.image_path || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        prescription_type: data.prescription_type || 'Non-Racikan',
        status: 'Antrean',
        clinical_screening: {
          admin_valid: true,
          indication_valid: true,
          dosage_valid: true,
          interaction_safe: true,
        },
        items: data.items || [],
        tuslah_fee: data.prescription_type === 'Racikan Puyer' ? 10000 : 5000,
        embalase_fee: 2000,
        notes: data.notes || '',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        verified_by: null,
        verified_at: null,
      };

      this.prescriptions.unshift(newPrescription);
      this.logActivity('UPLOAD_PRESCRIPTION', 'Resep Dokter', `Unggah resep baru ${rxpNumber} untuk pasien ${newPrescription.patient_name}`);

      // Simpan ke database PostgreSQL
      try {
        const res = await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_name: newPrescription.patient_name,
            patient_phone: newPrescription.patient_phone,
            doctor_name: newPrescription.doctor_name,
            image_path: newPrescription.image_path,
            status: 'Pending',
            notes: newPrescription.notes,
            user_id: newPrescription.user_id,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.prescription && resData.prescription.id) {
            newPrescription.id = Number(resData.prescription.id);
            console.log(`✅ [STORE] Resep berhasil disimpan permanen ke PostgreSQL (ID: ${newPrescription.id})`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal simpan resep ke PostgreSQL:', err.message);
      }

      return newPrescription;
    },

    async updatePrescriptionStatus(id, newStatus) {
      const presc = this.prescriptions.find(p => p.id === id);
      if (presc) {
        presc.status = newStatus;
        if (newStatus === 'Siap Diambil' || newStatus === 'Selesai') {
          presc.verified_by = this.currentUser ? this.currentUser.name : 'Apoteker Penanggung Jawab';
          presc.verified_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
        this.logActivity('PRESCRIPTION_STATUS', 'Resep Dokter', `Resep ${presc.recipe_number} status diubah ke: ${newStatus}`);

        // Kirim perubahan status ke PostgreSQL
        try {
          let dbStatus = 'Pending';
          if (newStatus === 'Siap Diambil' || newStatus === 'Verified' || newStatus === 'Ditinjau') dbStatus = 'Verified';
          else if (newStatus === 'Ditolak' || newStatus === 'Rejected') dbStatus = 'Rejected';
          else if (newStatus === 'Selesai' || newStatus === 'Processed') dbStatus = 'Processed';

          await fetch('/api/prescriptions/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: id,
              status: dbStatus,
              verified_by: this.currentUser ? this.currentUser.id : 2,
              notes: presc.notes || null,
            }),
          });
          console.log(`✅ [STORE] Status resep ID ${id} (${dbStatus}) tersinkron ke PostgreSQL.`);
        } catch (err) {
          console.warn('⚠️ [STORE] Gagal update status resep ke PostgreSQL:', err.message);
        }
      }
    },

    // ===== POS CHECKOUT =====
    async processPOSCheckout(payload) {
      const {
        items,
        customer_name,
        customer_phone,
        payment_method,
        paid_amount,
        discount_amount,
        tax_amount,
        tuslah_fee,
        embalase_fee,
        prescription_id,
        is_prescription,
        doctor_name,
        prescription_no,
        dosage_instruction,
      } = payload;

      // Validate stock availability
      for (const item of items) {
        const med = this.medicines.find(m => m.id === item.id);
        if (!med) throw new Error(`Obat "${item.name}" tidak ditemukan!`);
        if (med.stock < item.qty) throw new Error(`Stok "${med.name}" tidak cukup (tersedia: ${med.stock})`);
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = this.transactions.length + 1;
      const invoiceNumber = `INV-${dateStr}-${String(count).padStart(4, '0')}`;

      const details = [];
      let subtotal = 0;

      // Deduct medicine stocks and FEFO batches
      for (const item of items) {
        const med = this.medicines.find(m => m.id === item.id);
        med.stock -= item.qty;
        const itemSub = item.price * item.qty;
        subtotal += itemSub;

        details.push({
          id: Date.now() + Math.random(),
          medicine_id: med.id,
          name: med.name,
          qty: item.qty,
          price: item.price,
          subtotal: itemSub,
        });

        // Deduct FEFO batch sequentially (earliest expiry first)
        let remainingDeduct = item.qty;
        const medBatches = this.batches
          .filter(b => b.medicine_id === med.id && b.stock > 0)
          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

        let firstDeductedBatchNo = 'FEFO-AUTO';
        for (const b of medBatches) {
          if (remainingDeduct <= 0) break;
          if (firstDeductedBatchNo === 'FEFO-AUTO') firstDeductedBatchNo = b.batch_number;
          if (b.stock >= remainingDeduct) {
            b.stock -= remainingDeduct;
            remainingDeduct = 0;
          } else {
            remainingDeduct -= b.stock;
            b.stock = 0;
          }
        }

        // Update medicine nearest active expiry date and updated_at
        const remainingBatches = this.batches
          .filter(b => b.medicine_id === med.id && b.stock > 0)
          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        if (remainingBatches.length > 0) {
          med.expiry_date = remainingBatches[0].expiry_date;
        }
        med.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

        this.stockLogs.unshift({
          id: Date.now() + Math.random(),
          medicine_id: med.id,
          medicine_name: med.name,
          batch_no: firstDeductedBatchNo,
          type: 'Out',
          qty: -item.qty,
          current_stock: med.stock,
          reason: `Penjualan Kasir POS ${invoiceNumber}`,
          reference_id: invoiceNumber,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          user_name: this.currentUser ? this.currentUser.name : 'Kasir',
        });
      }

      const tuslah = Number(tuslah_fee) || 0;
      const embalase = Number(embalase_fee) || 0;
      const discount = Number(discount_amount) || 0;
      const tax = Number(tax_amount) || 0;

      const total = Math.max(0, subtotal + tuslah + embalase - discount + tax);
      const paid = Number(paid_amount) || total;
      const change = Math.max(0, paid - total);

      const transaction = {
        id: this.transactions.length + 1,
        invoice_number: invoiceNumber,
        user_id: this.currentUser ? this.currentUser.id : 1,
        cashier_name: this.currentUser ? this.currentUser.name : 'Kasir',
        customer_name: customer_name || 'Pelanggan Umum (Walk-in)',
        customer_phone: customer_phone || '-',
        is_prescription: Boolean(is_prescription || prescription_id),
        prescription_id: prescription_id || null,
        prescription_no: prescription_no || null,
        doctor_name: doctor_name || null,
        dosage_instruction: dosage_instruction || null,
        subtotal,
        tuslah_fee: tuslah,
        embalase_fee: embalase,
        discount_amount: discount,
        tax_amount: tax,
        total_amount: total,
        paid_amount: paid,
        change_amount: change,
        payment_status: 'Paid',
        payment_method: payment_method || 'Cash',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        details,
      };

      if (!this.currentShift || !this.currentShift.isOpen) {
        throw new Error('Shift kasir belum dibuka! Silakan masukkan Saldo Awal kasir terlebih dahulu.');
      }

      this.transactions.unshift(transaction);

      // Update shift totals
      if (this.currentShift && this.currentShift.isOpen) {
        this.currentShift.transactionCount = (this.currentShift.transactionCount || 0) + 1;
        if (payment_method === 'Cash' || payment_method === 'Tunai') {
          this.currentShift.totalCashSales = (this.currentShift.totalCashSales || 0) + total;
        } else {
          this.currentShift.totalNonCashSales = (this.currentShift.totalNonCashSales || 0) + total;
        }
        try {
          localStorage.setItem('apotek_cashier_shift', JSON.stringify(this.currentShift));
        } catch (e) {}
      }

      // Mark prescription as Selesai if linked
      if (prescription_id) {
        const presc = this.prescriptions.find(p => p.id === prescription_id);
        if (presc) presc.status = 'Selesai';
      }

      this.logActivity('POS_SALE', 'Kasir POS', `Transaksi penjualan ${invoiceNumber} senilai Rp ${total.toLocaleString()} via ${payment_method}`);

      // Simpan langsung secara permanen ke Database PostgreSQL
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_number: invoiceNumber,
            user_id: this.currentUser ? this.currentUser.id : 1,
            customer_name: transaction.customer_name,
            customer_phone: transaction.customer_phone,
            prescription_id: transaction.prescription_id,
            prescription_no: transaction.prescription_no,
            doctor_name: transaction.doctor_name,
            dosage_instruction: transaction.dosage_instruction,
            subtotal: transaction.subtotal,
            discount_amount: transaction.discount_amount,
            tax_amount: transaction.tax_amount,
            total_amount: transaction.total_amount,
            paid_amount: transaction.paid_amount,
            change_amount: transaction.change_amount,
            payment_method: transaction.payment_method,
            payment_status: transaction.payment_status,
            notes: transaction.dosage_instruction ? `Signa: ${transaction.dosage_instruction}` : null,
            items: details.map(d => ({
              medicine_id: d.medicine_id,
              name: d.name,
              qty: d.qty,
              price: d.price,
              subtotal: d.subtotal,
            })),
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.transaction && resData.transaction.id) {
            transaction.id = Number(resData.transaction.id);
            console.log(`✅ [STORE] Transaksi ${invoiceNumber} berhasil disimpan permanen ke PostgreSQL (ID: ${transaction.id})!`);
          }
          // Refresh data dari DB agar stok & mutasi kartu stok langsung akurat
          this.fetchMedicinesFromDb();
          this.fetchTransactionsFromDb();
          this.fetchStockLogsFromDb();
        }
      } catch (apiErr) {
        console.warn('⚠️ [STORE] Gagal menyimpan transaksi ke PostgreSQL API:', apiErr.message);
      }

      return transaction;
    },

    async fetchTransactionsFromDb() {
      try {
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          this.transactions = list.map(t => ({
            id: Number(t.id),
            invoice_number: t.invoice_number,
            user_id: t.user_id ? Number(t.user_id) : null,
            cashier_name: t.cashier_name || 'Kasir',
            customer_name: t.customer_name || 'Pelanggan Umum',
            customer_phone: t.customer_phone || '-',
            is_prescription: Boolean(t.prescription_id),
            prescription_id: t.prescription_id ? Number(t.prescription_id) : null,
            prescription_no: t.prescription_no || null,
            doctor_name: t.doctor_name || null,
            dosage_instruction: t.notes || null,
            subtotal: Number(t.subtotal) || 0,
            tuslah_fee: 0,
            embalase_fee: 0,
            discount_amount: Number(t.discount_amount) || 0,
            tax_amount: Number(t.tax_amount) || 0,
            total_amount: Number(t.total_amount) || 0,
            paid_amount: Number(t.paid_amount) || 0,
            change_amount: Number(t.change_amount) || 0,
            payment_status: t.payment_status || 'Paid',
            payment_method: t.payment_method || 'Cash',
            notes: t.notes || null,
            created_at: typeof t.created_at === 'string' ? t.created_at.slice(0, 19).replace('T', ' ') : new Date(t.created_at).toISOString().slice(0, 19).replace('T', ' '),
            details: Array.isArray(t.details) ? t.details.map(d => ({
              id: d.id,
              medicine_id: d.medicine_id,
              name: d.name || `Obat #${d.medicine_id}`,
              qty: Number(d.qty),
              price: Number(d.price),
              subtotal: Number(d.subtotal)
            })) : []
          }));
          console.log(`📦 [STORE] ${list.length} transaksi berhasil disinkronkan dari database PostgreSQL.`);
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal memuat transaksi dari DB:', err.message);
      }
    },

    async deleteTransaction(transactionId) {
      const isOwnerOrAdmin = this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
      if (!isOwnerOrAdmin) {
        throw new Error('Hanya Owner atau Admin yang berhak menghapus data transaksi.');
      }

      const target = this.transactions.find(t => t.id === Number(transactionId));
      const inv = target?.invoice_number || transactionId;

      this.transactions = this.transactions.filter(t => t.id !== Number(transactionId));
      try {
        await fetch(`/api/transactions/${encodeURIComponent(transactionId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify({ id: transactionId })
        });
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal hapus transaksi dari DB:', err.message);
      }

      this.broadcastChange('TRANSACTIONS_CHANGED');
      this.logActivity('DELETE_TRANSACTION', 'Kasir POS', `Menghapus faktur transaksi ${inv}`);
      return true;
    },

    async clearAllTransactions() {
      const isOwnerOrAdmin = this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
      if (!isOwnerOrAdmin) {
        throw new Error('Hanya Owner atau Admin yang berhak membersihkan data transaksi.');
      }

      this.transactions = [];
      try {
        await fetch('/api/transactions/clear-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          }
        });
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal membersihkan transaksi dari DB:', err.message);
      }

      this.broadcastChange('TRANSACTIONS_CHANGED');
      this.logActivity('CLEAR_TRANSACTIONS', 'Kasir POS', 'Membersihkan seluruh data riwayat transaksi.');
      return true;
    },

    resetOpnameSchedules() {
      this.opnameSchedules = [
        {
          id: 1,
          week_number: 1,
          title: 'Minggu ke-1: Obat Bebas & Obat Bebas Terbatas',
          category_ids: [2, 3],
          category_names: 'Obat Bebas Terbatas, Obat Bebas',
          day: 'Selasa',
          time: '08:30',
          assigned_user: 'Budi Santoso',
          notes: 'Fokus cek kemasan strip rusak & obat fast-moving etalase kasir',
          status: 'Siap Dikerjakan',
          last_performed: null,
          total_items: 5,
          discrepancy_count: 0,
        },
        {
          id: 2,
          week_number: 2,
          title: 'Minggu ke-2: Obat Keras (Ethical & Resep)',
          category_ids: [1],
          category_names: 'Obat Keras',
          day: 'Selasa',
          time: '08:30',
          assigned_user: 'Apt. Sarah Maulida, S.Farm (Apoteker)',
          notes: 'Wajib teliti kesesuaian resep dokter dan kartu stok lemari khusus obat keras BPOM',
          status: 'Terjadwal',
          last_performed: null,
          total_items: 3,
          discrepancy_count: 0,
        },
        {
          id: 3,
          week_number: 3,
          title: 'Minggu ke-3: Obat Jamu (Herbal Tradisional)',
          category_ids: [4],
          category_names: 'Obat Jamu',
          day: 'Selasa',
          time: '08:30',
          assigned_user: 'Siti Rahmawati',
          notes: 'Pemeriksaan integritas sachet jamu herbal, nomor izin edar BPOM TR dan masa simpan (ED)',
          status: 'Terjadwal',
          last_performed: null,
          total_items: 2,
          discrepancy_count: 0,
        },
        {
          id: 4,
          week_number: 4,
          title: 'Minggu ke-4: Alat Kesehatan, Suplemen & Kosmetik',
          category_ids: [5, 6, 7],
          category_names: 'Alat Kesehatan, Suplemen, Kosmetika',
          day: 'Selasa',
          time: '08:30',
          assigned_user: 'Apt. Sarah Maulida, S.Farm (Apoteker)',
          notes: 'Audit fisik tensimeter, strip tes gula darah, vitamin, dan produk personal care',
          status: 'Terjadwal',
          last_performed: null,
          total_items: 2,
          discrepancy_count: 0,
        },
      ];
      this.broadcastChange('OPNAME_CHANGED');
    },

    // ===== CASHIER SHIFT ACTIONS =====
    closeShift(countedCash = 0, closingNotes = '') {
      const startingCash = Number(this.currentShift?.startingCash) || 0;
      const cashSales = Number(this.currentShift?.totalCashSales) || 0;
      const targetSystemCash = startingCash + cashSales;
      const diff = (Number(countedCash) || 0) - targetSystemCash;

      const shiftSummary = {
        ...this.currentShift,
        closedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        countedCash: Number(countedCash) || 0,
        expectedCash: targetSystemCash,
        difference: diff,
        closingNotes: closingNotes || 'Closing Shift Kasir Selesai',
      };

      this.currentShift = {
        isOpen: false,
        cashierName: '',
        startTime: '',
        startDate: '',
        startingCash: 0,
        totalCashSales: 0,
        totalNonCashSales: 0,
        transactionCount: 0,
        countedCash: 0,
        closedAt: null,
        notes: '',
      };

      try {
        localStorage.removeItem('apotek_cashier_shift');
      } catch (e) {}

      this.logActivity('SHIFT_CLOSE', 'Kasir POS', `Tutup Shift Kasir: Uang Fisik Rp ${Number(countedCash).toLocaleString('id-ID')} (Selisih: Rp ${diff.toLocaleString('id-ID')})`);
      return shiftSummary;
    },

    openNewShift(startingCash, cashierName = null, notes = '') {
      const now = new Date();
      const activeName = cashierName || (this.currentUser ? this.currentUser.name : 'Kasir Bertugas');
      const wibTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now).replace('.', ':') + ' WIB';

      const wibDate = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(now);

      this.currentShift = {
        isOpen: true,
        cashierName: activeName,
        startTime: wibTime,
        startDate: wibDate,
        startingCash: Math.max(0, Number(startingCash) || 0),
        totalCashSales: 0,
        totalNonCashSales: 0,
        transactionCount: 0,
        countedCash: 0,
        closedAt: null,
        notes: notes || 'Shift Kasir Baru',
      };
      try {
        localStorage.setItem('apotek_cashier_shift', JSON.stringify(this.currentShift));
      } catch (e) {}
      this.logActivity('SHIFT_START', 'Kasir POS', `Buka Shift Kasir oleh ${activeName} pada ${wibTime} dengan Saldo Awal Rp ${this.currentShift.startingCash.toLocaleString('id-ID')}`);
    },

    // ===== 13. OPNAME ACTIONS =====
    saveOpnameSchedule(schedulePayload) {
      const idx = this.opnameSchedules.findIndex(s => s.id === schedulePayload.id);
      if (idx !== -1) {
        this.opnameSchedules[idx] = { ...this.opnameSchedules[idx], ...schedulePayload };
      } else {
        const nextId = this.opnameSchedules.length ? Math.max(...this.opnameSchedules.map(s => s.id)) + 1 : 1;
        this.opnameSchedules.push({ ...schedulePayload, id: nextId });
      }
      this.logActivity('OPNAME_SCHEDULE', 'Stock Opname', `Admin mengatur jadwal SO: ${schedulePayload.title}`);
    },

    // ===== 14. EOD DATABASE ACTIONS =====
    async saveEodToDb(eodPayload) {
      try {
        const response = await fetch('/api/eod-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eodPayload),
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.eod_report) {
            this.eodReports.unshift(resData.eod_report);
            console.log(`✅ [STORE] Laporan EOD tanggal ${eodPayload.date} berhasil disimpan ke PostgreSQL (ID: ${resData.eod_report.id})`);
            return { ...resData.eod_report, backup: resData.backup };
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal menyimpan EOD ke PostgreSQL:', err.message);
      }
      return null;
    },

    async fetchEodReportsFromDb() {
      try {
        const res = await fetch('/api/eod-reports');
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          if (list.length > 0) {
            this.eodReports = list;
            console.log(`📊 [STORE] ${list.length} arsip laporan EOD berhasil dimuat dari database PostgreSQL.`);
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal memuat arsip EOD dari DB:', err.message);
      }
    },

    async fetchOpnameReportsFromDb() {
      const isOwner = this.currentUser?.role === 'Owner' || (this.currentUser?.role && this.currentUser.role.toLowerCase() === 'owner');
      if (!isOwner) {
        this.opnameReports = [];
        return;
      }
      try {
        const res = await fetch('/api/opname-reports', {
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          }
        });
        if (res.ok) {
          const result = await res.json();
          const list = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
          this.opnameReports = list;
          console.log(`📋 [STORE] ${list.length} dokumen BASO Stock Opname berhasil dimuat dari database PostgreSQL untuk Owner.`);
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal memuat arsip BASO dari DB:', err.message);
      }
    },

    async executeOpnameApproval(reportPayload) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const dateStr = now.slice(0, 10).replace(/-/g, '');
      const reportNo = `BASO-${dateStr}-W${String(reportPayload.week_number || 2).padStart(2, '0')}`;

      // Update schedule status
      const schedule = this.opnameSchedules.find(s => s.id === reportPayload.schedule_id);
      if (schedule) {
        schedule.status = 'Selesai';
        schedule.last_performed = now.slice(0, 16);
        schedule.discrepancy_count = reportPayload.items.filter(i => i.variance !== 0).length;
      }

      // Format report
      const newReport = {
        id: Date.now(),
        report_no: reportNo,
        report_number: reportNo,
        schedule_id: reportPayload.schedule_id,
        schedule_title: reportPayload.schedule_title,
        week_number: reportPayload.week_number,
        category_names: reportPayload.category_names,
        performed_at: now.slice(0, 16),
        performed_by: reportPayload.performed_by || (this.currentUser ? this.currentUser.name : 'Petugas'),
        approved_by: this.currentUser ? `${this.currentUser.name} (${this.currentUser.role})` : 'Admin Apotek',
        total_items_counted: reportPayload.items.length,
        matched_items_count: reportPayload.items.filter(i => i.variance === 0).length,
        discrepancy_items_count: reportPayload.items.filter(i => i.variance !== 0).length,
        total_variance_value: reportPayload.items.reduce((acc, i) => acc + (i.variance_value || 0), 0),
        status: 'Disetujui Admin',
        notes: reportPayload.notes || 'Opname fisik disetujui & stok master disinkronkan secara otomatis.',
        items: reportPayload.items,
      };

      // Simpan BASO & Update Stok Atomik ke PostgreSQL
      try {
        const response = await fetch('/api/opname/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.report) {
            newReport.id = resData.report.id;
          }
          console.log(`✅ [STORE] Berita Acara ${reportNo} & ${newReport.discrepancy_items_count} mutasi stok tersimpan di PostgreSQL!`);
          // Sinkronisasi data master terbaru dari database
          this.fetchMedicinesFromDb();
          this.fetchStockLogsFromDb();
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal simpan BASO ke PostgreSQL:', err.message);
      }

      // Update local state untuk UI
      reportPayload.items.forEach(item => {
        const med = this.medicines.find(m => m.id === item.medicine_id);
        if (med && item.physical_stock !== undefined) {
          const diff = item.physical_stock - med.stock;
          med.stock = item.physical_stock;
          med.updated_at = now;
          if (diff !== 0) {
            this.stockLogs.unshift({
              id: Date.now() + Math.random(),
              medicine_id: med.id,
              medicine_name: med.name,
              batch_no: 'OPNAME-' + reportNo,
              type: 'Adjust',
              qty: diff,
              current_stock: med.stock,
              reason: `Stock Opname Mingguan: ${item.reason || 'Koreksi Fisik'} (${reportNo})`,
              reference_id: reportNo,
              created_at: now,
              user_name: this.currentUser ? this.currentUser.name : 'Admin',
            });
          }
        }
      });

      this.opnameReports.unshift(newReport);
      this.logActivity('OPNAME_APPROVE', 'Stock Opname', `Persetujuan BASO ${reportNo} oleh Admin. Selisih item: ${newReport.discrepancy_items_count}`);
      return newReport;
    },

    async deleteOpnameReport(reportIdOrNo) {
      const isOwner = this.currentUser?.role === 'Owner' || (this.currentUser?.role && this.currentUser.role.toLowerCase() === 'owner');
      if (!isOwner) {
        throw new Error('Hanya pengguna dengan role "Owner" yang berhak menghapus riwayat Stock Opname.');
      }

      const target = this.opnameReports.find(r => r.id === reportIdOrNo || r.report_no === reportIdOrNo || r.report_number === reportIdOrNo);
      const targetNo = target?.report_no || target?.report_number || String(reportIdOrNo);

      // Hapus dari state lokal
      this.opnameReports = this.opnameReports.filter(r => r.id !== reportIdOrNo && r.report_no !== reportIdOrNo && r.report_number !== reportIdOrNo && r.report_no !== targetNo && r.report_number !== targetNo);

      // Panggil backend API PostgreSQL
      try {
        await fetch(`/api/opname-reports/${encodeURIComponent(reportIdOrNo)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify({ id: reportIdOrNo, report_no: targetNo })
        });
        console.log(`🗑️ [STORE] Berita Acara ${targetNo} berhasil dihapus dari database PostgreSQL.`);
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal menghapus BASO dari DB:', err.message);
      }

      this.logActivity('OPNAME_DELETE', 'Stock Opname', `Penghapusan arsip BASO ${targetNo} oleh Owner.`);
      return true;
    },

    async clearAllOpnameReports() {
      const isOwner = this.currentUser?.role === 'Owner' || (this.currentUser?.role && this.currentUser.role.toLowerCase() === 'owner');
      if (!isOwner) {
        throw new Error('Hanya pengguna dengan role "Owner" yang berhak membersihkan riwayat Stock Opname.');
      }

      this.opnameReports = [];
      try {
        await fetch('/api/opname/clear-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          }
        });
        console.log(`🗑️ [STORE] Seluruh riwayat BASO berhasil dibersihkan dari database PostgreSQL.`);
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal membersihkan BASO dari DB:', err.message);
      }

      this.logActivity('OPNAME_CLEAR', 'Stock Opname', `Pembersihan seluruh arsip BASO oleh Owner.`);
      return true;
    },

    canAccessTab(tabId) {
      if (!this.currentUser) return false;
      const isOwner = this.currentUser.role === 'Owner' || this.currentUser.role === 'Admin';
      const id = String(tabId).toLowerCase();

      // Modul "users" (Hak Akses & Pengguna) PATEN hanya untuk role Owner!
      if (id === 'users' || id === 'hak-akses' || id === 'karyawan') {
        return isOwner;
      }

      // Role Owner otomatis menguasai semua modul sistem
      if (isOwner) return true;

      const perms = Array.isArray(this.currentUser.permissions) ? this.currentUser.permissions : [];
      if (perms.includes('all') || perms.includes('*')) return true;

      if (id === 'overview' || id === 'dashboard') return perms.includes('overview') || perms.includes('dashboard');
      if (id === 'pos' || id === 'kasir') return perms.includes('pos');
      if (id === 'inventory' || id === 'medicines' || id === 'stok') return perms.includes('inventory') || perms.includes('medicines');
      if (id === 'reports' || id === 'laporan') return perms.includes('reports');
      if (id === 'eod' || id === 'tutup-kasir') return perms.includes('eod');
      if (id === 'opname' || id === 'stock-opname') return perms.includes('opname') || perms.includes('stock-opname');

      return perms.includes(id);
    },

    canUserAccessTab(user, tabId) {
      if (!user) return false;
      const isOwner = user.role === 'Owner' || user.role === 'Admin';
      const id = String(tabId).toLowerCase();

      // Modul "users" (Hak Akses & Pengguna) PATEN hanya untuk role Owner!
      if (id === 'users' || id === 'hak-akses' || id === 'karyawan') {
        return isOwner;
      }

      // Role Owner otomatis menguasai semua modul sistem
      if (isOwner) return true;

      const perms = Array.isArray(user.permissions) ? user.permissions : [];
      if (perms.includes('all') || perms.includes('*')) return true;

      if (id === 'overview' || id === 'dashboard') return perms.includes('overview') || perms.includes('dashboard');
      if (id === 'pos' || id === 'kasir') return perms.includes('pos');
      if (id === 'inventory' || id === 'medicines' || id === 'stok') return perms.includes('inventory') || perms.includes('medicines');
      if (id === 'reports' || id === 'laporan') return perms.includes('reports');
      if (id === 'eod' || id === 'tutup-kasir') return perms.includes('eod');
      if (id === 'opname' || id === 'stock-opname') return perms.includes('opname') || perms.includes('stock-opname');

      return perms.includes(id);
    },

    async saveUserPermissions(userId, newPermissions) {
      const user = this.usersList.find(u => Number(u.id) === Number(userId));
      if (!user) return;

      const isOwner = user.role === 'Owner' || user.role === 'Admin';
      const permsToSave = isOwner ? ['all'] : newPermissions.filter(p => p !== 'users');

      const updated = await this.updateUserData(userId, { permissions: permsToSave });
      return updated;
    },

    async fetchUsersFromDb() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const dbUsers = await res.json();
          if (Array.isArray(dbUsers) && dbUsers.length > 0) {
            const customAvatars = getCustomAvatars();
            this.usersList = dbUsers.map(u => {
              const existing = this.usersList.find(curr => Number(curr.id) === Number(u.id) || curr.nik === u.nik);
              const custom = (u.nik && customAvatars[u.nik]) || (u.id && customAvatars[u.id]);
              let perms = u.permissions;
              if (typeof perms === 'string') {
                try { perms = JSON.parse(perms); } catch (e) { perms = []; }
              }
              const isOwner = u.role === 'Owner' || u.role === 'Admin';
              return {
                ...u,
                id: Number(u.id),
                avatar: custom || u.avatar,
                password: (existing && existing.password) ? existing.password : 'password123',
                permissions: isOwner ? ['all'] : (Array.isArray(perms) ? perms.filter(p => p !== 'users') : ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname']),
              };
            });
            this.saveUsersList();

            // Sinkronkan currentUser jika saat ini sedang login
            if (this.currentUser) {
              const currentInDb = this.usersList.find(u => Number(u.id) === Number(this.currentUser.id));
              if (currentInDb) {
                this.currentUser.permissions = currentInDb.permissions;
                this.currentUser.role = currentInDb.role;
                try {
                  localStorage.setItem('apotek_auth_user', JSON.stringify(this.currentUser));
                } catch (e) {}
              }
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ [STORE] Gagal sinkronisasi user dari DB:', err.message);
      }
    },
  },
});
