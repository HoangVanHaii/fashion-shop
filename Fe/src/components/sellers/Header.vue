<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import type { Shop } from '../../interfaces/user';
import { useAuthStore } from '../../stores/authStore';
import { getImage } from '../../utils/format';
import { useRouter } from 'vue-router';

const props = defineProps<{
    'nav1': string,
    'nav2':string
}>()

const router = useRouter();
const auth = useAuthStore();
const shop = ref<Shop>();
onBeforeMount(async () => {
    const shop_id = await auth.getShopIdByUserIdStore();
    shop.value = await auth.getShopByidStore(shop_id || 1);
})

import emitter from "../../utils/eventBus";

const toggleNavbar = () => {
  emitter.emit("toggle-navbar");
};

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
    <header>
        <div class="nav">
            <div class="header-left">
                <i class="fa-solid fa-bag-shopping"></i>
                <div class="abslu">U</div>
                <div class="chanel" v-if="props.nav1 == undefined || props.nav1 === ''">
                    <span @click="router.push({name: 'home-seller'})">Navar</span>
                    <span style="color: black;">Kênh người bán</span>
                </div>
                <div class="navbar" v-if="props.nav1 != undefined && props.nav1 !== ''" >
                    <div @click="router.push({name: 'home-seller'})">Trang chủ</div>
                    <i class="fa-solid fa-greater-than"></i>
                    <span>{{ props.nav1 }}</span>
                    <i class="fa-solid fa-greater-than"></i>
                    <span class="title">{{ props.nav2 }}</span>
                </div>  
            </div>
            <div class="header-left-mobile" @click="router.push({name: 'home-seller'})">
                <i class="fa-solid fa-house"></i>
                <span>Trang chủ</span>
            </div>
            <div class="logo">
                <img src="../../assets/logo.jpg" alt="">
            </div>
            <div class="header-right">
                <i class="fa-solid fa-grip"></i>
                <hr>
                <div class="user-dropdown" @click="toggleDropdown">
                    <img :src="getImage(shop?.logo || '')" alt="">
                    <span class="shop-name">{{ shop?.shop_name }}</span>
                    <span><i class="fa-solid fa-chevron-down"></i></span>
                </div>
                <i class="fa-solid fa-bars" @click.stop="toggleNavbar"></i>
                
                <!-- Dropdown Menu -->
                <div v-if="isDropdownOpen" class="dropdown-menu">
                    <button class="dropdown-item">Thông tin tài khoản</button>
                    <hr class="dropdown-divider">
                    <button class="dropdown-item danger" @click="handleLogout">Đăng xuất</button>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.fa-bars{
    display: none;
}
.header-left-mobile{
    display: none;
}
header{
   width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 56px;
}
.header-left{
    margin-left: 20px;
    margin-top: 10px;
    position: relative;
    color: red;
    font-size: 28px;
    display: flex;
    gap: 10px
}
.abslu{
    position: absolute;
    top: 9px;
    z-index: 9999;
    color: white;
    font-size: 17px;
    left: 6.2px;
    transform: rotate(180deg)
}
.chanel {
    display: flex;
    gap: 30px;
    font-size: 24px;
    margin-top: 4px;
}
.fa-grip{
    margin-right: 10px;
}
.shop-name{
    font-size: 20px;
}
.fa-chevron-down{
    font-size: 18px;
}
.nav{
    display: flex;
    justify-content: space-between;
}
.header-right{
    margin-right: 20px;
    display: flex;
    font-size: 27px;
    gap: 10px;
    justify-content: center;
    align-items: center;
    position: relative;
}

.user-dropdown {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 5px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.user-dropdown:hover {
    background-color: #f5f5f5;
}

hr{
    height: 25px;
}
.header-right img{
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.navbar{
    color: rgb(124, 124, 124);
    display: flex;
    gap: 20px;
    font-size: 22px;
    margin-top: 4px;
}
.navbar i {
    font-size: 16px;
    margin-top: 6.5px;
}
.title{
    color: black;
}
.logo{
    display: none;
}

/* Dropdown Menu Styles */
.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    overflow: hidden;
    z-index: 1001;
}

.dropdown-item {
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: white;
    text-align: left;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.dropdown-item:hover {
    background-color: #f5f5f5;
}

.dropdown-item.danger {
    color: #dc3545;
}

.dropdown-item.danger:hover {
    background-color: #fff5f5;
}

.dropdown-divider {
    margin: 0;
    border: none;
    border-top: 1px solid #e0e0e0;
    height: 1px;
}

@media(max-width: 767px){
    .header-left{
        display: none;
    }
    .logo{
        display: flex;
        height: 45px;
        margin-top: 5px;
        margin-right: 15px;
    }
    .header-left-mobile{
        display: flex;
        gap: 10px;
        font-size: 27px;
        color: rgb(63, 63, 63);
        margin-top: 10px;
        margin-left: 15px;
    }
    hr{
        display: none;
    }
    .header-right{
        gap: 2px;
    }
    .header-right i, .shop-name{
        display: none;
    }
    .fa-bars{
        display: flex !important;
        color: rgb(50, 50, 50);
    }
}
@media (max-width: 450px) {
    .logo{
        display: none;
    }
}
</style>