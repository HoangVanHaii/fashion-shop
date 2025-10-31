<script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import logo from "../assets/logo.jpg"
    import { useAuthStore } from '../stores/authStore';
    import VerifyOTP from '../components/VerifyOTP.vue';
    import Header from '../components/Header.vue';
    import Notification from '../components/Notification.vue';

    const auth = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    
    const showVerify = ref(false);
    const name = ref<string>('');
    const email = ref<string>('');
    const phone = ref<string>('');
    const password = ref<string>('');
    const dateOfBirth = ref<string>('');

    const isShaking = ref(false);
    const showNotification = ref<boolean>(false);
    const toastText = ref('');
    const nameInput = ref<HTMLInputElement | null>(null);
    const emailInput = ref<HTMLInputElement | null>(null);
    const phoneInput = ref<HTMLInputElement | null>(null);
    const passwordInput = ref<HTMLInputElement | null>(null);
    const dobInput = ref<HTMLInputElement | null>(null);
    const showPassword = ref(false)


    const openRegister = () => {
        email.value = '';
        password.value = '';
        dateOfBirth.value = ''
        phone.value = '';
        router.push('/auth/register')
    }
    const openLogin = () => {
        name.value = '';
        password.value = '';    
        router.push('/auth/login')
    }
    const togglePassword = () => {
    showPassword.value = !showPassword.value
    }
    const handleRegister = async () => {
        if (!name.value) {
            nameInput.value?.focus();
            auth.error = "Tên không được bỏ trống";
            triggerShake()
            return;
        }
        if (!email.value) {
            auth.error = "Email không được bỏ trống";
            triggerShake()
            emailInput.value?.focus();
            return;
        }
        if (!phone.value) {
            auth.error = "Số điện không được bỏ trống";
            triggerShake()
            phoneInput.value?.focus();
            return;
        }
        if (!password.value) {
            auth.error = "Mật khẩu không được bỏ trống";
            triggerShake()
            passwordInput.value?.focus();
            return;
        }
        if (!dateOfBirth.value) {
            auth.error = "Ngày sinh không được bỏ trống";
            triggerShake()
            dobInput.value?.focus();
            return;
        }
        showNotification.value = false;
        await auth.registerSendOtpStore(name.value, email.value, phone.value, password.value, dateOfBirth.value)
        if(auth.error){
            auth.loading = false;
            triggerShake();
            return;
        }
        if (auth.success) {
            password.value = '';
            showVerify.value = true;
            showNotification.value = true;
        }

        auth.loading = false;
    }
    const handleLogin = async () => {
        if (!email.value) {
            auth.error = "Email không được bỏ trống";
            triggerShake()
            emailInput.value?.focus();
            return;
        }
        if (!password.value) {
            auth.error = "Mật khẩu không được bỏ trống";
            triggerShake()
            passwordInput.value?.focus();
            return;
        }
        showNotification.value = false;
        toastText.value = '';
        await auth.loginStore(email.value, password.value);
        if (auth.error) {
            triggerShake();
        }
        if(auth.success) {
            showNotification.value = true;
            toastText.value = "✅ Đăng nhập thành công!";
            setTimeout(() => {
                const redirectPath = router.currentRoute.value.query.redirect;
                if (redirectPath) {
                    router.push(redirectPath.toString());
                }
                else {
                    router.push('/');
                }
            }, 1500);
        }
    }
    const triggerShake = () => {
        isShaking.value = true;
        setTimeout(() => {
            isShaking.value = false;
        }, 400); 
    };
    
