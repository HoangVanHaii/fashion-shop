<template>
    <div class="cart-page">
        <div class="cart-content">
            <div class="tab">
                <span>Trang chủ</span>
                <span class="divider"></span>
                <span :style="{color:'#828080ff'}">Thanh toán</span>
            </div>
            
            <div class="progress-bar-container">
                <div class="progress-bar-animated"></div>
            </div>
            
            <div class="shipping-address">
                <div class="address1">
                    <div class="header-address">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Địa Chỉ Nhận Hàng</span>
                    </div>
                    <div class="address">
                        <span>Nguyễn Hải Đăng | </span>
                        <span>0768533364 | </span>
                        <span>Tổ 11, ấp Tân Điền, xã Lý Nhơn, huyện Cần Giờ, TP HCM</span>
                        <b class="change-address">Thay đổi</b>
                    </div>
                </div>
                <div class="header2">
                    <div class="shipper-animation">
                        <i class="fa-solid fa-truck-fast truck"></i>
                        <i class="fa-solid fa-house-chimney house"></i>
                        <div class="road-line"></div>
                    </div>
                </div>
            </div>
            
            <div class="item">
                <div class="product-line">
                    <span>Sản phẩm</span>
                </div>
                <div class="header-item"> 
                    <div class="header-item1">
                        <span>Sản phẩm</span>
                    </div>
                    <div class="header-item2">
                        <span class="header-price">Đơn giá</span>
                        <span class="header-quantity">Số lượng</span>
                        <span class="header-total">Thành tiền</span>
                    </div>
                </div>
                
                <!-- Render shop-selected -->
                <div v-for="shop in cartStore.cartPay?.shops" :key="shop.shop_id" class="shop-block">
                    <div class="shop-header"> 
                        <i class="fa-solid fa-store"></i>
                        <b>{{ shop.shop_name }}</b>
                    </div>
                    
                    <div class="shop-items">
                        <div v-for="item in shop.carts" :key="item.cart_item_id" class="item-row">
                            <div class="item-info">
                                <img :src="`http://localhost:3000${item.image_url}`" alt="product" />
                                <div class="item-details">
                                    <span class="item-name">{{ item.name }}</span> 
                                </div>

                                <div class="item-size">
                                        <span>Phân Loại Hàng:</span>
                                        <span>Màu {{ item.color }} | Size {{ item.size }}</span>    
                                    </div>
                                <div class="price">
                                    <s>{{ item.price.toLocaleString() }}đ</s>
                                    <span>{{ item.price_after_reduction?.toLocaleString() }}đ</span>
                                </div>
                                
                                <div class="quantity">
                                    {{ item.quantity }}
                                </div>
                                <div class="quantity-mobile">
                                    <span>x{{ item.quantity }}</span>
                                </div>
                                
                                <div class="total">
                                    <span>{{ (item.price_after_reduction! * item.quantity).toLocaleString() }}đ</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="total-all-shop">
                            <span class="total-all-shop1">Tổng số tiền ( {{ shop.carts?.length || 0 }} sản phẩm ):</span>
                            <span class="total-all-shop2">{{ shop.carts?.reduce((sum, item) => sum + (item.price_after_reduction! * item.quantity), 0).toLocaleString() }}đ</span>
                        </div>
                    </div>
                </div>
            </div> 
            <!-- Order Summary -->
            <div class="order-summary">
                <div class="voucher-section">
                    <div class="voucher-left">
                        <i class="fa-solid fa-ticket"></i>
                        <span>Voucher</span>
                    </div>
                    <div class="voucher-right">
                        <span class="voucher-discount">-{{ ((cartStore.cartPay?.voucher_discount||0) / 1000).toLocaleString() }}k</span>
                        <b class="choose-voucher">Chọn voucher</b>
                    </div>
                </div>

                <div class="payment-method">
                    <div class="payment-left">
                        <i class="fa-solid fa-money-check-dollar"></i>
                        <span>Phương thức thanh toán</span>
                    </div>
                    <div class="payment-right">
                    <span>{{ selectedMethod?.label || 'Chưa chọn phương thức' }}</span>
                    <b class="change-payment" @click="showPaymentOptions = !showPaymentOptions">Thay Đổi</b>

                    <!-- Popup chọn phương thức -->
                    <div v-if="showPaymentOptions" class="payment-popup">
                        <div
                        v-for="method in paymentMethods"
                        :key="method.id"
                        class="payment-option"
                        :class="{ active: selectedMethod?.id === method.id }"
                        @click="selectMethod(method)"
                        >
                        {{ method.label }}
                        </div>
                    </div>
                    </div>

                </div>

                <div class="summary-total">
                    <div class="summary-row">
                        <span class="summary-label">Tổng tiền hàng</span>
                        <span class="summary-value">{{totalBeforeDiscount.toLocaleString()}}đ</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Tổng voucher giảm giá</span>
                        <span class="summary-value discount">-{{(cartStore.cartPay?.voucher_discount||0).toLocaleString()}}đ</span>
                        <div class="road-line-sumary"></div>
                    </div>
                    <div class="summary-row total-pay">
                        <span class="summary-label">Tổng thanh toán</span>
                        <span class="summary-value total-amount">{{(totalBeforeDiscount-(cartStore.cartPay?.voucher_discount||0)).toLocaleString()}}đ</span>
                    </div>
                </div>
                <div class="buy">
                    
                    <p class="note">
                        Nhấn “Đặt hàng” đồng nghĩa với việc bạn đồng ý tuân theo 
                        <a href="#">Điều khoản Nava</a>
                    </p>
                    <button class="order-btn" @click="clickOrder()">Đặt hàng</button>
                </div>                
            </div>
        </div>  
    </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cartStore'
