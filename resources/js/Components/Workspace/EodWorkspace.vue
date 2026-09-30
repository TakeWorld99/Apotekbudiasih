<template>
  <section class="space-y-5">
    <!-- 1. Header & Filter Panel (Rentang Tanggal & Tombol Tampilkan) -->
    <div class="cp-card p-5 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-200/70 shadow-2xs shrink-0">
              <CalendarCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">
                Laporan End Of Day (EOD) - Tutup Kasir Toko
              </h3>
              <p class="text-[11px] text-slate-500">
                Pilih rentang tanggal (dari kapan sampai kapan) lalu klik <strong>Tampilkan Data Rekap</strong> untuk melihat laporan keuangan & kas.
              </p>
            </div>
          </div>
        </div>

        <!-- Status Badge jika data sudah digenerate -->
        <div v-if="isEodGenerated" class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ eodTransactions.length }} Transaksi Ditemukan
          </span>
          <button
            type="button"
            @click="handleResetEod"
            class="btn-cp-secondary text-xs py-1.5 px-3 text-slate-600 hover:text-slate-800 cursor-pointer"
            title="Ganti rentang tanggal"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Ubah Filter</span>
          </button>
        </div>
      </div>

      <!-- Date Range Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div class="sm:col-span-4 lg:col-span-3">
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Dari Tanggal:
          </label>
          <div class="relative">
            <Clock class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              v-model="eodStartDate"
              type="date"
              class="cp-input pl-9 text-xs font-semibold text-slate-800 w-full cursor-pointer"
            />
          </div>
        </div>

        <div class="sm:col-span-4 lg:col-span-3">
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Sampai Tanggal:
          </label>
          <div class="relative">
            <Clock class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              v-model="eodEndDate"
              type="date"
              class="cp-input pl-9 text-xs font-semibold text-slate-800 w-full cursor-pointer"
            />
          </div>
        </div>

        <div class="sm:col-span-4 lg:col-span-3">
          <button
            type="button"
            @click="handleGenerateEod"
            class="w-full bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search class="w-4 h-4 stroke-[2.5]" />
            <span>Tampilkan Data Rekap</span>
          </button>
        </div>

        <!-- Presets Cepat -->
        <div class="sm:col-span-12 lg:col-span-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span class="text-[10px] text-slate-400 font-semibold shrink-0">Preset:</span>
          <button
            type="button"
            @click="setEodPreset('today'); handleGenerateEod()"
            class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            @click="setEodPreset('7days'); handleGenerateEod()"
            class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            7 Hari
          </button>
          <button
            type="button"
            @click="setEodPreset('thisMonth'); handleGenerateEod()"
            class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            @click="setEodPreset('all'); handleGenerateEod()"
            class="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] border border-emerald-200 transition-colors cursor-pointer"
          >
            Semua
          </button>
        </div>
      </div>
    </div>

    <!-- STATE 1: SEBELUM DATA DIGENERATE -->
    <div
      v-if="!isEodGenerated"
      class="cp-card p-10 text-center space-y-4 max-w-2xl mx-auto border-dashed border-2 border-slate-200 bg-white/80"
    >
      <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
        <CalendarCheck class="w-8 h-8 stroke-[1.5]" />
      </div>

      <div class="space-y-1.5">
        <h4 class="text-base font-bold text-slate-800">
          Pilih Periode Tanggal Laporan
        </h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Tentukan rentang tanggal transaksi di atas, kemudian klik tombol <strong>"Tampilkan Data Rekap"</strong> untuk memuat ringkasan omzet, rekonsiliasi kas laci, dan rincian transaksi kasir.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-left">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">Langkah 1</span>
          <p class="text-xs font-bold text-slate-800 mt-1">Pilih Tanggal</p>
          <p class="text-[10px] text-slate-500 mt-0.5">Tentukan dari tanggal berapa sampai berapa data ingin dilihat.</p>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.5 rounded">Langkah 2</span>
          <p class="text-xs font-bold text-slate-800 mt-1">Tampilkan Rekap</p>
          <p class="text-[10px] text-slate-500 mt-0.5">Sistem mengkalkulasi omzet, laba kotor, dan penerimaan kas.</p>
        </div>
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span class="text-[10px] font-bold text-sky-700 bg-sky-100/60 px-1.5 py-0.5 rounded">Langkah 3</span>
          <p class="text-xs font-bold text-slate-800 mt-1">Cetak & Ekspor</p>
          <p class="text-[10px] text-slate-500 mt-0.5">Cetak slip thermal 80mm atau unduh berkas PDF & Excel.</p>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="button"
          @click="setEodPreset('all'); handleGenerateEod()"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-emerald-200"
        >
          <span>Tampilkan Seluruh Data Tersedia</span>
          <span>➔</span>
        </button>
      </div>
    </div>

    <!-- STATE 2: SETELAH DATA DIGENERATE -->
    <template v-else>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="font-bold text-slate-800">Periode Terpilih:</span>
          <span class="font-bold text-emerald-800 font-data bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
            {{ eodStartDate }} s/d {{ eodEndDate }}
          </span>
          <span class="text-slate-400">·</span>
          <span class="text-slate-600 font-medium"><strong>{{ eodTransactions.length }}</strong> faktur ditemukan</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            @click="$emit('open-thermal-modal', eodPayloadData)"
            class="btn-cp-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Cetak struk rekap tutup kasir ke printer thermal 80mm"
          >
            <Printer class="w-4 h-4 text-emerald-600" />
            <span>Cetak Slip (80mm)</span>
          </button>

          <button
            type="button"
            @click="exportEODToExcel"
            class="btn-cp-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Ekspor rekap EOD ke Excel"
          >
            <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            @click="exportEODToPDF"
            class="btn-cp-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-slate-700 cursor-pointer"
            title="Unduh laporan EOD resmi bertandatangan"
          >
            <FileText class="w-4 h-4 text-indigo-600" />
            <span>Unduh PDF</span>
          </button>

          <button
            type="button"
            @click="saveEodRecord"
            class="btn-cp-primary text-xs py-1.5 px-3.5 shadow-md flex items-center gap-1.5 bg-[#047857] hover:bg-[#065f46] text-white cursor-pointer"
            title="Simpan & Validasi Tutup Kasir EOD ke PostgreSQL"
          >
            <Save class="w-4 h-4" />
            <span>Simpan EOD</span>
          </button>
        </div>
      </div>

      <!-- Empat Kartu Metrik Utama -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div class="cp-card p-4 border-l-4 border-l-emerald-600 bg-white">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Total Omzet Penjualan</span>
            <DollarSign class="w-4 h-4 text-emerald-600" />
          </div>
          <h4 class="text-2xl font-black text-slate-900 font-data mt-1.5">
            Rp {{ formatNumber(eodTotalGrossRevenue) }}
          </h4>
          <p class="text-[10px] text-slate-400 mt-1">Dari {{ eodTotalInvoices }} faktur penjualan</p>
        </div>

        <div class="cp-card p-4 border-l-4 border-l-slate-400 bg-white">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Penerimaan Kas Tunai</span>
            <Wallet class="w-4 h-4 text-slate-500" />
          </div>
          <h4 class="text-2xl font-black text-slate-900 font-data mt-1.5">
            Rp {{ formatNumber(eodCashSales) }}
          </h4>
          <p class="text-[10px] text-slate-400 mt-1">{{ eodCashTxCount }} transaksi tunai</p>
        </div>

        <div class="cp-card p-4 border-l-4 border-l-indigo-600 bg-white">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Penerimaan Non-Tunai</span>
            <CreditCard class="w-4 h-4 text-indigo-600" />
          </div>
          <h4 class="text-2xl font-black text-indigo-950 font-data mt-1.5">
            Rp {{ formatNumber(eodTotalNonCashSales) }}
          </h4>
          <p class="text-[10px] text-slate-400 mt-1">QRIS, Debit & Transfer</p>
        </div>

        <div class="cp-card p-4 border-l-4 border-l-teal-600 bg-white">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium">Laba Kotor Toko</span>
            <TrendingUp class="w-4 h-4 text-teal-600" />
          </div>
          <h4 class="text-2xl font-black text-teal-900 font-data mt-1.5">
            Rp {{ formatNumber(eodGrossProfit) }}
          </h4>
          <p class="text-[10px] text-teal-700 font-semibold mt-1">Margin {{ eodProfitMargin }}% dari omzet</p>
        </div>
      </div>

      <!-- Rekonsiliasi Kas Laci Fisik -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-8 cp-card p-5 space-y-3 bg-white">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Coins class="w-4 h-4 text-[#047857]" />
              <span>Rekonsiliasi Kas Fisik Laci (Cash Reconciliation)</span>
            </h4>
            <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Laci Kasir Utama
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span class="text-[10px] text-slate-500 font-medium block">1. Saldo Awal Laci (Float)</span>
              <span class="text-sm font-bold text-slate-800 font-data block mt-0.5">Rp {{ formatNumber(eodStartingCash) }}</span>
              <span class="text-[10px] text-slate-400">Modal receh kembalian</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span class="text-[10px] text-slate-500 font-medium block">2. Penjualan Tunai Bersih</span>
              <span class="text-sm font-bold text-emerald-700 font-data block mt-0.5">+ Rp {{ formatNumber(eodCashSales) }}</span>
              <span class="text-[10px] text-slate-400">Penerimaan kas sistem</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span class="text-[10px] text-slate-500 font-medium block">3. Kas Kecil (Petty Cash)</span>
              <span class="text-sm font-bold text-rose-600 font-data block mt-0.5">- Rp {{ formatNumber(eodPettyExpense) }}</span>
              <span class="text-[10px] text-slate-400 truncate block">{{ eodPettyExpenseNote || 'Tidak ada pengeluaran' }}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target Kas Sistem (Uang Seharusnya di Laci)</span>
              <div class="text-xl font-black font-data text-emerald-400">Rp {{ formatNumber(eodTargetSystemCash) }}</div>
            </div>
            <div class="sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kas Fisik Aktual Dihitung</span>
              <div class="text-xl font-black font-data text-white">Rp {{ formatNumber(eodActualCashCounted) }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 cp-card p-5 flex flex-col justify-between bg-white">
          <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span>Status Selisih Kas (Variance)</span>
            </h4>
            <div
              class="p-4 rounded-xl text-center border"
              :class="eodCashDiscrepancy === 0 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : (eodCashDiscrepancy < 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-blue-50 border-blue-200 text-blue-900')"
            >
              <span class="text-[11px] font-bold block uppercase tracking-wider">
                {{ eodCashDiscrepancy === 0 ? 'Kas Laci 100% Klop / Sesuai' : (eodCashDiscrepancy < 0 ? 'Kas Fisik Kurang (Defisit)' : 'Kas Fisik Berlebih (Surplus)') }}
              </span>
              <div class="text-2xl font-black font-data mt-1">
                {{ eodCashDiscrepancy === 0 ? 'Rp 0' : (eodCashDiscrepancy > 0 ? '+Rp ' + formatNumber(eodCashDiscrepancy) : '-Rp ' + formatNumber(Math.abs(eodCashDiscrepancy))) }}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 mt-3">
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Koreksi Kas Fisik Aktual (Rp):</label>
            <input
              v-model.number="eodActualCashCounted"
              type="number"
              class="cp-input text-xs font-mono font-bold text-slate-900 w-full"
            />
          </div>
        </div>
      </div>

      <!-- Tabel Transaksi Kasir -->
      <div class="cp-card p-5 space-y-4 bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 class="text-sm font-bold text-slate-900">Rincian Faktur Penjualan Kasir</h4>
            <p class="text-xs text-slate-500">Periode {{ eodStartDate }} s/d {{ eodEndDate }} (Total {{ eodTransactions.length }} Transaksi)</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-2.5 px-3">No. Faktur</th>
                <th class="py-2.5 px-3">Waktu</th>
                <th class="py-2.5 px-3">Kasir</th>
                <th class="py-2.5 px-3">Pelanggan</th>
                <th class="py-2.5 px-3">Item Obat</th>
                <th class="py-2.5 px-3">Metode</th>
                <th class="py-2.5 px-3 text-right">Total Bayar</th>
                <th class="py-2.5 px-3 text-center">Struk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="tx in eodTransactions" :key="tx.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-2.5 px-3 font-mono font-semibold text-slate-900">{{ tx.invoice_number }}</td>
                <td class="py-2.5 px-3 text-[11px] text-slate-500">{{ tx.created_at ? tx.created_at.slice(0, 16) : '-' }}</td>
                <td class="py-2.5 px-3 font-medium">{{ tx.cashier_name || eodEmployeeName }}</td>
                <td class="py-2.5 px-3">{{ tx.customer_name }}</td>
                <td class="py-2.5 px-3 max-w-[200px] truncate text-[11px] text-slate-600">
                  {{ tx.details ? tx.details.map(d => `${d.name} (${d.qty})`).join(', ') : '-' }}
                </td>
                <td class="py-2.5 px-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="tx.payment_method === 'Cash' ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'">
                    {{ tx.payment_method }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-bold text-slate-900 font-data">
                  Rp {{ formatNumber(tx.total_amount) }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    @click="$emit('view-receipt', tx)"
                    class="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Cetak Struk"
                  >
                    <Printer class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
              <tr v-if="eodTransactions.length === 0">
                <td colspan="8" class="text-center py-8 text-slate-400 text-xs">
                  Tidak ada transaksi pada periode {{ eodStartDate }} s/d {{ eodEndDate }}.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel Arsip Rekap EOD di PostgreSQL -->
      <div class="cp-card p-5 space-y-4 bg-white">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Database class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900">Arsip Tutup Kasir EOD (Tersimpan di Database PostgreSQL)</h4>
              <p class="text-xs text-slate-500">Histori penutupan kasir harian & validasi fisik laci yang tersimpan permanen</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {{ pharmacyStore.eodReports.length }} Rekap Tersimpan
            </span>
            <button
              type="button"
              @click="pharmacyStore.fetchEodReportsFromDb()"
              class="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Segarkan Data dari Database"
            >
              <RefreshCw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-2.5 px-3">Tanggal Laporan</th>
                <th class="py-2.5 px-3">Kasir Bertugas</th>
                <th class="py-2.5 px-3 text-right">Saldo Awal</th>
                <th class="py-2.5 px-3 text-right">Total Omzet</th>
                <th class="py-2.5 px-3 text-right">Kas Fisik Laci</th>
                <th class="py-2.5 px-3 text-right">Selisih</th>
                <th class="py-2.5 px-3 text-center">Faktur</th>
                <th class="py-2.5 px-3">Waktu Validasi</th>
                <th class="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="arch in pharmacyStore.eodReports" :key="arch.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-2.5 px-3 font-medium text-slate-900 font-data">{{ arch.report_date }}</td>
                <td class="py-2.5 px-3">
                  <div class="font-medium text-slate-900">{{ arch.employee_name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ arch.employee_nik || arch.employee_role }}</div>
                </td>
                <td class="py-2.5 px-3 text-right font-data">Rp {{ formatNumber(arch.starting_cash) }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-700 font-data">Rp {{ formatNumber(arch.total_gross_revenue) }}</td>
                <td class="py-2.5 px-3 text-right font-data font-medium">Rp {{ formatNumber(arch.actual_cash_counted) }}</td>
                <td class="py-2.5 px-3 text-right font-data font-semibold" :class="Number(arch.cash_discrepancy) < 0 ? 'text-rose-600' : (Number(arch.cash_discrepancy) > 0 ? 'text-blue-600' : 'text-emerald-700')">
                  {{ Number(arch.cash_discrepancy) === 0 ? 'Rp 0 (Sesuai)' : (Number(arch.cash_discrepancy) > 0 ? '+Rp ' + formatNumber(arch.cash_discrepancy) : '-Rp ' + formatNumber(Math.abs(arch.cash_discrepancy))) }}
                </td>
                <td class="py-2.5 px-3 text-center font-data">
                  <span class="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px]">{{ arch.total_invoices }}</span>
                </td>
                <td class="py-2.5 px-3 text-[11px] text-slate-500">
                  {{ arch.date_update || arch.created_at ? String(arch.date_update || arch.created_at).slice(0, 16).replace('T', ' ') : '-' }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    @click="loadArchivedEod(arch)"
                    class="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                  >
                    Muat Data
                  </button>
                </td>
              </tr>
              <tr v-if="pharmacyStore.eodReports.length === 0">
                <td colspan="9" class="text-center py-6 text-slate-400 text-xs">
                  Belum ada arsip penutupan kasir EOD yang tersimpan di database. Klik tombol "Simpan EOD" di atas untuk menyimpan rekap hari ini ke PostgreSQL.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import { useNotificationStore } from '@/Stores/notificationStore';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  CalendarCheck, Clock, RefreshCw, Search, Printer,
  FileSpreadsheet, FileText, Save, DollarSign, Wallet,
  CreditCard, TrendingUp, Coins, CheckCircle2, Database,
} from 'lucide-vue-next';

defineEmits(['view-receipt', 'open-thermal-modal']);

const pharmacyStore = usePharmacyStore();
const notify = useNotificationStore();

const formatNumber = (num) => Math.round(Number(num) || 0).toLocaleString('id-ID');

const eodStoreName = ref('Apotek Budi Asih');
const eodEmployeeNik = ref('2026010188');
const eodEmployeeName = ref('Afin Riyandika');
const eodEmployeeRole = ref('Admin & Pemilik Sarana Apotek (PSA)');
const eodOpenCashierDateTime = ref(`${new Date().toISOString().slice(0, 10)} 07:00 WIB`);
const eodCloseCashierDateTime = ref(`${new Date().toISOString().slice(0, 10)} 20:00 WIB`);
const eodUserUpdate = ref('Afin Riyandika (Admin)');
const eodDateUpdate = ref(`${new Date().toISOString().slice(0, 10)} 20:05:00`);

const isEodGenerated = ref(true);
const eodStartDate = ref(new Date().toISOString().slice(0, 10));
const eodEndDate = ref(new Date().toISOString().slice(0, 10));

const eodStartingCash = ref(250000);
const eodActualCashCounted = ref(394000);
const eodPettyExpense = ref(25000);
const eodPettyExpenseNote = ref('Pembelian Air Mineral Galon & Plastik Klip Obat');

const eodDate = computed(() => {
  if (!eodStartDate.value && !eodEndDate.value) return new Date().toISOString().slice(0, 10);
  if (eodStartDate.value === eodEndDate.value) return eodStartDate.value;
  return `${eodStartDate.value} s/d ${eodEndDate.value}`;
});

const handleGenerateEod = () => {
  if (!eodStartDate.value) eodStartDate.value = new Date().toISOString().slice(0, 10);
  if (!eodEndDate.value) eodEndDate.value = eodStartDate.value;
  if (eodStartDate.value > eodEndDate.value) {
    const tmp = eodStartDate.value;
    eodStartDate.value = eodEndDate.value;
    eodEndDate.value = tmp;
  }
  isEodGenerated.value = true;
  notify.success(`Data rekap EOD periode ${eodStartDate.value} s/d ${eodEndDate.value} berhasil dimuat!`, 'Filter Tanggal Aktif');
};

const handleResetEod = () => {
  isEodGenerated.value = false;
};

const setEodPreset = (type) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (type === 'today') {
    eodStartDate.value = formatDate(now);
    eodEndDate.value = formatDate(now);
  } else if (type === '7days') {
    const past7 = new Date();
    past7.setDate(past7.getDate() - 6);
    eodStartDate.value = formatDate(past7);
    eodEndDate.value = formatDate(now);
  } else if (type === 'thisMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    eodStartDate.value = formatDate(firstDay);
    eodEndDate.value = formatDate(now);
  } else {
    eodStartDate.value = '2026-01-01';
    eodEndDate.value = formatDate(now);
  }
};

const eodTransactions = computed(() => {
  const start = eodStartDate.value || '2000-01-01';
  const end = eodEndDate.value || '2099-12-31';

  return pharmacyStore.transactions.filter(t => {
    let txDate = '';
    if (t.created_at) {
      txDate = typeof t.created_at === 'string' ? t.created_at.slice(0, 10) : new Date(t.created_at).toISOString().slice(0, 10);
    }
    return txDate >= start && txDate <= end;
  });
});

const eodCashTransactions = computed(() => eodTransactions.value.filter(t => t.payment_method === 'Cash'));
const eodCashSales = computed(() => eodCashTransactions.value.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0));
const eodCashTxCount = computed(() => eodCashTransactions.value.length);

const eodQrisTransactions = computed(() => eodTransactions.value.filter(t => t.payment_method === 'QRIS'));
const eodQrisSales = computed(() => eodQrisTransactions.value.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0));
const eodQrisTxCount = computed(() => eodQrisTransactions.value.length);

const eodTransferTransactions = computed(() => eodTransactions.value.filter(t => t.payment_method === 'Transfer'));
const eodTransferSales = computed(() => eodTransferTransactions.value.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0));
const eodTransferTxCount = computed(() => eodTransferTransactions.value.length);

const eodDebitTransactions = computed(() => eodTransactions.value.filter(t => t.payment_method === 'Debit'));
const eodDebitSales = computed(() => eodDebitTransactions.value.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0));
const eodDebitTxCount = computed(() => eodDebitTransactions.value.length);

