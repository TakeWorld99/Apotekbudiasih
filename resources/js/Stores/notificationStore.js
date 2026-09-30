import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  // --- Toast Notifications State ---
  const toasts = ref([]);

  const remove = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const show = ({
    type = 'info',
    title = '',
    message = '',
    duration = 3800,
  }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Default titles based on type if not provided
    const fallbackTitles = {
      success: 'Berhasil',
      error: 'Terjadi Kendala',
      warning: 'Peringatan',
      info: 'Informasi',
    };

    const finalTitle = title || fallbackTitles[type] || 'Notifikasi';

    // Format display time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const toastItem = {
      id,
      type,
      title: finalTitle,
      message,
      duration,
      timeStr,
      createdAt: Date.now(),
    };

    toasts.value.push(toastItem);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  };

  const success = (message, title = 'Berhasil', duration = 3800) => {
    // Strip redundant leading checkmarks like "✓ " if present
    const cleanMsg = typeof message === 'string' ? message.replace(/^✓\s*/, '') : message;
    return show({ type: 'success', title, message: cleanMsg, duration });
  };

  const error = (message, title = 'Gagal Diproses', duration = 4500) => {
    const cleanMsg = typeof message === 'string' ? message.replace(/^(⚠️|❌)\s*/, '') : message;
    return show({ type: 'error', title, message: cleanMsg, duration });
  };

  const warning = (message, title = 'Peringatan', duration = 4000) => {
    const cleanMsg = typeof message === 'string' ? message.replace(/^⚠️\s*/, '') : message;
    return show({ type: 'warning', title, message: cleanMsg, duration });
  };

  const info = (message, title = 'Informasi', duration = 3800) => {
    return show({ type: 'info', title, message, duration });
  };

  const clear = () => {
    toasts.value = [];
  };

  // --- Confirmation Modal State (Pengganti window.confirm) ---
  const confirmDialog = ref({
    isOpen: false,
    title: 'Konfirmasi Tindakan',
    message: '',
    type: 'danger', // 'danger' | 'warning' | 'primary'
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    resolve: null,
  });

  const confirm = ({
    title = 'Konfirmasi Tindakan',
    message = '',
    type = 'danger',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
  }) => {
    return new Promise((resolve) => {
      confirmDialog.value = {
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        resolve,
      };
    });
  };

  const closeConfirm = (result = false) => {
    if (confirmDialog.value.resolve) {
      confirmDialog.value.resolve(result);
    }
    confirmDialog.value.isOpen = false;
    confirmDialog.value.resolve = null;
  };

  return {
    toasts,
    confirmDialog,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
    confirm,
    closeConfirm,
  };
});
