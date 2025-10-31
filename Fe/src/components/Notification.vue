<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  text: string
  isSuccess?: boolean
}>()
const show = ref(false);
watch(() => props.text, (newVal) => {
    if (newVal) {
        show.value = true;
        setTimeout(() => (show.value = false), 1700);
    }
})
</script>
<template>
    <teleport to="body">
        <transition name="fade-slide"> 
            <div v-if="show" class="toast" :class="{'toast-success': isSuccess, 'toast-error': !isSuccess}">
                {{ text }}
            </div>
        </transition>
    </teleport>
</template>

<style scoped>
.toast{
    position: fixed;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 9999999;
    font-size: 18px;
    max-width: 300px;
    text-align: center;
}
.toast-success{
    background-color: rgb(64, 185, 64);
}
.toast-error{
    background-color: rgb(231, 73, 73);
}
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.6s ease;
} 
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -40px);
}

@media(max-width : 768px){
    .toast{
        padding: 10px 15px;
        font-size: 12px;
        max-width: 80%;
    }
}
</style>