const eodTotalNonCashSales = computed(() => eodQrisSales.value + eodTransferSales.value + eodDebitSales.value);
const eodTotalGrossRevenue = computed(() => eodCashSales.value + eodTotalNonCashSales.value);
const eodTargetSystemCash = computed(() => Number(eodStartingCash.value) + eodCashSales.value - Number(eodPettyExpense.value));
const eodCashDiscrepancy = computed(() => Number(eodActualCashCounted.value) - Number(eodTargetSystemCash.value));

const eodTotalDiscounts = computed(() => eodTransactions.value.reduce((acc, t) => acc + (Number(t.discount_amount) || 0), 0));
const eodTotalTuslahEmbalase = computed(() => eodTransactions.value.reduce((acc, t) => acc + (Number(t.tuslah_fee) || 0) + (Number(t.embalase_fee) || 0), 0));

const eodTotalCOGS = computed(() => {
  let cogs = 0;
  eodTransactions.value.forEach(tx => {
    if (Array.isArray(tx.details)) {
      tx.details.forEach(d => {
        const med = pharmacyStore.medicines.find(m => m.id === d.medicine_id);
        const buyPrice = med && med.purchase_price ? Number(med.purchase_price) : Number(d.price) * 0.7;
        cogs += buyPrice * (Number(d.qty) || 1);
      });
    }
  });
  return cogs;
});

