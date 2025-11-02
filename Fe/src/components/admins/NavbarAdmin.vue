<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import emitter from '../../utils/eventBus'
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';

const isShow = ref(false)
const showForm = ref<HTMLElement | null>(null);
const router = useRouter();

const handleResize = () => {
    if (window.innerWidth > 768) {
        isShow.value = true;
    } else {
        isShow.value = false;
    }
};

const handleClickOutside = (e: Event) => {
    // nếu click không nằm trong khối navbar -> đóng (chỉ áp dụng mobile)
    if (
        window.innerWidth <= 768 &&
        showForm.value &&
        !showForm.value.contains(e.target as Node)
    ) {
        isShow.value = false;
    }
};

onMounted(() => {
    handleResize();
    emitter.on("toggle-navbar", () => {
        isShow.value = !isShow.value;
    });
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", handleResize);
})

onUnmounted(() => {
    emitter.off("toggle-navbar"); 
});

const showManagermentOrder = ref<boolean>(false)
const showData = ref<boolean>(false);
const showManagermentProduct = ref<boolean>(false);
const showCustomCare = ref<boolean>(false);
const showManagermentShop = ref<boolean>(false);
const showMarketing = ref<boolean>(false);
const showVoucher = ref<boolean>(false);
const showFlashSale = ref<boolean>(false);
const showAllOrder = ref<boolean>(false);
const showAllProduct = ref<boolean>(false);
const showAddProduct = ref<boolean>(false);
const showReview = ref<boolean>(false);
const showProfile = ref<boolean>(false);
const showProfileShop = ref<boolean>(false);
const showStatistical = ref<boolean>(false);

const reset = (...args: Ref<boolean>[]) => {
    args.forEach((a, index) => {
        if (index === args.length - 1) {
            a.value = !a.value;
        } else {
            a.value = false;
        }
    });
};

const goToOrder = () => {
    reset(
        showProfileShop,
        showFlashSale,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        showVoucher,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showReview,
        showProfile,
        showStatistical,
        showAllOrder
    );
    handleResize();    

    showManagermentOrder.value = true;
    router.push({name: 'order-seller'})

}

// const goToAllProduct = () => {
//     reset(
//         showProfileShop,
//         showFlashSale,
//         showManagermentOrder,
//         showData,
//         showManagermentProduct,
//         showCustomCare,
//         showManagermentShop,
//         showMarketing,
//         showVoucher,
//         isShow,
//         showAllOrder,
//         showAddProduct,
//         showReview,
//         showProfile,
//         showAllOrder,
//         showStatistical,
//         showAllProduct
//     );
//     handleResize();    
//     showManagermentProduct.value = true;
//     router.push({name: 'product-seller'})
// }

// const gotoAddProduct = () => {
//     reset(
//         showProfileShop,
//         showFlashSale,
//         showManagermentOrder,
//         showData,
//         showManagermentProduct,
//         showCustomCare,
//         showManagermentShop,
//         showMarketing,
//         showVoucher,
//         isShow,
//         showAllOrder,
//         showReview,
//         showProfile,
//         showAllOrder,
//         showAllProduct,
//         showStatistical,
//         showAddProduct
//     );
//     handleResize();    
//     showManagermentProduct.value = true;
// }

const goToStatistical = () => {
    reset(
        showProfileShop,
        showFlashSale,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        showVoucher,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showReview,
        showProfile,
        showAllOrder,
        showStatistical
    );
    handleResize();    
    showData.value = true;
}

const goToReview = () => {
    reset(
        showProfileShop,
        showFlashSale,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        showVoucher,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showProfile,
        showAllOrder,
        showStatistical,
        showReview
    );
    handleResize();    
    showCustomCare.value = true;
}

const goToVoucher = () => {
    reset(
        showProfileShop,
        showFlashSale,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showReview,
        showProfile,
        showAllOrder,
        showStatistical,
        showVoucher
    );
    handleResize();    
    showMarketing.value = true;
}

const goToProfile = () => {
    reset(
        showAddProduct,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        showVoucher,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showReview,
        showAllOrder,
        showStatistical,
        showProfile
    );
    handleResize();    
    showProfileShop.value = true;
}