import { useOrderStore } from '../stores/orderStore'
import { onMounted,computed,ref,watch } from 'vue'
import {validateVoucherByCode} from '../utils/validateVoucher'
import type { OderPayLoad,OrderItem,Order } from '../interfaces/order'
const cartStore = useCartStore()
const orderStore = useOrderStore()

onMounted(() => {
    if (cartStore.cartPay?.shops.length === 0) {
        // Handle empty cart
    }
    console.log('Voucher in cartPay:', cartStore.cartPay?.voucher_discount)

})
// const totalBeforeDiscount = computed(() => {
//     return cartStore.cartPay?.shops.reduce(
//         (total, shop) => total + (shop.carts?.reduce(
//         (totalShop, item) => totalShop + (item.price_after_reduction! * item.quantity),0) || 0),0)
//     }
// )

const totalBeforeDiscount = computed(() => {
    return (
        cartStore.cartPay?.shops?.reduce(
        (total, shop) =>
            total +
            (shop.carts?.reduce(
            (totalShop, item) => totalShop + (item.price_after_reduction! * item.quantity),
            0
            ) || 0),
        0
        ) || 0
    )
    })


//Phương thức pay
const showPaymentOptions = ref(false)
interface PaymentMethod {
    id: string
    label: string
}

const paymentMethods: PaymentMethod[] = [
{ id: 'cod', label: 'Thanh toán khi nhận hàng' },
{ id: 'credit_card', label: 'Thẻ tín dụng' },
{ id: 'paypal', label: 'PayPal' },
{ id: 'momo', label: 'Momo' },
{ id: 'vnpay', label: 'VNPAY' }
]

const selectedMethod = ref<PaymentMethod | null>(paymentMethods[0]?? null)

const selectMethod = (method: PaymentMethod) => {
    selectedMethod.value = method
    showPaymentOptions.value = false
}


// watch(
//   () => cartStore.cartPay?.voucher_id,
//   async () => {
//     const cart = cartStore.cartPay
//     if (!cart || cart.voucher_id == null) return
//       try {
//         const discount = await validateVoucherById(cart.voucher_id, cartStore.total_price_after_reduction)
//         cart.voucher_discount = discount
//       } catch (err: any) {
//         cart.voucher_discount = 0
//         console.error(err.message)
//       }
//   }
// )


// watch(
//   () => cartStore.cartPay?.voucher_id,
//   async () => {
//     const cart = cartStore.cartPay
//     if (!cart || cart.voucher_code ==null) return
//       try {
//         const discount = await validateVoucherByCode(cart.voucher_code, cartStore.total_price_after_reduction)
//         cart.voucher_discount = discount
//       } catch (err: any) {
//         cart.voucher_discount = 0
//         console.error(err.message)
//       }
//   }
// )

