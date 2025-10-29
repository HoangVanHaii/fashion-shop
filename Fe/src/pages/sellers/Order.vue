<script setup lang="ts">
import Header from '../../components/sellers/Header.vue';
import Navbar from '../../components/sellers/Navbar.vue';
import { ref, computed, onMounted } from 'vue';
import { useOrderSellerStore } from '../../stores/sellers/orderStore';
import { formatDate, formatPrice, getImage } from '../../utils/format';
import { useRouter } from 'vue-router';
import Loading from '../../components/Loading.vue';
import { useAuthStore } from '../../stores/authStore';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import Notification from '../../components/Notification.vue';

const auth = useAuthStore();
const router = useRouter();
const order = useOrderSellerStore();
const nav2 = ref<string>('Tất cả')
const toggle = ref(false)
const selectedType = ref('order_id')
const listNameUser = ref<string[]>([]);
const showFormConfirm = ref<boolean>(false);
const orderAction = ref<number | null>(null)
const messageAction = ref<string>("Xác nhận hành động này");
const statusAction = ref<string>('pending');
const showNotification = ref<boolean>(false);
const texNotification = ref<string>('');
onMounted(async () => {
    await order.getOrderOfShopMeStore();
    for (const u of order.filteredOrder) {
        const name = await auth.getNameByIdStore(u.user_id || 3);
        listNameUser.value.push(name);
    }
})
const statusMap: Record<string, string> = {
        "pending": "Chờ xác nhận",
        "confirmed": "Chờ lấy hàng",
        "shipped": "Đang giao hàng",
        "completed": "Hoàn thành",
        "cancelled": "Đã hủy",
    };
const items = [
    { value: 'order_id', label: 'Mã đơn hàng' },
    { value: 'product_name', label: 'Tên sản phẩm' }
]

const selectedLabel = computed(() =>
     items.find(i => i.value === selectedType.value)?.label
)
const placeholderText = computed(() => {
    if (selectedType.value === 'order_id') {
        return 'Nhập mã đơn hàng'
    } else if (selectedType.value === 'product_name') {
        return 'Nhập tên sản phẩm'
    }
    return ''
})
const typeInput = computed(() => {
    if (selectedType.value === 'order_id') {
        return 'number'
    } else if (selectedType.value === 'product_name') {
        return 'text'
    }
    return ''
})
const selectItem = (item : any) => {
    selectedType.value = item.value
    toggle.value = false
}
const handleRefresh = () => {
    router.go(0);
};

