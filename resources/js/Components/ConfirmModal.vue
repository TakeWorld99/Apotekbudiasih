<template>
  <Transition name="fade-modal">
    <div
      v-if="notificationStore.confirmDialog.isOpen"
      class="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none"
      @click.self="handleCancel"
      @keydown.esc="handleCancel"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        <!-- Modal Header with Icon -->
        <div class="flex items-start gap-4 mb-4">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
            :class="getIconContainerClass(notificationStore.confirmDialog.type)"
          >
            <AlertTriangle
              v-if="notificationStore.confirmDialog.type === 'warning'"
              class="w-6 h-6 text-amber-600"
            />
            <Trash2
              v-else-if="notificationStore.confirmDialog.type === 'danger'"
              class="w-6 h-6 text-rose-600"
            />
            <HelpCircle
              v-else
              class="w-6 h-6 text-emerald-600"
            />
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-slate-900 tracking-tight">
              {{ notificationStore.confirmDialog.title || 'Konfirmasi Tindakan' }}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed mt-1.5 whitespace-pre-line">
              {{ notificationStore.confirmDialog.message }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            @click="handleCancel"
            class="btn-cp-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {{ notificationStore.confirmDialog.cancelText || 'Batal' }}
          </button>
          
          <button
            type="button"
            @click="handleConfirm"
            class="font-semibold px-4 py-2 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs select-none cursor-pointer shadow-sm"
            :class="getConfirmButtonClass(notificationStore.confirmDialog.type)"
          >
            {{ notificationStore.confirmDialog.confirmText || 'Ya, Lanjutkan' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationStore } from '@/Stores/notificationStore';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-vue-next';

const notificationStore = useNotificationStore();

const handleCancel = () => {
  notificationStore.closeConfirm(false);
};

const handleConfirm = () => {
  notificationStore.closeConfirm(true);
};

const getIconContainerClass = (type) => {
  switch (type) {
    case 'danger':
      return 'bg-rose-50 border-rose-200';
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'primary':
    default:
      return 'bg-emerald-50 border-emerald-200';
  }
};

const getConfirmButtonClass = (type) => {
  switch (type) {
    case 'danger':
      return 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20';
    case 'primary':
    default:
      return 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20';
  }
};
</script>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
