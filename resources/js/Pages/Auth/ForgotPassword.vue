<template>
  <div class="min-h-screen bg-[#f4f7fb] text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#005032] selection:text-white">
    
    <!-- Main Modal / Card Container -->
    <main class="w-full max-w-[560px] bg-white rounded-2xl shadow-[0_15px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-300">
      
      <!-- ================= HEADER ================= -->
      <header class="px-6 py-5 sm:px-8 sm:py-6 flex items-start justify-between bg-gradient-to-r from-[#edf4fc] via-[#f3f7fd] to-[#edf4fc] border-b border-slate-200/80">
        <div class="flex items-center gap-3.5">
          <!-- Dark Green Key Icon Badge -->
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-[#005032] to-[#003822] flex items-center justify-center text-white shadow-sm shrink-0">
            <KeyRound class="w-5 h-5 text-white" />
          </div>

          <div>
            <div class="flex items-center gap-2.5 mb-1">
              <h1 class="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                Pemulihan Kata Sandi
              </h1>
              <span class="bg-emerald-100/80 text-[#006b44] border border-emerald-300/60 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                OTP EMAIL
              </span>
            </div>
            <p class="text-xs text-slate-500">
              Sistem Otentikasi &amp; Keamanan Apotek Budi Asih
            </p>
          </div>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="handleBackToLogin"
          aria-label="Tutup"
          class="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl transition-colors cursor-pointer"
          title="Tutup / Kembali ke Login"
        >
          <X class="w-5 h-5" />
        </button>
      </header>

      <!-- ================= CONTENT AREA ================= -->
      <div class="p-6 sm:p-8 flex flex-col gap-6">
        
        <!-- ================= STEPPER (3 SEGMEN) ================= -->
        <div v-if="currentStep <= 3" class="flex flex-col w-full">
          <div class="flex gap-2 w-full mb-2.5">
            <!-- Segmen 1 -->
            <div
              class="h-1.5 flex-1 rounded-full transition-all duration-500"
              :class="currentStep >= 1 ? 'bg-[#005032]' : 'bg-slate-200'"
            ></div>
            <!-- Segmen 2 -->
            <div
              class="h-1.5 flex-1 rounded-full transition-all duration-500"
              :class="currentStep >= 2 ? 'bg-[#005032]' : 'bg-slate-200'"
            ></div>
            <!-- Segmen 3 -->
            <div
              class="h-1.5 flex-1 rounded-full transition-all duration-500"
              :class="currentStep >= 3 ? 'bg-[#005032]' : 'bg-slate-200'"
            ></div>
          </div>

          <div class="flex justify-between w-full text-xs font-semibold">
            <span
              class="w-1/3 text-left transition-colors duration-300"
              :class="currentStep >= 1 ? 'text-[#005032] font-bold' : 'text-slate-400'"
            >
              1. NIK &amp; Email
            </span>
            <span
              class="w-1/3 text-center transition-colors duration-300"
              :class="currentStep >= 2 ? 'text-[#005032] font-bold' : 'text-slate-400'"
            >
              2. Verifikasi OTP
            </span>
            <span
              class="w-1/3 text-right transition-colors duration-300"
              :class="currentStep >= 3 ? 'text-[#005032] font-bold' : 'text-slate-400'"
            >
              3. Sandi Baru
            </span>
          </div>
        </div>

        <!-- ALERT ERROR (JIKA ADA) -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in"
        >
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
          <span class="font-medium leading-relaxed">{{ errorMessage }}</span>
        </div>

        <!-- ======================================================== -->
        <!-- TAMPILAN 1: NIK & EMAIL                                  -->
        <!-- ======================================================== -->
        <div v-if="currentStep === 1" class="flex flex-col gap-5 animate-in fade-in duration-300">
          
          <!-- Field 1: Nomor Induk Karyawan (NIK) -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-2 text-slate-800">
              <CreditCard class="w-4 h-4 text-slate-500" />
              <label for="nik-field" class="font-bold text-xs tracking-tight">Nomor Induk Karyawan (NIK)</label>
            </div>
            
            <div class="relative">
              <input
                id="nik-field"
                v-model="inputNik"
                @input="handleNikAutoFillEmail"
                type="text"
                placeholder="Masukkan 10 digit NIK Anda (Contoh: 2026010188)"
                class="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#005032] focus:ring-2 focus:ring-[#005032]/10 transition-all font-medium pr-18"
              />
              <span class="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded tracking-wider pointer-events-none">
                WAJIB
              </span>
            </div>

            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 pl-0.5">
              <Info class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Gunakan NIK resmi yang terdaftar pada sistem kepegawaian Apotek Budi Asih.
            </p>
          </div>

          <!-- Field 2: Alamat Email Terdaftar / Email Aktif -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-2 text-slate-800">
              <Mail class="w-4 h-4 text-slate-500" />
              <label for="email-field" class="font-bold text-xs tracking-tight">Alamat Email Terdaftar / Email Aktif</label>
            </div>

            <div class="relative">
              <input
                id="email-field"
                v-model="inputEmail"
                type="email"
                required
                placeholder="Masukkan alamat email terdaftar"
                @keyup.enter="handleSendOtp"
                class="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 focus:outline-none focus:border-[#005032] focus:ring-2 focus:ring-[#005032]/10 transition-all font-medium"
              />
              <Mail class="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 pl-0.5">
              <Info class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Kode verifikasi OTP 6-digit akan dikirimkan ke alamat email aktif ini untuk memastikan otoritas akses.
            </p>
          </div>

          <!-- Tombol Kirim Kode OTP -->
          <div class="pt-2">
            <button
              type="button"
              :disabled="isLoading || !inputEmail.trim()"
              @click="handleSendOtp"
              class="w-full bg-[#005032] hover:bg-[#006640] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(0,80,50,0.22)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin text-white" />
                <span>Mengirim Kode...</span>
              </span>
              <span v-else class="flex items-center gap-2">
                <span>Kirim Kode OTP</span>
                <KeyRound class="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- TAMPILAN 2: VERIFIKASI KODE OTP                          -->
        <!-- ======================================================== -->
        <div v-if="currentStep === 2" class="flex flex-col items-center w-full gap-5 animate-in fade-in duration-300">
          
          <div class="text-center pt-1">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#005032] border border-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <MailCheck class="w-6 h-6 text-[#005032]" />
            </div>
            <h2 class="font-bold text-2xl text-slate-900 mb-1.5 tracking-tight">
              Verifikasi Kode OTP
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Masukkan 6 digit kode keamanan yang telah dikirim ke: <br />
              <strong class="text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 font-semibold inline-block mt-1 font-mono text-xs">{{ inputEmail }}</strong>
            </p>
          </div>

          <!-- 6 Square OTP Boxes -->
          <div class="flex flex-col items-center w-full my-1">
            <div class="flex gap-2 sm:gap-3 justify-center w-full mb-5">
              <input
                v-for="(_, index) in 6"
                :key="index"
                :ref="el => { if (el) otpBoxes[index] = el; }"
                v-model="otpDigits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                :aria-label="'Digit ' + (index + 1)"
                @input="handleOtpInput(index, $event)"
                @keydown="handleOtpKeydown(index, $event)"
                @paste="handleOtpPaste($event)"
                class="w-11 h-13 sm:w-13 sm:h-15 text-center text-2xl font-black font-mono text-slate-900 border-2 border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:border-[#005032] focus:ring-4 focus:ring-[#005032]/10 transition-all outline-none shadow-sm"
              />
            </div>

            <!-- Resend Countdown Text -->
            <div class="text-center text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-1.5">
              <span>Belum menerima kode?</span>
              <button
                type="button"
                :disabled="otpCountdown > 0 || isLoading"
                @click="handleResendOtp"
                class="font-bold inline-flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                :class="otpCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#005032] hover:underline'"
              >
                <Clock v-if="otpCountdown > 0" class="w-3.5 h-3.5 text-slate-400" />
                <RefreshCw v-else class="w-3.5 h-3.5 text-[#005032]" />
                <span v-if="otpCountdown > 0">Kirim Ulang ({{ formatTime(otpCountdown) }})</span>
                <span v-else>Kirim Ulang Kode</span>
              </button>
            </div>
          </div>

          <!-- Tombol Verifikasi Kode -->
          <div class="w-full space-y-3 pt-2">
            <button
              type="button"
              :disabled="otpFullValue.length < 6 || isLoading"
              @click="handleVerifyOtp"
              class="w-full bg-[#005032] hover:bg-[#006640] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(0,80,50,0.22)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi...</span>
              </span>
              <span v-else class="flex items-center gap-2">
                <span>Verifikasi Kode</span>
                <CheckCircle2 class="w-4 h-4" />
              </span>
            </button>

            <!-- Navigasi Bawah -->
            <div class="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                @click="currentStep = 1"
                class="text-slate-500 hover:text-[#005032] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                Ubah NIK / Email
              </button>
              <button
                type="button"
                @click="handleBackToLogin"
                class="text-slate-500 hover:text-[#005032] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- TAMPILAN 3: ATUR SANDI BARU                              -->
        <!-- ======================================================== -->
        <div v-if="currentStep === 3" class="flex flex-col gap-5 animate-in fade-in duration-300">
          
          <div class="text-center pt-1">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#005032] border border-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Lock class="w-6 h-6 text-[#005032]" />
            </div>
            <h2 class="font-bold text-2xl text-slate-900 mb-1.5 tracking-tight">
              Atur Sandi Baru
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 max-w-[360px] mx-auto text-center leading-relaxed">
              Gunakan kombinasi yang kuat untuk mengamankan akses akun Anda.
            </p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleSaveNewPassword">
            
            <!-- Kolom: Kata Sandi Baru -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-slate-800">
                <Lock class="w-4 h-4 text-slate-500" />
                <label for="new-pw-input" class="font-bold text-xs tracking-tight">Kata Sandi Baru</label>
              </div>

              <div class="relative">
                <input
                  id="new-pw-input"
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                  required
                  class="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#005032] focus:ring-2 focus:ring-[#005032]/10 transition-all pr-11 font-medium"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1.5 flex items-center justify-center cursor-pointer rounded-lg hover:bg-slate-100"
                  :title="showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                >
                  <Eye v-if="!showNewPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Bar Kekuatan Sandi -->
              <div class="flex flex-col gap-1.5 pt-1">
                <div class="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="{
                      'bg-rose-500': passwordStrength.score <= 30,
                      'bg-amber-500': passwordStrength.score > 30 && passwordStrength.score <= 65,
                      'bg-emerald-600': passwordStrength.score > 65
                    }"
                    :style="{ width: passwordStrength.score + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between items-center text-[11px]">
                  <span class="text-slate-500">
                    Kekuatan Sandi: 
                    <strong
                      :class="{
                        'text-rose-600': passwordStrength.score <= 30,
                        'text-amber-600': passwordStrength.score > 30 && passwordStrength.score <= 65,
                        'text-emerald-700': passwordStrength.score > 65
                      }"
                    >
                      {{ passwordStrength.label }}
                    </strong>
                  </span>
                  <span class="text-slate-400 font-medium">Min. 6 Karakter</span>
                </div>
              </div>
            </div>

            <!-- Kolom: Konfirmasi Kata Sandi -->
            <div class="flex flex-col gap-1.5 pt-1">
              <div class="flex items-center justify-between text-slate-800">
                <div class="flex items-center gap-2">
                  <Lock class="w-4 h-4 text-slate-500" />
                  <label for="confirm-pw-input" class="font-bold text-xs tracking-tight">Konfirmasi Kata Sandi</label>
                </div>
                <span
                  v-if="confirmPassword && newPassword === confirmPassword"
                  class="text-[11px] font-bold text-emerald-600 flex items-center gap-1"
                >
                  <Check class="w-3.5 h-3.5 text-emerald-600" />
                  Cocok
                </span>
                <span
                  v-else-if="confirmPassword && newPassword !== confirmPassword"
                  class="text-[11px] font-medium text-rose-500"
                >
                  Belum Cocok
                </span>
              </div>

              <div class="relative">
                <input
                  id="confirm-pw-input"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi baru"
                  required
                  class="w-full bg-[#f8fafc] border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#005032] focus:ring-2 focus:ring-[#005032]/10 transition-all pr-11 font-medium"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1.5 flex items-center justify-center cursor-pointer rounded-lg hover:bg-slate-100"
                  :title="showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                >
                  <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Tombol Simpan & Masuk -->
            <div class="pt-3 space-y-3">
              <button
                type="submit"
                :disabled="isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6"
                class="w-full bg-[#005032] hover:bg-[#006640] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(0,80,50,0.22)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isLoading" class="flex items-center gap-2">
                  <Loader2 class="w-4 h-4 animate-spin text-white" />
                  <span>Menyimpan Sandi...</span>
                </span>
                <span v-else class="flex items-center gap-2">
                  <span>Simpan &amp; Masuk</span>
                  <ArrowRight class="w-4 h-4" />
                </span>
              </button>

              <div class="text-center">
                <button
                  type="button"
                  @click="handleBackToLogin"
                  class="text-xs text-slate-500 hover:text-[#005032] transition-colors cursor-pointer font-medium inline-flex items-center gap-1.5"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                  Kembali ke Login
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- ======================================================== -->
        <!-- TAMPILAN 4: SUKSES (PENGALIHAN KE LOGIN)                 -->
        <!-- ======================================================== -->
        <div v-if="currentStep === 4" class="text-center py-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-[#005032] border border-emerald-100 flex items-center justify-center shadow-xs">
            <ShieldCheck class="w-9 h-9 text-[#005032]" />
          </div>

          <div class="space-y-1.5 max-w-sm mx-auto">
            <h3 class="font-bold text-xl text-slate-900 tracking-tight">
              Kata Sandi Berhasil Diperbarui!
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Kata sandi untuk akun <strong class="text-slate-900 font-semibold">{{ inputEmail }}</strong> telah berhasil diperbarui di sistem. Silakan masuk kembali dengan kata sandi baru Anda.
            </p>
          </div>

          <div class="w-full pt-3">
            <button
              type="button"
              @click="handleCompleteAndLogin"
              class="w-full bg-[#005032] hover:bg-[#006640] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(0,80,50,0.22)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import {
  KeyRound,
  X,
  CreditCard,
  Mail,
  MailCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Info
} from 'lucide-vue-next';

