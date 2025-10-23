<script setup lang="ts">
import Header from '../components/Header.vue';
import NavbarProfile from '../components/NavbarProfile.vue';
import Loading from '../components/Loading.vue';
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { getImage } from '../utils/getImage';
import { useOrderStore } from '../stores/orderStore';
import { formatPrice } from '../utils/formatPrice';
import { useRouter } from 'vue-router';
import type { GetOrder } from '../interfaces/order';

const router = useRouter();
const order = useOrderStore()
const auth = useAuthStore();
const nameProductSearch = ref<string>();
const selectedStatus = ref<string>("Tất cả");

const listOrder = ref<GetOrder[]>();
const filteredOrder = ref<GetOrder[]>();
const searchFilteredOrder = ref<GetOrder[]>();

const orderStatuses = ["Tất cả", "Chờ xác nhận", "Chờ lấy hàng", "Đang giao hàng", "Hoàn thành", "Đã hủy"];
const reverseStatusMap: Record<string, string> = {
    "Tất cả": "all",
    "Chờ xác nhận": "pending",
    "Chờ lấy hàng": "confirmed",
    "Đang giao hàng": "shipped",
    "Hoàn thành": "completed",
    "Đã hủy": "cancelled"
};

watch(selectedStatus, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        nameProductSearch.value = "";
        if (reverseStatusMap[newValue] === "all") {
            filteredOrder.value = listOrder.value
            searchFilteredOrder.value = filteredOrder.value;
        } else {
            const statusKey = reverseStatusMap[newValue]
            filteredOrder.value = listOrder.value?.filter(o => o.status === statusKey)
            searchFilteredOrder.value = filteredOrder.value;
        }
    }
});

const handleSelect = (status: string) => {
    selectedStatus.value = status;
};

onMounted(async () => {
    handleResize();
    const orders = await order.getOrderOfMeStore()
    if (orders) {
        for (const order of orders) {
            const productId = order.items[0]?.product_id;
            order.shop_name = await auth.getShopNameStore(productId || 4);
        }
        listOrder.value = orders
        filteredOrder.value = listOrder.value
        searchFilteredOrder.value = filteredOrder.value;
    }
    window.addEventListener('resize', handleResize);
})
const handleResize = () => {
    if (window.innerWidth > 768) {
        showNavbar.value = true;
    } else {
        showNavbar.value = false;
    }
}
const handleHideNavbar = () => {
    if (window.innerWidth <= 768) {
        showNavbar.value = false;
    }
};


function normalizeText(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .toLowerCase()
        .trim();
}

// 🔍 Theo dõi input — lọc realtime
watch(nameProductSearch, (newValue) => {
    if (!listOrder.value) return;

    const keyword = normalizeText(newValue || "");

    if (!keyword) {
        searchFilteredOrder.value = filteredOrder.value;
        return;
    }

    searchFilteredOrder.value = filteredOrder.value?.filter((order) => {
        const productName = normalizeText(order.items[0]?.product_name || "");
        return productName.includes(keyword);
    });
});

const handleRefresh = () => {
    router.go(0);
}