const handleAction = async () => {
    showFormConfirm.value = false;
    texNotification.value = '';

    if (statusAction.value == 'pending') {
        await order.cancelStore(orderAction.value!);
        showNotification.value = true;
        if (order.success) {
            texNotification.value = '✅ Hủy thành công đơn hàng!';
        } else {
            texNotification.value = '❌ Không thể hủy đơn hàng!'
        }
    } else if (statusAction.value == 'confirmed') {
        await order.confirmStore(orderAction.value!)
            showNotification.value = true;
         if (order.success) {
            texNotification.value = '✅ Xác nhận thành công đơn hàng!';
        } else {
            texNotification.value = '❌ Không thể xác nhận đơn hàng!'
        }
    } else if (statusAction.value == 'shipped') {
        await order.dispatchStore(orderAction.value!);
        showNotification.value = true;
         if (order.success) {
            texNotification.value = '✅ Giao hàng cho đơn vị vận chuyển thành công!';
        } else {
            texNotification.value = '❌ Chưa thể giao đơn hàng!'
        }
    } else if (statusAction.value == 'completed') {
        await order.completeStore(orderAction.value!)
        showNotification.value = true;
         if (order.success) {
            texNotification.value = '✅ Hoàn thành đơn hàng thành công';
        } else {
            texNotification.value = '❌ Chưa thể hoàn thành đơn hàng!'
        }
    }

}
const groupData = (order_id: number, status: string) => {
    orderAction.value = order_id;
    statusAction.value = status;
    if (status == 'pending') {
        messageAction.value = 'Xác nhận đơn hàng này?'
        statusAction.value = 'confirmed'
    } else if (status == 'confirmed') {
        messageAction.value = 'Tiến hành giao cho đơn vị vận chuyển?'
        statusAction.value = 'shipped';
    } else if (status == 'shipped') {
        messageAction.value = 'Xác nhận hoàn thành thành đơn?'
        statusAction.value = 'completed';
    }
    showFormConfirm.value = true;
}
const goToCancel = (order_id: number, status: string) => {
    showFormConfirm.value = true;
    orderAction.value = order_id;
    statusAction.value = status;
    messageAction.value = 'Xác nhận hủy đơn hàng này?'
}
</script>
<template>
    <Header :nav1="'Đơn hàng'" :nav2="nav2"></Header>
    <Loading :loading="order.loading" />
     <ConfirmDialog 
        v-if="showFormConfirm && orderAction"
        :message="messageAction"
        @close="showFormConfirm = false"
        @confirm="handleAction"

    />
    <Notification :text="texNotification" :isSuccess="showNotification"/>
    <div class="container">
        <Navbar 
         :isShow='false'
        :showManagermentOrder= 'true'
        :showManagermentProduct= 'false'
        :showData= 'false'
        :showCustomCare= 'false'
        :showManagermentShop= 'false'
        :showMarketing= 'false'
        :showVoucher= 'false'
        :showFlashSale= 'false'
        :showAllOrder= 'true'
        :showAllProduct= 'false'
        :showAddProduct= 'false'
        :showReview= 'false'
        :showProfileShop= 'false'
        :showProfile= 'false'
        :showStatistical= 'false'
        class="abs"
        ></Navbar>

        <div class="order" v-if="order.listOrder.length != 0">
            <p class="title">Đơn hàng</p>
            <div class="main-order">
                <div class="status">
                    <span
                    v-for="status in [
                        'Tất cả',
                        'Chờ xác nhận',
                        'Chờ lấy hàng',
                        'Đang giao hàng',
                        'Hoàn thành',
                        'Đã hủy',
                    ]"
                    :key="status"
                    :class="{ active: order.selectedStatus === status }"
                    @click="order.selectedStatus = status"
                    >
                    {{ status }}
                    </span>
                </div>
                <hr>
                <div class="search">
                    <div class="dropdown" @mouseenter="toggle = !toggle" @mouseleave="toggle = false" >
                        <div class="selected"><span>{{ selectedLabel }} </span> <i class="fa-solid fa-chevron-down" :class="{move: toggle === true}"></i></div>
                        <ul v-if="toggle" class="options">
                        <li v-for="item in items" :key="item.value"
                            @click.stop="selectItem(item)"
                            class="option">
                            {{ item.label }}
                        </li>
                        </ul>
                    </div>
                    <input v-model="order.searchText" :type="typeInput" :placeholder="placeholderText">
                    <button class="apply">Áp dụng</button>
                    <button class="refresh" @click="order.searchText = ''">Đặt lại</button>
                </div>
                <span class="total-order">
                    {{ order.listOrder.length }} Đơn hàng
                </span>
                <div class="list-order">
                    <div class="name-column">
                        <span
                            v-for="colum in [
                                'Mã đơn',
                                'Tên người đặt',
                                'Tổng đơn',
                                'Thông tin người nhận',
                                'Ngày tạo',
                                'Trạng thái',
                                'Thao tác'
                            ]"
                            :class="{ small: colum === 'Mã đơn' || colum === 'Tổng đơn',big: colum === 'Thông tin người nhận' }"
                            :key="colum">
                            {{ colum }}
                        </span>
                    </div>
                    <div class="list-order-detail">
                         <div class="none-order" v-if="order.filteredOrder?.length == 0">
                            <div class="img">
                                <img :src="getImage('/uploads/reviews/none-order.jpg')" alt="" />
                            </div>
                            <div class="refresh-now">
                                <span>Không tìm thấy đơn hàng nào</span>
                                <span @click="handleRefresh" style="color: blue; "
                                ><i class="fa-solid fa-rotate-right"></i> Vui lòng tải lại</span
                                >
                            </div>
                        </div>
                        <div class="order-detail" v-for="(order, index) in order.filteredOrder" :key="index">
                            <div class="item">
                                <div class="infor-order">
                                    <span class="order_id">{{ order.order_id }}</span>          
                                    <span>{{ listNameUser[index] }}</span>
                                    <span class="order_total">{{ formatPrice(order.total + (order.discount_value || 0) )}}</span>
                                    <div class="infor-user-recive">
                                        <span>{{ order.shipping_name }} | {{ order.shipping_phone }}</span>
                                        <span>{{ order.shipping_address }}</span>
                                    </div>
                                    <span>{{formatDate(order.created_at) }}</span>
                                    <span :class="{ pending: order.status =='pending', confirmed: order.status == 'confirmed', shipped: order.status == 'shipped', completed: order.status == 'completed', cancelled: order.status == 'cancelled'}">{{ statusMap[order.status] }}</span>
                                </div>
                                <div class="action">
                                    <button class="accept" v-if="order.status != 'cancelled' && order.status != 'completed'" @click="groupData(order.order_id, order.status)">Xác nhận</button>
                                    <button class="reject" v-if="order.status == 'pending'" @click="goToCancel(order.order_id, order.status)">Hủy</button>
                                </div>
                            </div>
                            <div class="product">
                                <div class="column-product">
                                    <span v-for="value in [
                                        'Sản phẩm',
                                        'Số lượng',
                                        'Giá',
                                        'Chương trình khuyến mãi'
                                    ]"
                                    :class="{ price: value == 'Số lượng', name: value == 'Sản phẩm' }"
                                    >{{ value }}</span>
                                </div>
                                <div class="main-product" v-for="product in order.items">
                                    <div class="img-name-product">
                                        <img :src="getImage(product.image_url)" alt="">
                                        <div>
                                            <span class="name-product">{{ product.product_name }}</span>
                                            <span>{{ product.color }}, {{ product.size }}</span>
                                        </div>
                                    </div>
                                    <span class="quantity">{{ product.quantity }}</span>
                                    <div class="old-new-price">
                                        <span class="old" v-if="product.flash_price">{{ formatPrice(product.price) }}</span>
                                        <span v-if="product.flash_price"> - </span>
                                        <span class="new"> {{ formatPrice(product.flash_price || product.price) }}</span>
                                    </div>
                                    <span class="sale">SIEUSALE-0{{product.flash_sale_id }}</span>
                                </div>
                            </div>                        
                            <hr class="hr">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
  width: 6px; 
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f9f9f9;
}

