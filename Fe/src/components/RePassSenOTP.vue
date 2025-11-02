<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Notification from './Notification.vue';
import VerifyOTP from './VerifyOTP.vue';

const showEmail = ref(true);
const email = ref<string>('');
const emit = defineEmits(['close']);


const router = useRouter();
const auth = useAuthStore();
const textToast = ref('');
const showNotification = ref<boolean>(false);

const handleBack = () => {
  router.back();
};

const showVerify = ref<boolean>(false);
const sending = ref<boolean>(false);
const handleSubmit = async () => {
    textToast.value = '';
    if (!email.value || email.value.length < 10) {
        showNotification.value = false;
        setTimeout(() => {
            textToast.value = '❌ Email không hợp lệ'
        }, 0);
        return;
    }
    sending.value = true;
    await auth.forgotPasswordStore(email.value);
    sending.value = false;
    if (auth.error) {
        textToast.value = auth.error  ||  '❌ Có lỗi khi gửi OTP đến email ' + email.value
        showNotification.value = false;
        console.log(auth.error);
        return;
    }
    textToast.value = '✅ Đã gửi OTP đến email ' + email.value;
    showNotification.value = true;
    setTimeout(() => {
        showVerify.value = true;
        showEmail.value = false;
        // emit('close');
    }, 1500);

};
const handleClose = () => {
    emit('close');
}
</script>

<template>
    <Notification :text="textToast" :isSuccess="showNotification"/>
    <VerifyOTP :email="email" v-if="showVerify" @close="showVerify = false"/>
  <div class="reset-password-container"  @click="handleClose" v-if="showEmail">
    <div class="reset-password-card" @click.stop>
      <button @click="handleBack" class="back-button" type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <h2 class="title">Đặt lại mật khẩu</h2>

      <div class="reset-form">
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="input-field"
            :disabled="sending"
          />
        </div>

      

        <button @click="handleSubmit"
          type="submit" 
          class="submit-button"
          :disabled="sending"
        >
          <span v-if="!sending">Tiếp theo</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-container {
  display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 99999;
    background-color: rgba(0,0,0, 0.4) 
}

.reset-password-card {
  background: white;
  border-radius: 6px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
  position: relative;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.back-button:hover {
  color: #FF6B6B;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  margin-top: 1rem;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.input-field {
  width: 90%;
  padding: 0.6rem 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input-field::placeholder {
  color: #999;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border-left: 4px solid #c33;
}

.success-message {
  background: #efe;
  color: #2a7;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border-left: 4px solid #2a7;
  line-height: 1.5;
}

.submit-button {
  width: 100%;
  padding: 0.7rem 1rem;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 5px rgba(255, 107, 107, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .reset-password-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .back-button {
    top: 1.5rem;
    left: 1.5rem;
  }
}
</style>