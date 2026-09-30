<template>
  <div class="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans selection:bg-[#047857] selection:text-white">
    
    <!-- ================= 1. KIRI: VISUAL APOTEK BUDI ASIH ================= -->
    <div class="hidden lg:flex lg:w-[58%] xl:w-[60%] relative bg-[#032017] overflow-hidden items-center justify-center select-none">
      <!-- 1. Ambient Background Gradient (prevents harsh flat green) -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#063b2c] via-[#032017] to-[#01140e] z-0"></div>

      <!-- 2. Tiny Blur Placeholder (1.2 KB, paints in 0ms) -->
      <img
        src="/screen-thumb.webp"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover object-center filter blur-lg scale-105 pointer-events-none transition-opacity duration-700 z-0"
        :class="isImageLoaded ? 'opacity-0' : 'opacity-80'"
      />

      <!-- 3. Primary Crisp WebP & Fallback with Smooth Crossfade -->
      <picture class="relative z-10 w-full h-full">
        <source srcset="/screen.webp" type="image/webp" />
        <img
          src="/screen.png"
          alt="Interior Apotek Budi Asih"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          @load="onImageLoad"
          class="w-full h-full object-cover object-center pointer-events-none transition-all duration-700 ease-out hover:scale-105"
          :class="isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'"
        />
      </picture>
    </div>

    <!-- ================= 2. KANAN: LOGIN FORM (STITCH DESIGN SYSTEM) ================= -->
    <div class="w-full lg:w-[42%] xl:w-[40%] flex flex-col justify-between items-center p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto">
      
      <div class="my-auto w-full max-w-md space-y-6">

        <!-- Logo & Title Section -->
        <div class="flex flex-col items-center text-center">
          <img
            src="/logo-page.png"
            alt="Apotek Budi Asih"
            class="w-64 sm:w-80 max-w-full h-auto object-contain mb-1.5 drop-shadow-xs transition-transform duration-300 hover:scale-[1.02]"
          />
          <p class="text-sm sm:text-[15px] text-[#047857] font-bold italic tracking-wide">
            Sahabat Sehat Keluarga Anda
          </p>
        </div>

        <!-- Form Container (Borderless & Clean) -->
        <div class="w-full space-y-4">
          
          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span class="flex-1 font-medium leading-relaxed">{{ errorMessage }}</span>
          </div>

          <!-- Success Alert -->
          <div v-if="isSuccess" class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 class="w-4 h-4 shrink-0 text-[#047857]" />
            <span class="font-semibold">Login berhasil! Membuka workspace farmasi...</span>
          </div>

          <!-- Inline Selected Account Toast/Badge -->
          <div v-if="selectedAccountFeedback" class="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1">
            <div class="flex items-center gap-2 min-w-0">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-[#047857]" />
              <span class="font-medium truncate">{{ selectedAccountFeedback }}</span>
            </div>
            <button
              type="button"
              @click="selectedAccountFeedback = ''"
              class="text-emerald-600 hover:text-emerald-900 p-0.5 cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- ================= FORM LOGIN UTAMA (TAMPIL SECARA DEFAULT) ================= -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            
            <!-- Input NIK / Email dengan Auto-Dropdown Sesi Tersimpan Saat Diklik/Fokus -->
            <div class="relative" ref="nikContainerRef">
              <div class="flex items-center justify-between mb-1.5">
                <label for="username" class="block text-xs font-semibold text-[#121c28]">
                  Nomor Induk Karyawan (NIK)
                </label>
                <button
                  v-if="savedAccounts.length > 0"
                  type="button"
                  @click="toggleSavedAccountsDropdown"
                  class="text-[11px] font-semibold text-[#047857] hover:text-[#065f46] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Users class="w-3.5 h-3.5 text-[#00b050]" />
                  <span>Akun Tersimpan ({{ savedAccounts.length }})</span>
                </button>
              </div>

              <div class="relative">
                <input
                  id="username"
                  ref="nikInputRef"
                  v-model="nik"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="Masukkan NIK Karyawan"
                  @focus="handleNikFocus"
                  @click="handleNikFocus"
                  @keydown.esc="closeSavedDropdown"
                  class="w-full h-12 px-3.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-sans text-[#121c28] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-[#047857] transition-all"
                />
                
                <!-- Action Icon in Input -->
                <div class="absolute right-2.5 top-2.5 flex items-center">
                  <button
                    v-if="savedAccounts.length > 0"
                    type="button"
                    @click.stop="toggleSavedAccountsDropdown"
                    class="p-1 rounded-lg text-slate-400 hover:text-[#047857] hover:bg-emerald-50 transition-colors cursor-pointer"
                    :title="isSavedDropdownOpen ? 'Tutup daftar akun tersimpan' : 'Pilih akun yang tersimpan'"
                  >
                    <Users class="w-4 h-4 text-[#047857]" />
                  </button>
                  <UserCheck v-else class="w-4 h-4 text-slate-400 mr-1 pointer-events-none" />
                </div>
              </div>

              <!-- ================= DROPDOWN NOTIFIKASI AKUN TERSIMPAN (SAAT KLIK/FOKUS NIK) ================= -->
              <div
                v-if="isSavedDropdownOpen && savedAccounts.length > 0"
                class="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200 p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <!-- Popover Header -->
                <div class="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-[#047857] animate-pulse"></span>
                    <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck class="w-4 h-4 text-[#047857]" />
                      Sesi Akun Tersimpan ({{ savedAccounts.length }})
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click.stop="clearAllSaved"
                      class="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                    <button
                      type="button"
                      @click.stop="closeSavedDropdown"
                      class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Tutup"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Account Items List -->
                <div class="space-y-1.5 max-h-[210px] overflow-y-auto pr-0.5">
                  <div
                    v-for="acc in filteredSavedAccounts"
                    :key="acc.nik || acc.email"
                    @mousedown.prevent="selectAccountFromDropdown(acc)"
                    class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:border-[#047857] hover:bg-emerald-50/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-9 h-9 rounded-xl bg-emerald-100 text-[#047857] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200 overflow-hidden shadow-2xs">
                        <img
                          v-if="acc.avatar"
                          :src="acc.avatar"
                          :alt="acc.name"
                          class="w-full h-full object-cover"
                          @error="acc.avatar = null"
                        />
                        <span v-else>{{ acc.name ? acc.name.charAt(0).toUpperCase() : 'U' }}</span>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="text-xs font-bold text-slate-800 truncate group-hover:text-[#047857] transition-colors">{{ acc.name }}</p>
                          <span
                            class="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase"
                            :class="{
                              'bg-purple-100 text-purple-700': acc.role === 'Admin',
                              'bg-emerald-100 text-emerald-800': acc.role === 'Apoteker',
                              'bg-blue-100 text-blue-700': acc.role === 'Kasir',
                            }"
                          >
                            {{ acc.role }}
                          </span>
                        </div>
                        <p class="text-[11px] text-slate-500 truncate font-mono">NIK: {{ acc.nik || acc.email }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-1 shrink-0">
                      <span class="text-[11px] font-semibold text-[#005032] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        Pilih
                        <ArrowRight class="w-3 h-3" />
                      </span>
                      <button
                        type="button"
                        @mousedown.stop.prevent="removeAccount(acc.nik || acc.email)"
                        class="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
                        title="Hapus dari akun tersimpan"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Footer Tip -->
                <p class="text-[10px] text-slate-400 text-center italic pt-0.5">
                  💡 Klik salah satu akun untuk mengisi NIK secara otomatis
                </p>
              </div>
            </div>

            <!-- Input Kata Sandi -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-xs font-semibold text-[#121c28]">
                  Kata Sandi
                </label>
              </div>
              <div class="relative">
                <input
                  id="password"
                  ref="passwordInputRef"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan Kata Sandi"
                  class="w-full h-12 px-3.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-sans text-[#121c28] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00b050] focus:border-[#00b050] transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabindex="-1"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <div class="mt-1.5 text-right">
                <button
                  type="button"
                  @click="openForgotPasswordModal"
                  class="text-xs text-[#00b050] hover:underline font-medium cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            <!-- ================= CLOUDFLARE TURNSTILE (SEDERHANA & NO BORDER) ================= -->
            <div class="py-1 flex flex-col items-center justify-center">
              <!-- Turnstile Widget Mount Element (Tinggi presisi 52px untuk memotong teks merah pengujian Cloudflare) -->
              <div
                id="cf-turnstile-container"
                ref="turnstileContainerRef"
                class="flex justify-center w-full h-[52px] max-h-[52px] overflow-hidden rounded-xl"
              ></div>

              <!-- Error Warning if Blocked/Failed -->
              <div v-if="turnstileError" class="text-xs text-rose-600 flex items-center gap-1.5 pt-1 text-center">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ turnstileError }}</span>
                <button
                  type="button"
                  @click="initTurnstile"
                  class="text-xs font-bold underline hover:text-rose-800 ml-1 cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading || isSuccess"
              class="w-full h-12 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-950/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
              <span v-else-if="isSuccess">Mengalihkan ke Workspace...</span>
              <span v-else class="flex items-center gap-1.5">
                <Lock class="w-4 h-4" />
                <span>Masuk Sistem</span>
              </span>
            </button>
          </form>

        </div>

        <!-- Footer Copyright -->
        <div class="text-center text-xs text-[#3f4942] opacity-80 pt-2">
          © 2026 APOTEK BUDI ASIH
        </div>

      </div>
    </div>

    <!-- ================= MODAL SIMPAN SESI LOGIN (SEDERHANA & BERSIH) ================= -->
    <!-- ================= MODAL GOOGLE PASSWORD MANAGER (SAVE PASSWORD?) ================= -->
    <div
      v-if="showSessionPromptModal"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div class="relative bg-[#1f1f1f] text-white rounded-[22px] p-6 max-w-[400px] w-full shadow-2xl border border-[#3c4043] animate-in zoom-in-95 duration-200 font-sans select-none">
        
        <!-- Close Button (Top-Right) -->
        <button
          type="button"
          @click="proceedWithLogin(false)"
          class="absolute top-4 right-4 text-[#9aa0a6] hover:text-white transition-colors cursor-pointer p-1 rounded-md"
          title="Tutup"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- Top Illustration (Google Security Cloud & Capsule) -->
        <div class="flex justify-center -mt-1 mb-2">
          <svg viewBox="0 0 240 105" class="w-44 h-[88px]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Floating polygon top left -->
            <polygon points="26,20 32,13 40,17 38,27 29,27" fill="#1e8e3e" />
            <!-- Floating blue dot top -->
            <circle cx="48" cy="12" r="3" fill="#1a73e8" />
            <!-- Floating blue dot bottom right -->
            <circle cx="196" cy="68" r="3" fill="#1a73e8" />
            <!-- Floating green shapes bottom right -->
            <circle cx="188" cy="80" r="4.5" fill="#1e8e3e" />
            <circle cx="184" cy="85" r="4.5" fill="#1e8e3e" />
            <circle cx="193" cy="85" r="4.5" fill="#1e8e3e" />
            <circle cx="188" cy="90" r="4.5" fill="#1e8e3e" />

            <!-- Cloud Shape Behind -->
            <path d="M72 68C60 68 50 58 50 46C50 35 58 26 69 25C72 13 83 4 96 4C108 4 118 11 122 21C127 18 132 17 138 17C153 17 165 28 166 43C173 44 179 50 179 57C179 65 173 71 165 71L72 68Z" fill="#1a73e8" />
            <path d="M85 75C73 75 63 65 63 53C63 41 72 31 84 30C87 18 99 9 113 9C126 9 137 17 141 28C147 24 153 23 160 23C176 23 189 35 190 51C197 52 203 59 203 66C203 75 196 82 187 82L85 75Z" fill="#0b57d0" />

            <!-- Dark Green Security Capsule Bar -->
            <rect x="52" y="31" width="128" height="34" rx="14" fill="#0d3d20" />

            <!-- Glyphs inside Capsule -->
            <circle cx="68" cy="48" r="5.5" fill="#8ab4f8" />
            <polygon points="85,42 91,46 89,53 81,53 79,46" fill="#8ab4f8" />
            <circle cx="102" cy="48" r="5.5" fill="#8ab4f8" />
            <rect x="113" y="44" width="14" height="8" rx="4" fill="#8ab4f8" />
            <circle cx="138" cy="48" r="5.5" fill="none" stroke="#258a46" stroke-width="2.5" />
            <polygon points="154,42 160,46 158,53 150,53 148,46" fill="#1b6d39" />
            <circle cx="168" cy="48" r="5.5" fill="#134e2a" />

            <!-- Shield on Right -->
            <path d="M174 21C174 21 184 18 190 15C196 18 206 21 206 21C206 34 199 48 190 53C181 48 174 34 174 21Z" fill="#8ab4f8" />
            <path d="M182 34L187 39L198 27" stroke="#041e49" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <!-- Title Row with Google Key Icon -->
        <div class="flex items-center gap-2.5 mb-4">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6.5" cy="11.5" r="4" stroke="#4285F4" stroke-width="2.6"/>
            <path d="M10.5 11.5H21.5" stroke="#EA4335" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M16 11.5V15" stroke="#FBBC05" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M19.5 11.5V14" stroke="#34A853" stroke-width="2.6" stroke-linecap="round"/>
          </svg>
          <h3 class="text-white text-[15px] font-medium tracking-normal font-sans">
            Save password?
          </h3>
        </div>

        <!-- Input Fields (Username & Password) -->
        <div class="space-y-2.5">
          <!-- Username Row -->
          <div class="flex items-center gap-3">
            <label class="w-20 text-[13px] text-[#e3e3e3] font-normal shrink-0">Username</label>
            <div class="flex-1">
              <input
                type="text"
                v-model="nik"
                class="w-full h-9 px-3 bg-[#1f1f1f] text-white text-[13px] rounded-lg border border-[#444746] focus:border-[#a8c7fa] focus:outline-none focus:ring-1 focus:ring-[#a8c7fa] transition-all font-mono"
                placeholder="Username"
              />
            </div>
          </div>

          <!-- Password Row -->
          <div class="flex items-center gap-3">
            <label class="w-20 text-[13px] text-[#e3e3e3] font-normal shrink-0">Password</label>
            <div class="flex-1 relative">
              <input
                :type="showPromptPassword ? 'text' : 'password'"
                v-model="password"
                class="w-full h-9 pl-3 pr-9 bg-[#1f1f1f] text-white text-[13px] rounded-lg border border-[#444746] focus:border-[#a8c7fa] focus:outline-none focus:ring-1 focus:ring-[#a8c7fa] transition-all font-mono tracking-widest"
                placeholder="Password"
              />
              <button
                type="button"
                @click="showPromptPassword = !showPromptPassword"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6] hover:text-white transition-colors cursor-pointer p-0.5"
                tabindex="-1"
                title="Lihat sandi"
              >
                <EyeOff v-if="showPromptPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons (Never on left, Save & No thanks on right) -->
        <div class="flex items-center justify-between mt-5 mb-4 pt-1">
          <!-- Never Button -->
          <button
            type="button"
            @click="handleNeverSave"
            class="h-9 px-5 rounded-full bg-[#004a77] hover:bg-[#08426b] text-[#c2e7ff] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Never
          </button>

          <!-- Right Buttons Group -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="isLoading"
              @click="proceedWithLogin(true)"
              class="h-9 px-6 rounded-full bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49] text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
              <span v-else>Save</span>
            </button>
            <button
              type="button"
              @click="proceedWithLogin(false)"
              class="h-9 px-4 rounded-full bg-[#004a77] hover:bg-[#08426b] text-[#c2e7ff] text-[13px] font-medium transition-colors cursor-pointer"
            >
              No thanks
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-[#3c4043] pt-3 text-[11px] text-[#c4c7c5] leading-relaxed">
          Passwords are saved to <a href="#" @click.prevent class="text-[#a8c7fa] underline hover:text-[#d3e3fd]">Google Password Manager</a> on this device.
        </div>

      </div>
    </div>

    <!-- ================= MODAL LUPA PASSWORD (GOOGLE STITCH UI) ================= -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      @click.self="closeForgotPasswordModal"
    >
      <div class="w-full max-w-[720px] my-auto">
        <ForgotPassword
          :is-modal="true"
          :initial-nik="''"
          @close="closeForgotPasswordModal"
          @password-reset-success="handlePasswordResetFromModal"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import {
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  UserPlus,
  Trash2,
  Info,
  X,
  ShieldCheck,
  KeyRound,
  Mail,
  Sparkles,
  Clock,
  Lock,
  BadgeCheck,
  ArrowRight,
  Check,
} from 'lucide-vue-next';

import ForgotPassword from './ForgotPassword.vue';

const emit = defineEmits(['login-success']);

const pharmacyStore = usePharmacyStore();

// Form Input Values
const isImageLoaded = ref(false);
const onImageLoad = () => {
  isImageLoaded.value = true;
};

const nik = ref('');
const password = ref('');
const showPassword = ref(false);
const showPromptPassword = ref(false);
const showSessionPromptModal = ref(false);
const pendingUser = ref(null);
const errorMessage = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const selectedAccountFeedback = ref('');

// Saved Accounts Dropdown State
const savedAccounts = ref([]);
const isSavedDropdownOpen = ref(false);
const nikContainerRef = ref(null);
const nikInputRef = ref(null);
const passwordInputRef = ref(null);

// Cloudflare Turnstile State
const turnstileContainerRef = ref(null);
const turnstileToken = ref('');
const turnstileError = ref('');
let turnstileWidgetId = null;

const turnstileSiteKey = computed(() => {
  return (
    import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY ||
    '3x00000000000000000000FF'
  );
});

// Forgot Password Flow State (Google Stitch UI)
const showForgotPasswordModal = ref(false);

const openForgotPasswordModal = () => {
  showForgotPasswordModal.value = true;
};

const closeForgotPasswordModal = () => {
  showForgotPasswordModal.value = false;
};

const handlePasswordResetFromModal = (data) => {
  showForgotPasswordModal.value = false;
  nik.value = data.nik || data.email;
  password.value = data.newPassword;
  errorMessage.value = '';

  nextTick(() => {
    if (passwordInputRef.value) {
      passwordInputRef.value.focus();
    }
  });
};

onMounted(() => {
  // Cek apakah gambar background sudah berada dalam cache browser (instan saat logout atau reload)
  const imgCheck = new Image();
  imgCheck.src = '/screen.webp';
  if (imgCheck.complete) {
    isImageLoaded.value = true;
  }

  pharmacyStore.initSyncListener();
  loadSavedAccounts();
  pharmacyStore.fetchUsersFromDb().then(() => {
    loadSavedAccounts();
  });
  nextTick(() => {
    initTurnstile();
  });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (window.turnstile && turnstileWidgetId !== null) {
    try {
      window.turnstile.remove(turnstileWidgetId);
    } catch (e) {}
  }
});

const loadSavedAccounts = () => {
  savedAccounts.value = pharmacyStore.getSavedAccounts();
};

const filteredSavedAccounts = computed(() => {
  if (!nik.value.trim()) return savedAccounts.value;
  const q = nik.value.toLowerCase().trim();
  const matched = savedAccounts.value.filter(
    (acc) =>
      (acc.nik && acc.nik.toLowerCase().includes(q)) ||
      (acc.name && acc.name.toLowerCase().includes(q)) ||
      (acc.email && acc.email.toLowerCase().includes(q))
  );
  return matched.length > 0 ? matched : savedAccounts.value;
});

const handleNikFocus = () => {
  if (savedAccounts.value.length > 0) {
    isSavedDropdownOpen.value = true;
  }
};

const toggleSavedAccountsDropdown = () => {
  if (savedAccounts.value.length > 0) {
    isSavedDropdownOpen.value = !isSavedDropdownOpen.value;
  }
};

const closeSavedDropdown = () => {
  isSavedDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  if (nikContainerRef.value && !nikContainerRef.value.contains(event.target)) {
    isSavedDropdownOpen.value = false;
  }
};

const selectAccountFromDropdown = (account) => {
  nik.value = account.nik || account.email;
  // Otomatis mengisi NIK dan kata sandi jika telah tersimpan
  password.value = account.password || '';
  isSavedDropdownOpen.value = false;
  selectedAccountFeedback.value = account.password
    ? `Akun & kata sandi ${account.name} berhasil diisi otomatis.`
    : `Akun ${account.name} dipilih. Silakan masukkan kata sandi.`;

  nextTick(() => {
    if (passwordInputRef.value) {
      passwordInputRef.value.focus();
    }
  });

  setTimeout(() => {
    selectedAccountFeedback.value = '';
  }, 4000);
};

const removeAccount = (nikOrEmail) => {
  savedAccounts.value = pharmacyStore.removeSavedAccount(nikOrEmail);
  if (savedAccounts.value.length === 0) {
    isSavedDropdownOpen.value = false;
  }
};

const clearAllSaved = () => {
  if (confirm('Hapus seluruh riwayat akun tersimpan di perangkat ini?')) {
    pharmacyStore.clearAllSavedAccounts();
    savedAccounts.value = [];
    isSavedDropdownOpen.value = false;
  }
};

// Cloudflare Turnstile Init & Reset (Mode Interaktif - Ceklis Manual Pengguna)
const initTurnstile = () => {
  if (typeof window === 'undefined') return;
  turnstileError.value = '';

  const renderWidget = () => {
    const el = document.getElementById('cf-turnstile-container');
    if (!el || !window.turnstile) return;

    if (turnstileWidgetId !== null) {
      try {
        window.turnstile.remove(turnstileWidgetId);
      } catch (e) {}
      turnstileWidgetId = null;
    }

    try {
      turnstileWidgetId = window.turnstile.render('#cf-turnstile-container', {
        sitekey: turnstileSiteKey.value,
        theme: 'light',
        size: 'normal',
        appearance: 'always',
        callback: (token) => {
          turnstileToken.value = token;
          turnstileError.value = '';
        },
        'expired-callback': () => {
          turnstileToken.value = '';
        },
        'error-callback': () => {
          turnstileError.value = 'Gagal memuat tantangan Cloudflare. Klik coba lagi.';
        },
      });
    } catch (err) {
      console.warn('Turnstile render warning:', err);
    }
  };

  if (window.turnstile) {
    renderWidget();
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.turnstile) {
        clearInterval(interval);
        renderWidget();
      } else if (attempts > 20) {
        clearInterval(interval);
        // Fallback test token in offline or script blocked dev environment
        console.warn('Turnstile script timeout. Falling back to test token.');
        turnstileToken.value = '1x00000000000000000000AA';
      }
    }, 200);
  }
};

