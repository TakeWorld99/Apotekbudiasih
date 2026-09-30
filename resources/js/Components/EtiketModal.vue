<template>
  <div
    v-if="isOpen && item"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
  >
    <div
      class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Tag class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-800">Cetak Etiket Aturan Pakai Obat</h3>
            <p class="text-[11px] text-slate-500">Label petunjuk minum obat untuk pasien</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Etiket Preview Paper -->
      <div class="p-6 bg-slate-100 flex flex-col items-center gap-4">
        <!-- White Label for Obat Dalam (Putih) -->
        <div
          id="etiket-label"
          class="bg-white text-slate-900 w-full max-w-[320px] p-4 rounded-xl border-2 border-emerald-600 shadow-md font-sans text-xs leading-tight select-none"
        >
          <!-- Kop Apotek -->
          <div class="text-center border-b border-slate-300 pb-2 mb-2">
            <h2 class="text-xs font-black tracking-wider text-emerald-800 uppercase">APOTEK BUDI ASIH</h2>
            <p class="text-[9px] text-slate-600">Jl. Budi Asih Sehat No. 88, Bandung · Telp: (022) 720-8899</p>
            <p class="text-[8px] text-slate-500">SIPA: 19950812/SIPA_32.73/2022/2045 · APA: Apt. Sarah M., S.Farm</p>
          </div>

          <!-- Metadata -->
          <div class="flex justify-between items-center text-[10px] mb-2 font-mono text-slate-700">
            <span>No: <strong>{{ item.recipe_number || item.invoice_number || 'RX-001' }}</strong></span>
            <span>Tgl: {{ todayDate }}</span>
          </div>

          <!-- Pasien -->
          <div class="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 mb-2.5">
            <div class="text-[10px] text-slate-500">Pasien:</div>
            <div class="font-bold text-xs text-slate-900 truncate">{{ item.patient_name || item.customer_name || 'Pelanggan Umum' }}</div>
          </div>

          <!-- Nama Obat -->
          <div class="text-center my-2 py-1 bg-slate-50 rounded border border-slate-200">
            <span class="font-bold text-xs text-slate-800">{{ item.medicine_name || item.name || 'Nama Obat' }}</span>
            <span v-if="item.qty" class="text-[10px] text-slate-500 ml-1">({{ item.qty }} {{ item.unit || 'Unit' }})</span>
          </div>

          <!-- Aturan Pakai Input / Display -->
          <div class="my-3 text-center border-y border-dashed border-emerald-600/40 py-2.5 space-y-1">
            <p class="text-[11px] font-black text-emerald-900 tracking-wide uppercase">
              {{ item.dosage_instruction || localDosage || '3 X SEHARI 1 TABLET' }}
            </p>
            <p class="text-[10px] font-semibold text-slate-700">
              {{ timingNote }}
            </p>
          </div>

          <!-- Footer warning -->
          <div class="text-center pt-1 text-[8px] text-slate-500 italic">
            OBAT DALAM · SIMPAN DI TEMPAT SEJUK DAN KERING
          </div>
        </div>

        <!-- Dosage Quick Edit inside Modal -->
        <div class="w-full max-w-[320px] bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
          <label class="block font-bold text-slate-700">Ubah Aturan Pakai:</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="preset in dosagePresets"
              :key="preset"
              type="button"
              @click="localDosage = preset"
              :class="[
                'py-1 px-1.5 rounded text-[10px] font-semibold border transition-all text-center',
                localDosage === preset ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              ]"
            >
              {{ preset }}
            </button>
          </div>

          <div class="flex gap-2 pt-1">
            <select v-model="timingNote" class="cp-input text-[11px] py-1">
              <option value="Sesudah Makan (Pagi / Siang / Malam)">Sesudah Makan</option>
              <option value="Sebelum Makan (Perut Kosong)">Sebelum Makan</option>
              <option value="Bersama Makanan / Suapan Pertama">Bersama Makanan</option>
              <option value="Malam Hari Sebelum Tidur">Sebelum Tidur</option>
              <option value="Bila Perlu / Saat Nyeri atau Demam">Bila Perlu / Demam</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex items-center justify-between gap-3 p-4 bg-slate-50 border-t border-slate-200">
        <button
          @click="$emit('close')"
          class="btn-cp-secondary text-xs px-4 py-2"
        >
          Tutup
        </button>

        <button
          @click="printEtiket"
          class="btn-cp-primary text-xs px-4 py-2 shadow-md"
        >
          <Printer class="w-4 h-4" />
          <span>Cetak Etiket Mini</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Tag, Printer, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  item: Object,
});

defineEmits(['close']);

const todayDate = new Date().toLocaleDateString('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const localDosage = ref('3 X SEHARI 1 TABLET');
const timingNote = ref('Sesudah Makan (Pagi / Siang / Malam)');

const dosagePresets = [
  '3 x 1 Tablet',
  '2 x 1 Tablet',
  '1 x 1 Tablet',
  '3 x 1 Bungkus',
  '3 x 1 Sendok Teh (5ml)',
  'Bila Demam/Nyeri',
];

const printEtiket = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #etiket-label,
  #etiket-label * {
    visibility: visible;
  }
  #etiket-label {
    position: absolute;
    left: 0;
    top: 0;
    width: 60mm;
    border: 2px solid #000;
  }
}
</style>