</script>
<template>
     <Header />
     <Notification :text="toastText" :isSuccess="showNotification" />
    <div class="container">
        <div class="slogan">
            <img :src="logo" alt="">
            <p class="welcome">Chào mừng bạn đến với Nava </p>
            <p class="shopping"> Thiên đường mua sắm</p>
        </div>
        <div class="form-register" v-if="route.name=='register-sendOTP'"  @submit.prevent="handleRegister" >
            <div class="title">
                <span id="login" @click="openLogin()">Đăng nhập</span>
                <span id="space">|</span>
                <span id="register">Đăng ký</span>
            </div>
            <div class="content">
                <input ref="nameInput" v-model="name" type="text" class="name" placeholder="Tên">
                <input ref="dobInput" v-model="dateOfBirth" type="date" class="date-of-birth" placeholder="dd/MM/yyy">
                <input ref="emailInput" v-model="email" type="text" class="email" placeholder="Email">
                <input ref="phoneInput" v-model="phone" type="text" class="phone-number" placeholder="Số điện thoại">
                <!-- <input ref="passwordInput" v-model="password" type="password" class="password" placeholder="Mật khẩu"> -->
                <div class="password-wrapper">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Mật khẩu">
                    <i @click="togglePassword" class="fa" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </div>
                <button 
                    class="register" 
                    @click="handleRegister"
                    :disabled="auth.loading"
                    :class="{ 'loading-button': auth.loading }"
                >
                    {{ auth.loading ? 'Đang đăng ký' : 'Đăng ký' }}
                </button>            
            </div>
            <p
                    v-if="auth.error"
                    style="color: red;"
                    :class="{ shake: isShaking }"
                    class="error-text"
                >
                {{ auth.error }}
                </p>
            <span id="or">————— Hoặc —————</span>
             <div class="other-register">
                <button class="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
                <button class="google"><i class="fa-brands fa-google"></i> Google</button>
            </div>
            <div class="rule">
                <span>Bằng việc đăng kí, bạn đã đồng ý với Nava về</span>
                <br>
                <div class="policy-clause">
                    <span id="clause">Điều khoản dịch vụ </span> <span>&</span> <span id="policy"> Chính sách bảo mật</span>
                </div>
                
            </div>
        </div>
         <div class="form-login" v-if="route.path=='/auth/login'">
            <div class="title">
                <span id="register">Đăng nhập</span>
                <span id="space">|</span>
                <span id="login" @click="openRegister()">Đăng ký</span>
            </div>
            <div class="content">
                <input v-model="email" type="text" class="email" placeholder="Email">
                <!-- <input v-model="password" type="password" class="password" placeholder="Mật khẩu"> -->
                <div class="password-wrapper">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Mật khẩu">
                    <i @click="togglePassword" class="fa" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </div>
                <div class="forgetPass">
                    <span id="forgetPass">Quên mật khẩu?</span>
                </div>
                <button
                    class="register"
                    @click="handleLogin"
                    :disabled="auth.loading"
                    :class="{ 'loading-button': auth.loading }"
                    >
                    {{ auth.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
            </div>
            <span id="or">————— Hoặc —————</span>
            <div class="other-login">
                <button class="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
                <button class="google"><i class="fa-brands fa-google"></i> Google</button>
                
            </div>
            <p 
                :class="{ shake: isShaking }" 
                style="color: red; transition: all 0.2s;">
                {{ auth.error }}
            </p>
        </div>
    </div>
    <div v-if="showVerify" class="modal-overlay" @click="showVerify = false">
        <div class="modal-content" @click.stop>
            <VerifyOTP :email="email" :phone="phone" @close="showVerify = false" />
        </div>
    </div>
</template>
<style scoped>
.loading-button {
    cursor: wait !important;
    opacity: 0.7;
}
.fa-facebook{
    color: blue;
    font-size: 15px;
}
.container {
    margin-top: 9%; 
    width: 96%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1rem;    
}
.slogan {
    height: 60%;
    width: 40%;
    margin-left: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 30px;
}
img{
    width: 30%;
    height: 30%;
}
.welcome, img {
    font-size: 32px;
    font-family: sans-serif;
    opacity: 0;
    transform: translateX(-250px);
    animation: slideIn 1s ease-out forwards;
}
.shopping {
    margin-top: -10px;
    font-size: 30px;
    font-family: sans-serif;
    opacity: 0;
    transform: translateX(250px);
    animation: slideIn 1s ease-out forwards;
}

.form-register, .form-login  {
    height: 85%;
    width: 32%;
    border: 1px solid rgb(153, 153, 153);
    margin-right: 4%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateX(250px);
    animation: slideIn 1s ease-out forwards;

}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.shake {
  animation: shake 0.4s ease;
}

.shake {
animation: shake 0.4s ease;
}
@keyframes slideIn {
    to {
    opacity: 1;
    transform: translateX(0);
    }
}
.content{
    display: flex;
    width: 80%;
    margin-top: 10px;
    flex-direction: column;
}
.title {
    margin-top: 10px;
    font-weight: 900;
    font-size: 32;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    width: 70%;
}
#login{
    margin-top: 10px;
    font-size: 20px;
    color: rgb(143, 143, 143);
}
#login, #register:hover {
    cursor: pointer;
}
#register{
    margin-top: 10px;
    color: black;
    font-size: 20px;
}
#space{
    font-size: 39px;
    margin-top: -5px;
    color: rgb(86, 86, 86);
}
input{
    height: 25px;
    width: 90%;
    margin: 0.6rem;
    padding: 2px;
    padding-left: 1rem;
    border-radius: 5px;
    border: 1px solid rgb(107, 107, 107);
      transition: all 0.3s ease;

}
input:focus {
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}
input:hover {
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
}
.register{
    height: 35px;
    width: 96%;
    margin: 0.6rem;
    padding: 2px;
    padding-left: 1rem;
    background-color: rgb(255, 46, 46);
    border: none;
    color: white;
    border-radius: 5px;
}
.register:hover{
    background-color: rgb(239, 11, 11);
}
.register:focus {
    box-shadow: 0 0 0 1px rgba(255, 59, 48, 0.4); 
}
.other-register, .other-login{
    width: 78%;
    display: flex;
    justify-content: space-between;
    margin: 0, 0.6rem, 0.6rem, 0.6rem;
    padding: 2px;
}
.facebook, .google{
    height: 35px;
    width: 36%;
    margin: 1rem;
    background-color: white;
    border-radius: 5px;
    border: 1px solid rgb(159, 159, 159);
}
#or{
    margin-top: 10px;
}
button:hover{
    cursor: pointer;
}
.rule{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.policy-clause{
    margin-top: -8px;
}
#policy, #clause{
    color: rgb(232, 51, 51);
}
.form-login {
    height: 56%;
}
.forgetPass{
    font-size: 13px;
    display: flex;
    color: rgb(57, 57, 238);
    font-style: italic;
    text-decoration: underline;
    justify-content: end;
}
.forgetPass:hover{
    cursor: pointer;
}
.password-wrapper {
    position: relative;
    width: 90%;
}
.password-wrapper input {
    height: 25px;
    width: 100%;
    border-radius: 5px;
    border: 1px solid rgb(107, 107, 107);
    transition: all 0.3s ease;
}
.password-wrapper i {
    position: absolute;
    right: -21px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #888;
    font-size: 13px;
}