const eodGrossProfit = computed(() => Math.max(0, eodTotalGrossRevenue.value - eodTotalCOGS.value));
const eodProfitMargin = computed(() => {
  if (eodTotalGrossRevenue.value === 0) return '0.0';
  return ((eodGrossProfit.value / eodTotalGrossRevenue.value) * 100).toFixed(1);
});
const eodTotalInvoices = computed(() => eodTransactions.value.length);
const eodAverageBasket = computed(() => {
  if (eodTotalInvoices.value === 0) return 0;
  return Math.round(eodTotalGrossRevenue.value / eodTotalInvoices.value);
});

const eodPayloadData = computed(() => ({
  storeName: eodStoreName.value,
  employeeNik: eodEmployeeNik.value,
  employeeName: eodEmployeeName.value,
  employeeRole: eodEmployeeRole.value,
  date: eodDate.value,
  openCashierDateTime: eodOpenCashierDateTime.value,
  closeCashierDateTime: eodCloseCashierDateTime.value,
  userUpdate: eodUserUpdate.value,
  dateUpdate: eodDateUpdate.value,
  startingCash: Number(eodStartingCash.value),
  actualCashCounted: Number(eodActualCashCounted.value),
  depositCash: Math.max(0, Number(eodActualCashCounted.value) - Number(eodStartingCash.value)),
  pettyExpense: Number(eodPettyExpense.value),
  pettyExpenseNote: eodPettyExpenseNote.value,
  cashSales: eodCashSales.value,
  cashTxCount: eodCashTxCount.value,
  targetSystemCash: eodTargetSystemCash.value,
  cashDiscrepancy: eodCashDiscrepancy.value,
  qrisSales: eodQrisSales.value,
  qrisTxCount: eodQrisTxCount.value,
  transferSales: eodTransferSales.value,
  transferTxCount: eodTransferTxCount.value,
  debitSales: eodDebitSales.value,
  debitTxCount: eodDebitTxCount.value,
  totalNonCashSales: eodTotalNonCashSales.value,
  totalGrossRevenue: eodTotalGrossRevenue.value,
  totalDiscounts: eodTotalDiscounts.value,
  totalTuslahEmbalase: eodTotalTuslahEmbalase.value,
  totalCOGS: eodTotalCOGS.value,
  grossProfit: eodGrossProfit.value,
  profitMargin: Number(eodProfitMargin.value),
  totalInvoices: eodTotalInvoices.value,
  averageBasket: eodAverageBasket.value,
  notes: 'Tutup kasir harian terverifikasi sistem PostgreSQL.',
}));