const clickOrder = async () =>{
    if (!cartStore.cartPay) return
    const orderItems: OrderItem[] = []
    cartStore.cartPay.shops.forEach(shop => {
        if(shop.carts){
            shop.carts.forEach(item => {
            orderItems.push({
                size_id: item.size_id,       
                quantity: item.quantity,
                // price: item.price_after_reduction
            })
            })
        }
    })

    const order: Order={
        voucher_code:cartStore.cartPay.voucher_code,
        shipping_name:'Nguyễn Hải Đăng', 
        shipping_address:'Tổ 11, ấp Tân Điền, xã Lý Nhơn, huyện Cần Giờ, TP HCM',
        shipping_phone: '0768533364',
        payment_method:selectedMethod.value?.id as Order['payment_method']
    }

     const payload: OderPayLoad = {
        order,
        orderItems
    }

    try {
    console.log("Payload gửi lên API:", payload);
    const res = await orderStore.createOrder(payload)
    await cartStore.removePaidItems()
    console.log('Order created:', res)
    // chuyển trang hoặc show modal thành công
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    console.error("Đặt hàng thất bại:", msg);
    }

}


</script>

<style scoped>
.product-line {
    display: none;
}
.quantity-mobile{
    display: none;
}
.cart-page {
    font-size: 20px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f0f0f0;
    width: 90%;
    margin: 0 auto;
    overflow: hidden;
}

.cart-content {
    flex: 1;
    padding: 16px;
    padding-bottom: 160px;
    overflow-y: auto;
    overflow-x: hidden;
    
}

.tab {
    display: flex;
    border-radius: 10px;
    background-color: #a9a7a7a2;
    padding: 10px 20px 10px 50px;
    margin-bottom: 10px;
}

.divider {
    width: 1px;
    background-color: #060606ff;
    margin: 0 15px;
}

/* Progress Bar Animation */
.progress-bar-container {
    width: 100%;
    padding: 5px 0;
    /* overflow: hidden; */
}

.progress-bar-animated {
    width: 200%;
    height: 5px;
    border-radius: 3px;
    background: repeating-linear-gradient(
        150deg,
        #2563eb 0px,
        #2563eb 30px,
        #f0f0f0 30px,
        #f0f0f0 40px,
        #dc2626 40px,
        #dc2626 70px,
        #f0f0f0 70px,
        #f0f0f0 80px
    );
    animation: moveGradient 15s linear infinite;
}

@keyframes moveGradient {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}

/* Shipping Address Section */
.shipping-address {
    display: flex;
    background-color: white;
    padding: 25px 30px 25px 50px;
    border-radius: 8px;
    margin-bottom: 10px;
}

.header-address {
    color: #dc2626;
    text-align: left;
    font-size: 20px;
    margin-bottom: 10px;
}

.header-address i {
    margin-right: 8px;
}

.address {
    text-align: left;
}

.change-address {
    color: #2563eb;
    margin-left: 10%;
    cursor: pointer;
}

.change-address:hover {
    text-decoration: underline;
}

.address1 {
    flex: 4;
}

.header2 {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

/* Shipper Animation */
.shipper-animation {
    position: relative;
    width: 500px;
    height: 50px;
}

.shipper-animation .road-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: #dc2626;
    border-radius: 2px;
}

.shipper-animation .house {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30px;
    color: #dc2626;
}

.shipper-animation .truck {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30px;
    color: #dc2626;
    animation: truckRun 3s linear infinite;
}

@keyframes truckRun {
    0% {
        left: 0;
        opacity: 1;
    }
    80% {
        left: 85%;
        opacity: 1;
    }
    81% {
        left: 0;
        opacity: 0;
    }
    100% {
        left: 0;
        opacity: 1;
    }
}

/* Items Section */
.item {
    margin-top: 10px;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border-bottom: 1px solid #494949;
}

.header-item {
    display: flex;
    text-align: center;
    padding: 10px;
    /* border-bottom: 2px solid #0a0a0a; */
    font-weight: 500;
    border-radius: 8px 8px 0 0;
    box-shadow: 0px 4px 8px rgba(0,0,0,0.2);
}

.header-item1 {
    flex: 4;
    text-align: left;
    padding-left: 30px;
    text-align: left;
}

