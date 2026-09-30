<template>
  <div
    v-if="isOpen && medicine"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
  >
    <div
      class="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in duration-150"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <SlidersHorizontal class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Penyesuaian Stok Obat</h3>
            <p class="text-xs text-slate-500 font-semibold text-emerald-800">{{ medicine.name }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Medicine Summary Pill -->
      <div class="p-4 bg-slate-50 border-b border-slate-100 space-y-1">
        <div class="flex justify-between items-center">
          <h4 class="font-bold text-sm text-slate-900">{{ medicine.name }}</h4>
          <span class="badge bg-slate-100 text-slate-700 border-slate-300">
            {{ medicine.unit }}
          </span>
        </div>
        <div class="flex items-center gap-4 text-xs text-slate-600">
          <div>
            Stok Saat Ini: <strong class="text-slate-900">{{ medicine.stock }}</strong>
          </div>
          <div>
            Batas Min: <span class="font-medium text-slate-700">{{ medicine.min_stock }}</span>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
        <!-- Adjustment Type Buttons -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Jenis Mutasi Stok
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="type = 'In'"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1',
                type === 'In'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              ]"
            >
              <PlusCircle class="w-4 h-4 text-emerald-600" />
              <span>Masuk (+In)</span>
            </button>

            <button
              type="button"
              @click="type = 'Out'"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1',
                type === 'Out'
                  ? 'bg-rose-50 text-rose-700 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              ]"
            >
              <MinusCircle class="w-4 h-4 text-rose-600" />
              <span>Keluar (-Out)</span>
            </button>

            <button
              type="button"
              @click="type = 'Adjust'"
              :class="[
                'py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center gap-1',
                type === 'Adjust'
                  ? 'bg-sky-50 text-sky-700 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              ]"
            >
              <CheckSquare class="w-4 h-4 text-sky-600" />
              <span>Opname Fisik</span>
            </button>
          </div>
        </div>

        <!-- Quantity Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            {{ type === 'Adjust' ? 'Jumlah Total Stok Fisik Aktual' : 'Jumlah Penyesuaian Unit' }}
          </label>
          <input
            v-model.number="qty"
            type="number"
            min="1"
            required
            class="form-input w-full font-mono font-bold text-slate-900"
            placeholder="0"
          />
        </div>

        <!-- Resulting Stock Preview -->
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span class="text-slate-600">Estimasi Stok Akhir:</span>
          <span class="font-bold text-sm" :class="estimatedStock < medicine.min_stock ? 'text-amber-600' : 'text-emerald-700'">
            {{ estimatedStock }} {{ medicine.unit }}
          </span>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan / Alasan
          </label>
          <input
            v-model="reason"
            type="text"
            required
            class="form-input w-full text-xs"
            placeholder="Contoh: Penerimaan Faktur No. 102 / Koreksi Opname"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Batal
          </button>
          <button
            type="submit"
            class="btn-primary"
          >
            Simpan Mutasi
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { SlidersHorizontal, PlusCircle, MinusCircle, CheckSquare, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  medicine: Object,
});

const emit = defineEmits(['close', 'adjusted']);

const type = ref('In');
const qty = ref(10);
const reason = ref('Penerimaan dari Supplier');

watch(() => props.medicine, (med) => {
  if (med) {
    type.value = 'In';
    qty.value = 10;
    reason.value = 'Penerimaan dari PBF / Supplier';
  }
});

watch(type, (newType) => {
  if (newType === 'In') {
    reason.value = 'Penerimaan dari PBF / Supplier';
  } else if (newType === 'Out') {
    reason.value = 'Barang Rusak / Kedaluwarsa Dihapuskan';
  } else {
    reason.value = 'Stock Opname Fisik Akhir Bulan';
    if (props.medicine) qty.value = props.medicine.stock;
  }
});

const estimatedStock = computed(() => {
  if (!props.medicine) return 0;
  const current = props.medicine.stock;
  const num = Number(qty.value) || 0;

  if (type.value === 'In') return current + num;
  if (type.value === 'Out') return Math.max(0, current - num);
  return num;
});

const handleSubmit = () => {
  if (!qty.value || qty.value <= 0) {
    alert('Jumlah unit harus lebih besar dari 0');
    return;
  }

  emit('adjusted', {
    medicineId: props.medicine.id,
    type: type.value,
    qty: qty.value,
    reason: reason.value,
  });

  emit('close');
};
</script>