::-webkit-scrollbar-thumb {
  background: #999; 
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.infor-order .pending {
    color: blue;
    font-weight: 500;
}
.infor-order .confirmed {
    color: rgb(221, 221, 1);
    font-weight: 500;
}
.infor-order .shipped {
    color: green;
    font-weight: 500px;
}
.infor-order .completed {
    color: red;
    font-weight: 500;
}
.infor-order .cancelled {
    color: orange;
    font-weight: 500;
}
.template{
    background-color: #fec02e;
}
.container{
    margin-top: 60px;
    display: flex;
    justify-content: space-between;
    height: 90vh;
    overflow: hidden;
}
.order{
    width: 81.3%;
    /* height: 30px; */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    /* height: 115vh; */
    overflow-y: auto;
}
.main-order {
    display: flex;
    flex-direction: column;
    width: 90%;
    margin: 0 auto;
}
.title{
    margin-left: 54px;
    font-size: 24px;
}
.status {
  display: flex;
  /* gap: 15px; */
  width: 70%;
  justify-content: space-between;
}

.status span {
  cursor: pointer;
  color: #333;
  transition: color 0.2s, font-weight 0.2s;
}
.move {
    transform: rotate(180deg);
}
.status span.active {
  color: red;
  /* font-weight: 600; */
  text-decoration: underline;
}
.order hr{
    width: 100%;
}
.search{
    display: flex;
}
.dropdown {
  position: relative;
  width: 140px;
  user-select: none;
}

.selected {
  padding: 4px;
  border: 1px solid #ccc;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  margin: 0px 0 0;
  list-style: none;
  padding: 0;
}

.option {
  padding: 4px;
  cursor: pointer;
}

.option:hover {
  background: #fec02e;
  color: white;
}
input{
    border: 1px solid #ccc;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    outline: none;
    padding-left: 10px;
    width: 35%;
}
.apply {
    border: 1px solid rgb(234, 0, 0);
    color: rgb(215, 1, 1);
    background-color: white;
    border-radius: 4px;
    margin-left: 6px;
}
.refresh {
    border: 1px solid rgb(59, 59, 59);
    color: rgb(39, 39, 39);
    background-color: white;
    border-radius: 4px;
    margin-left: 6px;
}
.apply:hover{
    cursor: pointer;
    transform: translateY(-1px);
}
.refresh:hover{
    cursor: pointer;
    transform: translateY(-1px);
}
.total-order {
    margin-top: 10px;
    font-weight: bold;
    font-size: 18px;
}

.name-column{
    display: flex;
    justify-content: space-between;
    /* gap: 10px; */
    margin-top: 20px;
    background-color: #e3e3e3;
    height: 40px;
    /* padding: 6px;
    padding-top: 8px;
    padding-left: 8px; */
    border-radius: 6px;
}
.name-column span {
    width: 14%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* text-align: center; */
}
.order-detail{
    width: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
}
.list-order-detail {
    margin-top: 3px;
    border: 1px solid rgb(194, 194, 194);
    border-radius: 5px;
    /* height: ; */
    overflow-y: auto;
    height: 83vh;
}
.small {
    width: 7% !important;
}
.big{
    width: 18% !important;
}
.item{
    width: 100%;
    display: flex;
}
.item span{
    width: 16%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.order_id, .order_total{
    width: 8.2% !important;
}
.order_total {
    color: red;
}
.item .infor-order{
    display: flex;
    justify-content: space-between;
    width: 85.5%;
    margin-top: 20px;
    /* background-color */
}
.item .infor-order .infor-user-recive{
    display: flex;
    flex-direction: column;
    width: 22%;
}
.item .infor-order .infor-user-recive span{
    width: 100% !important;
}
.item .action{
    width: 13%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: end;
    gap: 5px;
    margin-top: 7px;
}
.item .action button{
    width: 60%;
    cursor: pointer;
    background:none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

}
.item .action button:hover{
    transform: translateY(-1px);
}
.item .action .accept{
    color: green;
    border: 0.5px solid green;
}
.item .action .reject{
    color: red;
    border: 0.5px solid red;
}
.product{
    width: 74%;
    background-color: #e6e6e6;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    gap: 10px;

}
.column-product{
    width: 100%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid rgb(199, 199, 199);

}
.column-product span {
    justify-content: space-between;
    width: 27%;
    text-align: center;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.column-product .price{
    width: 14%;
}
.column-product .name{
    width: 42.5%;
}
.main-product {
    display: flex;
    width: 96%;
    margin: 0 auto;
    margin-bottom: 5px;
}
.main-product .img-name-product{
    display: flex;
    flex-direction: row;
    width: 39%;
}
.main-product .img-name-product img{
    width: 65px;
    height: 65px;    
}
.main-product .img-name-product div{
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 2px;
    width: 76%;
}
.main-product .img-name-product div .name-product {
    display: inline-block; 
    max-width: 94%; 
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;  
}
.main-product .quantity{
    width: 12%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.main-product .old-new-price{ 
    width: 26%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px
}
.main-order .old-new-price .old {
    text-decoration: line-through;
}
.main-order .sale {
    width: 23%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.hr{
    width: 90%;
}
.none-order {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.none-order .img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
}
.none-order .img img {
  width: 60%;
}
.refresh-now {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.refresh-now .refresh,
.fa-rotate-right {
  color: blue !important;
}
.refresh-now .refresh:hover {
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1) !important; 
  cursor: pointer !important;
}
.fa-rotate-right:hover {
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.refresh-now .purchase-now {
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  width: 40%;
  height: 30px;
}
.refresh-now .purchase-now:hover {
  cursor: pointer;
  transform: translateY(-1px);
}
@media(max-width: 767px){

    .title{
        margin-left: 32px;
        font-size: 24px;
    }
    .order{
        width: 100%;
    }
    .list-order{
        overflow-x: auto;
    }
    .name-column, .list-order-detail {
        width: 800px;
    }

    .status{
        width: 95%;
        min-height: 40px;
        font-size: 20px;
        white-space: nowrap;
        overflow-x: auto;
        display: flex;
        gap: 20px;
  }
    .abs{
        position: fixed;
        z-index: 99999;
        background-color: white;
        right: 0;
        width: 200px;
    }
  .status span {
    text-decoration: none !important;
  }
    .status::-webkit-scrollbar {
    display: none;
  }
}
@media(max-width: 520px) {
    .dropdown .selected {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3px;
        height: 30px;
    }
    .title{
        margin-left: 24px;
        font-size: 24px;
    }
}
</style>