const showNavbar = ref<boolean>(true);
</script>    
<template>
    <Header></Header>
    <Loading  :loading="order.loading" />
    <div class="breadcrumb">
        <a href="/home" class="breadcrumb-item" >Trang chủ</a>
        <span class="separator">|</span>
        <span class="breadcrumb-item active" >Hồ sơ</span>
        <span class="separator">|</span>
        <span class="breadcrumb-item active" id="product-name">Đơn hàng</span>
    </div>
    <div class="container" @click="handleHideNavbar" >
        <NavbarProfile 
            v-model:show-menu="showNavbar"
            :show-detail="false" 
            :show-address="false" 
            :show-favourite="false" 
            :show-notification="false" 
            :show-order="true" 
            :show-profile="false" 
            :show-register-seller="false" 
            :show-reset-password="false" 
            :show-voucher="false" 
        />
        <div class="order">
            <div class="status">        
                <span
                    v-for="status in orderStatuses"
                    :key="status"
                    @click="handleSelect(status)"
                    :class="{ active: selectedStatus === status }"
                >
                    {{ status }}
                </span>
            </div>
            <div class="search">
                <input v-model="nameProductSearch" type="text" placeholder="Nhập tên sản phẩm để tìm kiếm">
                <button><i class="fa-solid fa-magnifying-glass"></i></button>
            </div>
            <div class="list-order">
                <div class="none-order" v-if="searchFilteredOrder?.length == 0">
                    <div class="img">
                        <img :src="getImage('/uploads/users/default-avatar.png')" alt="">
                    </div>
                    <div class="refresh-now">
                        <span v-if="filteredOrder?.length != 0">Không tìm thấy đơn hàng nào</span>
                        <span v-if="filteredOrder?.length == 0">Đơn hàng trống, mua sắm ngay thôi nào</span>
                        <button v-if="filteredOrder?.length == 0 " class="purchase-now" @click="router.push({name: 'Home'})">Xem ngay</button>
                        <span v-if="filteredOrder?.length != 0" class="refresh" @click="handleRefresh"><i class="fa-solid fa-rotate-right"></i> Vui lòng tải lại</span>
                    </div>
                </div>
                <div class="card-order" v-for="order in searchFilteredOrder">
                    <div class="header-shop">
                        <div class="header-left">
                            <i class="fa-solid fa-store"></i>
                            <span>{{order.shop_name }}</span>
                            <button>Xem shop</button>
                        </div>
                        <div class="status-order">
                            <div class="completed" v-if="order.status == 'completed'">
                                <i class="fa-solid fa-truck-fast"></i>
                                <span class="success">Giao hàng thành công |{{ ' ' }}</span>
                                <span>Hoàn thành</span>
                            </div>
                            <span class="pending" v-if="order.status == 'pending'">Chờ xác nhận</span>
                            <span class="confirmed" v-if="order.status == 'confirmed'">Chờ lấy hàng</span>
                            <span class="shipped" v-if="order.status == 'shipped'">Đang giao</span>
                            <span class="cancelled" v-if="order.status == 'cancelled'">Đã hủy</span>
                        </div>
                    </div>
                    <div class="product">
                        <div class="detail-product">
                            <div class="detail-left">
                                <img :src="getImage(order.items[0]?.image_url || '' )" alt="">
                                <div class="infor-product">
                                    <span class="name">{{ order.items[0]?.product_name }}</span>
                                    <span>Phân loại hàng: {{ order.items[0]?.color }}, {{ order.items[0]?.size }}</span>
                                    <span>x{{ order.items[0]?.quantity }}</span>
                                </div>
                            </div>
                            <div class="detail-right">
                                <div class="price">
                                    <span  class="old" v-if="order.items[0]?.flash_price">{{ formatPrice(order.items[0]?.price) }}</span>
                                    <span>{{ formatPrice(order.items[0]?.flash_price || order.items[0]?.price!) }}</span>
                                </div>
                                <button v-if="order.status == 'completed'">Đánh giá</button>
                            </div>
                        </div>
                    </div>
                    <div class="total-price">
                        <div class="last-total">
                            <span>Thành tiền: </span>
                            <span class="last-price">{{ formatPrice(order.total) }}</span>
                        </div>
                        <div class="btn">
                            <button class="see-order-detail">Xem chi tiết</button>
                            <button class="re-order" v-if="order.status === 'completed' || order.status == 'cancelled'">Mua lại</button>     
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .breadcrumb {
        padding: 15px 25px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        margin-left: -7px;
        margin-top: 110px;
        border-bottom: 1px solid #e0e0e0;
    }
    .automatic-redirect-image{
        display: none;
    }
    .breadcrumb-item {
        color: #a0a0a0;
        text-decoration: none;
        transition: color 0.3s;
        
    }
    #product-name{
        color: black;
    }
    .breadcrumb-item:hover {
        color: #ff6b35;
    }

    .breadcrumb-item.active {
        color: #a1a1a1;
        font-weight: 500;
    }.breadcrumb-item.active:hover {
        cursor: pointer;
    }
    .container{
        width: 100%;
        background-color: rgb(247, 247, 247);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top:1px;
        overflow: hidden;
        scrollbar-width: none;
        height: 74vh;
    }  
    
    .order{
        width: 75%;
        overflow-y: auto;
        /* scrollbar-width: thin; */
        background-color: white;
        border-top-left-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap:10px;
        align-items: center;
        padding-top: 10px;
        height: 100%;
    }   
    .order::-webkit-scrollbar {
            display: none;
        }
    .search{
        width: 80%;
        background-color: #f7f7f7;
        padding: 7px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }            
    .search input{
        font-size: 15px;
        border: none;
        outline: none;
        width: 85%;
        padding: 5px;
        background:none;
        margin-left: 10px;
    }
    .search button{
        width: 5%;
        height: 85%;
        border: none;
        background-color:#ff6b35;
        margin-right: 6px;
        border-radius: 6px;
        color: white;
        font-size: 17px;
    }
    .status {
        display: flex;
        /* gap: 15px; */
        width: 80%;
        justify-content: space-between;
    }

    .status span {
        cursor: pointer;
        color: #333;
        transition: color 0.2s, font-weight 0.2s;
    }

    .status span.active {
        color: red;
        /* font-weight: 600; */
        text-decoration: underline;
    }
    .list-order{
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 81.5%;
        height: auto;
    }
    .card-order{
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        background-color: #f5f5f5;
    }
    .header-shop{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-bottom: 10px;
        margin: 10px;
        border-bottom: 1px solid rgb(184, 184, 184);
    }
    .header-left i{
        color: #333;
        font-size: 20px;
        margin-right: 10px;
    }
    .header-left span {
        color: #000000;
        font-size: 20px;
        font-weight: 620;
        margin-right: 10px;
    }
    .header-left button{
        background: none;
        border: 1px solid rgb(180, 180, 180);
        font-size: 13px;
    }
    .header-left button:hover{
        cursor: pointer;
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
    }
    .status-order {
        display: flex;
        flex-direction: row;
        justify-content: end;
    }
    .status-order .completed span {
        color: red;
    }
    .status-order .completed .success, i{
        color: green;
    }
    .pending {
        color: blue;
    }
    .confirmed {
        color: rgb(226, 226, 3);
    }
    .shipped {
        color: green;
    }
    .cancelled {
        color: red;
    }
    .product{
        width: 100%;
        display: flex;
        flex-direction: column;
        margin: 10px
    }
    .detail-product{
        display: flex;
        flex-direction: row;

    }
    .detail-left {
        width: 60%;
        display: flex;
        flex-direction: row;
    }
    .detail-left img{
        border: 0.5px solid rgb(141, 141, 141);
        width: 20%;
    }
    .infor-product{
        display: flex;
        flex-direction: column;
        gap: 6px;
        justify-content: center;
        color: #707070;
        font-size: 15px;
        margin-left: 15px;
    }
    .name{
        font-weight: 400;
        font-size: 18px;
        color: #000000;
    }
    .detail-right{
        width: 35%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        color: red;
        font-size: 20px;
    }
    .price{
        display: flex;
        flex-direction: column;
    }
    .old{
        text-decoration:line-through;
        color: #000000;
        font-size: 17px;
    }
    .detail-right button:hover{
        background-color: #eefdff;
        cursor: pointer;
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
    }
    .detail-right button{
        background-color: white;
        color: rgb(3, 149, 175);
        border: 0.5px solid rgb(0, 119, 255);
    }
    .total-price{
        padding: 10px;
        background-color: #cccccc;
        display: flex;
        flex-direction: column;
        align-items:flex-end;
        width: 97%;
    }
    .last-total{
        font-size: 20px;
        margin-right: 5px;
    }
    .last-price{
        width: 100%;
        color: red;
    }
    .btn{
        display: flex;
        flex-direction: row;
        justify-content: end;
        width: 29%;
    }
    .btn button{
        background:none;
        margin: 4px;
        width: 45%;
        height: 30px;
    }
    .re-order{
        background-color: red !important;
        color: white;
        border: 0.5px solid rgb(218, 16, 16)
    }
    .re-order:hover{
        background-color: rgb(240, 1, 1) !important;
        cursor: pointer;
        box-shadow: 0 4px 5px rgba(228, 55, 55, 0.1);
    }
    .test{
        width: 100%;
        height: 400px;
        background-color: red;
    }
    .see-order-detail{
        color: blue;
        border: 0.5px solid rgb(16, 36, 218)
    }
    .see-order-detail:hover{
        background-color: #dfdfdf;
        cursor: pointer;
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
    }
    .none-order{
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .none-order .img{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40%;
    }
    .none-order .img img{
         width: 60%;
    }
    .refresh-now{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap:5px;
    }
    .refresh-now .refresh, .fa-rotate-right{
        color: blue;
    }
    .refresh-now .refresh:hover{
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }
    .fa-rotate-right:hover{
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }
    .refresh-now .purchase-now{
        background-color: red;
        color: white;     
        border:none;
        border-radius: 5px;
        width: 40%;
        height: 30px;
    }
    .refresh-now .purchase-now:hover{
        cursor: pointer;
        transform: translateY(-1px);
    }
    @media(max-width: 1024px){
        .container{
            border-radius: 0px;;
        }
        .order{
                        border-radius: 0px;;

            width: 75%;
        }
        .status{
            width: 85%;
        }
        .list-order{
            width: 85%;
        }
        .search{
            width: 84%;
        }
    }
    @media(max-width : 768px){
        .container{
            margin-top: 100px;
        }
        .breadcrumb{
            display: none;
        }
        .order{
            width: 100%;
            margin-top: 24px;
        }
        .list-order{
            margin-top: 40px;
        }

        .status {
            width: 95%; 
             min-height: 40px;
            font-size: 20px;
            white-space: nowrap;     
            overflow-x: auto; 
            display: flex;     
            gap: 20px;
        }

        .status span{
            text-decoration: none !important;   
        }
        .search button{
            width: 30px;
        }
        .status::-webkit-scrollbar {
            display: none;
        }
        .search{
            width: 95%;
        }
        .list-order{
            width: 95%;
        }
        .total-price{
            width: 94%;
            margin: 0 auto;
        }
        .btn{
            width: 60%;

        }
        .detail-left img{
            width: 40px;
            height: 60px;
        }
    }
    @media(max-width : 375px){
        .header-left span{
            font-size: 17px;
        }
        .header-left button {
            font-size: 14px;
        }
        .infor-product span{
            font-size: 13px;
        }
        .name{
            font-size: 15px;
        }
        .price span{
            font-size: 18px;
        }
        .price .old{
            font-size: 15px;
        }
    }
</style>