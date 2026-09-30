<template>
  <section class="space-y-6">
    <!-- 1. HEADER & SUB-NAVIGASI -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-data">
              MENU-07 • RBAC & KEPATUHAN FARMASI
            </span>
            <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Struktur Resmi Cabang: Owner & Apoteker
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              👑 Owner Mengontrol Penuh 7 Modul
            </span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck class="w-6 h-6 text-indigo-600" />
            Hak Akses & Pengelolaan Karyawan Apotek
          </h2>
          <p class="text-xs text-slate-500 max-w-3xl">
            Sistem Role-Based Access Control (RBAC): Role <strong>Owner</strong> memiliki kendali mutlak atas seluruh 7 modul sistem, dan dapat dengan bebas menentukan hak akses modul sidebar yang diizinkan untuk role <strong>Apoteker</strong>.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            @click="openAddUserModal"
            class="text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold cursor-pointer rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      <!-- 2. PERINGATAN SIPA KEDALUWARSA -->
      <div v-if="sipaExpiringUsers.length > 0" class="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div class="text-xs space-y-1">
          <h4 class="font-bold text-amber-950">Peringatan Regulasi Farmasi: Masa Berlaku SIPA / STRTTK Mendekati Kedaluwarsa</h4>
          <p class="text-amber-800">
            Berdasarkan Permenkes No. 73/2016, Apoteker dan TTK wajib memiliki surat izin praktek yang masih aktif. Terdapat <strong>{{ sipaExpiringUsers.length }}</strong> tenaga kefarmasian yang izinnya akan berakhir:
          </p>
          <ul class="list-disc list-inside space-y-0.5 text-amber-900 font-medium pt-1">
            <li v-for="u in sipaExpiringUsers" :key="u.id">
              <strong>{{ u.name }}</strong> ({{ u.role }}) - SIPA: {{ u.sipa || 'Belum diisi' }} (Berlaku s/d: <span class="underline font-bold">{{ u.sipa_expiry ? u.sipa_expiry.slice(0, 10) : 'Belum diatur' }}</span>)
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 3. KARTU PROFIL KARYAWAN BESERTA STATUS HAK AKSES MODUL -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Users class="w-4 h-4 text-emerald-600" />
          Daftar Staf & Izin Modul Sidebar Aktif
        </h3>
        <span class="text-xs text-slate-500">Total Karyawan: <strong>{{ pharmacyStore.usersList.length }}</strong> Orang</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="user in pharmacyStore.usersList"
          :key="user.id"
          class="p-5 bg-white border rounded-2xl flex flex-col justify-between transition-all shadow-xs hover:shadow-md"
          :class="isUserOwner(user) ? 'border-purple-200 bg-gradient-to-br from-white to-purple-50/20' : 'border-slate-200'"
        >
          <div class="space-y-4">
            <!-- Profil Bar -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <img
                  :src="user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
                  :alt="user.name"
                  class="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h4 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {{ user.name }}
                    <span v-if="isUserOwner(user)" class="text-amber-500" title="Pemilik Sistem (Owner)">👑</span>
                  </h4>
                  <p class="text-[11px] font-mono text-slate-500 font-semibold">NIK: {{ user.nik }}</p>
                </div>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border"
                :class="isUserOwner(user) ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
              >
                {{ user.role }}
              </span>
            </div>

            <!-- Detail Info -->
            <div class="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
              <div class="flex justify-between">
                <span class="text-slate-400">Email:</span>
                <span class="font-medium text-slate-800 truncate max-w-[200px]">{{ user.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Telepon:</span>
                <span class="font-medium text-slate-800">{{ user.phone || '-' }}</span>
              </div>
              <div v-if="user.sipa" class="flex justify-between">
                <span class="text-slate-400">No. SIPA:</span>
                <span class="font-medium text-slate-800">{{ user.sipa }}</span>
              </div>
              <div v-if="user.sipa_expiry" class="flex justify-between text-[11px]">
                <span class="text-slate-400">Masa Berlaku SIPA:</span>
                <span class="font-bold text-amber-700">{{ user.sipa_expiry ? user.sipa_expiry.slice(0, 10) : '-' }}</span>
              </div>
            </div>

            <!-- Status Hak Akses Modul Sidebar -->
            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders class="w-3.5 h-3.5 text-indigo-600" />
                  Hak Akses Modul Sidebar:
                </span>
                <span
                  class="font-data text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="isUserOwner(user) ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-emerald-100 text-emerald-800'"
                >
                  {{ isUserOwner(user) ? '7/7 Modul (Akses Penuh Owner)' : `${getUserActiveModuleCount(user)}/6 Modul Operasional Aktif` }}
                </span>
              </div>

              <!-- Pill tags modul -->
              <div v-if="isUserOwner(user)" class="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
                <span class="text-base">👑</span>
                <div>
                  <p class="font-bold text-[11px]">Akses Penuh ke Seluruh 7 Modul Sistem</p>
                  <p class="text-[10px] text-purple-700">Termasuk modul khusus Hak Akses & Pengguna (MENU-07)</p>
                </div>
              </div>
              <div v-else class="space-y-1.5">
                <div class="grid grid-cols-2 gap-1.5">
                  <div
                    v-for="mod in assignableModules"
                    :key="mod.id"
                    class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors"
                    :class="isModuleActiveForUser(user, mod.id)
                      ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 line-through'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="isModuleActiveForUser(user, mod.id) ? 'bg-emerald-600' : 'bg-slate-300'"></span>
                    <span class="truncate">{{ mod.label }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-500">
                  <span>🔒</span>
                  <span class="truncate">Hak Akses & Pengguna: <strong>Paten Khusus Owner</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-4">
            <div>
              <button
                v-if="!isUserOwner(user)"
                type="button"
                @click="openPermissionModal(user)"
                class="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200"
                title="Bebas atur centang modul mana saja yang boleh dibuka oleh Apoteker ini"
              >
                <Sliders class="w-3.5 h-3.5" />
                <span>Atur Hak Akses Modul</span>
              </button>
              <span v-else class="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                🔒 Akses Penuh Absolut
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="editUser(user)"
                class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Edit Akun
              </button>
              <button
                v-if="user.id !== 1"
                type="button"
                @click="deleteUser(user)"
                class="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT / TAMBAH KARYAWAN -->
    <div v-if="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-base text-slate-900">{{ isEditing ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru' }}</h3>
            <p class="text-xs text-slate-500">Isi data akun pegawai dan atur izin modul sidebar</p>
          </div>
          <button @click="showUserModal = false" class="text-slate-400 hover:text-slate-700 p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveUserForm" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
            <input v-model="formUser.name" type="text" required class="cp-input w-full" placeholder="Contoh: Apt. Sarah Maulida, S.Farm" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">NIK Pegawai:</label>
              <input v-model="formUser.nik" type="text" class="cp-input w-full" placeholder="20260..." />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Peran (Role):</label>
              <select v-model="formUser.role" @change="onFormRoleChange" class="cp-input w-full font-bold">
                <option value="Owner">👑 Owner (Akses Penuh 7 Modul)</option>
                <option value="Apoteker">💊 Apoteker (Izin Modul Dinamis)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email Aktif:</label>
              <input v-model="formUser.email" type="email" required class="cp-input w-full" placeholder="nama@gmail.com" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp:</label>
              <input v-model="formUser.phone" type="text" class="cp-input w-full" placeholder="08123456789" />
            </div>
          </div>

          <!-- Kepatuhan SIPA jika Apoteker -->
          <div v-if="formUser.role === 'Apoteker'" class="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
            <span class="font-bold text-emerald-900 block flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-emerald-600" />
              Kepatuhan Regulasi SIPA / STRTTK:
            </span>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-emerald-800 mb-0.5">Nomor SIPA:</label>
                <input v-model="formUser.sipa" type="text" class="cp-input w-full text-xs" placeholder="19950812/SIPA_..." />
              </div>
              <div>
                <label class="block font-semibold text-emerald-800 mb-0.5">Kedaluwarsa SIPA:</label>
                <input v-model="formUser.sipa_expiry" type="date" class="cp-input w-full text-xs" />
              </div>
            </div>
          </div>

          <!-- KONFIGURASI HAK AKSES MODUL SIDEBAR (HANYA MODUL OPERASIONAL, USERS PATEN KHUSUS OWNER) -->
          <div class="p-4 rounded-xl border space-y-3" :class="formUser.role === 'Owner' ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold block" :class="formUser.role === 'Owner' ? 'text-purple-950' : 'text-slate-900'">
                  Konfigurasi Hak Akses Menu Sidebar:
                </span>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  {{ formUser.role === 'Owner'
                    ? 'Role Owner secara paten & otomatis memiliki kendali penuh atas ke-7 modul sistem (termasuk modul Hak Akses & Pengguna).'
                    : 'Pilih modul operasional yang diizinkan untuk diakses oleh Apoteker. Modul Hak Akses & Pengguna paten khusus Owner.' }}
                </p>
              </div>

              <!-- Tombol Cepat jika Apoteker -->
              <div v-if="formUser.role === 'Apoteker'" class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  @click="selectAllFormModules"
                  class="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  @click="clearAllFormModules"
                  class="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <!-- Tampilan jika role Owner -->
            <div v-if="formUser.role === 'Owner'" class="p-3 bg-purple-100/60 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2">
              <span class="text-base">👑</span>
              <span>Role <strong>Owner</strong> memiliki hak akses permanen ke seluruh 7 modul sistem apotek termasuk modul Hak Akses & Pengguna.</span>
            </div>

            <!-- Grid 6 Modul Operasional Checkboxes (Tanpa opsi Hak Akses & Pengguna) -->
            <div v-else class="space-y-2 pt-1">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  v-for="mod in assignableModules"
                  :key="mod.id"
                  class="p-2.5 rounded-xl border flex items-start gap-2.5 transition-all select-none cursor-pointer"
                  :class="formUser.permissions.includes(mod.id)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
                >
                  <input
                    type="checkbox"
                    :value="mod.id"
                    v-model="formUser.permissions"
                    class="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs truncate leading-snug">{{ mod.label }}</span>
                      <span class="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500">{{ mod.code }}</span>
                    </div>
                    <p class="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">{{ mod.desc }}</p>
                  </div>
                </label>
              </div>
              <div class="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-1.5">
                <span>🔒</span>
                <span>Modul <strong>Hak Akses & Pengguna (MENU-07)</strong> paten hanya untuk Owner dan tidak tersedia untuk role Apoteker.</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" @click="showUserModal = false" class="btn-cp-secondary">Batal</button>
            <button type="submit" class="btn-cp-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL KHUSUS: ATUR HAK AKSES CEPAT (FOCUS MODAL) -->
    <div v-if="showPermissionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Sliders class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900">Atur Izin Modul Sidebar</h3>
              <p class="text-xs text-slate-500">Pegawai: <strong>{{ targetUserForPermission?.name }}</strong> ({{ targetUserForPermission?.role }})</p>
            </div>
          </div>
          <button @click="showPermissionModal = false" class="text-slate-400 hover:text-slate-700 p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Presets Cepat -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] font-bold text-slate-600">Preset Cepat:</span>
            <button
              type="button"
              @click="targetUserPermissions = ['overview', 'pos', 'inventory', 'reports', 'eod', 'opname']"
              class="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded cursor-pointer"
            >
              Semua 6 Modul
            </button>
            <button
              type="button"
              @click="targetUserPermissions = ['pos', 'inventory', 'eod', 'opname']"
              class="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer"
            >
              Standar Farmasi
            </button>
            <button
              type="button"
              @click="targetUserPermissions = ['pos']"
              class="px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
            >
              Kasir Saja
            </button>
          </div>

          <!-- Keterangan Hak Akses Paten -->
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <span class="text-sm">🔒</span>
            <span>Modul <strong>Hak Akses & Pengguna (MENU-07)</strong> paten hanya untuk Owner dan tidak dapat diberikan ke Apoteker.</span>
          </div>

          <!-- Daftar 6 Modul Operasional Checkboxes (Tanpa opsi users) -->
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <label
              v-for="mod in assignableModules"
              :key="mod.id"
              class="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors"
              :class="targetUserPermissions.includes(mod.id) ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  class="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                  :class="targetUserPermissions.includes(mod.id) ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'"
                >
                  {{ mod.code.slice(-2) }}
                </span>
                <div class="min-w-0">
                  <h4 class="font-bold text-xs text-slate-900 truncate">{{ mod.label }}</h4>
                  <p class="text-[10px] text-slate-500 truncate">{{ mod.desc }}</p>
                </div>
              </div>
              <input
                type="checkbox"
                :value="mod.id"
                v-model="targetUserPermissions"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
              />
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" @click="showPermissionModal = false" class="btn-cp-secondary">Batal</button>
          <button type="button" @click="saveDirectPermissions" class="btn-cp-primary">
            Simpan
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePharmacyStore, SYSTEM_MODULES, ASSIGNABLE_MODULES } from '@/Stores/pharmacyStore';
import { useNotificationStore } from '@/Stores/notificationStore';
import {
  ShieldCheck,
  Plus,
  Users,
  Sliders,
  AlertTriangle,
  X,
} from 'lucide-vue-next';

const pharmacyStore = usePharmacyStore();
const notify = useNotificationStore();

// 7 Modul Sistem Resmi Sesuai Sidebar & 6 Modul Operasional yang dapat dialokasikan ke Apoteker
const systemModules = SYSTEM_MODULES;
const assignableModules = ASSIGNABLE_MODULES;

onMounted(() => {
  pharmacyStore.fetchUsersFromDb();
});

const showUserModal = ref(false);
const isEditing = ref(false);
const formUser = ref({
  id: null,
  name: '',
  nik: '',
  role: 'Apoteker',
  email: '',
  phone: '',
  sipa: '',
  sipa_expiry: '',
  permissions: ['pos', 'inventory', 'eod', 'opname'],
});

// Modal Khusus Quick-Permission
const showPermissionModal = ref(false);
const targetUserForPermission = ref(null);
const targetUserPermissions = ref([]);

const isUserOwner = (user) => {
  if (!user) return false;
  return user.role === 'Owner' || user.role === 'Admin';
};

const isModuleActiveForUser = (user, modId) => {
  return pharmacyStore.canUserAccessTab(user, modId);
};

const getUserActiveModuleCount = (user) => {
  if (isUserOwner(user)) return 7;
  return assignableModules.filter(m => isModuleActiveForUser(user, m.id)).length;
};

// Deteksi Apoteker yang masa berlaku SIPA-nya < 90 hari atau sudah habis
const sipaExpiringUsers = computed(() => {
  const now = new Date();
  const ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(now.getDate() + 90);

  return pharmacyStore.usersList.filter(u => {
    if (u.role === 'Apoteker' && u.sipa_expiry) {
      const expDate = new Date(u.sipa_expiry);
      return expDate <= ninetyDaysLater;
    }
    return false;
  });
});

const onFormRoleChange = () => {
  if (formUser.value.role === 'Owner') {
    formUser.value.permissions = ['all'];
  } else {
    // Default izin operasional untuk Apoteker (tanpa modul users)
    formUser.value.permissions = ['pos', 'inventory', 'eod', 'opname'];
  }
};

const selectAllFormModules = () => {
  formUser.value.permissions = assignableModules.map(m => m.id);
};

const clearAllFormModules = () => {
  formUser.value.permissions = [];
};

const openAddUserModal = () => {
  isEditing.value = false;
  formUser.value = {
    id: null,
    name: '',
    nik: '',
    role: 'Apoteker',
    email: '',
    phone: '',
    sipa: '',
    sipa_expiry: '',
    permissions: ['pos', 'inventory', 'eod', 'opname'],
  };
  showUserModal.value = true;
};

const editUser = (user) => {
  isEditing.value = true;
  const isOwner = isUserOwner(user);
  let perms = [];
  if (isOwner) {
    perms = ['all'];
  } else {
    perms = assignableModules.filter(m => isModuleActiveForUser(user, m.id)).map(m => m.id);
  }

  formUser.value = {
    id: user.id,
    name: user.name,
    nik: user.nik,
    role: isOwner ? 'Owner' : 'Apoteker',
    email: user.email,
    phone: user.phone || '',
    sipa: user.sipa || '',
    sipa_expiry: user.sipa_expiry ? user.sipa_expiry.slice(0, 10) : '',
    permissions: perms,
  };
  showUserModal.value = true;
};

const saveUserForm = async () => {
  try {
    const isOwner = formUser.value.role === 'Owner';
    const payload = {
      ...formUser.value,
      permissions: isOwner ? ['all'] : formUser.value.permissions.filter(p => p !== 'users'),
    };

    if (!isEditing.value && !payload.password) {
      payload.password = 'password123';
    }

    if (isEditing.value) {
      await pharmacyStore.updateUserData(payload.id, payload);
    } else {
      await pharmacyStore.addUser(payload);
    }

    showUserModal.value = false;
    notify.success(`Data karyawan ${payload.name} dan izin modul berhasil disimpan!`, 'Karyawan Tersimpan');
  } catch (e) {
    notify.error(e.message || 'Gagal menyimpan data karyawan', 'Error');
  }
};

const deleteUser = async (user) => {
  if (!confirm(`Hapus karyawan ${user.name} dari sistem?`)) return;
  try {
    const res = await fetch('/api/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    });
    if (res.ok) {
      await pharmacyStore.fetchUsersFromDb();
      notify.success(`Karyawan ${user.name} berhasil dihapus.`, 'User Dihapus');
    }
  } catch (e) {
    notify.error(e.message, 'Error');
  }
};

// Modal Khusus Cepat: Buka Izin Modul (Hanya menampilkan 6 modul operasional)
const openPermissionModal = (user) => {
  targetUserForPermission.value = user;
  targetUserPermissions.value = assignableModules.filter(m => isModuleActiveForUser(user, m.id)).map(m => m.id);
  showPermissionModal.value = true;
};

const saveDirectPermissions = async () => {
  if (!targetUserForPermission.value) return;
  try {
    const cleanPerms = targetUserPermissions.value.filter(p => p !== 'users');
    await pharmacyStore.saveUserPermissions(targetUserForPermission.value.id, cleanPerms);
    showPermissionModal.value = false;
    notify.success(
      `Hak akses modul untuk ${targetUserForPermission.value.name} diperbarui (${cleanPerms.length}/6 modul operasional aktif).`,
      'Izin Modul Diperbarui'
    );
  } catch (e) {
    notify.error(e.message || 'Gagal menyimpan izin modul', 'Error');
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
</style>