.header-item2 {
    flex: 3;
    display: flex;
    justify-content: space-around;
    text-align: center;
}

.header-item2 span {
    flex: 1;
}

.header-price{
    flex:1;
    padding-left:10px;
}

.header-quantity{
    flex:0.7;
    padding-left:5px;
        text-align: center;
    
}

.header-total{
    flex:0.7;
    /* padding-left:5px; */
    margin-right: 12px;
}

/* Shop Block */
.shop-block {
    margin-top: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    
}

.shop-header {
    background-color: #F5F5F5;
    padding: 12px 20px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    border-bottom: 1px solid #5f5f5f;
}

.shop-header i {
    margin-right: 8px;
    font-size: 25px;
}

.shop-items {
    padding: 0;
}

.item-row {
    padding: 10px;
    background-color: #F5F5F5;
}

.item-row:last-child {
    border-bottom: none;
}

.item-info {
    display: grid;
    grid-template-columns: 120px 1fr 1.5fr 0.9fr 0.5fr 0.8fr;
    gap: 20px;
    align-items: center;
    background-color:white ;
    /* border: 1px solid #dfd9d9;
    box-shadow: 0px 4px 8px rgba(0,0,0,0.9); */
}

.item-info img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #131212;
    margin: 20px 0px 0px 20px;

}

.item-details {
    display: flex;
    gap: 30px;
    text-align: left;
}

.item-name {
    font-weight: 500;
    display: block;

}

.item-size {
    color: #666;
}

.item-size span:first-child {
    display: block;
    margin-bottom: 4px;
}

