<script setup lang="ts">
import { ref , onBeforeMount} from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cartStore'
import { useCategoryStore } from '../stores/categoryStore'

import logo from '../assets/logo.jpg'

const cart = useCartStore();
const category = useCategoryStore();
const router = useRouter();

const searchQuery = ref('');
const showNamDropdown = ref(false);
const showNuDropdown = ref(false);
const showPhuKienDropdown = ref(false);
const cartCount = ref<number>(0); 
const categoryMale = ref<string[]>([]);
const categoryFemale = ref<string[]>([]);

const handleSearch = () => {
  console.log('Search:', searchQuery.value);
};

onBeforeMount(async() => {
    cartCount.value = await cart.getCartCountStore();
    categoryMale.value = await category.getCategoryNameStore('Nam');
    categoryFemale.value = await category.getCategoryNameStore('Nữ');
})
const goToCart = () => {
  router.push('/cart');
};

const goToProfile = () => {
  router.push('/profile');
};
</script>

<template>
  <header class="header">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="contact-info">
        <span>Hotline: 0000000 (8h-12h, 13h-5h)</span>
        <span class="divider">|</span>
        <span>Liên hệ</span>
      </div>
      <div class="store-info">
        <span><i class="fa-solid fa-bell"></i> Thông báo của tôi</span>
      </div>
    </div>

    <!-- Main header -->
    <div class="main-header">
      <div class="container">
        <!-- Logo -->
         <i class="fa-solid fa-bars"></i>
        <div class="logo">
          <img :src="logo"  @click="router.push('/')">
        </div>

        <nav class="nav-menu">
          <a href="/" class="nav-link">Trang chủ</a>
          <a href="/collections" class="nav-link">Ưu đãi cực hot</a>
          
          <div class="dropdown" @mouseenter="showNamDropdown = true" @mouseleave="showNamDropdown = false">
            <a href="/nam" class="nav-link">
              Nam <span class="arrow">▼</span>
            </a>
            <div v-if="showNamDropdown" class="dropdown-menu">
              <a v-for="nameCateMen in categoryMale" href="/nam/ao">{{ nameCateMen }}</a>
            </div>
          </div>

          <div class="dropdown" @mouseenter="showNuDropdown = true" @mouseleave="showNuDropdown = false">
            <a href="/nu" class="nav-link">
              Nữ <span class="arrow">▼</span>
            </a>
            <div v-if="showNuDropdown" class="dropdown-menu">
              <a v-for="nameCateFemale in categoryFemale" href="/nu/ao">{{ nameCateFemale }}</a>
            </div>
          </div>

          <div class="dropdown" @mouseenter="showPhuKienDropdown = true" @mouseleave="showPhuKienDropdown = false">
            <a href="/phu-kien" class="nav-link">
              Phụ kiện <span class="arrow">▼</span>
            </a>
            <div v-if="showPhuKienDropdown" class="dropdown-menu">
              <a href="/phu-kien/tui">Túi xách</a>
              <a href="/phu-kien/giay">Giày dép</a>
              <a href="/phu-kien/non">Nón</a>
            </div>
          </div>
        </nav>

        <div class="search-bar">
          <i class="fa-solid fa-magnifying-glass" @click="handleSearch"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search" 
            @keyup.enter="handleSearch"
          >
        </div>

        <div class="user-actions">
          <div class="user-icon" @click="goToProfile">
             <i class="fa-solid fa-user"></i> 
          </div>
          <div class="cart-icon" @click="goToCart">
             <i class="fa-solid fa-cart-shopping"></i>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Top bar */
.top-bar {
  background: linear-gradient(90deg, #ff6b35 0%, #ff8c5a 100%);
  color: white;
  padding: 8px 0;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px;
}

.contact-info {
  display: flex;
  align-items: center;
}

.divider {
  margin: 0 5px;
}
.fa-bars{
  display: none;
}
.store-info {
  cursor: pointer;
}

/* Main header */
.main-header {
  background: white;
  padding: 12px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Logo */
.logo {
  cursor: pointer;
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

/* Navigation */
.nav-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 45px;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ff6b35;
}

.arrow {
  font-size: 10px;
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 10px 0;
  min-width: 150px;
  /* margin-top: 10px; */
  z-index: 100;
}

.dropdown-menu a {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
  color: #ff6b35;
}

/* Search bar */
.search-bar {
  display: flex;
  gap:10px;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 8px 15px;
  width: 280px;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-bar input::placeholder {
  color: #999;
}

.search-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
}

/* User actions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-icon,
.cart-icon {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.user-icon img,
.cart-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

/* Responsive */
@media screen and (max-width: 1024px) {
  .container {
    padding: 0 20px;
    gap: 15px;
    display: flex;
    justify-content: space-between;
  }

  .nav-menu {
    gap: 15px;
  }

  .nav-link {
    font-size: 14px;
  }

  .search-bar {
    width: 200px;
  }
}

@media screen and (max-width: 768px) {
  .top-bar {
    padding: 6px 20px;
    font-size: 11px;
  }
  .search-bar{
    display: none;
  }
  .fa-bars{
    display: flex;
    font-size: 25px;
  }
  .container {
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-menu {
    display: none;
  }

  .search-bar {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }

  .logo img {
    height: 40px;
  }

  .user-icon img,
  .cart-icon img {
    width: 24px;
    height: 24px;
  }
}
</style>