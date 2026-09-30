<template>
  <section class="space-y-6">
    <!-- ========================================================================= -->
    <!-- 1. HEADER CARD & ACTION TOOLBAR -->
    <!-- ========================================================================= -->
    <div class="cp-card p-5 sm:p-6 bg-white shadow-xs border border-slate-100 relative overflow-hidden">
      <!-- Ambient accent banner -->
      <div class="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <!-- Title & Subtitle -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 shrink-0">
            <ClipboardCheck class="w-6 h-6" />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Stok Opname (SO) & Rekonsiliasi Fisik
              </h2>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                MENU-06
              </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                SOP Siklus 4 Minggu Kemenkes & BPOM
              </span>
            </div>
            <p class="text-xs sm:text-[13px] text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Metode rotasi mingguan per kategori rak obat: <strong>Toko tetap buka normal (Mode Cut-off)</strong> & 100% seluruh master obat terhitung akurat setiap bulan.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Panduan SOP Workflow (Modal On-Demand) -->
          <button
            type="button"
            @click="showSopGuideModal = true"
            class="text-xs py-2 px-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            title="Pelajari alur operasional & regulasi Stock Opname BPOM/Kemenkes"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>Panduan Alur SOP</span>
          </button>

          <!-- Riwayat BASO Archive (Khusus Role Owner) -->
          <button
            v-if="isOwnerRole"
            type="button"
            @click="openBasoArchiveModal"
            class="text-xs py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            title="Buka arsip Berita Acara Stock Opname (Khusus Owner)"
          >
            <FileText class="w-4 h-4 text-emerald-700" />
            <span>Arsip BASO ({{ pharmacyStore.opnameReports.length }})</span>
          </button>

          <!-- Atur Jadwal SO (Admin) -->
          <button
            id="btn-open-schedule-modal"
            type="button"
            @click="openEditScheduleModal(pharmacyStore.opnameSchedules.find(s => s.status === 'Siap Dikerjakan') || pharmacyStore.opnameSchedules[0])"
            class="btn-cp-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-emerald-900/15 cursor-pointer font-bold rounded-xl"
            title="Atur jadwal, hari, jam cut-off, kategori, dan petugas penanggung jawab"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>+ Atur Jadwal SO</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. DASHBOARD METRIK SELISIH (4 KPI CARDS) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: SELISIH TOTAL FINANSIAL (RUPIAH NET) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" :class="opnameDashboardMetrics.netVarianceValue < 0 ? 'from-rose-500 to-amber-500' : opnameDashboardMetrics.netVarianceValue > 0 ? 'from-blue-500 to-indigo-500' : 'from-emerald-500 to-teal-400'"></div>
        <div>
          <div class="flex items-start justify-between">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              :class="opnameDashboardMetrics.netVarianceValue < 0 ? 'bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs' : opnameDashboardMetrics.netVarianceValue > 0 ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'"
            >
              <DollarSign class="w-5 h-5" />
            </div>
            <span
              class="text-[11px] font-bold px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 border"
              :class="[
                opnameDashboardMetrics.netVarianceValue < 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                opnameDashboardMetrics.netVarianceValue > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-emerald-50 text-emerald-800 border-emerald-200'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="opnameDashboardMetrics.netVarianceValue < 0 ? 'bg-rose-500' : opnameDashboardMetrics.netVarianceValue > 0 ? 'bg-blue-500' : 'bg-emerald-500'"
              ></span>
              {{ opnameDashboardMetrics.netVarianceValue < 0 ? 'Defisit Nilai' : opnameDashboardMetrics.netVarianceValue > 0 ? 'Surplus Nilai' : 'Akurat Seimbang' }}
            </span>
          </div>

          <div class="my-3">
            <p class="text-xs text-slate-500 font-semibold tracking-tight">Selisih Total (Nilai Finansial Net)</p>
            <h3
              class="text-2xl font-black font-mono mt-1 tracking-tight"
              :class="opnameDashboardMetrics.netVarianceValue < 0 ? 'text-rose-600' : opnameDashboardMetrics.netVarianceValue > 0 ? 'text-blue-700' : 'text-emerald-700'"
            >
              {{ opnameDashboardMetrics.netVarianceValue < 0 ? '-' : opnameDashboardMetrics.netVarianceValue > 0 ? '+' : '' }}Rp {{ formatNumber(Math.abs(opnameDashboardMetrics.netVarianceValue)) }}
            </h3>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-rose-600 font-semibold flex items-center gap-1">
            <span class="text-[11px] text-slate-400 font-medium">Loss:</span>
            <span class="font-mono font-bold">-Rp {{ formatNumber(opnameDashboardMetrics.totalLossValue) }}</span>
          </span>
          <span class="text-blue-600 font-semibold flex items-center gap-1">
            <span class="text-[11px] text-slate-400 font-medium">Surplus:</span>
            <span class="font-mono font-bold">+Rp {{ formatNumber(opnameDashboardMetrics.totalSurplusValue) }}</span>
          </span>
        </div>
      </div>

      <!-- KPI 2: AKURASI STOK MASTER (%) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
        <div>
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <PackageOpen class="w-5 h-5" />
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {{ opnameDashboardMetrics.accuracyRate }}% Akurasi Fisik
            </span>
          </div>

          <div class="my-3">
            <p class="text-xs text-slate-500 font-semibold tracking-tight">Kesesuaian Fisik Rak vs Sistem</p>
            <h3 class="text-2xl font-black font-mono mt-1 tracking-tight text-slate-900 flex items-baseline gap-1.5">
              <span>{{ opnameDashboardMetrics.totalDiscrepancyItems }}</span>
              <span class="text-xs font-bold text-slate-500 font-sans">Item Selisih</span>
            </h3>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span class="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{{ opnameDashboardMetrics.totalMatchedItems }} Item Cocok</span>
          </span>
          <span class="font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 font-mono text-[11px]">
            {{ opnameDashboardMetrics.totalCountedItems }} SKU Diaudit
          </span>
        </div>
      </div>

      <!-- KPI 3: JUMLAH UNIT FISIK -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-400"></div>
        <div>
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <Sliders class="w-5 h-5" />
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Kuantitas Fisik
            </span>
          </div>

          <div class="my-3">
            <p class="text-xs text-slate-500 font-semibold tracking-tight">Jumlah Selisih Fisik (Unit)</p>
            <h3 class="text-2xl font-black font-mono mt-1 tracking-tight text-slate-900 flex items-baseline gap-1.5">
              <span>{{ opnameDashboardMetrics.netUnits > 0 ? '+' : '' }}{{ opnameDashboardMetrics.netUnits }}</span>
              <span class="text-xs font-bold text-slate-500 font-sans">Unit Bersih</span>
            </h3>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-rose-600 font-semibold flex items-center gap-1 font-mono">
            -{{ opnameDashboardMetrics.totalMinusUnits }} Unit Kurang
          </span>
          <span class="text-blue-600 font-semibold flex items-center gap-1 font-mono">
            +{{ opnameDashboardMetrics.totalPlusUnits }} Unit Lebih
          </span>
        </div>
      </div>

      <!-- KPI 4: PROGRES SIKLUS BULANAN -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
        <div>
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <RefreshCw class="w-5 h-5" />
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              {{ opnameDashboardMetrics.cycleProgressPercent }}% Siklus
            </span>
          </div>

          <div class="my-3">
            <p class="text-xs text-slate-500 font-semibold tracking-tight">Capaian Audit Bulan Berjalan</p>
            <div class="flex items-baseline justify-between mt-1">
              <h3 class="text-2xl font-black font-mono tracking-tight text-slate-900 flex items-baseline gap-1.5">
                <span>{{ opnameDashboardMetrics.completedSchedulesCount }} / 4</span>
                <span class="text-xs font-bold text-slate-500 font-sans">Minggu Selesai</span>
              </h3>
            </div>
            <!-- Mini Progress Bar -->
            <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                class="h-full bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, Math.max(0, opnameDashboardMetrics.cycleProgressPercent))}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span class="font-medium text-slate-600">100% Target Kategori</span>
          <span class="font-bold text-emerald-700 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Toko Tetap Buka
          </span>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 4. ANALITIK STOCK OPNAME (CHART BATANG & AKURASI KATEGORI) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- KIRI (2 KOLOM): GRAFIK BATANG TREN SELISIH MINGGUAN -->
      <div class="lg:col-span-2 cp-card p-5 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 class="w-4 h-4 text-emerald-600" />
                Grafik Tren Selisih Fisik & Akurasi Mingguan
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Perbandingan Item Cocok vs Item Selisih per siklus rotasi 4 kategori</p>
            </div>

            <!-- Legend -->
            <div class="flex items-center gap-3 text-xs">
              <div class="flex items-center gap-1.5 font-medium text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span class="text-[11px]">Item Cocok (Akurat)</span>
              </div>
              <div class="flex items-center gap-1.5 font-medium text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span class="text-[11px]">Item Selisih (Varian)</span>
              </div>
            </div>
          </div>

          <!-- Chart Canvas Bars -->
          <div class="h-52 flex items-end justify-between gap-4 pt-6 pb-2 px-3 border-b border-slate-100 relative bg-gradient-to-t from-slate-50/50 to-transparent rounded-xl">
            <!-- Background Grid Guide Lines -->
            <div class="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200/60 pointer-events-none"></div>
            <div class="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200/60 pointer-events-none"></div>
            <div class="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200/60 pointer-events-none"></div>

            <!-- 4 Weeks Columns -->
            <div
              v-for="bar in opnameWeeklyChartData"
              :key="bar.weekNumber"
              class="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
            >
              <!-- Tooltip hover -->
              <div class="absolute -top-16 px-3 py-2 bg-slate-900 text-white text-[10.5px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 space-y-0.5">
                <div class="font-bold text-emerald-400">{{ bar.title }}</div>
                <div class="text-[10px] text-slate-300">{{ bar.categories }}</div>
                <div class="flex items-center gap-2 pt-1 text-[10px] font-mono border-t border-slate-800 mt-1">
                  <span class="text-emerald-300">✓ {{ bar.matchedItems }} Cocok</span>
                  <span :class="bar.discrepancyItems > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'">
                    ✕ {{ bar.discrepancyItems }} Selisih
                  </span>
                  <span v-if="bar.discrepancyItems > 0" class="text-amber-300">
                    (Rp {{ formatNumber(Math.abs(bar.varianceValue)) }})
                  </span>
                </div>
              </div>

              <!-- Double Bars (Matched vs Discrepancy) -->
              <div class="w-full max-w-[56px] flex items-end justify-center gap-1.5 h-full">
                <!-- Bar Item Cocok -->
                <div
                  class="w-1/2 rounded-t-md transition-all duration-300 relative group-hover:brightness-105"
                  :style="{ height: `${bar.matchedBarHeight}%` }"
                  :class="bar.hasReport || bar.isLiveCounting ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-xs' : 'bg-emerald-200/60'"
                >
                  <span v-if="bar.matchedItems > 0" class="absolute -top-4 inset-x-0 text-center text-[9.5px] font-bold text-emerald-800 font-mono">
                    {{ bar.matchedItems }}
                  </span>
                </div>

                <!-- Bar Item Selisih -->
                <div
                  class="w-1/2 rounded-t-md transition-all duration-300 relative group-hover:brightness-105"
                  :style="{ height: `${bar.discrepancyBarHeight}%` }"
                  :class="bar.discrepancyItems > 0 ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-xs' : 'bg-transparent'"
                >
                  <span v-if="bar.discrepancyItems > 0" class="absolute -top-4 inset-x-0 text-center text-[9.5px] font-bold text-rose-700 font-mono">
                    {{ bar.discrepancyItems }}
                  </span>
                </div>
              </div>

              <!-- Week labels -->
              <div class="text-center pt-1">
                <div class="text-xs font-bold text-slate-800">{{ bar.weekLabel }}</div>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                  :class="[
                    bar.isLiveCounting ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' :
                    bar.hasReport ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    'bg-slate-100 text-slate-600'
                  ]"
                >
                  {{ bar.isLiveCounting ? '● Live Hitung' : bar.hasReport ? '✓ Selesai' : 'Terjadwal' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Summary Info -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10.5px] text-slate-500 mt-3 pt-2 px-1 gap-1 border-t border-slate-100">
          <span>Data terhubung langsung ke Berita Acara (BASO) & sinkronisasi otomatis stok master</span>
          <span class="font-bold text-emerald-800">Tingkat Kesesuaian Rata-Rata: {{ opnameDashboardMetrics.accuracyRate }}%</span>
        </div>
      </div>

      <!-- KANAN (1 KOLOM): DISTRIBUSI KATEGORI & ALASAN SELISIH -->
      <div class="cp-card p-5 bg-white shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div class="border-b border-slate-100 pb-2 mb-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart class="w-4 h-4 text-emerald-600" />
              Akurasi per Kategori Obat
            </h3>
            <p class="text-[11px] text-slate-500">Persentase kecocokan fisik rak vs sistem apotek</p>
          </div>

          <!-- Category Accuracy Progress Bars -->
          <div class="space-y-2.5">
            <div
              v-for="cat in opnameCategoryBreakdown"
              :key="cat.id"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-700 truncate max-w-[150px]" :title="cat.name">
                  {{ cat.name }}
                </span>
                <span class="font-mono font-bold text-[11px]" :class="cat.accuracy < 100 ? 'text-rose-600' : 'text-emerald-700'">
                  {{ cat.accuracy }}% ({{ cat.matched }}/{{ cat.checked }})
                </span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="cat.color"
                  :style="{ width: `${cat.accuracy}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reason Distribution -->
        <div class="pt-2 border-t border-slate-100">
          <span class="text-xs font-bold text-slate-800 block mb-2">Penyebab Utama Selisih Fisik:</span>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="r in opnameReasonDistribution"
              :key="r.label"
              class="p-2 rounded-xl text-[10.5px] space-y-0.5 transition-all"
              :class="r.bgClass"
            >
              <div class="font-bold truncate" :class="r.textClass" :title="r.label">{{ r.label }}</div>
              <div class="flex items-center justify-between font-mono text-[10px] text-slate-600">
                <span>{{ r.count }} Kasus</span>
                <span class="font-bold">{{ r.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 5. SIKLUS 4 MINGGU ROTASI KATEGORI (ROADMAP BULANAN) -->
    <!-- ========================================================================= -->
    <div class="cp-card p-5 space-y-4 bg-white shadow-xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw class="w-4 h-4 text-emerald-600" />
            Jadwal Siklus 4 Minggu Bergilir (Rotasi Bulanan)
          </span>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Pemeriksaan bertahap 1–2 kategori per minggu (~25 menit) · Bebas tentukan hari & jam cut-off
          </p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            v-if="isOwnerRole"
            type="button"
            @click="handleResetOpnameSchedules"
            class="text-xs text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300/80 transition-colors shadow-2xs"
            title="Kembalikan siklus 4 minggu jadwal stock opname ke kondisi awal"
          >
            <RotateCcw class="w-3.5 h-3.5 text-slate-600" />
            <span>Reset Siklus SO</span>
          </button>
          <button
            id="btn-open-all-schedules"
            type="button"
            @click="openEditScheduleModal(pharmacyStore.opnameSchedules[0])"
            class="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors"
          >
            <CalendarCheck class="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Atur Jadwal Lengkap</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          v-for="sch in pharmacyStore.opnameSchedules"
          :key="sch.id"
          class="p-4 rounded-2xl transition-all relative overflow-hidden border"
          :class="[
            sch.week_number === activeOpnameWeek && isOpnameCountingActive
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/30 shadow-sm'
              : sch.status === 'Siap Dikerjakan'
              ? 'bg-white border-amber-300 shadow-xs hover:shadow-md'
              : sch.status === 'Selesai'
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
          ]"
        >
          <!-- Top Badge -->
          <div class="flex items-center justify-between gap-1 mb-2.5">
            <span
              class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg font-mono"
              :class="sch.status === 'Selesai' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800 font-bold'"
            >
              Minggu {{ sch.week_number }}
            </span>
            <span
              class="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              :class="[
                sch.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                sch.status === 'Siap Dikerjakan' ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' :
                'bg-slate-100 text-slate-600'
              ]"
            >
              {{ sch.status }}
            </span>
          </div>

          <!-- Title & Categories -->
          <h4 class="font-bold text-xs text-slate-900 line-clamp-1 mb-1">{{ sch.title }}</h4>
          <div class="text-[11px] text-emerald-800 font-medium line-clamp-1 mb-2.5">
            🏷️ {{ sch.category_names }}
          </div>

          <!-- Details -->
          <div class="space-y-1.5 text-[11px] text-slate-500 pt-2.5 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <span>Waktu:</span>
              <span class="font-semibold text-slate-700 font-mono">{{ sch.day }}, {{ sch.time }} WIB</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Petugas:</span>
              <span class="font-semibold text-slate-700 truncate max-w-[120px]" :title="sch.assigned_user">{{ sch.assigned_user }}</span>
            </div>
          </div>

          <!-- Quick Action Button per Card -->
          <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              @click="openEditScheduleModal(sch)"
              class="text-[11px] text-slate-600 hover:text-emerald-800 font-bold cursor-pointer flex items-center gap-1"
            >
              <span>Ubah</span>
            </button>

            <!-- Mulai Hitung Button -->
            <button
              v-if="sch.status === 'Siap Dikerjakan' && !isOpnameCountingActive"
              type="button"
              @click="startCountingSession(sch)"
              class="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>Mulai Hitung ▶</span>
            </button>
            <template v-else-if="sch.status === 'Selesai'">
              <button
                v-if="isOwnerRole"
                type="button"
                @click="viewBasoForSchedule(sch)"
                class="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileCheck class="w-3.5 h-3.5" />
                <span>Lihat BASO</span>
              </button>
              <span
                v-else
                class="text-[11px] text-slate-500 font-medium flex items-center gap-1"
                title="Riwayat Berita Acara hanya dapat diakses oleh role Owner"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                <span>Selesai (Arsip Owner)</span>
              </span>
            </template>
            <button
              v-else-if="sch.status === 'Terjadwal' && !isOpnameCountingActive"
              type="button"
              @click="startCountingSession(sch)"
              class="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[10.5px] font-bold transition-colors cursor-pointer"
            >
              Mulai Lebih Awal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 6. LEMBAR KERJA HITUNG FISIK AKTIF (COUNTING WORKSHEET) -->
    <!-- ========================================================================= -->
    <div
      v-if="isOpnameCountingActive"
      id="counting-worksheet"
      class="cp-card overflow-hidden border-2 border-emerald-500 shadow-xl rounded-3xl animate-in fade-in duration-300"
    >
      <!-- Worksheet Header Banner -->
      <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
              ● Lembar Kerja Hitung Fisik Aktif
            </span>
            <h3 class="text-base sm:text-lg font-bold text-white tracking-tight">
              {{ currentActiveSchedule?.title || 'Stock Opname Mingguan' }}
            </h3>
          </div>
          <p class="text-xs text-emerald-100/90 mt-1 flex flex-wrap items-center gap-2">
            <span>Kategori: <strong>{{ currentActiveSchedule?.category_names }}</strong></span>
            <span>•</span>
            <span>Petugas: <strong>{{ currentActiveSchedule?.assigned_user }}</strong></span>
            <span>•</span>
            <span class="text-amber-300 font-medium">⚡ Kasir tetap melayani (Mode Cut-off Aktif)</span>
          </p>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            @click="isOpnameCountingActive = false"
            class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup Sementara
          </button>
          <button
            type="button"
            @click="submitCountSheetToAdmin(currentActiveSchedule)"
            class="px-4.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 class="w-4 h-4 text-emerald-950" />
            <span>✓ Kirim ke Admin untuk Rekonsiliasi</span>
          </button>
        </div>
      </div>

      <!-- Smart Filter & Fast Action Toolbar -->
      <div class="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <!-- Search and Status Tabs -->
        <div class="flex flex-wrap items-center gap-2 flex-1">
          <!-- Search input -->
          <div class="relative w-full sm:w-64">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              v-model="worksheetSearchQuery"
              type="text"
              class="cp-input text-xs pl-9 pr-3 py-2 bg-white"
              placeholder="Cari nama obat / SKU rak..."
            />
          </div>

          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
            <button
              type="button"
              @click="worksheetFilter = 'all'"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
              :class="worksheetFilter === 'all' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            >
              Semua ({{ opnameDraftItems.length }})
            </button>
            <button
              type="button"
              @click="worksheetFilter = 'discrepancy'"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              :class="worksheetFilter === 'discrepancy' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-700'"
            >
              <span>⚠️ Selisih</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="worksheetFilter === 'discrepancy' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'">
                {{ opnameCountingSummary.discrepancies }}
              </span>
            </button>
            <button
              type="button"
              @click="worksheetFilter = 'matched'"
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              :class="worksheetFilter === 'matched' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'"
            >
              <span>✓ Cocok</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="worksheetFilter === 'matched' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'">
                {{ opnameCountingSummary.matched }}
              </span>
            </button>
          </div>
        </div>

        <!-- Super Speed Actions (Game Changer) -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Tombol Samakan Semua ke Stok Sistem -->
          <button
            type="button"
            @click="handleAutoFillAllMatched"
            class="text-xs py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Isi otomatis semua hitungan fisik sama dengan stok sistem, lalu Anda hanya perlu menyesuaikan yang berselisih"
          >
            <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ Samakan Semua ke Stok Sistem</span>
          </button>

          <!-- Reset Semua -->
          <button
            type="button"
            @click="handleResetAllDraftCounts"
            class="text-xs py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset ulang stok fisik"
          >
            <RotateCcw class="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Worksheet Table -->
      <div class="overflow-x-auto">
        <table class="cp-table">
          <thead>
            <tr>
              <th class="w-10 text-center">No</th>
              <th>Nama Obat & Kategori</th>
              <th>Satuan</th>
              <th class="text-center font-mono">Stok Sistem</th>
              <th class="text-center w-44 font-mono">Hitungan Fisik Rak</th>
              <th class="text-center font-mono">Selisih Unit</th>
              <th class="text-right font-mono">Dampak Finansial (Rp)</th>
              <th class="w-64">Alasan & Catatan Selisih</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in filteredWorksheetItems"
              :key="item.medicine_id"
              class="hover:bg-slate-50 transition-colors"
              :class="item.variance !== 0 ? 'bg-amber-50/50' : ''"
            >
              <!-- Index -->
              <td class="text-center font-mono text-xs text-slate-400">{{ idx + 1 }}</td>

              <!-- Nama Obat & Kategori -->
              <td>
                <div class="font-bold text-xs text-slate-900">{{ item.name }}</div>
                <div class="flex items-center gap-2 mt-0.5 text-[10px]">
                  <span class="text-slate-400 font-mono">HPP: Rp {{ formatNumber(item.price) }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-emerald-800 font-semibold">{{ item.category_name }}</span>
                </div>
              </td>

              <!-- Satuan -->
              <td>
                <span class="text-xs font-semibold text-slate-700">{{ item.unit }}</span>
              </td>

              <!-- Stok Sistem (Snapshot) -->
              <td class="text-center font-mono font-bold text-xs text-slate-700">
                {{ item.system_stock }}
              </td>

              <!-- Input Hitung Fisik Taktil (Stepper + Keypad) -->
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    @click="item.physical_stock = Math.max(0, item.physical_stock - 1); updateOpnameItemVariance(item);"
                    class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center transition-all"
                    title="Kurang 1 unit"
                  >
                    -
                  </button>
                  <input
                    v-model.number="item.physical_stock"
                    type="number"
                    min="0"
                    @input="updateOpnameItemVariance(item)"
                    class="cp-input text-center font-mono font-black text-sm w-16 py-1 px-1"
                    :class="item.variance !== 0 ? 'border-amber-400 bg-amber-50/80 text-amber-950 ring-1 ring-amber-300' : 'border-emerald-400 text-emerald-950'"
                  />
                  <button
                    type="button"
                    @click="item.physical_stock++; updateOpnameItemVariance(item);"
                    class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center transition-all"
                    title="Tambah 1 unit"
                  >
                    +
                  </button>
                </div>
              </td>

              <!-- Status Selisih (Pcs) -->
              <td class="text-center">
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold inline-block"
                  :class="[
                    item.variance === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    item.variance < 0 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  ]"
                >
                  {{ item.variance === 0 ? '✓ Cocok' : (item.variance > 0 ? `+${item.variance}` : item.variance) }}
                </span>
              </td>

              <!-- Dampak Finansial (Rp) -->
              <td
                class="text-right font-mono font-bold text-xs"
                :class="[
                  item.variance === 0 ? 'text-slate-400' :
                  item.variance < 0 ? 'text-rose-700' :
                  'text-blue-700'
                ]"
              >
                {{ item.variance < 0 ? '-' : item.variance > 0 ? '+' : '' }}Rp {{ formatNumber(Math.abs(item.variance_value)) }}
              </td>

              <!-- Alasan Selisih Dropdown -->
              <td>
                <select
                  v-model="item.reason"
                  class="cp-input text-xs py-1"
                  :disabled="item.variance === 0"
                  :class="item.variance !== 0 ? 'border-amber-400 bg-amber-50/70 font-semibold text-slate-900 ring-1 ring-amber-300/40' : 'text-slate-400 bg-slate-50'"
                >
                  <option value="">-- Pilih Penyebab --</option>
                  <option value="Sesuai">Sesuai (Tidak Ada Selisih)</option>
                  <option value="Kemasan Rusak / Cacat Display">Kemasan Rusak / Cacat Display</option>
                  <option value="Bonus Supplier Belum Terinput">Bonus Supplier Belum Terinput</option>
                  <option value="Selisih Transaksi Kasir Eceran">Selisih Transaksi Kasir Eceran</option>
                  <option value="Salah Penempatan Rak Fisik">Salah Penempatan Rak Fisik</option>
                  <option value="Mendekati Kadaluarsa / Retur PBF">Mendekati Kadaluarsa / Retur PBF</option>
                </select>
              </td>
            </tr>

            <tr v-if="filteredWorksheetItems.length === 0">
              <td colspan="8" class="p-6 text-center text-xs text-slate-500">
                Tidak ada data obat yang sesuai dengan filter pencarian Anda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Sticky Summary Bar -->
      <div class="bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span class="text-slate-500">Total Diperiksa:</span>
            <span class="font-bold text-slate-900 ml-1 font-mono">{{ opnameCountingSummary.total }}</span>
          </div>
          <div>
            <span class="text-slate-500">Cocok:</span>
            <span class="font-bold text-emerald-700 ml-1 font-mono">{{ opnameCountingSummary.matched }}</span>
          </div>
          <div>
            <span class="text-slate-500">Selisih:</span>
            <span class="font-bold text-rose-600 ml-1 font-mono">{{ opnameCountingSummary.discrepancies }}</span>
          </div>
          <div>
            <span class="text-slate-500">Dampak Nilai Net:</span>
            <span
              class="font-black ml-1 font-mono text-sm"
              :class="opnameCountingSummary.varianceValue < 0 ? 'text-rose-700' : opnameCountingSummary.varianceValue > 0 ? 'text-blue-700' : 'text-emerald-700'"
            >
              {{ opnameCountingSummary.varianceValue < 0 ? '-' : opnameCountingSummary.varianceValue > 0 ? '+' : '' }}Rp {{ formatNumber(Math.abs(opnameCountingSummary.varianceValue)) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="isOpnameCountingActive = false"
            class="btn-cp-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            @click="submitCountSheetToAdmin(currentActiveSchedule)"
            class="btn-cp-primary text-xs py-2.5 px-5 font-bold shadow-md cursor-pointer flex items-center gap-1.5 rounded-xl"
          >
            <CheckSquare class="w-4 h-4" />
            <span>Kirim untuk Rekonsiliasi & BASO ▶</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 7. DEFAULT STATE (WHEN WORKSHEET IS NOT OPENED) -->
    <div v-else class="cp-card p-6 bg-gradient-to-br from-white to-emerald-50/20 border border-slate-200/90 space-y-4 shadow-xs">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono inline-block">
              Jadwal Tugas Berjalan
            </span>
            <span class="text-xs text-slate-400 font-medium">Bebas kapan saja memulai</span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            {{ pharmacyStore.opnameSchedules.find(s => s.status === 'Siap Dikerjakan')?.title || 'Minggu ke-2: Obat Keras (Ethical & Resep)' }}
          </h3>
          <p class="text-xs text-slate-600 max-w-2xl leading-relaxed">
            {{ pharmacyStore.opnameSchedules.find(s => s.status === 'Siap Dikerjakan')?.notes || 'Lakukan audit hitungan fisik di rak penyimpanan obat. Toko tetap melayani pelanggan secara normal.' }}
          </p>
        </div>

        <button
          type="button"
          @click="startCountingSession(pharmacyStore.opnameSchedules.find(s => s.status === 'Siap Dikerjakan') || pharmacyStore.opnameSchedules[0])"
          class="btn-cp-primary text-xs sm:text-sm py-3 px-6 shadow-md flex items-center gap-2 cursor-pointer font-bold whitespace-nowrap rounded-xl"
        >
          <CheckSquare class="w-4 h-4" />
          <span>Mulai Opname Fisik Minggu Ini ▶</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 1: ATUR JADWAL STOCK OPNAME (ADMIN) -->
    <!-- ========================================================================= -->
    <div
      v-if="showOpnameScheduleModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <!-- Header -->
        <div class="px-6 py-4.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-xs">
              <CalendarCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">Atur Jadwal Stock Opname (Admin)</h3>
              <p class="text-[11px] text-emerald-200/90 font-medium">Bebas memilih hari, jam cut-off, kategori, dan petugas pelaksana</p>
            </div>
          </div>
          <button
            type="button"
            @click="showOpnameScheduleModal = false"
            class="w-8 h-8 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSaveSchedule" class="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          <!-- Week Selector Tabs -->
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1.5">Pilih Siklus Mingguan / Ad-hoc:</label>
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                v-for="w in [1, 2, 3, 4]"
                :key="w"
                type="button"
                @click="switchOpnameScheduleInModal(w)"
                class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                :class="opnameEditForm.week_number === w ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
              >
                Minggu {{ w }}
              </button>
              <button
                type="button"
                @click="switchOpnameScheduleInModal(5)"
                class="py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                :class="opnameEditForm.week_number > 4 ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                title="Buat Jadwal Ad-hoc / Tambahan"
              >
                + Khusus
              </button>
            </div>
          </div>

          <!-- Status & Judul -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 mb-1">Status Penjadwalan</label>
              <select
                v-model="opnameEditForm.status"
                class="cp-input text-xs"
                required
              >
                <option value="Terjadwal">Terjadwal</option>
                <option value="Siap Dikerjakan">Siap Dikerjakan (Aktif)</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-800 mb-1">Judul / Keterangan Jadwal</label>
              <input
                v-model="opnameEditForm.title"
                type="text"
                class="cp-input text-xs"
                placeholder="Contoh: Minggu ke-2: Obat Keras (Ethical & Resep)"
                required
              />
            </div>
          </div>

          <!-- BEBAS MEMILIH HARI -->
          <div class="p-4 rounded-2xl bg-slate-50 space-y-2.5 border border-slate-100">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarCheck class="w-4 h-4 text-emerald-600" />
                <span>Bebas Pilih Hari Pelaksanaan</span>
              </label>
              <span class="text-[10.5px] text-slate-500">Klik hari rutin atau tanggal kalender</span>
            </div>

            <!-- Quick Day Buttons (Senin - Minggu) -->
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="d in ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']"
                :key="d"
                type="button"
                @click="setQuickDay(d)"
                class="py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center"
                :class="opnameEditForm.day.startsWith(d) ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 shadow-2xs'"
              >
                {{ d.slice(0, 3) }}
              </button>
            </div>

            <!-- Manual Date Picker & Custom Day Input -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label class="block text-[10.5px] font-semibold text-slate-600 mb-1">Pilih Tanggal Kalender (Spesifik):</label>
                <input
                  type="date"
                  :value="opnameEditForm.specific_date"
                  @input="handleDateChange"
                  class="cp-input text-xs"
                />
              </div>
              <div>
                <label class="block text-[10.5px] font-semibold text-slate-600 mb-1">Hari / Keterangan Jadwal:</label>
                <input
                  v-model="opnameEditForm.day"
                  type="text"
                  class="cp-input text-xs font-bold text-emerald-900"
                  placeholder="Contoh: Setiap Selasa / Akhir Bulan"
                  required
                />
              </div>
            </div>
          </div>

          <!-- BEBAS MEMILIH JAM CUT-OFF -->
          <div class="p-4 rounded-2xl bg-slate-50 space-y-2.5 border border-slate-100">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-emerald-600" />
                <span>Bebas Pilih Jam Cut-off (WIB)</span>
              </label>
              <span class="text-[10.5px] text-emerald-700 font-semibold font-mono">Toko Tetap Buka Normal</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <input
                v-model="opnameEditForm.time"
                type="time"
                class="cp-input text-sm font-black font-mono tracking-wider text-center max-w-[130px]"
                required
              />
              <div class="flex-1 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  @click="setQuickTime('08:30')"
                  class="py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                  :class="opnameEditForm.time === '08:30' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 shadow-2xs'"
                >
                  🌅 08:30 Pagi
                </button>
                <button
                  type="button"
                  @click="setQuickTime('13:00')"
                  class="py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                  :class="opnameEditForm.time === '13:00' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 shadow-2xs'"
                >
                  ☀️ 13:00 Siang
                </button>
                <button
                  type="button"
                  @click="setQuickTime('17:00')"
                  class="py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                  :class="opnameEditForm.time === '17:00' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 shadow-2xs'"
                >
                  🌆 17:00 Sore
                </button>
                <button
                  type="button"
                  @click="setQuickTime('21:30')"
                  class="py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                  :class="opnameEditForm.time === '21:30' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white hover:bg-slate-200 text-slate-700 shadow-2xs'"
                >
                  🌙 21:30 Tutup Toko
                </button>
              </div>
            </div>
          </div>

          <!-- Petugas Penanggung Jawab -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-800">Petugas Pelaksana Hitung Fisik</label>
              <span class="text-[10.5px] text-slate-400">Pilih staf atau ketik nama</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 mb-2">
              <button
                v-for="staff in availableStaffList"
                :key="staff"
                type="button"
                @click="opnameEditForm.assigned_user = staff"
                class="py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                :class="opnameEditForm.assigned_user === staff ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
              >
                {{ staff }}
              </button>
            </div>
            <input
              v-model="opnameEditForm.assigned_user"
              type="text"
              class="cp-input text-xs"
              placeholder="Nama apoteker / asisten apoteker bertugas"
              required
            />
          </div>

          <!-- Kategori Obat yang Ditargetkan (Multi-select) -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-slate-800">Pilih Kategori Obat yang Diaudit *</label>
              <button
                type="button"
                @click="toggleSelectAllOpnameCategories"
                class="text-[10.5px] text-emerald-800 hover:underline font-bold cursor-pointer"
              >
                {{ opnameEditForm.category_ids.length === pharmacyStore.categories.length ? '✕ Bersihkan Pilihan' : '✓ Pilih Semua Kategori' }}
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <label
                v-for="cat in pharmacyStore.categories"
                :key="cat.id"
                class="flex items-center gap-2 text-xs text-slate-800 cursor-pointer p-2 rounded-xl hover:bg-white transition-all"
                :class="opnameEditForm.category_ids?.includes(cat.id) ? 'font-bold text-emerald-900 bg-white shadow-2xs border border-emerald-200' : ''"
              >
                <input
                  type="checkbox"
                  :value="cat.id"
                  v-model="opnameEditForm.category_ids"
                  class="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span class="truncate">{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <!-- Instruksi / Catatan Lokasi Rak -->
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1">Catatan Lokasi Rak & Instruksi Khusus</label>
            <textarea
              v-model="opnameEditForm.notes"
              rows="2"
              class="cp-input text-xs"
              placeholder="Contoh: Periksa lemari obat keras A-01 s/d A-04 dan cek nomor batch kadaluarsa."
            ></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="showOpnameScheduleModal = false"
              class="text-xs py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn-cp-primary text-xs py-2 px-5 font-bold shadow-md cursor-pointer flex items-center gap-1.5 rounded-xl"
            >
              <Save class="w-4 h-4" />
              <span>Simpan Pengaturan Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 2: REVIEW SELISIH & APPROVAL REKONSILIASI (ADMIN / APJ) -->
    <!-- ========================================================================= -->
    <div
      v-if="showOpnameApprovalModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-xs">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-tight">Persetujuan & Rekonsiliasi Hasil Opname</h3>
              <p class="text-[11px] text-emerald-200/90 font-medium">Verifikasi selisih fisik sebelum sinkronisasi otomatis ke master stok</p>
            </div>
          </div>
          <button
            type="button"
            @click="showOpnameApprovalModal = false"
            class="w-8 h-8 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-slate-100 rounded-2xl">
              <div class="text-[10.5px] text-slate-500 font-medium">Total Diperiksa</div>
              <div class="text-base font-black text-slate-900 font-mono mt-0.5">{{ opnameApprovalPayload?.total_items || 0 }} Item</div>
            </div>
            <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div class="text-[10.5px] text-emerald-800 font-medium">Stok Akurat (Cocok)</div>
              <div class="text-base font-black text-emerald-900 font-mono mt-0.5">{{ opnameApprovalPayload?.matched_items || 0 }} Item</div>
            </div>
            <div class="p-3 bg-rose-50 rounded-2xl border border-rose-200">
              <div class="text-[10.5px] text-rose-700 font-medium">Ditemukan Selisih</div>
              <div class="text-base font-black text-rose-800 font-mono mt-0.5">{{ opnameApprovalPayload?.discrepancy_items_count || 0 }} Item</div>
            </div>
            <div class="p-3 bg-slate-100 rounded-2xl">
              <div class="text-[10.5px] text-slate-500 font-medium">Dampak Nilai Net</div>
              <div
                class="text-sm font-black font-mono mt-0.5"
                :class="(opnameApprovalPayload?.total_variance_value || 0) < 0 ? 'text-rose-600' : (opnameApprovalPayload?.total_variance_value || 0) > 0 ? 'text-blue-700' : 'text-emerald-700'"
              >
                Rp {{ formatNumber(Math.abs(opnameApprovalPayload?.total_variance_value || 0)) }}
              </div>
            </div>
          </div>

          <!-- Discrepancy Table -->
          <div>
            <h4 class="text-xs font-bold text-slate-800 mb-2">Rincian Item yang Mengalami Selisih Fisik:</h4>
            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th class="p-2.5">Nama Obat</th>
                    <th class="p-2.5 text-center">Stok Sistem</th>
                    <th class="p-2.5 text-center">Stok Fisik</th>
                    <th class="p-2.5 text-center">Selisih</th>
                    <th class="p-2.5 text-right">Nilai Selisih</th>
                    <th class="p-2.5">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-800">
                  <tr
                    v-for="item in (opnameApprovalPayload?.items || []).filter(i => i.variance !== 0)"
                    :key="item.medicine_id"
                    class="hover:bg-rose-50/40"
                  >
                    <td class="p-2.5">
                      <div class="font-bold text-slate-900">{{ item.name }}</div>
                      <div class="text-[10px] text-slate-500">{{ item.category_name }}</div>
                    </td>
                    <td class="p-2.5 text-center font-mono">{{ item.system_stock }}</td>
                    <td class="p-2.5 text-center font-mono font-bold">{{ item.physical_stock }}</td>
                    <td class="p-2.5 text-center">
                      <span
                        class="px-2 py-0.5 rounded-full font-mono font-bold text-[10.5px]"
                        :class="item.variance < 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'"
                      >
                        {{ item.variance > 0 ? '+' + item.variance : item.variance }}
                      </span>
                    </td>
                    <td class="p-2.5 text-right font-mono font-bold" :class="item.variance_value < 0 ? 'text-rose-700' : 'text-blue-700'">
                      Rp {{ formatNumber(Math.abs(item.variance_value)) }}
                    </td>
                    <td class="p-2.5 text-[11px] text-slate-600">
                      {{ item.reason || 'Koreksi Fisik' }}
                    </td>
                  </tr>
                  <tr v-if="(opnameApprovalPayload?.items || []).filter(i => i.variance !== 0).length === 0">
                    <td colspan="6" class="p-4 text-center text-xs text-slate-500">
                      Semua item 100% cocok dengan stok sistem. Tidak ada selisih.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Catatan Admin -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Catatan Persetujuan Admin / Apoteker</label>
            <textarea
              v-model="opnameAdminNotes"
              rows="2"
              class="cp-input text-xs"
              placeholder="Contoh: Telah diverifikasi fisik di rak dan disetujui untuk sinkronisasi master stok."
            ></textarea>
          </div>

          <!-- Alert System Action -->
          <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2.5">
            <CheckCircle2 class="w-5 h-5 text-emerald-700 shrink-0" />
            <div class="text-[11px] leading-relaxed">
              Dengan mengklik <strong>Setujui & Rekonsiliasi Otomatis</strong>, sistem akan otomatis memperbarui stok master obat di database PostgreSQL, mencatat mutasi riwayat ke <strong>Kartu Stok (Stock Log)</strong>, dan menerbitkan dokumen resmi <strong>Berita Acara (BASO)</strong>.
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="showOpnameApprovalModal = false"
              class="btn-cp-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Kembali Periksa
            </button>
            <button
              type="button"
              @click="handleApproveOpname"
              class="btn-cp-primary text-xs py-2.5 px-6 font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <FileCheck class="w-4 h-4 text-emerald-200" />
              <span>✓ Setujui & Rekonsiliasi Stok Otomatis</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 3: DOKUMEN RESMI BERITA ACARA STOCK OPNAME (BASO) & CETAK -->
    <!-- ========================================================================= -->
    <div
      v-if="showBasoModal && selectedBasoReport"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <!-- Action Header -->
        <div class="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2.5">
            <FileText class="w-4 h-4 text-emerald-400" />
            <span class="text-xs font-bold font-mono">Dokumen Resmi: {{ selectedBasoReport.report_no || selectedBasoReport.report_number }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="exportBasoToExcel(selectedBasoReport)"
              class="py-1 px-3 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              @click="printBasoDocument"
              class="py-1 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              @click="showBasoModal = false"
              class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Printable Document Body (A4 Style Paper View) -->
        <div id="basoPrintArea" class="p-8 space-y-6 overflow-y-auto bg-white text-slate-900">
          <!-- Letterhead Apotek Budi Asih -->
          <div class="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="/icon.png" alt="Logo" class="w-12 h-12 object-contain" />
              <div>
                <h1 class="text-lg font-black text-slate-900 tracking-tight uppercase">APOTEK BUDI ASIH</h1>
                <p class="text-[11px] text-slate-600 leading-tight">
                  Jl. Cikutra No. 182, Kota Bandung • Telp: (022) 7208192 • WhatsApp: 0812-8820-1928
                </p>
                <p class="text-[10px] text-slate-500 font-mono">
                  SIA: 442/0192/SIA-DINKES/2022 • SIPA: 19950812/SIPA_32.73/2022/2045
                </p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-block px-2.5 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] font-bold text-slate-800">
                {{ selectedBasoReport.report_no || selectedBasoReport.report_number }}
              </span>
              <p class="text-[10px] text-slate-500 mt-1">Status: Disetujui & Terekonsiliasi</p>
            </div>
          </div>

          <!-- Document Title -->
          <div class="text-center space-y-1">
            <h2 class="text-sm font-black uppercase tracking-widest text-slate-900 underline decoration-slate-400 underline-offset-4">
              BERITA ACARA STOCK OPNAME (BASO)
            </h2>
            <p class="text-xs text-slate-600 font-medium">
              Siklus Mingguan: {{ selectedBasoReport.week_title || selectedBasoReport.schedule_title }}
            </p>
          </div>

          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="space-y-1">
              <div class="flex"><span class="w-32 text-slate-500">Tanggal Audit:</span><span class="font-bold text-slate-800 font-mono">{{ selectedBasoReport.execution_date || selectedBasoReport.performed_at }}</span></div>
              <div class="flex"><span class="w-32 text-slate-500">Petugas Hitung:</span><span class="font-bold text-slate-800">{{ selectedBasoReport.operator_name || selectedBasoReport.performed_by }}</span></div>
              <div class="flex"><span class="w-32 text-slate-500">Kategori Obat:</span><span class="font-bold text-emerald-800">{{ selectedBasoReport.category_names }}</span></div>
            </div>
            <div class="space-y-1">
              <div class="flex"><span class="w-36 text-slate-500">Disetujui Oleh:</span><span class="font-bold text-slate-800">{{ selectedBasoReport.approved_by }}</span></div>
              <div class="flex"><span class="w-36 text-slate-500">Waktu Persetujuan:</span><span class="font-mono text-slate-800">{{ selectedBasoReport.approved_at || selectedBasoReport.performed_at }}</span></div>
              <div class="flex"><span class="w-36 text-slate-500">Total Item Selisih:</span><span class="font-bold text-rose-600">{{ selectedBasoReport.discrepancy_items_count }} Item</span></div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="space-y-1.5">
            <div class="text-xs font-bold text-slate-800">Daftar Barang & Rincian Hasil Audit Fisik:</div>
            <table class="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead class="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th class="p-2 border border-slate-300 text-center w-8">No</th>
                  <th class="p-2 border border-slate-300">Nama Obat</th>
                  <th class="p-2 border border-slate-300 text-center">Satuan</th>
                  <th class="p-2 border border-slate-300 text-center font-mono">Stok Sistem</th>
                  <th class="p-2 border border-slate-300 text-center font-mono">Stok Fisik</th>
                  <th class="p-2 border border-slate-300 text-center font-mono">Selisih</th>
                  <th class="p-2 border border-slate-300 text-right font-mono">Nilai Selisih (Rp)</th>
                  <th class="p-2 border border-slate-300">Alasan / Catatan</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in selectedBasoReport.items"
                  :key="idx"
                  :class="item.variance !== 0 ? 'bg-amber-50/40' : ''"
                >
                  <td class="p-2 border border-slate-300 text-center font-mono">{{ idx + 1 }}</td>
                  <td class="p-2 border border-slate-300 font-semibold">{{ item.name }}</td>
                  <td class="p-2 border border-slate-300 text-center">{{ item.unit || 'Biji' }}</td>
                  <td class="p-2 border border-slate-300 text-center font-mono">{{ item.system_stock }}</td>
                  <td class="p-2 border border-slate-300 text-center font-mono font-bold">{{ item.physical_stock }}</td>
                  <td class="p-2 border border-slate-300 text-center font-mono font-bold">
                    <span :class="item.variance < 0 ? 'text-rose-700' : item.variance > 0 ? 'text-blue-700' : 'text-slate-600'">
                      {{ item.variance > 0 ? '+' + item.variance : item.variance }}
                    </span>
                  </td>
                  <td class="p-2 border border-slate-300 text-right font-mono font-bold">
                    {{ formatNumber(Math.abs(item.variance_value || 0)) }}
                  </td>
                  <td class="p-2 border border-slate-300 text-[10px] text-slate-600">
                    {{ item.reason || (item.variance === 0 ? 'Sesuai (Cocok)' : 'Koreksi Fisik') }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td colspan="6" class="p-2 border border-slate-300 text-right text-xs">
                    Total Dampak Finansial Net:
                  </td>
                  <td class="p-2 border border-slate-300 text-right font-mono text-xs" :class="(selectedBasoReport.total_variance_value || 0) < 0 ? 'text-rose-700' : 'text-blue-700'">
                    Rp {{ formatNumber(Math.abs(selectedBasoReport.total_variance_value || 0)) }}
                  </td>
                  <td class="p-2 border border-slate-300"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Notes -->
          <div class="text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
            <div class="font-bold text-slate-900">Catatan Verifikasi Admin / Apoteker:</div>
            <p>{{ selectedBasoReport.notes || 'Opname fisik telah diverifikasi dan stok master disinkronkan secara otomatis ke sistem.' }}</p>
          </div>

          <!-- Signatures Block -->
          <div class="grid grid-cols-2 gap-8 pt-4">
            <div class="text-center space-y-12">
              <div class="text-xs text-slate-600">Petugas Pelaksana Hitung Fisik,</div>
              <div class="border-b border-slate-400 w-48 mx-auto"></div>
              <div class="text-xs font-bold text-slate-900">
                ( {{ selectedBasoReport.operator_name || selectedBasoReport.performed_by || 'Petugas Apotek' }} )
              </div>
            </div>

            <div class="text-center space-y-12">
              <div class="text-xs text-slate-600">Apoteker Penanggung Jawab / Admin,</div>
              <div class="border-b border-slate-400 w-48 mx-auto"></div>
              <div class="text-xs font-bold text-slate-900">
                ( {{ selectedBasoReport.approved_by || 'Apoteker Penanggung Jawab' }} )
              </div>
            </div>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            @click="showBasoModal = false"
            class="btn-cp-secondary text-xs py-2 px-5 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 4: ARSIP RIWAYAT BERITA ACARA (BASO) -->
    <!-- ========================================================================= -->
    <div
      v-if="showBasoArchiveModal && isOwnerRole"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-950/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-300 shadow-xs">
              <FileCheck class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white tracking-tight">Riwayat Berita Acara Stock Opname (BASO)</h3>
                <span class="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-bold">
                  Khusus Owner
                </span>
              </div>
              <p class="text-[11px] text-emerald-200/90 font-medium">Arsip audit fisik mingguan & dokumen pertanggungjawaban stok resmi</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="pharmacyStore.opnameReports.length > 0"
              type="button"
              @click="confirmClearAllReports"
              :disabled="isDeletingReport"
              class="py-1 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 hover:text-white border border-rose-400/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Kosongkan seluruh riwayat arsip untuk membebaskan kapasitas penyimpanan"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-300" />
              <span>Kosongkan Arsip</span>
            </button>
            <button
              type="button"
              @click="showBasoArchiveModal = false"
              class="w-8 h-8 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Table Body -->
        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- Information & Storage Helper Banner -->
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
              <span class="text-[11.5px]">
                Akses Eksklusif <strong>Owner</strong>: Riwayat Berita Acara resmi (BASO). Hapus arsip berkala atau data uji coba agar kapasitas database tetap bersih dan hemat ruang penyimpanan.
              </span>
            </div>
            <span class="text-[11px] font-mono font-bold text-slate-500 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {{ pharmacyStore.opnameReports.length }} Dokumen
            </span>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th class="p-3">No. Berita Acara</th>
                  <th class="p-3">Siklus & Kategori</th>
                  <th class="p-3">Tanggal Audit</th>
                  <th class="p-3">Petugas</th>
                  <th class="p-3 text-center">Item Selisih</th>
                  <th class="p-3 text-right">Dampak Finansial</th>
                  <th class="p-3 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-800">
                <tr
                  v-for="rep in pharmacyStore.opnameReports"
                  :key="rep.id"
                  class="hover:bg-slate-50 transition-colors"
                >
                  <td class="p-3 font-mono font-bold text-emerald-900">
                    {{ rep.report_no || rep.report_number }}
                  </td>
                  <td class="p-3">
                    <div class="font-bold text-slate-900">{{ rep.week_title || rep.schedule_title }}</div>
                    <div class="text-[10px] text-slate-500">{{ rep.category_names }}</div>
                  </td>
                  <td class="p-3 text-slate-600 whitespace-nowrap font-mono">
                    {{ rep.execution_date || rep.performed_at }}
                  </td>
                  <td class="p-3 text-slate-700">
                    {{ rep.operator_name || rep.performed_by }}
                  </td>
                  <td class="p-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded-full font-bold text-[10.5px]"
                      :class="rep.discrepancy_items_count > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'"
                    >
                      {{ rep.discrepancy_items_count }} Item
                    </span>
                  </td>
                  <td class="p-3 text-right font-mono font-bold" :class="rep.total_variance_value < 0 ? 'text-rose-700' : 'text-blue-700'">
                    Rp {{ formatNumber(Math.abs(rep.total_variance_value)) }}
                  </td>
                  <td class="p-3 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        @click="openBasoPreview(rep)"
                        class="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-200 transition-colors text-[10.5px] cursor-pointer flex items-center gap-1"
                        title="Lihat Dokumen BASO"
                      >
                        <FileText class="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lihat</span>
                      </button>
                      <button
                        type="button"
                        @click="exportBasoToExcel(rep)"
                        class="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors text-[10.5px] cursor-pointer flex items-center gap-1"
                        title="Unduh Excel"
                      >
                        <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-700" />
                        <span>XLSX</span>
                      </button>
                      <!-- OPSI DELETE UNTUK MENGHEMAT PENYIMPANAN -->
                      <button
                        type="button"
                        @click="confirmDeleteReport(rep)"
                        :disabled="isDeletingReport"
                        class="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors text-[10.5px] cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        title="Hapus dokumen ini dari database penyimpanan"
                      >
                        <Trash2 class="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="pharmacyStore.opnameReports.length === 0">
                  <td colspan="7" class="p-8 text-center text-xs text-slate-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText class="w-5 h-5" />
                      </div>
                      <p class="font-medium">Belum ada riwayat Berita Acara Stock Opname yang tersimpan.</p>
                      <p class="text-[11px] text-slate-400">Penyimpanan database saat ini bersih dan optimal.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <button
              v-if="pharmacyStore.opnameReports.length > 0"
              type="button"
              @click="confirmClearAllReports"
              :disabled="isDeletingReport"
              class="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Semua (Kosongkan Penyimpanan)</span>
            </button>
          </div>
          <button
            type="button"
            @click="showBasoArchiveModal = false"
            class="btn-cp-secondary text-xs py-2 px-5 cursor-pointer font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL PANDUAN ALUR SOP STOCK OPNAME (ON-DEMAND) -->
    <!-- ========================================================================= -->
    <div
      v-if="showSopGuideModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4.5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-200">
              <ClipboardCheck class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-white tracking-tight">SOP & Alur Stock Opname Apotek</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Standar BPOM & Kemenkes
                </span>
              </div>
              <p class="text-xs text-emerald-100/80 mt-0.5">Metode rotasi 4 minggu bergilir per kategori rak obat: Toko tetap buka normal (Mode Cut-off)</p>
            </div>
          </div>
          <button
            type="button"
            @click="showSopGuideModal = false"
            class="w-8 h-8 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Content Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-5">
          <!-- 4 Langkah Golden Workflow -->
          <div>
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>4 Langkah Utama Operasional SO</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Langkah 1 -->
              <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Langkah 1
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">Role: Admin / APA</span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CalendarCheck class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jadwal & Kuota Kategori</span>
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Admin menentukan siklus mingguan (Minggu 1-4) per kategori rak obat. Toko tetap buka normal berkat cut-off cerdas tanpa perlu tutup apotek.
                </p>
              </div>

              <!-- Langkah 2 -->
              <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Langkah 2
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">Role: Petugas / AA</span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Audit & Hitung Fisik Rak</span>
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Petugas menghitung fisik rak obat. Gunakan tombol 'Samakan ke Stok Sistem' untuk efisiensi audit hingga 80% dan fokus teliti pada obat yang selisih.
                </p>
              </div>

              <!-- Langkah 3 -->
              <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Langkah 3
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">Role: Apoteker / Petugas</span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Review Selisih & Alasan</span>
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Sistem otomatis menghitung varian fisik vs sistem (Surplus / Defisit) dan kalkulasi nilai kerugian/keuntungan rupiah berdasarkan HPP obat.
                </p>
              </div>

              <!-- Langkah 4 -->
              <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Langkah 4
                  </span>
                  <span class="text-[11px] text-slate-400 font-medium">Role: APJ (SIPA) / Owner</span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rekonsiliasi & Terbit BASO</span>
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Apoteker Penanggung Jawab menyetujui hasil. Stok master di database otomatis disinkronkan, mutasi tercatat di Kartu Stok, dan BASO resmi siap cetak.
                </p>
              </div>
            </div>
          </div>

          <!-- 3 Prinsip Efisiensi Operasional -->
          <div class="pt-3 border-t border-slate-100">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Keunggulan & Kepatuhan Regulasi</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                  <Clock class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Efisiensi Waktu (~20 Menit)</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Membagi audit menjadi 4 minggu rotasi (1-2 kategori per minggu) mencegah kejenuhan petugas tanpa mengganggu jam operasional kasir.
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                  <Building2 class="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Mode Cut-off Cerdas</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Snapshot stok terkunci pada jam cut-off. Transaksi kasir penjualan tetap berjalan normal tanpa mengacaukan perhitungan fisik.
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div class="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                  <FileSpreadsheet class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Resmi BPOM & Dinkes</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-snug">
                  Otomatis menerbitkan Berita Acara Stock Opname (BASO) resmi dengan kop surat apotek, siap cetak PDF atau ekspor Excel (.xlsx).
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-500 font-medium">Apotek Budi Asih · Sistem Manajemen Stok Farmasi</span>
          <button
            type="button"
            @click="showSopGuideModal = false"
            class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import { useNotificationStore } from '@/Stores/notificationStore';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import {
  ClipboardCheck,
  FileText,
  ShieldCheck,
  DollarSign,
  PackageOpen,
  Sliders,
  RefreshCw,
  BarChart3,
  PieChart,
  CalendarCheck,
  CheckSquare,
  X,
  FileCheck,
  FileSpreadsheet,
  Clock,
  Save,
  CheckCircle2,
  Printer,
  Search,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Building2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Lock,
} from 'lucide-vue-next';

const pharmacyStore = usePharmacyStore();
const notify = useNotificationStore();

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('id-ID');
};

// ==================== WORKFLOW STATE & GUIDES ====================
const showSopGuideModal = ref(false);

// ==================== WEEKLY ROTATING STOCK OPNAME ====================
const activeOpnameWeek = ref(2);
const isOpnameCountingActive = ref(false);
const opnameDraftItems = ref([]);
const worksheetSearchQuery = ref('');
const worksheetFilter = ref('all'); // 'all' | 'discrepancy' | 'matched'

const showOpnameScheduleModal = ref(false);
const showOpnameApprovalModal = ref(false);
const showBasoModal = ref(false);
const showBasoArchiveModal = ref(false);
const isDeletingReport = ref(false);

const isOwnerRole = computed(() => {
  const role = pharmacyStore.currentUser?.role;
  return ['Owner', 'Admin'].includes(role) || (typeof role === 'string' && ['owner', 'admin'].includes(role.toLowerCase()));
});

const handleResetOpnameSchedules = async () => {
  const confirmed = await notify.confirm({
    title: 'Reset Siklus Jadwal Opname?',
    message: 'Tindakan ini akan mengembalikan status seluruh 4 minggu jadwal Stock Opname ke siklus baru (Minggu 1 siap dikerjakan). Apakah Anda yakin?',
    type: 'warning',
    confirmText: 'Ya, Reset Siklus',
    cancelText: 'Batal',
  });
  if (confirmed) {
    pharmacyStore.resetOpnameSchedules();
    notify.success('Siklus 4 minggu jadwal opname berhasil direset ke status awal.', 'Siklus Direset');
  }
};

const availableStaffList = computed(() => {
  const users = pharmacyStore.users || [];
  if (users.length > 0) {
    return users.map(u => `${u.name} (${u.role})`);
  }
  return [
    'Afin Riyandika (Owner)',
    'Indana Farhah (Apoteker)',
    'Budi Santoso (Kasir)',
    'Siti Rahmawati (Asisten Apoteker)',
  ];
});

const currentActiveSchedule = computed(() => {
  return pharmacyStore.opnameSchedules.find(s => s.week_number === activeOpnameWeek.value) || pharmacyStore.opnameSchedules[0];
});

const opnameEditForm = ref({
  id: null,
  week_number: 1,
  title: '',
  day: 'Senin',
  time: '21:30',
  specific_date: '',
  assigned_user: '',
  category_ids: [],
  notes: '',
  status: 'Terjadwal',
});

const selectedBasoReport = ref(null);
const opnameApprovalPayload = ref(null);
const opnameAdminNotes = ref('');

// On mount: fetch real reports from PostgreSQL DB
onMounted(() => {
  pharmacyStore.fetchOpnameReportsFromDb();
});

// ==================== FILTERED WORKSHEET ITEMS ====================
const filteredWorksheetItems = computed(() => {
  let list = opnameDraftItems.value;

  if (worksheetFilter.value === 'discrepancy') {
    list = list.filter(i => i.variance !== 0);
  } else if (worksheetFilter.value === 'matched') {
    list = list.filter(i => i.variance === 0);
  }

  if (worksheetSearchQuery.value.trim()) {
    const q = worksheetSearchQuery.value.toLowerCase().trim();
    list = list.filter(i => 
      (i.name && i.name.toLowerCase().includes(q)) ||
      (i.category_name && i.category_name.toLowerCase().includes(q)) ||
      (i.batch_no && i.batch_no.toLowerCase().includes(q))
    );
  }

  return list;
});

// ==================== ACTIONS: SCHEDULE MODAL ====================
const openEditScheduleModal = (sch) => {
  if (!sch) {
    sch = pharmacyStore.opnameSchedules[0] || {
      id: 1,
      week_number: 1,
      title: 'Minggu ke-1: Obat Bebas & Bebas Terbatas',
      day: 'Selasa',
      time: '08:30',
      assigned_user: 'Budi Santoso',
      category_ids: [2, 3],
      notes: '',
      status: 'Terjadwal'
    };
  }
  opnameEditForm.value = {
    id: sch.id,
    week_number: sch.week_number || 1,
    title: sch.title || '',
    day: sch.day || 'Senin',
    time: sch.time || '21:30',
    specific_date: sch.specific_date || '',
    assigned_user: sch.assigned_user || availableStaffList.value[0] || 'Afin Riyandika (Owner)',
    category_ids: [...(sch.category_ids || [])],
    notes: sch.notes || '',
    status: sch.status || 'Terjadwal',
  };
  showOpnameScheduleModal.value = true;
};

const switchOpnameScheduleInModal = (weekNum) => {
  const existing = pharmacyStore.opnameSchedules.find(s => s.week_number === weekNum);
  if (existing) {
    openEditScheduleModal(existing);
  } else {
    const nextId = pharmacyStore.opnameSchedules.length ? Math.max(...pharmacyStore.opnameSchedules.map(s => s.id)) + 1 : 1;
    opnameEditForm.value = {
      id: nextId,
      week_number: weekNum,
      title: `Jadwal Khusus: Audit Tambahan (Minggu ${weekNum})`,
      day: 'Senin',
      time: '21:30',
      specific_date: '',
      assigned_user: availableStaffList.value[0] || 'Afin Riyandika (Owner)',
      category_ids: pharmacyStore.categories.map(c => c.id),
      notes: 'Audit stok fisik rak khusus ad-hoc.',
      status: 'Terjadwal',
    };
  }
};

const setQuickDay = (dayName) => {
  opnameEditForm.value.day = dayName;
};

const handleDateChange = (e) => {
  const val = e.target.value;
  if (!val) return;
  opnameEditForm.value.specific_date = val;
  const d = new Date(val + 'T00:00:00');
  if (!isNaN(d.getTime())) {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayName = daysIndo[d.getDay()];
    opnameEditForm.value.day = `${dayName}, ${d.getDate()} ${monthsIndo[d.getMonth()]} ${d.getFullYear()}`;
  }
};

const setQuickTime = (timeStr) => {
  opnameEditForm.value.time = timeStr;
};

const toggleSelectAllOpnameCategories = () => {
  if (opnameEditForm.value.category_ids.length === pharmacyStore.categories.length) {
    opnameEditForm.value.category_ids = [];
  } else {
    opnameEditForm.value.category_ids = pharmacyStore.categories.map(c => c.id);
  }
};

const handleSaveSchedule = () => {
  const selectedCats = pharmacyStore.categories.filter(c => opnameEditForm.value.category_ids.includes(c.id));
  const categoryNames = selectedCats.map(c => c.name).join(', ') || 'Kategori Campuran';
  
  pharmacyStore.saveOpnameSchedule({
    ...opnameEditForm.value,
    category_names: categoryNames,
  });

  showOpnameScheduleModal.value = false;
  confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
  notify.success(`Jadwal Stock Opname "${opnameEditForm.value.title}" pada ${opnameEditForm.value.day} jam ${opnameEditForm.value.time} WIB berhasil disimpan.`, 'Jadwal Opname Tersimpan');
};

// ==================== ACTIONS: COUNTING SHEET ====================
const startCountingSession = (sch) => {
  if (!sch) return;
  activeOpnameWeek.value = sch.week_number;
  
  let matchedMeds = pharmacyStore.medicines.filter(m => (sch.category_ids || []).includes(m.category_id));
  if (matchedMeds.length === 0) {
    matchedMeds = pharmacyStore.medicines.slice(0, 10);
  }

  opnameDraftItems.value = matchedMeds.map(m => {
    const unitPrice = m.price || m.buy_price || 10000;
    return {
      medicine_id: m.id,
      name: m.name,
      category_id: m.category_id,
      category_name: m.category_name || (pharmacyStore.categories.find(c => c.id === m.category_id)?.name || 'Obat'),
      unit: m.unit || 'Biji',
      system_stock: Number(m.stock),
      physical_stock: Number(m.stock), // default set to system stock for faster flow
      variance: 0,
      price: unitPrice,
      variance_value: 0,
      reason: 'Sesuai',
      batch_no: m.batch_no || 'BATCH-REG',
      expiry_date: m.expiry_date || '2027-12-31',
    };
  });

  // Example discrepancy pre-population for week 2 demonstration if freshly initialized
  if (sch.week_number === 2 && opnameDraftItems.value.length > 1) {
    const item1 = opnameDraftItems.value[0];
    item1.physical_stock = Math.max(0, item1.system_stock - 2);
    item1.variance = -2;
    item1.variance_value = -2 * item1.price;
    item1.reason = 'Kemasan Rusak / Cacat Display';

    if (opnameDraftItems.value[1]) {
      const item2 = opnameDraftItems.value[1];
      item2.physical_stock = item2.system_stock + 1;
      item2.variance = 1;
      item2.variance_value = 1 * item2.price;
      item2.reason = 'Bonus Supplier Belum Terinput';
    }
  }

  worksheetFilter.value = 'all';
  worksheetSearchQuery.value = '';
  isOpnameCountingActive.value = true;

  // Smooth scroll into worksheet
  setTimeout(() => {
    const el = document.getElementById('counting-worksheet');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

const updateOpnameItemVariance = (item) => {
  item.physical_stock = Number(item.physical_stock) || 0;
  item.variance = item.physical_stock - item.system_stock;
  item.variance_value = item.variance * Number(item.price || 0);

  if (item.variance === 0) {
    item.reason = 'Sesuai';
  } else if (!item.reason || item.reason === 'Sesuai') {
    item.reason = item.variance < 0 ? 'Kemasan Rusak / Cacat Display' : 'Bonus Supplier Belum Terinput';
  }
};

const handleAutoFillAllMatched = () => {
  opnameDraftItems.value.forEach(item => {
    item.physical_stock = item.system_stock;
    item.variance = 0;
    item.variance_value = 0;
    item.reason = 'Sesuai';
  });
  notify.info('Seluruh hitungan fisik rak berhasil disamakan dengan stok sistem. Anda sekarang tinggal menyesuaikan item yang berbeda.', 'Auto-Fill Selesai');
};

const handleResetAllDraftCounts = () => {
  if (confirm('Reset ulang seluruh angka hitungan fisik rak ke 0?')) {
    opnameDraftItems.value.forEach(item => {
      item.physical_stock = 0;
      updateOpnameItemVariance(item);
    });
  }
};

const opnameCountingSummary = computed(() => {
  const total = opnameDraftItems.value.length;
  const matched = opnameDraftItems.value.filter(i => i.variance === 0).length;
  const discrepancies = opnameDraftItems.value.filter(i => i.variance !== 0).length;
  const varianceValue = opnameDraftItems.value.reduce((acc, i) => acc + (i.variance_value || 0), 0);

  return { total, matched, discrepancies, varianceValue };
});

// ==================== DASHBOARD METRICS & ANALYTICS ====================
const opnameDashboardMetrics = computed(() => {
  let totalCountedItems = 0;
  let totalMatchedItems = 0;
  let totalDiscrepancyItems = 0;
  let netVarianceValue = 0;
  let totalLossValue = 0;
  let totalSurplusValue = 0;
  let totalMinusUnits = 0;
  let totalPlusUnits = 0;

  pharmacyStore.opnameReports.forEach(rep => {
    totalCountedItems += Number(rep.total_items_counted || (rep.items ? rep.items.length : 0));
    totalMatchedItems += Number(rep.matched_items_count || 0);
    totalDiscrepancyItems += Number(rep.discrepancy_items_count || 0);
    netVarianceValue += Number(rep.total_variance_value || 0);

    if (rep.items && Array.isArray(rep.items)) {
      rep.items.forEach(it => {
        const vVal = Number(it.variance_value || 0);
        const vUnit = Number(it.variance || 0);
        if (vVal < 0) totalLossValue += Math.abs(vVal);
        if (vVal > 0) totalSurplusValue += vVal;
        if (vUnit < 0) totalMinusUnits += Math.abs(vUnit);
        if (vUnit > 0) totalPlusUnits += vUnit;
      });
    }
  });

  const accuracyRate = totalCountedItems > 0
    ? ((totalMatchedItems / totalCountedItems) * 100).toFixed(1)
    : '100.0';

  const completedSchedulesCount = pharmacyStore.opnameSchedules.filter(s => s.status === 'Selesai').length;
  const cycleProgressPercent = Math.round((completedSchedulesCount / 4) * 100);

  return {
    totalCountedItems,
    totalMatchedItems,
    totalDiscrepancyItems,
    netVarianceValue,
    totalLossValue,
    totalSurplusValue,
    totalMinusUnits,
    totalPlusUnits,
    netUnits: totalPlusUnits - totalMinusUnits,
    accuracyRate,
    completedSchedulesCount,
    cycleProgressPercent,
  };
});

const opnameWeeklyChartData = computed(() => {
  return [1, 2, 3, 4].map(wNum => {
    const sch = pharmacyStore.opnameSchedules.find(s => s.week_number === wNum);
    const rep = pharmacyStore.opnameReports.find(r => 
      r.schedule_id === (sch ? sch.id : null) || 
      (r.report_number && r.report_number.includes(`W0${wNum}`)) || 
      (r.report_no && r.report_no.includes(`W0${wNum}`)) || 
      (r.week_number === wNum)
    );

    let totalItems = 0;
    let matchedItems = 0;
    let discrepancyItems = 0;
    let varianceValue = 0;
    let minusUnits = 0;
    let plusUnits = 0;
    let isLiveCounting = false;

    if (rep) {
      totalItems = Number(rep.total_items_counted || (rep.items ? rep.items.length : 0));
      matchedItems = Number(rep.matched_items_count || 0);
      discrepancyItems = Number(rep.discrepancy_items_count || 0);
      varianceValue = Number(rep.total_variance_value || 0);
      if (rep.items) {
        rep.items.forEach(it => {
          if (it.variance < 0) minusUnits += Math.abs(it.variance);
          if (it.variance > 0) plusUnits += it.variance;
        });
      }
    } else if (sch && sch.week_number === activeOpnameWeek.value && isOpnameCountingActive.value) {
      isLiveCounting = true;
      totalItems = opnameDraftItems.value.length;
      matchedItems = opnameDraftItems.value.filter(i => i.variance === 0).length;
      discrepancyItems = opnameDraftItems.value.filter(i => i.variance !== 0).length;
      varianceValue = opnameCountingSummary.value.varianceValue;
      opnameDraftItems.value.forEach(it => {
        if (it.variance < 0) minusUnits += Math.abs(it.variance);
        if (it.variance > 0) plusUnits += it.variance;
      });
    } else if (sch) {
      const count = pharmacyStore.medicines.filter(m => (sch.category_ids || []).includes(m.category_id)).length;
      totalItems = count > 0 ? count : (wNum === 3 ? 3 : 2);
      matchedItems = totalItems;
      discrepancyItems = 0;
      varianceValue = 0;
    }

    const maxRef = 8;

    return {
      weekNumber: wNum,
      weekLabel: `Minggu ${wNum}`,
      title: sch ? sch.title : `Minggu ke-${wNum}`,
      categories: sch ? sch.category_names : 'Kategori Obat',
      status: isLiveCounting ? 'Sedang Dihitung (Live)' : (sch ? sch.status : 'Terjadwal'),
      totalItems,
      matchedItems,
      discrepancyItems,
      varianceValue,
      minusUnits,
      plusUnits,
      isLiveCounting,
      hasReport: !!rep,
      matchedBarHeight: Math.min(100, Math.max(14, Math.round((matchedItems / Math.max(totalItems, maxRef)) * 100))),
      discrepancyBarHeight: discrepancyItems > 0 ? Math.min(100, Math.max(22, Math.round((discrepancyItems / Math.max(totalItems, maxRef)) * 100))) : 0,
    };
  });
});

const opnameCategoryBreakdown = computed(() => {
  const categoryStats = {};
  pharmacyStore.categories.forEach(c => {
    categoryStats[c.id] = { id: c.id, name: c.name, checked: 0, matched: 0, discrepancy: 0, varianceVal: 0 };
  });

  pharmacyStore.opnameReports.forEach(rep => {
    if (rep.items) {
      rep.items.forEach(it => {
        const catId = it.category_id;
        if (categoryStats[catId]) {
          categoryStats[catId].checked++;
          if (it.variance === 0) categoryStats[catId].matched++;
          else {
            categoryStats[catId].discrepancy++;
            categoryStats[catId].varianceVal += (it.variance_value || 0);
          }
        }
      });
    }
  });

  if (isOpnameCountingActive.value) {
    opnameDraftItems.value.forEach(it => {
      const catId = it.category_id;
      if (categoryStats[catId]) {
        categoryStats[catId].checked++;
        if (it.variance === 0) categoryStats[catId].matched++;
        else {
          categoryStats[catId].discrepancy++;
          categoryStats[catId].varianceVal += (it.variance_value || 0);
        }
      }
    });
  }

  const activeCats = Object.values(categoryStats).filter(c => c.checked > 0);
  if (activeCats.length === 0) {
    return [
      { id: 1, name: 'Obat Keras', checked: 3, matched: 3, discrepancy: 0, accuracy: 100, varianceVal: 0, color: 'bg-rose-500' },
      { id: 2, name: 'Obat Bebas Terbatas', checked: 3, matched: 3, discrepancy: 0, accuracy: 100, varianceVal: 0, color: 'bg-blue-500' },
      { id: 3, name: 'Obat Bebas', checked: 2, matched: 2, discrepancy: 0, accuracy: 100, varianceVal: 0, color: 'bg-emerald-500' },
      { id: 4, name: 'Obat Jamu', checked: 2, matched: 2, discrepancy: 0, accuracy: 100, varianceVal: 0, color: 'bg-amber-500' },
      { id: 5, name: 'Obat Fitofarmaka', checked: 2, matched: 1, discrepancy: 1, accuracy: 50, varianceVal: -72000, color: 'bg-purple-500' },
    ];
  }

  const categoryColorMap = {
    1: 'bg-rose-500',
    2: 'bg-sky-500',
    3: 'bg-emerald-500',
    4: 'bg-amber-500',
    5: 'bg-purple-500',
  };
  return activeCats.map((c) => ({
    ...c,
    color: c.discrepancy > 0 ? 'bg-rose-500' : (categoryColorMap[c.id] || 'bg-slate-500'),
    accuracy: c.checked > 0 ? Math.round((c.matched / c.checked) * 100) : 100
  }));
});

const opnameReasonDistribution = computed(() => {
  const reasonsMap = {
    'Kemasan Rusak / Cacat Display': { label: 'Kemasan Rusak / Cacat Display', count: 0, color: 'bg-rose-500', barColor: 'bg-rose-500', textClass: 'text-rose-700', bgClass: 'bg-rose-50 border border-rose-200' },
    'Bonus Supplier Belum Terinput': { label: 'Bonus Supplier Belum Terinput', count: 0, color: 'bg-blue-500', barColor: 'bg-blue-500', textClass: 'text-blue-700', bgClass: 'bg-blue-50 border border-blue-200' },
    'Selisih Transaksi Kasir': { label: 'Selisih Transaksi Kasir Eceran', count: 0, color: 'bg-amber-500', barColor: 'bg-amber-500', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border border-amber-200' },
    'Salah Penempatan Rak': { label: 'Salah Penempatan Rak Fisik', count: 0, color: 'bg-teal-500', barColor: 'bg-teal-500', textClass: 'text-teal-700', bgClass: 'bg-teal-50 border border-teal-200' },
  };

  let totalDiscrepancies = 0;

  pharmacyStore.opnameReports.forEach(rep => {
    if (rep.items) {
      rep.items.forEach(it => {
        if (it.variance !== 0) {
          totalDiscrepancies++;
          const r = it.reason || '';
          if (r.toLowerCase().includes('rusak') || r.toLowerCase().includes('cacat') || r.toLowerCase().includes('bocor')) {
            reasonsMap['Kemasan Rusak / Cacat Display'].count++;
          } else if (r.toLowerCase().includes('bonus') || r.toLowerCase().includes('supplier') || r.toLowerCase().includes('faktur')) {
            reasonsMap['Bonus Supplier Belum Terinput'].count++;
          } else if (r.toLowerCase().includes('kasir') || r.toLowerCase().includes('jual')) {
            reasonsMap['Selisih Transaksi Kasir'].count++;
          } else {
            reasonsMap['Salah Penempatan Rak'].count++;
          }
        }
      });
    }
  });

  if (isOpnameCountingActive.value) {
    opnameDraftItems.value.forEach(it => {
      if (it.variance !== 0) {
        totalDiscrepancies++;
        const r = it.reason || '';
        if (r.toLowerCase().includes('rusak') || r.toLowerCase().includes('cacat')) {
          reasonsMap['Kemasan Rusak / Cacat Display'].count++;
        } else if (r.toLowerCase().includes('bonus') || r.toLowerCase().includes('supplier')) {
          reasonsMap['Bonus Supplier Belum Terinput'].count++;
        } else if (r.toLowerCase().includes('kasir')) {
          reasonsMap['Selisih Transaksi Kasir'].count++;
        } else {
          reasonsMap['Salah Penempatan Rak'].count++;
        }
      }
    });
  }

  if (totalDiscrepancies === 0) {
    return [
      { label: 'Kemasan Rusak / Cacat Display', count: 1, percent: 50, color: 'bg-rose-500', textClass: 'text-rose-700', bgClass: 'bg-rose-50 border border-rose-200' },
      { label: 'Bonus Supplier Belum Terinput', count: 1, percent: 50, color: 'bg-blue-500', textClass: 'text-blue-700', bgClass: 'bg-blue-50 border border-blue-200' },
      { label: 'Selisih Transaksi Kasir Eceran', count: 0, percent: 0, color: 'bg-amber-500', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border border-amber-200' },
      { label: 'Salah Penempatan Rak Fisik', count: 0, percent: 0, color: 'bg-teal-500', textClass: 'text-teal-700', bgClass: 'bg-teal-50 border border-teal-200' },
    ];
  }

  return Object.values(reasonsMap).map(r => ({
    ...r,
    percent: Math.round((r.count / Math.max(1, totalDiscrepancies)) * 100),
  }));
});

// ==================== ACTIONS: SUBMIT COUNT & APPROVAL ====================
const submitCountSheetToAdmin = (sch) => {
  if (!sch) sch = currentActiveSchedule.value;

  const summary = opnameCountingSummary.value;
  opnameApprovalPayload.value = {
    schedule_id: sch.id,
    week_number: sch.week_number,
    week_title: sch.title,
    category_names: sch.category_names,
    total_items: summary.total,
    matched_items: summary.matched,
    discrepancy_items_count: summary.discrepancies,
    total_variance_value: summary.varianceValue,
    operator_name: sch.assigned_user || pharmacyStore.currentUser?.name || 'Petugas Apotek',
    items: JSON.parse(JSON.stringify(opnameDraftItems.value)),
  };

  opnameAdminNotes.value = `Telah diverifikasi fisik di rak penyimpanan oleh ${sch.assigned_user || 'Petugas'}. Rekonsiliasi disetujui untuk sinkronisasi master stok Apotek Budi Asih.`;
  showOpnameApprovalModal.value = true;
};

const handleApproveOpname = async () => {
  if (!opnameApprovalPayload.value) return;

  const payload = {
    ...opnameApprovalPayload.value,
    notes: opnameAdminNotes.value,
    approved_by: pharmacyStore.currentUser ? `${pharmacyStore.currentUser.name} (${pharmacyStore.currentUser.role})` : 'Apoteker Penanggung Jawab',
  };

  const newReport = await pharmacyStore.executeOpnameApproval(payload);
  showOpnameApprovalModal.value = false;
  isOpnameCountingActive.value = false;

  confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  notify.success(`Rekonsiliasi Berhasil! Berita Acara ${newReport.report_no || newReport.report_number} diterbitkan dan stok master otomatis disinkronkan ke PostgreSQL.`, 'Rekonsiliasi Selesai');

  selectedBasoReport.value = newReport;
  showBasoModal.value = true;
};

const openBasoArchiveModal = () => {
  if (!isOwnerRole.value) {
    notify.warning('Akses Dibatasi: Riwayat Berita Acara Stock Opname (BASO) hanya dapat dilihat oleh role "Owner".', 'Akses Terbatas');
    return;
  }
  showBasoArchiveModal.value = true;
};

const openBasoPreview = (report) => {
  if (!isOwnerRole.value) {
    notify.warning('Akses Dibatasi: Dokumen Berita Acara Stock Opname (BASO) hanya dapat dilihat oleh role "Owner".', 'Akses Terbatas');
    return;
  }
  selectedBasoReport.value = report;
  showBasoModal.value = true;
};

const viewBasoForSchedule = (sch) => {
  if (!isOwnerRole.value) {
    notify.warning('Akses Dibatasi: Riwayat Berita Acara Stock Opname (BASO) hanya dapat dilihat oleh role "Owner".', 'Akses Terbatas');
    return;
  }
  const rep = pharmacyStore.opnameReports.find(r => 
    r.schedule_id === sch.id || 
    r.week_number === sch.week_number ||
    (r.week_title && r.week_title.includes(`Minggu ke-${sch.week_number}`))
  );
  if (rep) {
    openBasoPreview(rep);
  } else {
    notify.info(`Berita Acara untuk Minggu ke-${sch.week_number} dapat dilihat di Arsip BASO.`, 'Informasi');
    showBasoArchiveModal.value = true;
  }
};

const confirmDeleteReport = async (rep) => {
  if (!isOwnerRole.value) {
    notify.warning('Akses Dibatasi: Hanya role Owner yang berhak menghapus riwayat Stock Opname.', 'Akses Ditolak');
    return;
  }
  const reportNumber = rep.report_no || rep.report_number || 'Dokumen';
  const targetId = rep.id || reportNumber;

  // Hapus langsung dari memori lokal seketika (otomatis langsung hilang seketika dari tabel)
  pharmacyStore.opnameReports = pharmacyStore.opnameReports.filter(
    r => r.id !== rep.id && r.report_no !== reportNumber && r.report_number !== reportNumber
  );

  try {
    await pharmacyStore.deleteOpnameReport(targetId);
    // Tanpa notifikasi popup toast di pojok kanan atas sesuai instruksi pengguna
  } catch (err) {
    console.warn('Gagal menghapus dokumen BASO dari DB:', err);
  }
};

const confirmClearAllReports = async () => {
  if (!isOwnerRole.value) {
    notify.warning('Akses Dibatasi: Hanya role Owner yang berhak membersihkan riwayat Stock Opname.', 'Akses Ditolak');
    return;
  }
  if (pharmacyStore.opnameReports.length === 0) {
    return;
  }

  let confirmed = false;
  if (notify.confirm) {
    confirmed = await notify.confirm({
      title: 'Kosongkan Seluruh Riwayat BASO?',
      message: `Tindakan ini akan menghapus permanen seluruh ${pharmacyStore.opnameReports.length} data riwayat Berita Acara Stock Opname untuk menghemat penyimpanan database apotek. Apakah Anda yakin?`,
      confirmText: 'Ya, Kosongkan Semua',
      type: 'danger',
    });
  } else {
    confirmed = window.confirm(`Kosongkan seluruh ${pharmacyStore.opnameReports.length} riwayat BASO dari database?`);
  }

  if (!confirmed) return;

  // Kosongkan langsung dari tampilan tabel seketika
  pharmacyStore.opnameReports = [];

  try {
    isDeletingReport.value = true;
    await pharmacyStore.clearAllOpnameReports();
    // Tanpa notifikasi popup toast di pojok kanan atas sesuai instruksi pengguna
  } catch (err) {
    console.warn('Gagal membersihkan riwayat BASO dari DB:', err);
  } finally {
    isDeletingReport.value = false;
  }
};

const printBasoDocument = () => {
  window.print();
};

const exportBasoToExcel = (report) => {
  if (!report) return;

  const metadataRows = [
    ['APOTEK BUDI ASIH - BERITA ACARA STOCK OPNAME (BASO)'],
    ['No. Dokumen', report.report_no || report.report_number],
    ['Siklus Mingguan', report.week_title || report.schedule_title],
    ['Kategori Obat', report.category_names],
    ['Tanggal Pelaksanaan', report.execution_date || report.performed_at],
    ['Petugas Hitung', report.operator_name || report.performed_by],
    ['Disetujui Oleh (Admin/APJ)', report.approved_by],
    ['Waktu Persetujuan', report.approved_at || report.performed_at],
    ['Total Item Selisih', `${report.discrepancy_items_count} Item`],
    ['Total Dampak Finansial Net (Rp)', report.total_variance_value],
    ['Catatan Verifikasi', report.notes],
    [],
    ['No', 'Nama Obat', 'Kategori', 'Satuan', 'Stok Sistem', 'Stok Fisik', 'Selisih Unit', 'Harga Satuan (Rp)', 'Nilai Selisih (Rp)', 'Keterangan Alasan']
  ];

  const itemRows = (report.items || []).map((item, idx) => [
    idx + 1,
    item.name,
    item.category_name,
    item.unit || 'Biji',
    item.system_stock,
    item.physical_stock,
    item.variance,
    item.price || 0,
    item.variance_value || 0,
    item.reason || (item.variance === 0 ? 'Sesuai' : 'Koreksi Fisik')
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...metadataRows, ...itemRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Berita Acara SO');

  const safeReportNo = (report.report_no || report.report_number || 'BASO').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `${safeReportNo}_Apotek_Budi_Asih.xlsx`);
};
</script>

<style scoped>
@media print {
  /* Hide all app chrome and show only BASO print area */
  body * {
    visibility: hidden;
  }
  #basoPrintArea, #basoPrintArea * {
    visibility: visible;
  }
  #basoPrintArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20mm;
    box-shadow: none;
    border: none;
    background: white;
  }
}
</style>
