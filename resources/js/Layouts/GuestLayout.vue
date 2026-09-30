<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- Header Portal -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30 px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-glow">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cross class="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <h1 class="text-base font-extrabold text-white">APOTEK BUDI ASIH</h1>
            <p class="text-[11px] text-teal-400 font-semibold uppercase tracking-wider">Portal Tebus Resep Digital</p>
          </div>
        </div>

        <router-link
          to="/"
          class="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Kembali ke Dashboard Staff</span>
        </router-link>
      </div>
    </header>

    <!-- Hero Banner -->
    <section class="py-12 px-6 bg-gradient-to-b from-teal-950/30 via-slate-950 to-slate-950 text-center relative overflow-hidden">
      <div class="max-w-3xl mx-auto space-y-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <ShieldCheck class="w-4 h-4 text-teal-400" />
          <span>Layanan Resmi Apoteker Berlisensi SIPA</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Tebus Resep Dokter <span class="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Cepat, Aman & Asli</span>
        </h2>
        <p class="text-sm text-slate-300 max-w-xl mx-auto">
          Unggah foto resep dokter Anda. Tim Apoteker kami akan memverifikasi keabsahan, dosis klinis, dan menyiapkan obat Anda.
        </p>
      </div>
    </section>

    <!-- 3 Steps Explanation -->
    <section class="max-w-5xl mx-auto px-6 py-6 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-5 border-teal-500/20">
        <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm mb-3">
          1
        </div>
        <h4 class="font-bold text-sm text-white mb-1">Unggah Foto Resep</h4>
        <p class="text-xs text-slate-400 leading-relaxed">
          Ambil foto lembar resep fisik dokter dengan jelas beserta nama & nomor kontak Anda.
        </p>
      </div>

      <div class="glass-card p-5 border-cyan-500/20">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">
          2
        </div>
        <h4 class="font-bold text-sm text-white mb-1">Telaah Resep Apoteker</h4>
        <p class="text-xs text-slate-400 leading-relaxed">
          Apoteker memeriksa keabsahan administratif, interaksi obat, dan ketersediaan stok obat keras.
        </p>
      </div>

      <div class="glass-card p-5 border-emerald-500/20">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
          3
        </div>
        <h4 class="font-bold text-sm text-white mb-1">Ambil / Siap Kasir</h4>
        <p class="text-xs text-slate-400 leading-relaxed">
          Setelah diverifikasi, resep otomatis masuk ke antrean POS Kasir untuk proses pembayaran & penyerahan.
        </p>
      </div>
    </section>

    <!-- Upload Form Card -->
    <section class="max-w-2xl mx-auto px-6 py-8 w-full">
      <div class="glass-card p-6 sm:p-8 border-slate-700/80 shadow-2xl">
        <div class="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div class="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <FileUp class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Formulir Kirim Resep Baru</h3>
            <p class="text-xs text-slate-400">Data Anda dilindungi kerahasiaan medis apotek</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmitPortal" class="mt-6 space-y-5">
          <!-- Upload Image -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Unggah Berkas Foto Resep <span class="text-rose-400">*</span>
            </label>
            <div
              @click="$refs.portalFile.click()"
              class="border-2 border-dashed border-slate-700 hover:border-teal-500/70 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/50 transition-all"
            >
              <input
                type="file"
                ref="portalFile"
                accept="image/*"
                class="hidden"
                @change="handleImageChange"
              />

              <div v-if="!preview" class="flex flex-col items-center">
                <UploadCloud class="w-10 h-10 text-teal-400 mb-2" />
                <p class="text-xs font-semibold text-slate-200">Klik di sini untuk memilih foto resep</p>
                <p class="text-[11px] text-slate-400 mt-1">Mendukung file JPG, PNG, atau WEBP</p>
              </div>

              <div v-else class="text-center">
                <img :src="preview" alt="Preview" class="max-h-40 mx-auto rounded-lg border border-slate-700 object-cover" />
                <p class="text-xs text-emerald-400 font-semibold mt-2">✓ Foto resep dipilih</p>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap Pasien <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="portalForm.patient_name"
              type="text"
              required
              placeholder="Contoh: Rina Kusuma"
              class="glass-input w-full"
            />
          </div>

          <!-- Phone & Doctor -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp <span class="text-rose-400">*</span>
              </label>
              <input
                v-model="portalForm.patient_phone"
                type="tel"
                required
                placeholder="087812345678"
                class="glass-input w-full"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Dokter Praktik
              </label>
              <input
                v-model="portalForm.doctor_name"
                type="text"
                placeholder="dr. Sp.KK / Sp.A"
                class="glass-input w-full"
              />
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Catatan / Permintaan Khusus
            </label>
            <textarea
              v-model="portalForm.notes"
              rows="3"
              placeholder="Sertakan informasi alergi atau instruksi khusus dokter..."
              class="glass-input w-full resize-none text-xs"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full py-3 text-sm font-bold"
          >
            <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
            <span v-else>Kirim Resep ke Apoteker Sekarang</span>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { usePharmacyStore } from '@/Stores/pharmacyStore';
import { Cross, ArrowLeft, ShieldCheck, FileUp, UploadCloud, Loader2 } from 'lucide-vue-next';

const router = useRouter();
const pharmacyStore = usePharmacyStore();

const portalFile = ref(null);
const preview = ref(null);
const isSubmitting = ref(false);

const portalForm = reactive({
  patient_name: '',
  patient_phone: '',
  doctor_name: '',
  notes: '',
  image_path: '',
});

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      preview.value = event.target.result;
      portalForm.image_path = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmitPortal = () => {
  if (!portalForm.patient_name.trim()) {
    alert('Nama pasien wajib diisi!');
    return;
  }

  isSubmitting.value = true;
  setTimeout(() => {
    pharmacyStore.uploadPrescription({
      patient_name: portalForm.patient_name,
      patient_phone: portalForm.patient_phone,
      doctor_name: portalForm.doctor_name,
      notes: portalForm.notes,
      image_path: portalForm.image_path || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    });

    isSubmitting.value = false;
    alert('Resep berhasil dikirim! Tim Apoteker kami akan segera menelaah resep Anda.');
    router.push('/prescriptions');
  }, 700);
};
</script>