const goToFlashSale = () => {
    reset(
        showProfileShop,
        showManagermentOrder,
        showData,
        showManagermentProduct,
        showCustomCare,
        showManagermentShop,
        showMarketing,
        showVoucher,
        isShow,
        showAllOrder,
        showAllProduct,
        showAddProduct,
        showReview,
        showProfile,
        showAllOrder,
        showStatistical,
        showFlashSale
    );
    handleResize();    
    showMarketing.value = true;
    router.push({ name: 'flashsale-seller' });
}
</script>

<template>
    <div ref="showForm" class="nav" v-if="isShow">
        <!-- Tổng quan -->
        <div class="order" @click.stop="showData = !showData">
            <div class="menu-content">
                <i class="fa-solid fa-chart-line menu-icon"></i>
                <span>Tổng quan</span>
            </div>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showData == true}"></i>
        </div>
        <div class="detail-order" v-if="showData">
            <span @click="goToStatistical" :class="{ active : showStatistical === true}">Thống kê</span>
        </div>

        <!-- Đơn hàng -->
        <div class="order" @click.stop="showManagermentOrder = !showManagermentOrder">
            <div class="menu-content">
                <i class="fa-solid fa-shopping-bag menu-icon"></i>
                <span>Đơn hàng</span>
            </div>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showManagermentOrder == true}"></i>
        </div>
        <div class="detail-order" v-if="showManagermentOrder">
            <span @click="goToOrder" :class="{ active : showAllOrder === true}">Tất cả</span>
        </div>

        <!-- Khuyến mãi -->
        <div class="product" @click.stop="showMarketing = !showMarketing">
            <div class="menu-content">
                <i class="fa-solid fa-bullhorn menu-icon"></i>
                <span>Khuyến mãi</span>
            </div>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showMarketing == true}"></i>
        </div>
        <div class="detail-product" v-if="showMarketing">
            <span @click="goToVoucher" :class="{ active : showVoucher === true}">Mã giảm giá</span>
            <span @click="goToFlashSale" :class="{ active : showFlashSale === true}">Flash Sale</span>
        </div>

        <!-- Chính sách -->
        <div class="data" @click.stop="showCustomCare = !showCustomCare">
            <div class="menu-content">
                <i class="fa-solid fa-newspaper menu-icon"></i>
                <span>Chính sách</span>
            </div>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showCustomCare == true}"></i>
        </div>
        <div class="detail-data" v-if="showCustomCare">
            <span @click="goToReview" :class="{ active : showReview === true}">Điều khoản sử dụng</span>
        </div>

        <!-- Tài khoản -->
        <div class="customer-care" @click.stop="showProfileShop = !showProfileShop">
            <div class="menu-content">
                <i class="fa-solid fa-user menu-icon"></i>
                <span>Tài khoản</span>
            </div>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showProfileShop == true}"></i>
        </div>
        <div class="detail-customer-care" v-if="showProfileShop">
            <span @click="goToProfile" :class="{ active : showProfile === true}">Tài khoản & phân quyền</span>
        </div>

    </div>
</template>

<style scoped>
span:hover{
    cursor: pointer;
    transform: translateX(-1px);
    box-shadow: 0 2px 5px rgba(246, 67, 67, 0.2);
}

i{
    color: rgb(129, 129, 129);
    font-size: 15px;
    margin-top: 4px;
}

.menu-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.menu-icon {
    font-size: 18px;
    color: rgb(129, 129, 129);
    margin-top: 0;
}

.nav{
    width: 17%;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    padding: 6px;
    font-size: 20px;
}

.detail-order, .detail-product, .detail-data, .detail-customer-care, .detail-shop, .detail-marketing {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-left: 34px;
    font-size: 19px;
}

.order{
    margin-top: 30px;
}

.order, .product, .data, .customer-care, .shop, .marketing {
    display: flex;
    margin-left: 4px;
    justify-content: space-between;
}

.nav .active {
    color: red;
}

.nav .rotate {
    transform: rotate(180deg);
}
</style>