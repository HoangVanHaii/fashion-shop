<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Shop } from '../../interfaces/user';
import { useAuthStore } from '../../stores/authStore';
import { getImage } from '../../utils/format';

const props = defineProps<{
    'nav1': string,
    'nav2':string
}>()

const auth = useAuthStore();
const shop = ref<Shop>();
onMounted(async () => {
    shop.value = await auth.getShopByidStore(3);
})
</script>

<template>
    <header>
        <div class="nav">
            <div class="header-left">
                <i class="fa-solid fa-bag-shopping"></i>
                <div class="abslu">U</div>
                <div class="chanel" v-if="props.nav1 == undefined">
                    <span>Navar</span>
                    <span style="color: black;">Kênh người bán</span>
                </div>
                <div class="navbar" v-if="props.nav1 != undefined">
                    <div >Trang chủ</div>
                    <i class="fa-solid fa-greater-than"></i>
                    <span>{{ props.nav1 }}jhjhjh</span>
                    <i class="fa-solid fa-greater-than"></i>
                    <span class="title">{{ props.nav2 }}jhjhjjhj</span>
                </div>
            </div>
            <div class="header-left-mobile">
                <i class="fa-solid fa-house"></i>
                <span>Trang chủ</span>
            </div>
            <div class="logo">
                <img src="../../assets/logo.jpg" alt="">
            </div>
            <div class="header-right">
                <i class="fa-solid fa-grip"></i>
                <hr>
                <img :src="getImage(shop?.logo || '')" alt="">
                <span class="shop-name">{{ shop?.shop_name }}</span>
                <span><i class="fa-solid fa-chevron-down"></i></span>
                <i class="fa-solid fa-bars"></i>
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
}
hr{
    height: 25px;
}
.header-right img{
    width: 55px;
    height: 55px;
    border-radius: 50%;
}
.navbar{

    color: rgb(124, 124, 124);
    display: flex;
    gap: 20px;
    font-size: 26px;
    margin-top: 2px;
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
@media(max-width: 650px){
    .header-left{
        display: none;
    }
    .logo{
        display: flex;
        /* width: 50%; */
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
@media (max-width: 390px) {
    .logo{
        display: none;
    }
}
</style>