@media screen and (max-width: 1024px) and (min-width: 768px) {
    .slogan {
        width: 40%;
    }
    .form-register {
        width: 44%;
        height: 85%;
    }
    .form-login {
        width: 40%;
        height: 55%;
    }
    .content{
        width: 90%;
    }
    #login, #register{
        font-size: 17px;
    }
    #space{
        margin-top: 0.2rem;
        font-size: 25px;
    }
  input, .register {
    font-size: 14px;
    height: 30px;
  }

  .facebook, .google {
    font-size: 14px;
    height: 32px;
  }

  .other-register {
    width: 100%;
  }
}
@media screen and (max-width: 767px) {
    img{
        display: none;
    }
    .container{
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        padding: 3px;
        top:8%;
        height: 90vh;
    }
    .slogan{
        width: 90%;
        margin: 0;
        height: 10%;
    }
    .form-register {
        width: 90%;
        margin: 0;
        height: 64%;
        transform: translateY(80px);

    }
    .form-login {
        width: 90%;
        margin: 0;
        height: 44%;
        transform: translateY(80px);
    }
    .shopping, .welcome {
        font-size: 20px;
    }
}

.register-container {
    transition: filter 0.3s ease;
}
.register-container.blurred {
    filter: blur(3px);
    pointer-events: none;
}
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Background đen mờ */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    position: relative;
    z-index: 10000;
}
.loading-button {
    cursor: wait !important;
    opacity: 0.7;
}
</style>
