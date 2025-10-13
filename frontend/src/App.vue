<template>
  <div class="login-container">
    <div class="login-box">
      <div class="tabs">
        <span class="active">Đăng nhập</span>
        <span>Đăng ký</span>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="Nhập email" required />
        </div>

        <div class="form-group">
          <label>Mật khẩu</label>
          <input v-model="password" type="password" placeholder="Nhập mật khẩu" required />
        </div>

        <div class="forgot">
          <a href="#">Quên mật khẩu?</a>
        </div>

        <button type="submit" class="btn-login">Đăng nhập</button>
        <button type="button" class="btn-skip">Bỏ qua</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const password = ref('')

// URL backend — ví dụ: localhost:5000
const API_URL = 'http://localhost:3000/api/user/login'

const handleLogin = async () => {
  try {
    const res = await axios.post(API_URL, {
      email: email.value,
      password: password.value,
    })
    alert('Đăng nhập thành công!')
    console.log('Dữ liệu trả về:', res.data)
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || 'Đăng nhập thất bại!')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 350px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tabs {
  display: flex;
  justify-content: space-around;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: bold;
}

.tabs .active {
  color: red;
  border-bottom: 2px solid red;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.forgot {
  text-align: right;
  margin-bottom: 20px;
}

.forgot a {
  color: red;
  font-size: 13px;
  text-decoration: none;
}

.btn-login {
  background: red;
  color: white;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 10px;
}

.btn-skip {
  border: 1px solid red;
  color: red;
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: none;
  font-weight: bold;
}
</style>
