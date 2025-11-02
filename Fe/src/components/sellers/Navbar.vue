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
const props = defineProps<
    {
        'isShow': boolean
        'showManagermentOrder': boolean,
        'showManagermentProduct': boolean,
        'showData': boolean,
        'showCustomCare': boolean,
        'showManagermentShop': boolean,
        'showMarketing': boolean,
        'showVoucher': boolean,
        'showFlashSale': boolean,
        'showAllOrder': boolean,
        'showAllProduct': boolean,
        'showAddProduct': boolean,
        'showReview': boolean,
        'showProfileShop': boolean,
        'showProfile': boolean,
        'showStatistical': boolean,
    }>();

    const showManagermentOrder = ref<boolean>(props.showManagermentOrder)
    const showData = ref<boolean>(props.showData);
    const showManagermentProduct = ref<boolean>(props.showManagermentProduct);
    const showCustomCare = ref<boolean>(props.showCustomCare);
    const showManagermentShop = ref<boolean>(props.showManagermentShop);
    const showMarketing = ref<boolean>(props.showMarketing);
    const showVoucher = ref<boolean>(props.showVoucher);
    const showFlashSale = ref<boolean>(props.showFlashSale);
    const showAllOrder = ref<boolean>(props.showAllOrder);
    const showAllProduct = ref<boolean>(props.showAllProduct);
    const showAddProduct = ref<boolean>(props.showAddProduct);
    const showReview = ref<boolean>(props.showReview);
    const showProfile = ref<boolean>(props.showProfile);
    
    const showProfileShop = ref<boolean>(props.showProfileShop);
    // const isShow = ref<boolean>(props.isShow);
    const showStatistical = ref<boolean>(props.showStatistical);
    

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
const goToAllProduct = () => {
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
        showAddProduct,
        showReview,
        showProfile,
        showAllOrder,
        showStatistical,
        showAllProduct
    );
        handleResize();    
    showManagermentProduct.value = true;
    router.push({name: 'product-seller'})
}
const gotoAddProduct = () => {
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
        showReview,
        showProfile,
        showAllOrder,
        showAllProduct,
        showStatistical,
        showAddProduct
    );
        handleResize();    
    showManagermentProduct.value = true;
    showAddProduct.value = true;
    router.push({name: 'add-product-seller'})
}
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
        <div class="order" @click.stop="showManagermentOrder = !showManagermentOrder">
            <span>Quản lý đơn hàng</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showManagermentOrder == true}"></i>
        </div>
        <div class="detail-order" v-if="showManagermentOrder">
            <span @click="goToOrder" :class="{ active : showAllOrder === true}">Tất cả</span>
        </div>
        <!--  -->
        <div class="product" @click.stop="showManagermentProduct = !showManagermentProduct">
            <span>Quản lý sản phẩm</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showManagermentProduct == true}"></i>
        </div>
        <div class="detail-product" v-if="showManagermentProduct">
            <span @click="goToAllProduct" :class="{ active : showAllProduct === true}">Tất cả sản phẩm</span>
            <span @click="gotoAddProduct" :class="{ active : showAddProduct === true}">Thêm sản phẩm</span>
        </div>
        <!--  -->
        <div class="data" @click.stop="showData = !showData">
            <span>Dữ liệu</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showData == true}"></i>
        </div>
        <div class="detail-data" v-if="showData">
            <span @click="goToStatistical" :class="{ active : showStatistical === true}">Thống kê</span>
        </div>
        <!--  -->
        <div class="customer-care" @click.stop="showCustomCare = !showCustomCare">
            <span>Chăm sóc khách hàng</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showCustomCare == true}"></i>
        </div>
        <div class="detail-customer-care" v-if="showCustomCare">
            <span @click="goToReview" :class="{ active : showReview === true}">Quản lý đánh giá</span>
        </div>
        <!--  -->
        <div class="shop" @click.stop="showProfileShop = !showProfileShop">
            <span>Quản lý shop</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showProfileShop == true}"></i>
        </div>
        <div class="detail-shop" v-if="showProfileShop">
            <span @click="goToProfile" :class="{ active : showProfile === true}">Hồ sơ shop</span>
        </div>
        <!--  -->
        <div class="marketing" @click.stop="showMarketing = !showMarketing">
            <span>Marketing</span>
            <i class="fa-solid fa-chevron-down" :class="{ rotate: showMarketing == true}"></i>
        </div>
        <div class="detail-marketing" v-if="showMarketing">
            <span @click="goToVoucher" :class="{ active : showVoucher === true}">Chương trình flash sale</span>
            <span @click="goToFlashSale" :class="{ active : showFlashSale === true}">Mã giảm giá của shop</span>
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
    /* margin-top: 6px;
    margin-bottom: 10px; */
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