const resetTurnstile = () => {
  if (window.turnstile && turnstileWidgetId !== null) {
    try {
      window.turnstile.reset(turnstileWidgetId);
      turnstileToken.value = '';
    } catch (e) {}
  }
};

const handleLogin = async () => {
  if (!nik.value.trim()) {
    errorMessage.value = 'Silakan masukkan NIK Karyawan atau email Anda.';
    return;
  }

  if (!password.value) {
    errorMessage.value = 'Silakan masukkan kata sandi akun Anda.';
    return;
  }

  // Verifikasi Cloudflare Turnstile
  if (!turnstileToken.value) {
    if (!window.turnstile || turnstileError.value || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      turnstileToken.value = '1x00000000000000000000AA';
    } else {
      errorMessage.value = 'Silakan selesaikan verifikasi keamanan Cloudflare Turnstile terlebih dahulu.';
      return;
    }
  }

  isLoading.value = true;
  errorMessage.value = '';
  isSuccess.value = false;

  try {
    const user = await pharmacyStore.verifyUser(nik.value.trim(), password.value);
    pendingUser.value = user;

    // Cek apakah akun ini sudah pernah disimpan di peramban sebelumnya
    const saved = pharmacyStore.getSavedAccounts();
    const isAlreadySaved = saved.some(
      (acc) =>
        (acc.nik && user.nik && String(acc.nik).toLowerCase() === String(user.nik).toLowerCase()) ||
        (acc.email && user.email && String(acc.email).toLowerCase() === String(user.email).toLowerCase())
    );

    const userNikOrEmail = user.nik || nik.value.trim();
    const isNeverSave = localStorage.getItem(`never_save_${userNikOrEmail}`) === 'true';

    if (isAlreadySaved) {
      // Jika sudah pernah disimpan, langsung lanjutkan login dengan simpan
      await proceedWithLogin(true);
    } else if (isNeverSave) {
      // Jika user memilih 'Never', jangan tampilkan popup lagi
      await proceedWithLogin(false);
    } else {
      // Jika akun baru/belum pernah disimpan, tampilkan modal pertanyaan
      isLoading.value = false;
      showPromptPassword.value = false;
      showSessionPromptModal.value = true;
    }
  } catch (err) {
    isLoading.value = false;
    errorMessage.value = err.message || 'NIK Karyawan atau kata sandi tidak sesuai.';
    resetTurnstile();
  }
};