const props = defineProps({
  initialNik: { type: String, default: '' },
  initialEmail: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'password-reset-success']);

const router = useRouter();
const pharmacyStore = usePharmacyStore();

// Step State
const currentStep = ref(1); // 1: NIK & Email, 2: OTP, 3: Sandi Baru, 4: Sukses
const errorMessage = ref('');
const isLoading = ref(false);

// Step 1 Values (Kosong saat awal membuka form)
const inputNik = ref('');
const inputEmail = ref('');

// Step 2 Values
const generatedOtp = ref('123456');
const otpDigits = ref(['', '', '', '', '', '']);
const otpBoxes = ref([]);
const otpCountdown = ref(60);
let countdownTimer = null;

const otpFullValue = computed(() => otpDigits.value.join(''));

// Step 3 Values
const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password Strength Meter
const passwordStrength = computed(() => {
  const p = newPassword.value;
  if (!p) return { score: 0, label: 'Kosong' };
  let score = 0;
  if (p.length >= 6) score += 25;
  if (p.length >= 8) score += 25;
  if (/[0-9]/.test(p)) score += 25;
  if (/[A-Z]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 25;

  if (score <= 25) return { score: 25, label: 'Lemah' };
  if (score === 50) return { score: 50, label: 'Sedang' };
  if (score === 75) return { score: 75, label: 'Kuat' };
  return { score: 100, label: 'Sangat Kuat' };
});

onMounted(() => {
  if (props.initialNik) inputNik.value = props.initialNik;
  if (props.initialEmail) inputEmail.value = props.initialEmail;
  handleNikAutoFillEmail();
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

const handleNikAutoFillEmail = async () => {
  const query = inputNik.value.trim().toLowerCase();
  if (!query) {
    inputEmail.value = '';
    return;
  }

  // 1. Ambil data email langsung dari database PostgreSQL secara real-time
  try {
    const res = await fetch('/api/users/lookup?nik=' + encodeURIComponent(query));
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user && data.user.email) {
        inputEmail.value = data.user.email;
        return;
      }
    }
  } catch (err) {
    // Lanjut ke fallback jika network offline
  }

  // 2. Fallback ke list lokal
  const matched = pharmacyStore.usersList.find(
    u => u.nik.toLowerCase() === query
  );
  if (matched) {
    inputEmail.value = matched.email;
  }
};

// Step 1: Send OTP
const handleSendOtp = async () => {
  if (!inputEmail.value.trim()) {
    errorMessage.value = 'Silakan masukkan alamat email terdaftar.';
    return;
  }

  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res = await fetch('/api/forgot-password/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: inputEmail.value.trim(),
        nik: inputNik.value.trim(),
      }),
    });

    const data = await res.json();
    isLoading.value = false;

    if (res.ok) {
      if (data.dev_otp) {
        console.log('[DEBUG DEV OTP]:', data.dev_otp);
      }
      otpDigits.value = ['', '', '', '', '', ''];
      currentStep.value = 2;
      startCountdown();

      nextTick(() => {
        if (otpBoxes.value[0]) otpBoxes.value[0].focus();
      });
    } else {
      errorMessage.value = data.error || data.message || 'Gagal mengirimkan kode OTP.';
    }
  } catch (e) {
    isLoading.value = false;
    errorMessage.value = 'Koneksi ke server gagal. Pastikan jaringan aktif.';
  }
};

