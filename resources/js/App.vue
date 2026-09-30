<template>
  <router-view />
  <!-- Global In-App Notifications & Confirm Dialogs -->
  <SystemNotifications />
</template>

<script setup>
import { onMounted } from 'vue';
import { useNotificationStore } from '@/Stores/notificationStore';
import SystemNotifications from '@/Components/SystemNotifications.vue';

const notificationStore = useNotificationStore();

// Expose notification store globally and provide automatic fail-safe bridge
if (typeof window !== 'undefined') {
  window.$notify = notificationStore;

  // Intercept native browser alert to guarantee zero native popup leaks
  window.alert = (msg) => {
    if (!msg) return;
    const str = String(msg);
    const lower = str.toLowerCase();

    if (str.includes('✓') || lower.includes('berhasil') || lower.includes('sukses')) {
      notificationStore.success(str);
    } else if (lower.includes('gagal') || lower.includes('tidak dapat') || lower.includes('error') || lower.includes('salah')) {
      notificationStore.error(str);
    } else if (str.includes('⚠️') || lower.includes('wajib') || lower.includes('harus') || lower.includes('peringatan') || lower.includes('melebihi') || lower.includes('habis')) {
      notificationStore.warning(str);
    } else {
      notificationStore.info(str);
    }
  };
}
</script>