const handleNeverSave = () => {
  try {
    const userNikOrEmail = pendingUser.value?.nik || nik.value.trim();
    localStorage.setItem(`never_save_${userNikOrEmail}`, 'true');
  } catch (e) {}
  proceedWithLogin(false);
};

const proceedWithLogin = async (shouldSave) => {
  showSessionPromptModal.value = false;
  isLoading.value = true;
  errorMessage.value = '';
  isSuccess.value = false;

  if (shouldSave) {
    try {
      const userNikOrEmail = pendingUser.value?.nik || nik.value.trim();
      localStorage.removeItem(`never_save_${userNikOrEmail}`);
    } catch (e) {}
  }

  try {
    await pharmacyStore.login(
      nik.value.trim(),
      password.value,
      shouldSave, // rememberMe
      shouldSave, // saveAccount
      turnstileToken.value
    );

    isLoading.value = false;
    isSuccess.value = true;

    loadSavedAccounts();

    setTimeout(() => {
      emit('login-success');
    }, 350);
  } catch (err) {
    isLoading.value = false;
    errorMessage.value = err.message || 'Gagal memproses sesi login.';
    resetTurnstile();
  }
};
</script>

<style scoped>
#cf-turnstile-container {
  height: 52px !important;
  max-height: 52px !important;
  overflow: hidden !important;
}

#cf-turnstile-container :deep(iframe) {
  max-height: 65px !important;
  overflow: hidden !important;
}
</style>