const startCountdown = () => {
  otpCountdown.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (otpCountdown.value > 0) {
      otpCountdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

const handleResendOtp = async () => {
  if (otpCountdown.value > 0) return;
  await handleSendOtp();
};

// OTP multi-box input navigation
const handleOtpInput = (index, event) => {
  const val = event.target.value;
  const cleanVal = val.replace(/\D/g, '').slice(-1);
  otpDigits.value[index] = cleanVal;

  if (cleanVal && index < 5) {
    nextTick(() => {
      if (otpBoxes.value[index + 1]) otpBoxes.value[index + 1].focus();
    });
  } else if (cleanVal && index === 5 && otpFullValue.value.length === 6) {
    handleVerifyOtp();
  }
};

const handleOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      if (otpBoxes.value[index - 1]) otpBoxes.value[index - 1].focus();
    });
  } else if (event.key === 'ArrowLeft' && index > 0) {
    otpBoxes.value[index - 1]?.focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    otpBoxes.value[index + 1]?.focus();
  } else if (event.key === 'Enter' && otpFullValue.value.length === 6) {
    handleVerifyOtp();
  }
};

const handleOtpPaste = (event) => {
  event.preventDefault();
  const pasteData = (event.clipboardData || window.clipboardData).getData('text');
  const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');
  digits.forEach((d, i) => {
    otpDigits.value[i] = d;
  });
  if (digits.length > 0) {
    const nextIdx = Math.min(digits.length, 5);
    nextTick(() => {
      if (otpBoxes.value[nextIdx]) otpBoxes.value[nextIdx].focus();
    });
    if (digits.length === 6) {
      handleVerifyOtp();
    }
  }
};

