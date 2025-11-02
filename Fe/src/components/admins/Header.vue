<script setup lang="ts">
import { ref } from 'vue';
import router from '../../routers';

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const handleLogout = () => {
  localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_id");
  localStorage.removeItem("avatar");

  router.push('/auth/login')
}
</script>

<template>
  <header class="header">
    <!-- Left Section -->
    <div class="header-left">
      <i class="fas fa-briefcase icon"></i>
      <span class="title">Kênh quản lý</span>
    </div>

    <!-- Right Section -->
    <div class="header-right">
      <div class="user-menu" @click="toggleDropdown">
        <div class="avatar">
          <i class="fas fa-user"></i>
        </div>
        <span class="username">TenAdmin</span>
        <i 
          class="fas fa-chevron-down arrow" 
          :class="{ 'rotate': isDropdownOpen }"
        ></i>
      </div>

      <!-- Dropdown Menu -->
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <button class="dropdown-item">Thông tin tài khoản</button>
        <!-- <button class="dropdown-item">Cài đặt</button> -->
        <hr class="dropdown-divider">
        <button class="dropdown-item danger" @click="handleLogout">Đăng xuất</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  color: #dc2626;
  font-size: 24px;
}

.title {
  color: #dc2626;
  font-size: 25px;
  font-weight: 600;
}

.header-right {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-menu:hover {
  background-color: #f3f4f6;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar i {
  color: #6b7280;
  font-size: 16px;
}

.username {
  color: #374151;
  font-size: 22px;
  font-weight: 500;
}

.arrow {
  color: #6b7280;
  font-size: 12px;
  transition: transform 0.3s;
}

.arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 8px 0;
  z-index: 10;
}

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.danger {
  color: #dc2626;
}

.dropdown-item.danger:hover {
  background-color: #fef2f2;
}

.dropdown-divider {
  margin: 8px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}
</style>