const saveEodRecord = async () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formattedNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  eodDateUpdate.value = formattedNow;
  eodUserUpdate.value = `${pharmacyStore.currentUser.name} (${pharmacyStore.currentUser.role})`;
  
  const saved = await pharmacyStore.saveEodToDb({
    ...eodPayloadData.value,
    dateUpdate: formattedNow,
    userUpdate: eodUserUpdate.value,
  });

  confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  if (saved?.backup?.fileName) {
    notify.success(`Laporan EOD berhasil disimpan & cadangan database otomatis dibuat (${saved.backup.fileName})!`, 'Tutup Kasir & Cadangan Otomatis Berhasil');
  } else {
    notify.success(`Laporan EOD ${eodStoreName.value} Tanggal ${eodDate.value} berhasil disimpan dan divalidasi ke database PostgreSQL oleh ${eodUserUpdate.value}!`, 'Laporan EOD Tersimpan di DB');
  }
};

const loadArchivedEod = (arch) => {
  if (arch.report_date) {
    if (arch.report_date.includes(' s/d ')) {
      const parts = arch.report_date.split(' s/d ');
      eodStartDate.value = parts[0].trim();
      eodEndDate.value = parts[1].trim();
    } else {
      eodStartDate.value = arch.report_date.trim();
      eodEndDate.value = arch.report_date.trim();
    }
  }
  if (arch.actual_cash_counted !== undefined) {
    eodActualCashCounted.value = Number(arch.actual_cash_counted);
  }
  if (arch.starting_cash !== undefined) {
    eodStartingCash.value = Number(arch.starting_cash);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  notify.info(`Data EOD tanggal ${arch.report_date} dimuat dari arsip database.`, 'Arsip EOD Dimuat');
};

const exportEODToExcel = () => {
  const wb = XLSX.utils.book_new();
  const summaryData = [
    { Parameter: 'Nama Apotek / Cabang', Nilai: eodStoreName.value },
    { Parameter: 'Tanggal EOD', Nilai: eodDate.value },
    { Parameter: 'Kasir Bertugas', Nilai: eodEmployeeName.value },
    { Parameter: 'Saldo Awal Laci / Float (Rp)', Nilai: eodStartingCash.value },
    { Parameter: 'Penerimaan Kasir Tunai (Rp)', Nilai: eodCashSales.value },
    { Parameter: 'Pengeluaran Kas Kecil / Petty (Rp)', Nilai: eodPettyExpense.value },
    { Parameter: 'Target Kas Sistem Laci (Rp)', Nilai: eodTargetSystemCash.value },
    { Parameter: 'Saldo Akhir / Kas Fisik Laci (Rp)', Nilai: eodActualCashCounted.value },
    { Parameter: 'Selisih Kas Fisik / Variance (Rp)', Nilai: eodCashDiscrepancy.value },
    { Parameter: 'Total Penerimaan Non-Tunai (Rp)', Nilai: eodTotalNonCashSales.value },
    { Parameter: 'Total Omzet Bersih / Net Sales (Rp)', Nilai: eodTotalGrossRevenue.value },
    { Parameter: 'Estimasi Beban Pokok / HPP Obat (Rp)', Nilai: eodTotalCOGS.value },
    { Parameter: 'Profit / Laba Kotor Toko (Rp)', Nilai: eodGrossProfit.value },
    { Parameter: 'Margin Profit (%)', Nilai: `${eodProfitMargin.value}%` },
    { Parameter: 'Total Faktur Selesai', Nilai: `${eodTotalInvoices.value} Faktur` },
  ];
  const ws1 = XLSX.utils.json_to_sheet(summaryData);

  const invoiceData = eodTransactions.value.map(tx => ({
    'No. Faktur': tx.invoice_number,
    'Waktu': tx.created_at,
    'Kasir': tx.cashier_name || eodEmployeeName.value,
    'Pelanggan': tx.customer_name,
    'Metode': tx.payment_method,
    'Total (Rp)': tx.total_amount,
  }));
  const ws2 = XLSX.utils.json_to_sheet(invoiceData);

  XLSX.utils.book_append_sheet(wb, ws1, 'Rekapitulasi EOD');
  XLSX.utils.book_append_sheet(wb, ws2, 'Rincian Faktur');

  const safeDateSlug = eodStartDate.value === eodEndDate.value ? eodStartDate.value : `${eodStartDate.value}_sd_${eodEndDate.value}`;
  XLSX.writeFile(wb, `Laporan_EOD_Apotek_Budi_Asih_${safeDateSlug}.xlsx`);
  notify.success('Laporan EOD berhasil diekspor ke format Excel (.xlsx)!', 'Ekspor Excel Berhasil');
};

const exportEODToPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(eodStoreName.value.toUpperCase(), 105, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('SIA: 442/109/SIA/DPMPTSP/2022 · SIPA: 19950812/SIPA_32.73/2022/2045', 105, 20, { align: 'center' });
  doc.text('Jl. Budi Asih Sehat No. 88, Bandung | Telp: (022) 720-8899', 105, 25, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN TUTUP KASIR HARIAN (END OF DAY / EOD)', 14, 35);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${eodDate.value} | Kasir: ${eodEmployeeName.value} (${eodEmployeeNik.value})`, 14, 40);

  const summaryRows = [
    ['Total Omzet Penjualan', `Rp ${formatNumber(eodTotalGrossRevenue.value)}`, 'Total Penerimaan Kas Tunai', `Rp ${formatNumber(eodCashSales.value)}`],
    ['Total Transaksi Non-Tunai', `Rp ${formatNumber(eodTotalNonCashSales.value)}`, 'Saldo Awal Laci (Float)', `Rp ${formatNumber(eodStartingCash.value)}`],
    ['Kas Kecil / Petty Cash Keluar', `Rp ${formatNumber(eodPettyExpense.value)}`, 'Target Kas Sistem Laci', `Rp ${formatNumber(eodTargetSystemCash.value)}`],
    ['Kas Fisik Laci Dihitung', `Rp ${formatNumber(eodActualCashCounted.value)}`, 'Selisih Kas Fisik (Variance)', eodCashDiscrepancy.value === 0 ? 'Rp 0 (Sesuai)' : (eodCashDiscrepancy.value > 0 ? '+Rp ' + formatNumber(eodCashDiscrepancy.value) : '-Rp ' + formatNumber(Math.abs(eodCashDiscrepancy.value)))],
    ['Estimasi HPP Obat (COGS)', `Rp ${formatNumber(eodTotalCOGS.value)}`, 'Laba Kotor Toko / Margin', `Rp ${formatNumber(eodGrossProfit.value)} (${eodProfitMargin.value}%)`]
  ];

  doc.autoTable({
    startY: 44,
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 50 },
      1: { fontStyle: 'bold', width: 45 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], width: 50 },
      3: { fontStyle: 'bold', width: 45 },
    },
  });

  const tableRows = eodTransactions.value.map(tx => [
    tx.invoice_number,
    tx.created_at ? tx.created_at.slice(11, 16) : '-',
    tx.customer_name,
    tx.payment_method,
    `Rp ${Number(tx.total_amount).toLocaleString('id-ID')}`
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['No. Faktur', 'Jam', 'Pelanggan', 'Metode', 'Total Bayar']],
    body: tableRows.slice(0, 35),
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [4, 120, 87] },
  });

  const safeDateSlug = eodStartDate.value === eodEndDate.value ? eodStartDate.value : `${eodStartDate.value}_sd_${eodEndDate.value}`;
  doc.save(`Laporan_EOD_Apotek_Budi_Asih_${safeDateSlug}.pdf`);
  notify.success('Laporan EOD berhasil diekspor ke PDF!', 'Ekspor PDF Berhasil');
};
</script>
