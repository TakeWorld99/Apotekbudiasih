<template>
  <div
    class="fixed top-4 right-4 sm:top-5 sm:right-6 z-[99999] pointer-events-none flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md"
    aria-live="polite"
    aria-atomic="true"
  >
    <TransitionGroup name="toast-slide">
      <div
        v-for="t in notificationStore.toasts"
        :key="t.id"
        class="pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl shadow-slate-900/10 p-3.5 sm:p-4 transition-all duration-300 hover:shadow-2xl"
        :class="getToastBorderClasses(t.type)"
        role="alert"
      >
        <!-- Card Content -->
        <div class="flex items-start gap-3">
          <!-- Icon Badge -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-200 hover:scale-105"
            :class="getIconBadgeClasses(t.type)"
          >
            <CheckCircle2 v-if="t.type === 'success'" class="w-5 h-5 text-emerald-600" />
            <AlertCircle v-else-if="t.type === 'error'" class="w-5 h-5 text-rose-600" />
            <AlertTriangle v-else-if="t.type === 'warning'" class="w-5 h-5 text-amber-600" />
            <Info v-else class="w-5 h-5 text-sky-600" />
          </div>

          <!-- Text Details -->
          <div class="flex-1 min-w-0 pr-1">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-xs tracking-tight" :class="getTitleColor(t.type)">
                {{ t.title }}
              </span>
              <span class="text-[10px] text-slate-400 font-data font-medium shrink-0">
                {{ t.timeStr }}
              </span>
            </div>
            <p class="text-xs text-slate-600 font-normal leading-relaxed mt-0.5 whitespace-pre-line break-words">
              {{ t.message }}
            </p>
          </div>

          <!-- Close Action -->
          <button
            type="button"
            @click="notificationStore.remove(t.id)"
            class="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Tutup notifikasi"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Animated Progress Indicator Line -->
        <div
          v-if="t.duration > 0"
          class="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 overflow-hidden"
        >
          <div
            class="h-full toast-progress"
            :class="getProgressBarClasses(t.type)"
            :style="{ animationDuration: `${t.duration}ms` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/Stores/notificationStore';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next';

const notificationStore = useNotificationStore();

const getToastBorderClasses = (type) => {
  switch (type) {
    case 'success':
      return 'border-emerald-200/90 text-slate-800';
    case 'error':
      return 'border-rose-200/90 text-slate-800';
    case 'warning':
      return 'border-amber-200/90 text-slate-800';
    case 'info':
    default:
      return 'border-sky-200/90 text-slate-800';
  }
};

const getIconBadgeClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50/90 border-emerald-200 text-emerald-600';
    case 'error':
      return 'bg-rose-50/90 border-rose-200 text-rose-600';
    case 'warning':
      return 'bg-amber-50/90 border-amber-200 text-amber-600';
    case 'info':
    default:
      return 'bg-sky-50/90 border-sky-200 text-sky-600';
  }
};

const getTitleColor = (type) => {
  switch (type) {
    case 'success':
      return 'text-emerald-800';
    case 'error':
      return 'text-rose-800';
    case 'warning':
      return 'text-amber-800';
    case 'info':
    default:
      return 'text-sky-800';
  }
};

const getProgressBarClasses = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500';
    case 'error':
      return 'bg-rose-500';
    case 'warning':
      return 'bg-amber-500';
    case 'info':
    default:
      return 'bg-sky-500';
  }
};
</script>

<style scoped>
/* Toast Vue Slide-in / Slide-out Animations */
.toast-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
.toast-slide-move {
  transition: transform 0.3s ease;
}

/* Linear progress bar countdown animation */
@keyframes shrinkProgress {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

.toast-progress {
  animation-name: shrinkProgress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>
