<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 bg-[#071a13] border-r border-[#0d2a1f] transition-all duration-300 ease-in-out flex flex-col justify-between py-4 select-none group/sidebar overflow-y-auto overflow-x-hidden custom-scrollbar',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isExpanded ? 'w-[260px] px-3.5 shadow-2xl shadow-emerald-950/60' : 'w-[68px] items-center px-2.5'
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Top Section -->
    <div class="flex flex-col w-full gap-3" :class="isExpanded ? '' : 'items-center'">
      
      <!-- Brand Header -->
      <div
        class="w-full pb-2 border-b border-white/10 shrink-0 flex items-center"
        :class="isExpanded ? 'justify-between px-1 animate-in fade-in duration-200' : 'justify-center px-0'"
      >
        <!-- When collapsed: Only Logo Icon, centered -->
        <div v-if="!isExpanded" class="flex items-center justify-center w-full">
          <router-link
            to="/dashboard"
            class="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer group"
            title="Apotek Budi Asih"
          >
            <img src="/icon.png" alt="Logo Apotek Budi Asih" class="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-110" />
          </router-link>
        </div>

        <!-- When expanded: Full branding with name -->
        <div v-else class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 bg-[#00a86b] rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            ✚
          </div>
          <div class="flex flex-col truncate">
            <span class="font-bold text-sm text-white tracking-tight leading-tight">Apotek Budi Asih</span>
            <span class="text-[10px] text-emerald-400 font-semibold tracking-wide">Pharmacy POS & ERP</span>
          </div>
        </div>
      </div>

      <!-- 1. Plus Button (Green Squircle) -->
      <router-link
        to="/pos"
        class="bg-[#00a86b] hover:bg-[#00925c] active:scale-95 text-white transition-all shadow-lg shadow-emerald-950/40 cursor-pointer group relative"
        :class="isExpanded ? 'w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs' : 'w-11 h-11 rounded-2xl flex items-center justify-center'"
        title="+ Kasir POS Cepat"
      >
        <Plus class="w-5 h-5 stroke-[3] shrink-0" />
        <span v-if="isExpanded" class="whitespace-nowrap">+ Kasir POS</span>
        <div v-if="!isExpanded" class="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#071a13] text-white text-xs font-semibold rounded-xl border border-emerald-500/30 shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 transform -translate-x-1 group-hover:translate-x-0">
          + Aksi Cepat / POS
        </div>
      </router-link>

      <!-- 2. Avatar / Thumbnail Card -->
      <div class="relative group w-full" :class="isExpanded ? '' : 'flex justify-center'">
        <div
          class="rounded-xl transition-all cursor-pointer"
          :class="isExpanded ? 'bg-[#0a271d] p-2 flex items-center gap-2.5 border border-emerald-900/30' : 'w-11 h-8 rounded-lg overflow-hidden border border-white/20 shadow-xs bg-emerald-900/40 flex items-center justify-center text-white font-bold text-xs'"
        >
          <img
            v-if="pharmacyStore.currentUser.avatar"
            :src="pharmacyStore.currentUser.avatar"
            :alt="pharmacyStore.currentUser.name"
            class="rounded-lg object-cover"
            :class="isExpanded ? 'w-8 h-8' : 'w-full h-full'"
            @error="pharmacyStore.currentUser.avatar = null"
          />
          <span v-else>{{ pharmacyStore.currentUser.name ? pharmacyStore.currentUser.name.charAt(0).toUpperCase() : 'U' }}</span>
          <div v-if="isExpanded" class="flex flex-col truncate min-w-0">
            <span class="font-bold text-xs text-white truncate leading-tight">{{ pharmacyStore.currentUser.name }}</span>
            <span class="text-[10px] text-emerald-400 font-semibold mt-0.5">{{ pharmacyStore.currentUser.role }}</span>
          </div>
        </div>
        <div v-if="!isExpanded" class="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#071a13] text-white text-xs font-semibold rounded-xl border border-emerald-500/30 shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 transform -translate-x-1 group-hover:translate-x-0">
          <p class="font-bold">{{ pharmacyStore.currentUser.name }}</p>
          <p class="text-[10px] text-emerald-400">{{ pharmacyStore.currentUser.role }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-[1px] bg-white/10 my-0.5" :class="isExpanded ? 'w-full' : 'w-8 mx-auto'"></div>

      <!-- 3. Navigation Links (Matching Screenshot Sequence) -->
      <nav class="flex flex-col gap-2 w-full" :class="isExpanded ? '' : 'items-center gap-3.5'">
        <!-- 1. Grid (Dashboard) -->
        <router-link
          to="/"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <LayoutGrid class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Dashboard Eksekutif</span>
          <div v-if="!isExpanded" class="nav-tooltip">Dashboard Eksekutif</div>
        </router-link>

        <!-- 2. Package (Medicines Catalog) -->
        <router-link
          to="/medicines"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <Package class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Katalog & Stok Obat</span>
          <span
            v-if="pharmacyStore.lowStockMedicines.length > 0 && !isExpanded"
            class="w-2 h-2 rounded-full bg-[#00a86b] absolute top-2 right-2 ring-2 ring-[#071a13]"
          ></span>
          <span
            v-if="pharmacyStore.lowStockMedicines.length > 0 && isExpanded"
            class="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 bg-emerald-900/50 text-emerald-300"
          >
            {{ pharmacyStore.lowStockMedicines.length }}
          </span>
          <div v-if="!isExpanded" class="nav-tooltip">Katalog & Stok Master Obat</div>
        </router-link>

        <!-- 3. Pills (POS Kasir) -->
        <router-link
          to="/pos"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <Pill class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Kasir POS Cepat</span>
          <div v-if="!isExpanded" class="nav-tooltip">Kasir POS Cepat</div>
        </router-link>

        <!-- 4. Clock (Shifts / Expiry) -->
        <router-link
          to="/medicines?tab=fefo"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          @click="$emit('close-sidebar')"
        >
          <Clock class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Inventaris FEFO & Batch</span>
          <div v-if="!isExpanded" class="nav-tooltip">Inventaris FEFO & Kadaluwarsa</div>
        </router-link>


        <!-- 6. File Text (Prescriptions) -->
        <router-link
          to="/prescriptions"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <FileText class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Resep Dokter & Racikan</span>
          <span
            v-if="pharmacyStore.pendingPrescriptionsCount > 0 && !isExpanded"
            class="w-2 h-2 rounded-full bg-[#00a86b] absolute top-2 right-2 ring-2 ring-[#071a13]"
          ></span>
          <span
            v-if="pharmacyStore.pendingPrescriptionsCount > 0 && isExpanded"
            class="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 bg-emerald-900/50 text-emerald-300"
          >
            {{ pharmacyStore.pendingPrescriptionsCount }}
          </span>
          <div v-if="!isExpanded" class="nav-tooltip">Antrean & Skrining Resep Dokter</div>
        </router-link>

        <!-- 7. Bar Chart (Reports) -->
        <router-link
          to="/reports"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <BarChart3 class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Laporan & Ekspor</span>
          <div v-if="!isExpanded" class="nav-tooltip">Laporan & Analitik Keuangan</div>
        </router-link>

        <!-- 8. Shield (Hak Akses & Pengguna Toko) -->
        <router-link
          to="/users"
          class="group relative"
          :class="isExpanded ? 'nav-row-item' : 'nav-dock-item'"
          :active-class="isExpanded ? 'nav-row-active' : 'active'"
          @click="$emit('close-sidebar')"
        >
          <ShieldCheck class="w-5 h-5 shrink-0" />
          <span v-if="isExpanded" class="flex-1 truncate">Hak Akses & Pengguna</span>
          <div v-if="!isExpanded" class="nav-tooltip">Hak Akses & Pengguna Toko</div>
        </router-link>
      </nav>
    </div>

    <!-- Bottom Section -->
    <div class="flex flex-col gap-3 w-full mt-auto pt-3 border-t border-white/10" :class="isExpanded ? '' : 'items-center'">
      <!-- Active Shift Status Card with Glowing Dot -->
      <div class="relative group w-full" :class="isExpanded ? '' : 'flex justify-center'">
        <div
          class="transition-all cursor-pointer border"
          :class="isExpanded
            ? 'w-full bg-[#092218] hover:bg-[#0c2f21] rounded-xl p-2.5 flex flex-col gap-1.5 border-emerald-900/40'
            : 'w-11 h-11 bg-[#092218] hover:bg-[#0c2f21] rounded-2xl flex items-center justify-center border-emerald-900/40'"
          title="Status Shift Kasir"
        >
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 bg-[#00a86b] rounded-full shadow-[0_0_10px_#00a86b] animate-pulse shrink-0"></span>
              <span v-if="isExpanded" class="text-xs font-bold text-emerald-400">Sesi Kasir: Aktif</span>
            </div>
          </div>
          <div v-if="isExpanded" class="text-[11px] text-slate-300">
            <span>07:00 - 20:00 WIB</span>
          </div>
        </div>
        <div v-if="!isExpanded" class="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#071a13] text-white text-xs font-semibold rounded-xl border border-emerald-500/30 shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 transform -translate-x-1 group-hover:translate-x-0">
          <p class="font-bold text-emerald-400">Sesi Kasir: Aktif</p>
          <p class="text-[10px] text-slate-300">07:00 - 20:00 WIB</p>
        </div>
      </div>

      <!-- Logout Button (Red Door Exit) -->
      <div class="relative group w-full" :class="isExpanded ? '' : 'flex justify-center'">
        <button
          @click="pharmacyStore.logout()"
          class="text-[#f43f5e] hover:text-[#fb7185] hover:bg-rose-500/10 transition-all cursor-pointer"
          :class="isExpanded ? 'w-full py-2 px-3 rounded-xl flex items-center gap-3 font-semibold text-xs text-left' : 'w-11 h-11 rounded-2xl flex items-center justify-center'"
          title="Keluar Sistem"
        >
          <LogOut class="w-5 h-5 text-[#f43f5e] shrink-0" />
          <span v-if="isExpanded">Keluar Sistem (Logout)</span>
        </button>
        <div v-if="!isExpanded" class="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#071a13] text-white text-xs font-semibold rounded-xl border border-rose-500/30 shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 transform -translate-x-1 group-hover:translate-x-0">
          <span class="text-rose-400 font-bold">Keluar Sistem (Logout)</span>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Backdrop -->
  <div
    v-if="isOpen"
    @click="$emit('close-sidebar')"
    class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
  ></div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import {
  LayoutGrid,
  Package,
  Pill,
  Clock,
  FileText,
  BarChart3,
  ShieldCheck,
  Plus,
  LogOut,
} from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
});

defineEmits(['close-sidebar']);

const pharmacyStore = usePharmacyStore();
const isHovered = ref(false);
const isExpanded = computed(() => isHovered.value);
</script>

<style scoped>
.nav-dock-item {
  @apply w-11 h-11 rounded-2xl flex items-center justify-center text-[#6e8c80] hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer;
}

.nav-dock-item.active {
  @apply bg-[#00a86b] text-white shadow-lg shadow-emerald-950/40 scale-105;
}

.nav-dock-item.active svg {
  @apply text-white;
}

.nav-row-item {
  @apply w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#7e998f] hover:text-white hover:bg-white/5 transition-all duration-150 text-left;
}

.nav-row-active {
  @apply bg-[#00a86b] text-white font-bold shadow-md shadow-emerald-950/40;
}

.nav-row-active svg {
  @apply text-white;
}

.nav-tooltip {
  @apply absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#071a13] text-white text-xs font-semibold rounded-xl border border-emerald-500/30 shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 transform -translate-x-1 group-hover:translate-x-0;
}
</style>
