<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import iconLock from '../assets/iconLock.jpg'
import Notification from "./Notification.vue";

const props = defineProps(['email']);
const emit = defineEmits(['close']);
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const err = ref<string>('');
const otpLength = 6;
const otp = ref<string[]>(Array(otpLength).fill(""));
const resending = ref<boolean>(false);
const inputs = ref<(HTMLInputElement | null)[]>([]);

const showNotification = ref<boolean>(false);
const toastText = ref('');
const handleInput = (index: number) => {
    err.value = "";
    const current = otp.value[index];
    if (current && index < otpLength - 1) {
        nextTick(() => inputs.value[index + 1]?.focus());
    }
};
onMounted(() => {
    if (inputs) {
        nextTick(() => inputs.value?.[0]?.focus());
    }
})
const handleBackspace = (event: KeyboardEvent, index: number) => {
    if (event.key === "Backspace" && !otp.value[index] && index > 0) {
        nextTick(() => inputs.value[index - 1]?.focus());
    }
};

const handleSubmit = async () => {
    const otpCode = otp.value.join("");
    auth.loading = true;
    if(otpCode.length != 6){
        err.value = "Vui lòng mã có 6 chữ số";
        auth.loading = false;
        return;
    }
    const email: string = props.email
    if (route.path == '/auth/register') {
        await auth.verifyRegisterStore(email, otpCode)
        if(auth.success){
            showNotification.value = true;
            toastText.value = "✅ Xác thực thành công!";
            setTimeout(() => {
                emit('close');
                router.push('/auth/login')
            }, 1200);  
            
        }
        if(auth.error){
            err.value = auth.error;
        }
    }
    auth.loading = false;
}
const handleResendOTP = async () => {
    resending.value = true;
    err.value = "";
        
    // TODO: Gọi API gửi lại OTP ở đây
    // await auth.resendOTPStore(email);
    
    setTimeout(() => {
        resending.value = false;
        otp.value = Array(otpLength).fill("");
        nextTick(() => inputs.value[0]?.focus());
        
    }, 1500);
}
const handleClose = () => {
    emit('close');
}
</script>

<template>
    <Notification :text="toastText" :isSuccess="showNotification" />

    <div class="otp-wrapper" @click="handleClose" >
        <div class="otp-card" @click.stop>
            <img :src="iconLock" alt="otp" class="otp-logo" />
            <h2>XÁC THỰC OTP</h2>
            <p class="otp-desc">
                    Vui lòng nhập mã số chúng tôi đã gửi qua email
                <span>******{{ route.query.email?.toString().slice(5) }}</span>. Mã xác thực trong 120s
            </p>

            <div class="otp-inputs">
                <input
                    v-for="(digit, index) in otp"
                        :key="index"
                        type="text"
                        maxlength="1"
                        class="otp-input"
                        v-model="otp[index]"
                        ref="inputs"
                        :disabled="digit=='khongsudung'"
                        @input="handleInput(index)"
                        @keydown="handleBackspace($event, index)"
                    />
            </div>
            <button
                    class="otp-btn"
                    @click="handleSubmit"
                    :disabled="auth.loading"
                    :class="{ 'loading-button': auth.loading }"
                >
                    Tiếp tục
            </button>
             <p class="otp-resend">
                Chưa nhận được mã? 
                <a 
                    href="#" 
                    @click.prevent="handleResendOTP"
                    :class="{ 'resending': resending }"
                >
                    {{ resending ? 'Đang gửi...' : 'Gửi lại' }}
                </a>
            </p>
            <p style="color: red;">{{err}}</p>
        </div>
  </div>
</template>

<style scoped>

.otp-wrapper {
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
    /* background-color: red; */
}

.otp-card {
    width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 40px 20px;
    text-align: center;
}

.otp-logo {
    width: 90px;
    margin-bottom: 20px;
}

h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
}

.otp-desc {
    color: #555;
    font-size: 14px;
    margin-bottom: 20px;
}

.otp-desc span {
    font-weight: 600;
    color: #000;
}

.otp-inputs {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 25px;
}

.otp-input {
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    outline: none;
    transition: 0.2s;
}

.otp-input:focus {
    border-color: #ff6600;
    box-shadow: 0 0 5px #ff6600;
}

.otp-btn {
    width: 100%;
    background: #ff4500;
    border: none;
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;
}

.otp-btn:hover {
    background: #ff5722;
}

.otp-resend {
    font-size: 13px;
    margin-top: 15px;
}

.otp-resend a {
    color: #0066cc;
    text-decoration: none;
}

@media screen and (max-width: 576px) {
    .otp-card {
        width: 350px;
    }
    h2{
        font-size: 18px;
    }
    .otp-input{
        width: 47px;
        height: 47px;
        font-size: 18px;
    }
}
.loading-button {
    cursor: wait !important;
    opacity: 0.7;
}
.otp-resend a.resending {
    color: #999;
    cursor: wait;
    pointer-events: none;
}
</style>
