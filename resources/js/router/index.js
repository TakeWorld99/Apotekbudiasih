import { createRouter, createWebHistory } from 'vue-router';
import UnifiedWorkspace from '../Pages/UnifiedWorkspace.vue';
import GuestLayout from '../Layouts/GuestLayout.vue';
import ForgotPassword from '../Pages/Auth/ForgotPassword.vue';

const routes = [
  {
    path: '/',
    name: 'workspace',
    component: UnifiedWorkspace,
    meta: { title: 'Kasir - Apotek Budi Asih' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: UnifiedWorkspace,
    meta: { title: 'Dashboard & Analitik - Apotek Budi Asih' },
  },
  {
    path: '/overview',
    redirect: '/dashboard',
  },
  {
    path: '/pos',
    name: 'pos',
    component: UnifiedWorkspace,
    meta: { title: 'Kasir - Apotek Budi Asih' },
  },
  {
    path: '/kasir',
    redirect: '/pos',
  },
  {
    path: '/medicines',
    name: 'medicines',
    component: UnifiedWorkspace,
    meta: { title: 'Stok & Produk Obat - Apotek Budi Asih' },
  },
  {
    path: '/inventory',
    redirect: '/medicines',
  },
  {
    path: '/stok',
    redirect: '/medicines',
  },
  {
    path: '/reports',
    name: 'reports',
    component: UnifiedWorkspace,
    meta: { title: 'Laporan Penjualan - Apotek Budi Asih' },
  },
  {
    path: '/laporan',
    redirect: '/reports',
  },
  {
    path: '/eod',
    name: 'eod',
    component: UnifiedWorkspace,
    meta: { title: 'Laporan End Of Day(EOD) - Apotek Budi Asih' },
  },
  {
    path: '/tutup-kasir',
    redirect: '/eod',
  },
  {
    path: '/stock-opname',
    name: 'stock-opname',
    component: UnifiedWorkspace,
    meta: { title: 'Stok Opname(SO) - Apotek Budi Asih' },
  },
  {
    path: '/opname',
    redirect: '/stock-opname',
  },
  {
    path: '/users',
    name: 'users',
    component: UnifiedWorkspace,
    meta: { title: 'Hak Akses & Pengguna Toko - Apotek Budi Asih' },
  },
  {
    path: '/hak-akses',
    redirect: '/users',
  },
  {
    path: '/karyawan',
    redirect: '/users',
  },
  {
    path: '/portal-pasien',
    name: 'portal-pasien',
    component: GuestLayout,
    meta: { title: 'Portal Tebus Resep Digital - Apotek Budi Asih' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { title: 'Pemulihan Kata Sandi - Apotek Budi Asih' },
  },
  {
    path: '/login',
    redirect: '/pos',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pos',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || 'Apotek Budi Asih';
  next();
});

export default router;
