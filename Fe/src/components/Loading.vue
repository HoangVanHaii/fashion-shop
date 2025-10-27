<script setup lang="ts">
import { ref, } from 'vue'
const props = defineProps <{
    loading: boolean  
}>()

</script>
<template>
    <div class="product-page">
        <div v-if="props.loading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
    </div>
</template>
<style scoped>
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); 
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        /* cursor: wait;  */
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 6px solid #f3f3f3;
        border-top: 6px solid #e74c3c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>