// Step 2: Verify OTP via Backend API
const handleVerifyOtp = async () => {
  if (otpFullValue.value.length < 6) {
    errorMessage.value = 'Masukkan 6 digit kode OTP.';
    return;
  }

  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res = await fetch('/api/forgot-password/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: inputEmail.value.trim(),
        nik: inputNik.value.trim(),
        otp: otpFullValue.value.trim(),
      }),
    });

    const data = await res.json();
    isLoading.value = false;

    if (res.ok) {
      errorMessage.value = '';
      currentStep.value = 3;
    } else {
      errorMessage.value = data.error || data.message || 'Kode OTP tidak sesuai.';
    }
  } catch (err) {
    isLoading.value = false;
    errorMessage.value = 'Gagal memverifikasi OTP. Silakan coba lagi.';
  }
};

// Step 3: Save New Password via Backend API
const handleSaveNewPassword = async () => {
  if (!newPassword.value) {
    errorMessage.value = 'Silakan masukkan kata sandi baru.';
    return;
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Kata sandi minimal 6 karakter.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok.';
    return;
  }

  errorMessage.value = '';
  isLoading.value = true;

  try {
    const res = await fetch('/api/forgot-password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifier: inputEmail.value.trim() || inputNik.value.trim(),
        email: inputEmail.value.trim(),
        nik: inputNik.value.trim(),
        otp: otpFullValue.value.trim(),
        password: newPassword.value.trim(),
      }),
    });

    const data = await res.json();
    isLoading.value = false;

    if (res.ok) {
      // Perbarui juga data di store local jika user ditemukan
      const foundUser = pharmacyStore.usersList.find(
        u => u.email.toLowerCase() === inputEmail.value.trim().toLowerCase() || (inputNik.value && u.nik === inputNik.value.trim())
      );
      if (foundUser) {
        foundUser.password = newPassword.value.trim();
        pharmacyStore.saveUsersList();
      }

      currentStep.value = 4;
    } else {
      errorMessage.value = data.error || data.message || 'Gagal mengatur ulang kata sandi.';
    }
  } catch (err) {
    isLoading.value = false;
    errorMessage.value = 'Terjadi kesalahan sistem saat menyimpan kata sandi.';
  }
};

const handleBackToLogin = () => {
  if (props.isModal) {
    emit('close');
  } else {
    router.push('/');
  }
};

const handleCompleteAndLogin = () => {
  emit('password-reset-success', {
    nik: inputNik.value,
    email: inputEmail.value,
    newPassword: newPassword.value,
  });

  if (!props.isModal) {
    router.push('/');
  }
};
</script>
