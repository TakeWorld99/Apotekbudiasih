<template>
  <header class="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3">
    <div class="flex items-center justify-between gap-4">
      <!-- Left: Mobile Toggle & Brand/Page Title -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
        >
          <Menu class="w-6 h-6" />
        </button>

        <div class="hidden sm:flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span class="text-xs font-medium text-slate-400 font-mono">{{ currentTime }} WIB</span>
        </div>
      </div>

      <!-- Center / Right Actions -->
      <div class="flex items-center gap-3">
        <!-- Quick Prescription Upload Button -->
        <button
          @click="$emit('open-upload-modal')"
          class="btn-primary py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl"
          title="Unggah Foto Resep Dokter Baru"
        >
          <FileUp class="w-4 h-4" />
          <span class="hidden md:inline">Unggah Resep</span>
        </button>

        <!-- Low stock alert indicator -->
        <router-link
          to="/medicines"
          v-if="pharmacyStore.lowStockMedicines.length > 0"
          class="hidden md:flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition-all"
          title="Obat mencapai batas stok minimum"
        >
          <AlertTriangle class="w-3.5 h-3.5 text-amber-400" />
          <span>{{ pharmacyStore.lowStockMedicines.length }} Stok Menipis</span>
        </router-link>

        <!-- Pending Prescription Badge -->
        <router-link
          to="/prescriptions"
          v-if="pharmacyStore.pendingPrescriptionsCount > 0"
          class="flex items-center gap-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-teal-500/25 transition-all"
        >
          <Clock class="w-3.5 h-3.5 text-teal-400" />
          <span>{{ pharmacyStore.pendingPrescriptionsCount }} Resep Baru</span>
        </router-link>

        <!-- Role Simulator Dropdown -->
        <div class="relative">
          <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <ShieldCheck class="w-4 h-4 text-teal-400" />
            <select
              :value="pharmacyStore.currentUser.role === 'Admin' ? 'Owner' : pharmacyStore.currentUser.role"
              @change="handleRoleChange($event.target.value)"
              class="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-2"
              title="Simulasikan Hak Akses Role"
            >
              <option value="Owner" class="bg-slate-900 text-slate-100">👑 Owner</option>
              <option value="Apoteker" class="bg-slate-900 text-slate-100">💊 Apoteker</option>
            </select>
          </div>
        </div>


      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import { Menu, FileUp, AlertTriangle, Clock, ShieldCheck } from 'lucide-vue-next';

defineEmits(['toggle-sidebar', 'open-upload-modal']);

const pharmacyStore = usePharmacyStore();
const currentTime = ref('');

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

let timer = null;
onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleRoleChange = (role) => {
  pharmacyStore.switchRole(role);
};
</script>
