<template>
  <div
    v-if="isOpen && transaction"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
  >
    <div
      class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-2">
          <Printer class="w-4 h-4 text-emerald-600" />
          <h3 class="text-sm font-bold text-slate-800">Pratinjau Struk Kasir</h3>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Thermal Receipt Preview Paper -->
      <div class="p-5 bg-slate-100 flex justify-center max-h-[70vh] overflow-y-auto">
        <div
          id="thermal-receipt"
          class="bg-white text-slate-900 w-full max-w-[340px] p-5 rounded-lg border border-slate-200 shadow-sm font-mono text-xs leading-tight select-none"
        >
          <!-- Receipt Header -->
          <div class="text-center border-b border-dashed border-slate-300 pb-3 mb-2.5">
            <h2 class="text-sm font-black tracking-wide text-slate-900">APOTEK BUDI ASIH</h2>
            <p class="text-[10px] text-slate-600">Jl. Budi Asih Sehat No. 88, Bandung</p>
            <p class="text-[10px] text-slate-600">Telp: (022) 720-8899 • WA: 0812-3456-7890</p>
            <p class="text-[9px] text-slate-500 mt-1">SIA: 503/Apt/2026 • APA: Apt. Sarah Maulida, S.Farm</p>
          </div>

          <!-- Transaction Type Pill -->
          <div class="text-center mb-2.5">
            <span
              class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold"
              :class="transaction.prescription_id || transaction.is_prescription ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'"
            >
              {{ (transaction.prescription_id || transaction.is_prescription) ? '✚ TRANSAKSI RESEP DOKTER' : '✓ PENJUALAN REGULER (NON-RESEP)' }}
            </span>
          </div>

          <!-- Metadata -->
          <div class="border-b border-dashed border-slate-300 pb-2 mb-2.5 text-[10px] space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-600">No. Faktur:</span>
              <span class="font-bold text-slate-900">{{ transaction.invoice_number }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Waktu:</span>
              <span>{{ transaction.created_at }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Kasir:</span>
              <span>{{ transaction.cashier_name || 'Budi Santoso' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Pelanggan / Pasien:</span>
              <span class="font-bold">{{ transaction.customer_name || 'Pelanggan Walk-in' }}</span>
            </div>
            <div v-if="transaction.doctor_name" class="flex justify-between text-indigo-900">
              <span>Dokter Penulis:</span>
              <span>{{ transaction.doctor_name }}</span>
            </div>
          </div>

          <!-- Item list -->
          <div class="border-b border-dashed border-slate-300 pb-2.5 mb-2.5 space-y-2">
            <div
              v-for="(item, idx) in transaction.details"
              :key="idx"
              class="text-[11px]"
            >
              <div class="font-semibold text-slate-900 truncate">{{ item.name }}</div>
              <div class="flex justify-between text-slate-600 pl-2 text-[10px]">
                <span>{{ item.qty }}x @ Rp {{ formatNumber(item.price) }}</span>
                <span class="font-semibold text-slate-900">Rp {{ formatNumber(item.subtotal) }}</span>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2.5 mb-3">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>Rp {{ formatNumber(transaction.subtotal) }}</span>
            </div>
            <div v-if="transaction.tuslah_fee > 0" class="flex justify-between text-indigo-700">
              <span>Jasa Racik / Tuslah:</span>
              <span>Rp {{ formatNumber(transaction.tuslah_fee) }}</span>
            </div>
            <div v-if="transaction.embalase_fee > 0" class="flex justify-between text-slate-600">
              <span>Kemasan / Embalase:</span>
              <span>Rp {{ formatNumber(transaction.embalase_fee) }}</span>
            </div>
            <div v-if="transaction.discount_amount > 0" class="flex justify-between text-rose-600">
              <span>Diskon:</span>
              <span>- Rp {{ formatNumber(transaction.discount_amount) }}</span>
            </div>
            <div v-if="transaction.tax_amount > 0" class="flex justify-between text-slate-600">
              <span>PPN (11%):</span>
              <span>Rp {{ formatNumber(transaction.tax_amount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-xs text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL BAYAR:</span>
              <span>Rp {{ formatNumber(transaction.total_amount) }}</span>
            </div>
            <div class="flex justify-between text-slate-700 text-[10px]">
              <span>Metode Bayar:</span>
              <span class="font-bold text-slate-900">{{ transaction.payment_method }}</span>
            </div>
            <div v-if="transaction.payment_method === 'Cash' || transaction.payment_method === 'Tunai'" class="flex justify-between text-slate-700 text-[10px]">
              <span>Uang Diterima:</span>
              <span>Rp {{ formatNumber(transaction.paid_amount) }}</span>
            </div>
            <div v-if="transaction.change_amount > 0" class="flex justify-between font-bold text-emerald-700 text-[10px]">
              <span>Kembalian:</span>
              <span>Rp {{ formatNumber(transaction.change_amount) }}</span>
            </div>
          </div>

          <!-- Barcode & Footer Note -->
          <div class="text-center pt-0.5 space-y-1">
            <div class="inline-block px-3 py-0.5 bg-slate-50 rounded text-[9px] tracking-widest font-mono font-bold border border-slate-200">
              *{{ transaction.invoice_number }}*
            </div>
            <p class="text-[9px] text-slate-600 italic">
              "Semoga Lekas Sembuh • Terima Kasih Atas Kunjungan Anda"
            </p>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="flex items-center justify-between gap-2.5 p-4 bg-slate-50 border-t border-slate-200">
        <button
          @click="$emit('close')"
          class="btn-cp-secondary text-xs px-3.5 py-2"
        >
          Tutup
        </button>

        <div class="flex items-center gap-2">
          <button
            v-if="transaction.prescription_id || transaction.is_prescription"
            @click="$emit('print-etiket', transaction)"
            class="btn-cp-azure text-xs px-3.5 py-2"
          >
            <Tag class="w-4 h-4" />
            <span>Etiket Resep</span>
          </button>

          <button
            @click="printReceipt"
            class="btn-cp-primary text-xs px-4 py-2"
          >
            <Printer class="w-4 h-4" />
            <span>Cetak Struk Thermal</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Printer, Tag, X } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  transaction: Object,
});

defineEmits(['close', 'print-etiket']);

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID');
};

const printReceipt = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #thermal-receipt,
  #thermal-receipt * {
    visibility: visible;
  }
  #thermal-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
  }
}
</style>