.price {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.price s {
    color: #999;
}

.price span {
    color: #000;
    font-weight: 500;
}

.quantity {
    text-align: center;
}

.total {
    text-align: center;
    
}

.total span {
    color: #dc2626;
    font-weight: 600;
}

.total-all-shop {
display: flex;
align-items: center;
justify-content: flex-end;
padding: 15px 25px 15px 15px;
border-top: 1px solid #e0e0e0;
background-color: #fafafa;
font-size: 21px;
text-align: right;
}

/* label co giãn linh hoạt, không bị đẩy */
.total-all-shop1 {

text-align: right;
color: #333;
}

/* value có độ rộng cố định, căn phải */
.total-all-shop2 {
width: 180px; /* có thể chỉnh nhỏ/lớn hơn tùy layout */
text-align: right;
color: #dc2626;
font-weight: 700;
}


/* --- Order Summary Section --- */
.order-summary {
background-color: #fff;
margin-top: 20px;
padding: 20px 40px;
border-radius: 8px;
border-top: 1px dashed #ccc;
}

/* Layout chính: 2 cột ngang */
.voucher-section{
display: grid;
grid-template-columns: 1fr 1fr;
align-items: center;
padding: 15px 0;
gap: 40px;
}    
.payment-method {
display: grid;
grid-template-columns: 0.7fr 1fr;
align-items: center;
padding: 15px 0;
gap: 40px;
}

.voucher-section {
border-bottom: 1px dashed #ccc;
}

/* Cột trái */
.voucher-left,
.payment-left { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
}

.voucher-left i {
    color: #ff6f00; 
    font-size: 26px; 
}

.payment-left i { 
    color: #ff9f1c; 
    font-size: 26px; 
}

/* Cột phải */
.voucher-right{ 
    display: flex; 
    justify-content: flex-end;
    gap:20px;
    align-items: center;
}


.payment-right { 
    display: flex; 
    justify-content: flex-end;
    gap:60px;
    align-items: center;
    text-align: center;
        position: relative;
}

.voucher-discount {
color: #dc2626;
border: 1px solid #dc2626;
border-radius: 4px;
padding: 3px 8px;
min-width: 60px;
text-align: center;
background-color: #fff5f5;
font-weight: 600;
}

.choose-voucher,
.change-payment { 
    color: #2563eb; 
    cursor: pointer;
    white-space: nowrap;
}

.choose-voucher:hover,
.change-payment:hover { 
    text-decoration: underline; 
}

/* Summary section - layout ngang */
.summary-total {
margin-top: 20px;
padding-top: 15px;
border-top: 1px dashed #ccc;
}

/* Grid layout cho phần summary */
.summary-row {
display: grid;
grid-template-columns: 220px 120px;
gap:20px;
align-items: center;
padding: 8px 0;
justify-self: end;
}

.summary-label {
color: #333;
text-align: left;
/* margin-left: 1150px; */
}

.road-line-sumary {
grid-column: 1 / -1;   /* chiếm toàn bộ hàng grid */
height: 1px;
background-color: #999;
border-radius: 2px;
margin: 6px 0;         /* khoảng cách trên/dưới */
opacity: 0.7;
width:400px;
margin-left: auto;
}

/* Giá trị căn phải */
.summary-value {
text-align: right;
font-weight: 600;
min-width: 120px;
}

/* Nút đặt hàng cùng hàng */
.order-btn {
background-color: #dc2626;
color: #fff;
border: none;
border-radius: 6px;
padding: 10px 35px;
/* font-size: 18px; */
cursor: pointer;
transition: background-color 0.2s, transform 0.08s;
white-space: nowrap;
/* grid-column: 3; */
    height: 50px;
    width: 200px;
outline: none;
box-shadow: none;

}

.order-btn:hover { 
    background-color: #b91c1c; 
    transform: translateY(-1px); 
}

/* Trạng thái giảm giá */
.discount { 
    color: #dc2626; 
}

/* Dòng tổng thanh toán */
.total-pay {
margin-top: 5px;
}

.total-pay .summary-label { 

    font-weight: 700; 
}

.total-pay .summary-value { 
    color: #dc2626; 
    font-weight: 800; 
}

/* Note văn bản nhỏ */
.note {
margin-top: 15px;
color: #555;
text-align: left;
}

.note a { 
    color: #2563eb; 
    text-decoration: none; 
}

.note a:hover { 
    text-decoration: underline; 
}

.buy{

    margin-top: 50px;
    display: grid;
    grid-template-columns: 2fr auto;
    gap:20px;
}

.payment-popup {
    position: absolute;
    right: 120px;
    top: 95%;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    padding: 10px 0;
    z-index: 100;
    width: auto;
}

    .payment-option {
    padding: 10px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    }

    .payment-option:hover {
    background-color: #f2f2f2;
    }

    .payment-option.active {
    background-color: #e6f0ff;
    font-weight: 600;
    }


/* ----------------------------- */
/*  Tablet (870px – 1000px) */
/* ----------------------------- */        
@media (max-width: 1000px) and (min-width: 870px) {
    .cart-page {
        font-size: 16px;
    }

    /* Shipper Animation */
    .shipper-animation {
        width: 320px;
    }

}
/* ----------------------------- */
/*  Mobile (870px <=) */
/* ----------------------------- */   
@media (max-width: 870px) {
    .cart-page{
        width: 100%;
    }
    .header2{
        display:none;
    }
    .header-item{
        display:none;
    }
    
    .quantity{
        display:none;
    }
    .item-size span:first-child {
        display: inline;;
        margin-bottom: 4px;
    }
    .product-line {
        display: block;
        text-align: left;
        font-size: 25px;
        font-weight: 400;
    }

    .cart-page {
        font-size: 22px;
    }
        .shipping-address {
        position: relative;
        padding: 25px 20px 25px 20px;
        }
    .change-address {
        position: absolute;
        right: 45px  ;
        top: 30px ;
    }
    .progress-bar-container {
    width: 100%;
    padding: 5px 0;
    overflow: hidden;
    }

    .item-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    background: white;
    padding: 0px;
    border-radius: 8px;
    position: relative;
    }

    .item-info img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0; /* không co ảnh */
    }

    .item-details {
        flex: 1;
    }

    .item-name {
        position: absolute;
        left: 160px;
        top:25px;
        font-weight: 500;
        color: #333;
    }
    .item-size {
        position: absolute;
        left: 160px;
        top:55px;
        color: #555;
    }

    .total{
        display:none;
    }
    .price {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
    }
    .quantity-mobile{
        display:block;
        position: absolute;
        left: 160px;
        top:95px;
        color: #f44336;
    }

    .price span {
        position: absolute;
        left: 300px;
        top:95px;
        color: #f44336;
    }
    .price s {
        position: absolute;
        left: 400px;
        top:95px;
        color: #aaa;
        margin-left: 5px;
    }
}

</style>