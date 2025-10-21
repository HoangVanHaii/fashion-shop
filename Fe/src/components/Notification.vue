<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  ['text']: String,
  ['status']: Boolean
});
onMounted(() => {
    alert(props.text);
}); 
const visible = ref(false);
watch(
  () => props.status,
  (newVal) => {
    if (newVal) {
      visible.value = true;

      setTimeout(() => {
        visible.value = false;
      }, 2500);
    }
  }
);
</script>

<template>
  <div
    v-if="visible"
    :class="['notification', props.status ? 'success' : 'error']"
  >
    <i :class="props.status ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
    <p>{{ props.text }}</p>
  </div>
</template>

<style scoped>
.notification {
  position: fixed;
  top: 120px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 280px;
  z-index: 9999;
  animation: slideInOut 2.5s ease forwards;
}

/* Màu sắc */
.notification.success {
  background-color: #e6ffed;
  color: #2e7d32;
  border: 1px solid #2e7d32;
}

.notification.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #c62828;
}

.notification i {
  margin-right: 8px;
  font-size: 16px;
}

/* 🎬 Hiệu ứng trượt vào - trượt ra */
@keyframes slideInOut {
  0% {
    transform: translateX(120%);
    opacity: 0;
  }
  15% {
    transform: translateX(0);
    opacity: 1;
  }
  85% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}
</style>
