<template>
  <div
    v-if="isOpen && eodData"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
  >
    <div
      class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div class="flex items-center gap-2">
          <Printer class="w-4 h-4 text-emerald-600" />
          <h3 class="text-sm font-bold text-slate-800">Pratinjau Slip EOD Thermal (80mm)</h3>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Thermal Paper Preview Area -->
      <div class="p-5 bg-slate-100 flex justify-center max-h-[72vh] overflow-y-auto">
        <div
          id="eod-thermal-receipt"
          class="bg-white text-slate-900 w-full max-w-[340px] p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm font-mono text-xs leading-tight select-none"
        >
          <!-- Store Header -->
          <div class="text-center border-b border-dashed border-slate-300 pb-3 mb-2.5">
            <h2 class="text-sm font-black tracking-wide text-slate-900 uppercase">{{ eodData.storeName || 'APOTEK BUDI ASIH' }}</h2>
            <p class="text-[10px] text-slate-600">Jl. Budi Asih Sehat No. 88, Bandung</p>
            <p class="text-[10px] text-slate-600">Telp: (022) 720-8899 • WA: 0812-3456-7890</p>
            <p class="text-[9px] text-slate-500 mt-0.5">SIA: 503/Apt/2026 • APA: Apt. Sarah Maulida, S.Farm</p>
          </div>

          <!-- Document Title -->
          <div class="text-center mb-2.5">
            <span class="inline-block px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-black tracking-wider">
              REKAP END OF DAY (EOD)
            </span>
          </div>

          <!-- 1. Identitas Toko, Shift & Kasir -->
          <div class="border-b border-dashed border-slate-300 pb-2 mb-2.5 text-[10px] space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-600">Nama Toko:</span>
              <span class="font-bold text-slate-900">{{ eodData.storeName || 'Apotek Budi Asih' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Nama Kasir:</span>
              <span class="font-bold text-slate-900">{{ eodData.employeeName || 'Afin Riyandika' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">NIK Karyawan:</span>
              <span class="font-bold font-data">{{ eodData.employeeNik || '2026010188' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Jabatan:</span>
              <span class="font-semibold">{{ eodData.employeeRole || 'Admin' }}</span>
            </div>
            <div class="flex justify-between pt-1 border-t border-dotted border-slate-200">
              <span class="text-slate-600">Open Kasir:</span>
              <span class="font-semibold">{{ eodData.openCashierDateTime || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Close Kasir:</span>
              <span class="font-semibold">{{ eodData.closeCashierDateTime || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Total Faktur:</span>
              <span class="font-bold font-data">{{ eodData.totalInvoices || 0 }} Transaksi</span>
            </div>
          </div>

          <!-- 2. Cash Reconciliation Section -->
          <div class="border-b border-dashed border-slate-300 pb-2.5 mb-2.5 space-y-1.5 text-[11px]">
            <div class="font-bold text-slate-900 text-[10px] uppercase tracking-wide text-center bg-slate-100 py-0.5 rounded">
              [ REKONSILIASI KAS LACI ]
            </div>
            <div class="flex justify-between text-slate-600 pt-1">
              <span>Saldo Awal (Modal):</span>
              <span class="font-data font-semibold">Rp {{ formatNumber(eodData.startingCash) }}</span>
            </div>
            <div class="flex justify-between text-emerald-700">
              <span>(+) Penjualan Tunai:</span>
              <span class="font-data font-bold">Rp {{ formatNumber(eodData.cashSales) }}</span>
            </div>
            <div class="flex justify-between text-rose-600">
              <span>(-) Petty Cash:</span>
              <span class="font-data font-semibold">Rp {{ formatNumber(eodData.pettyExpense) }}</span>
            </div>
            <div class="flex justify-between text-slate-900 font-bold pt-1 border-t border-dotted border-slate-200">
              <span>(=) Target Kas Sistem:</span>
              <span class="font-data">Rp {{ formatNumber(eodData.targetSystemCash) }}</span>
            </div>
            <div class="flex justify-between text-slate-900 font-black">
              <span>Saldo Akhir (Kas Fisik):</span>
              <span class="font-data">Rp {{ formatNumber(eodData.actualCashCounted) }}</span>
            </div>
            <div
              class="flex justify-between font-bold pt-1 px-1.5 py-0.5 rounded"
              :class="eodData.cashDiscrepancy === 0 ? 'bg-emerald-50 text-emerald-800' : (eodData.cashDiscrepancy < 0 ? 'bg-rose-50 text-rose-800' : 'bg-sky-50 text-sky-800')"
            >
              <span>Selisih (Variance):</span>
              <span class="font-data">
                {{ eodData.cashDiscrepancy === 0 ? 'Rp 0 (SEIMBANG)' : (eodData.cashDiscrepancy > 0 ? '+ Rp ' + formatNumber(eodData.cashDiscrepancy) + ' (LEBIH)' : '- Rp ' + formatNumber(Math.abs(eodData.cashDiscrepancy)) + ' (KURANG)') }}
              </span>
            </div>
            <div class="flex justify-between text-indigo-900 font-black pt-1 bg-indigo-50/60 px-1.5 py-0.5 rounded">
              <span>Saldo Stor (Disetor):</span>
              <span class="font-data">Rp {{ formatNumber(eodData.depositCash) }}</span>
            </div>
          </div>

          <!-- 3. Payment Channels Section -->
          <div class="border-b border-dashed border-slate-300 pb-2.5 mb-2.5 space-y-1 text-[10px]">
            <div class="font-bold text-slate-900 uppercase tracking-wide text-center bg-slate-100 py-0.5 rounded">
              [ PENERIMAAN NON-TUNAI ]
            </div>
            <div class="flex justify-between text-slate-600 pt-1">
              <span>QRIS ({{ eodData.qrisTxCount || 0 }} tx):</span>
              <span class="font-data font-bold text-slate-900">Rp {{ formatNumber(eodData.qrisSales) }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Transfer BCA ({{ eodData.transferTxCount || 0 }} tx):</span>
              <span class="font-data font-bold text-slate-900">Rp {{ formatNumber(eodData.transferSales) }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Kartu Debit ({{ eodData.debitTxCount || 0 }} tx):</span>
              <span class="font-data font-bold text-slate-900">Rp {{ formatNumber(eodData.debitSales) }}</span>
            </div>
            <div class="flex justify-between text-slate-900 font-black pt-1 border-t border-dotted border-slate-200">
              <span>Total Non-Tunai:</span>
              <span class="font-data">Rp {{ formatNumber(eodData.totalNonCashSales) }}</span>
            </div>
          </div>

          <!-- 4. Financial Sales & Profit Summary -->
          <div class="border-b border-dashed border-slate-300 pb-2.5 mb-2.5 space-y-1 text-[11px]">
            <div class="font-bold text-slate-900 uppercase text-[10px] tracking-wide text-center bg-slate-100 py-0.5 rounded">
              [ RINGKASAN OMZET & PROFIT ]
            </div>
            <div class="flex justify-between text-slate-900 font-black text-xs pt-1">
              <span>TOTAL OMZET BERSIH:</span>
              <span class="font-data text-emerald-800">Rp {{ formatNumber(eodData.totalGrossRevenue) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 text-[10px]">
              <span>(-) HPP Pembelian Obat:</span>
              <span class="font-data">Rp {{ formatNumber(eodData.totalCOGS) }}</span>
            </div>
            <div class="flex justify-between text-emerald-800 font-black text-[11px] bg-emerald-50/70 px-1 py-0.5 rounded">
              <span>PROFIT (Laba Kotor):</span>
              <span class="font-data">Rp {{ formatNumber(eodData.grossProfit) }} ({{ eodData.profitMargin }}%)</span>
            </div>
          </div>

          <!-- 5. Audit Trail Info -->
          <div class="border-b border-dashed border-slate-300 pb-2 mb-2 text-[9px] text-slate-500 space-y-0.5">
            <div class="flex justify-between">
              <span>User Update:</span>
              <span class="font-semibold text-slate-700">{{ eodData.userUpdate || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tanggal Update:</span>
              <span class="font-semibold text-slate-700">{{ eodData.dateUpdate || '-' }}</span>
            </div>
          </div>

          <!-- Signature Section -->
          <div class="pt-1 text-[9px] text-center text-slate-600">
            <div class="grid grid-cols-2 gap-3 pt-3 pb-2">
              <div class="space-y-6">
                <span>Kasir Bertugas,</span>
                <p class="font-bold border-b border-slate-400 pb-1">({{ eodData.employeeName || 'Afin Riyandika' }})</p>
              </div>
              <div class="space-y-6">
                <span>Penanggung Jawab,</span>
                <p class="font-bold border-b border-slate-400 pb-1">(Apt. Sarah Maulida)</p>
              </div>
            </div>
            <p class="text-[8px] text-slate-400 mt-2">=== DOKUMEN INTERNAL TUTUP KASIR RESMI ===</p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50">
        <button
          @click="$emit('close')"
          class="btn-cp-secondary text-xs px-4 py-2"
        >
          Tutup
        </button>
        <button
          @click="printThermal"
          class="btn-cp-primary text-xs px-5 py-2 flex items-center gap-1.5 shadow-md"
        >
          <Printer class="w-3.5 h-3.5" />
          <span>Cetak ke Printer Thermal (80mm)</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Printer, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  eodData: { type: Object, default: () => ({}) },
});

defineEmits(['close']);

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('id-ID');
};

const printThermal = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #eod-thermal-receipt,
  #eod-thermal-receipt * {
    visibility: visible;
  }
  #eod-thermal-receipt {
    position: fixed;
    left: 0;
    top: 0;
    width: 80mm !important;
    max-width: 80mm !important;
    margin: 0 !important;
    padding: 3mm !important;
    background: white !important;
    color: black !important;
    font-size: 11px !important;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
