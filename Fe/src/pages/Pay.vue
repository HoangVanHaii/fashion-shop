<template>
    <Header></Header>
    <Notification
        :isSuccess="isNotification"
        :text="toastText"
    />
    <Loading :loading="addressStore.loadingAddress" />
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
                        <span>{{ addressStore.addressDefault.name }} | </span>
                        <span>{{ addressStore.addressDefault.phone }} | </span>
                        <span>{{displayAddress (addressStore.addressDefault.address) }}</span>
                        <b class="change-address" @click="showAddress">Thay đổi</b>
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
                                <img :src="getImage(item.image_url)" alt="product" />
                                <div class="item-details">
                                    <span class="item-name">{{ item.name }}</span> 
                                </div>

                                <div class="item-size">
                                        <span>Phân Loại Hàng:</span>
                                        <span>Màu {{ item.color }} | Size {{ item.size }}</span>    
                                    </div>
                                <div class="price">
                                    <s >{{ item.price.toLocaleString() }}đ</s>
                                    <span >{{ item.price_after_reduction?.toLocaleString() }}đ</span>
                                </div>
                                
                                <div class="quantity">
                                    {{ item.quantity }}
                                </div>
                                <div class="quantity-mobile">
                                    <div class="quantity-mobile-in">
                                        <span>x{{ item.quantity }}</span>
                                        <div>
                                            <span class="price2">{{ item.price_after_reduction?.toLocaleString() }}đ</span>
                                            <s class="price1">{{ item.price.toLocaleString() }}đ</s>
                                        </div> 
                                    </div>        
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
                        <span v-if="(cartStore.cartPay?.voucher_discount||0) > 0" class="voucher-discount">-{{ ((cartStore.cartPay?.voucher_discount||0) / 1000).toLocaleString() }}k</span>
                        <!-- <b class="choose-voucher">Chọn voucher</b> -->
                         <a href="javascript:void(0)" @click.stop="openVoucherModal">
                            {{ cartStore.cartPay?.voucher_code || 'Chọn hoặc nhập mã voucher' }}
                        </a>
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
        <Voucher 
            v-if="showVoucher"
            @close="closeVoucherModal"
            @selected="handleSelectVoucher"
            />
        <div v-if="showListAddress" class="container-wrapper">
            <div class="container-main">
                <!-- Header -->
                <div class="header">
                <h1 class="header-title">Địa Chỉ Của Tôi</h1>
                </div>

                <!-- Address List -->
                <div class="address-list">
                    <div
                        v-for="address in addressStore.listAddress"
                        :key="address.id"
                        class="address-item"
                        >
                        <div class="address-wrapper">
                        <!-- Radio Button -->
                            <div class="radio-group">
                                <input
                                type="radio"
                                :id="`address-${address.id}`"
                                :value="address.id"
                                v-model="selectedAddress"
                               
                                class="radio-input"
                                />
                            </div>

                            <!-- Address Info -->
                            <div class="address-info">
                                <div class="info-header">
                                <h3 class="info-name">{{ address.name }}</h3>
                                <span class="info-phone"> |  {{ address.phone }}</span>
                                </div>

                                <p class="info-address">{{ displayAddress(address.address) }}</p>


                                <span v-if="address.is_default" class="badge-default">
                                Mặc định
                                </span>
                            </div>

                        
                            <div class="action-edit">
                                <a href="#" class="link-update" @click="handleUpdate(address)">Cập nhật</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add New Address -->
                <div class="add-address-section">
                <button @click="openAddAddressForm" class="btn-add-address">
                    <span> + Thêm địa chỉ mới</span>
                </button>
                </div>

                <!-- Footer Buttons -->
                <div class="footer-actions">
                <button @click="handleCancel" class="btn-cancel">
                    Hủy
                </button>
                <button @click="handleConfirm" class="btn-confirm">
                    Xác nhận
                </button>
                </div>
            </div>
        </div>
        <!-- Thêm vào template, bên cạnh container-wrapper -->

 <!-- Thêm vào template, bên cạnh container-wrapper -->

        <div v-if="showAddAddressForm" class="container-wrapper">
            <div class="container-main">
                <!-- Header -->
                <div class="header">
                    <h1 class="header-title">Thêm Địa Chỉ</h1>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmitAddress" class="add-address-form">
                    <!-- Hàng 1: Tên và SĐT -->
                    <div class="form-row">
                        <div class="form-group">
                            <input 
                                v-model="newAddress.name"
                                type="text" 
                                id="name" 
                                class="form-input"
                                required
                            />
                            <label for="name" class="form-label">Họ và tên</label>
                        </div>

                        <div class="form-group">
                            <input 
                                v-model="newAddress.phone"
                                type="tel" 
                                id="phone" 
                                class="form-input phone"
                                required
                            />
                            <label for="phone" class="form-label">Số điện thoại</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <input v-model="province" type="text" id="province" class="form-input" required />
                        <label for="province" class="form-label">Tỉnh/Thành phố, Quận huyện, Phường/Xã</label>
                    </div>

                    <div class="form-group">
                        <input v-model="address" type="text" id="address" class="form-input" required />
                        <label for="address" class="form-label">Tên đường, Số nhà</label>
                    </div>
                    
                    <div class="form-group checkbox">
                        <input 
                            v-model="newAddress.is_default"
                            type="checkbox" 
                            id="is_default" 
                            class="form-checkbox"
                        />
                        <label for="is_default" class="checkbox-label">Đặt làm địa chỉ mặc định</label>
                    </div>

                    <!-- Footer Buttons -->
                    <div class="footer-actions">
                        <button type="button" @click="handleCancelAddAddress" class="btn-cancel">
                            Trở lại
                        </button>
                        <button type="submit" class="btn-confirm">
                            Hoàn thành
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Voucher from '../components/Voucher.vue'
import { useCartStore } from '../stores/cartStore'
import { useOrderStore } from '../stores/orderStore'
import { onMounted,computed,ref } from 'vue'
import {validateVoucherByCode} from '../utils/validateVoucher'
import type { OderPayLoad, OrderItem, Order } from '../interfaces/order'
import Header from '../components/Header.vue'
import Loading from '../components/Loading.vue'
import router from '../routers'
import { getImage } from '../utils/format'
import { useAddressStore } from '../stores/addressStore'
import type { Address } from '../interfaces/address'
import Notification from '../components/Notification.vue'
const toastText = ref<string>('')
const isNotification = ref<boolean>(false);

const addressStore = useAddressStore();

const cartStore = useCartStore()
const orderStore = useOrderStore()
const showVoucher = ref(false)
const selectedAddress = ref<number>(0)

const loadingOrder = ref<boolean>(false);
const openVoucherModal = () => {
  showVoucher.value = true
}

const closeVoucherModal = () => {
  showVoucher.value = false
}

onMounted(async() => {
    console.log(cartStore.cartPay);
    if (cartStore.cartPay?.shops.length === 0) {
        // Handle empty cart
    }
    console.log('Voucher in cartPay:', cartStore.cartPay?.voucher_discount)
    
    await addressStore.getAddressesByUserStore();
    if(addressStore.addressDefault.id){
        selectedAddress.value = addressStore.addressDefault.id
    }
})


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

const handleSelectVoucher = async (code: string, id_shop: number) => {
  console.log("đã chạy1")
//   selectedVoucherCode.value = code
  cartStore.filterSelectedItems()
  const cart = cartStore.cartPay
  if (cart && cartStore.total_price_after_reduction > 0) {
    console.log("đã chạy2")
    try {
      console.log("đã chạy3")
      const discount = await validateVoucherByCode(code, cartStore.total_price_after_reduction,id_shop)
      console.log("đã chạy4")
      cart.voucher_discount = discount
      cart.voucher_code = code
      
      
    } catch (err: any) {
      cart.voucher_discount = 0
      console.error(err.message)
    }
  }
  console.log("đóng luôn")
  closeVoucherModal()
}

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

const clickOrder = async () => {
    loadingOrder.value = true;
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
        shipping_name:addressStore.addressDefault.name, 
        shipping_address:addressStore.addressDefault.address,
        shipping_phone:addressStore.addressDefault.phone,
        payment_method:selectedMethod.value?.id as Order['payment_method']
    }

     const payload: OderPayLoad = {
        order,
        orderItems
    }

    try {
        const res = await orderStore.createOrder(payload)
        loadingOrder.value = false;
        await cartStore.removePaidItems()

        if (order.payment_method == 'vnpay') {
            console.log(res.paymentUrl)
            window.location.href = res.paymentUrl;
            if (orderStore.error) {
                router.push('/orderFailed');
            }
            else router.push('/orderSuccess')
        }
        else {
            if (orderStore.error) {
                router.push('/orderFailed');
            }
            else router.push('/orderSuccess')
        }
       
    } catch (err: any) {
        loadingOrder.value = false;
        const msg = err.response?.data?.message || err.message;
        console.error("Đặt hàng thất bại:", msg);
    } finally {
        loadingOrder.value = false;
    }

}


// address
const showListAddress = ref<Boolean>(false)

const showAddress = () =>{
    if(addressStore.addressDefault.id){
        selectedAddress.value = addressStore.addressDefault.id
    }
    showListAddress.value = true;
}
const handleConfirm = async () => {
  const selected = addressStore.listAddress.find(a => a.id === selectedAddress.value
  );

  if (!selected) {
    return;
  }
  toastText.value=""
  try {
    const address:Address={
        ...selected,
         is_default: true
    }
    await addressStore.updateAddressStore(address);
    await addressStore.getAddressesByUserStore();
    
    toastText.value="Đã cập nhật địa chỉ mặc định"
    isNotification.value = true
    showListAddress.value = false;


  } catch (err) {
    toastText.value=""
    toastText.value="Cập nhật địa chỉ mặc định thất bại"
    isNotification.value = false
  }
};


const handleCancel = () => {
  showListAddress.value=false;
}



// add address
const showAddAddressForm = ref<boolean>(false)
const openAddAddressForm = ()=>{
    newAddress.value = {
        name: '',
        phone: '',
        address: '',
        is_default: false
    }
    showListAddress.value = false
    showAddAddressForm.value = true
}
const address = ref<String>("")
const province = ref<String>("")

const newAddress = ref<Address>({
    name: '',
    phone: '',
    address:'',
    is_default: false
})


const handleCancelAddAddress = () => {
    showAddAddressForm.value = false
    showListAddress.value = true
}

const handleSubmitAddress = async () => {
    newAddress.value.address = `${address.value.trim()},- ${province.value.trim()}`
    try {
        const addressPayload: Address = {
            id: newAddress.value.id, 
            name: newAddress.value.name,
            phone: newAddress.value.phone,
            address: newAddress.value.address,
            is_default: newAddress.value.is_default
        }
        
        if (newAddress.value.id) {
            await addressStore.updateAddressStore(addressPayload)
            toastText.value = "Đã cập nhật địa chỉ thành công"
        } else {
            const addPayload: Address = {
                name: newAddress.value.name,
                phone: newAddress.value.phone,
                address: newAddress.value.address,
                is_default: newAddress.value.is_default
            }
            await addressStore.addAddressStore(addPayload)
            toastText.value = "Đã thêm địa chỉ mới thành công"
        }
        
        await addressStore.getAddressesByUserStore()
        showAddAddressForm.value = false
        isNotification.value = true
    } catch (err) {
        toastText.value = ""
        toastText.value = "Lỗi khi xử lý địa chỉ"
        isNotification.value = false
        console.error("Lỗi:", err)
    }
}

const handleUpdate = async (addr: Address) => {
  toastText.value = "";

  if (addr) {
    let addressPart = "";
    let provincePart = "";

    if (addr.address.includes(",-")) {
      const parts = addr.address.split(",-");
      addressPart = parts[0]?.trim() || "";
      provincePart = parts[1]?.trim() || "";
    } else {
      addressPart = addr.address;
      provincePart = "";
    }

    newAddress.value = {
      id: addr.id,
      name: addr.name,
      phone: addr.phone,
      address: addressPart,
      is_default: addr.is_default,
    };
    address.value = addressPart;
    province.value = provincePart;

    showAddAddressForm.value = true;
  }
};
const displayAddress = (addr: string) => {
  if (!addr) return "";
  const parts = addr.split(",-");
  return parts.join(", ");
};
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
    padding-top:110px;
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

.total-all-shop1 {

text-align: right;
color: #333;
}

.total-all-shop2 {
width: 180px; 
text-align: right;
color: #dc2626;
font-weight: 700;
}

.order-summary {
background-color: #fff;
margin-top: 20px;
padding: 20px 40px;
border-radius: 8px;
border-top: 1px dashed #ccc;
}

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

.summary-total {
margin-top: 20px;
padding-top: 15px;
border-top: 1px dashed #ccc;
}

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
grid-column: 1 / -1;   
height: 1px;
background-color: #999;
border-radius: 2px;
margin: 6px 0;        
opacity: 0.7;
width:400px;
margin-left: auto;
}


.summary-value {
text-align: right;
font-weight: 600;
min-width: 120px;
}


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


.discount { 
    color: #dc2626; 
}


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



    /* adress */
.container-wrapper {
  position: fixed;          
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;   
}

.container-main {
  width: 100%;
  max-width: 28rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header */
.header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Address List */
.address-list {
  border-top: 1px solid #e5e7eb;
   max-height: 300px;
  overflow-y: auto;
}

.address-list::-webkit-scrollbar {
  display: none; 
}
.address-list {
  -ms-overflow-style: none; 
  scrollbar-width: none;    
}

.address-item {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.address-item:hover {
  background-color: #fafafa;
}

.address-item:last-child {
  border-bottom: none;
}

.address-wrapper {
  display: flex;
  gap: 0.75rem;
}

.radio-group {
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.radio-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #ef4444;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.info-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  font-size: 0.95rem;
}

.info-phone {
  color: #6b7280;
  font-size: 0.85rem;
}

.info-address {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.25rem 0;
}


.badge-default {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #fecaca;
}


.action-edit {
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.link-update {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-update:hover {
  color: #2563eb;
}

.add-address-section {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.btn-add-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #fecaca;
}

.btn-add-address:hover {
  color: #b91c1c;
}

.footer-actions {
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-cancel {
  border: 1px solid #d1d5db;
  color: #4b5563;
  background-color: white;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-confirm {
  background-color: #ef4444;
  color: white;
}

.btn-confirm:hover {
  background-color: #dc2626;
}

/* 
add address */
.add-address-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row .form-group {
  margin: 0;
}

.form-input {
  padding: 0.875rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: inherit;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #333;
}

.form-input:placeholder-shown {
  border-color: #ccc;
}

.form-label {
  position: absolute;
  top: -0.6rem;
  left: 0.875rem;
  background-color: white;
  padding: 0 0.3rem;
  color: #999;
  font-size: 0.8rem;
  font-weight: 400;
  transition: all 0.2s ease;
  pointer-events: none;
}

/* Khi input có value hoặc focus */
.form-input:not(:placeholder-shown) ~ .form-label,
.form-input:focus ~ .form-label {
  top: -0.6rem;
  color: #666;
  font-size: 0.8rem;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #999;
  flex-shrink: 0;
}

.checkbox-label {
  color: #666;
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
}

.phone{
    width: 81%;
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
@media (max-width: 870px) and (min-width: 680px) {
    .price1{
        display: none;
    }
    .price2{
        display: none;
    }
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
        font-size: 18px;
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

@media (max-width: 680px) {
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
        font-size: 18px;
        font-weight: 400;
    }

    .cart-page {
        font-size: 13px;
    }

    .cart-content {
    flex: 1;
    padding: 4px;
    padding-top:90px;
    padding-bottom: 160px;
    overflow-y: auto;
    overflow-x: hidden;
    
    }

    .shipping-address {
    position: relative;
    padding: 25px 20px 25px 20px;
    }
    .shipping-address span{
    font-size:15px;
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

    .shop-block {
    margin:10px 0px 0px 0px;
    }

    .shop-header i {
        margin-right: 8px;
        font-size: 20px;
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
        width: 90px;
        height: 90px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0; /* không co ảnh */
    }

    .item-details {
        flex: 1;
    }

    .item-name {
        position: absolute;
        left: 125px;
        top:25px;
        font-weight: 500;
        color: #333;
    }
    .item-size {
        display:flex;
        flex-direction: column;
        position: absolute;
        left: 125px;
        top:50px;
        color: #555;
    }

    .total{
        display:none;
    }
    .price {
        display:none;
    }
    .quantity-mobile{
        display:block;
        position: absolute;
        left: 125px;
        top:95px;
        color: #f44336;
    }
    .quantity-mobile-in{
        display: grid;
        grid-template-columns: 0.5fr auto;
        justify-content: space-between; 
        gap:35px;
    }

    .price1{
        color: #aaa;
        margin-left: 5px;
    }

    .price2{
        color: #f44336;
        padding-right: 10px;
    }

    .total-all-shop1 {
    text-align: right;
    color: #333;
    font-size:15px;
    }

    .total-all-shop2 {
    width: 100px; 
    text-align: right;
    color: #dc2626;
    font-weight: 700;
    font-size:15px;
    }

    .order-summary {
    padding: 20px 10px;
    }

    .voucher-section{
    padding: 0px 0;
    margin:0;
    gap: 40px;
    }    
    
    .payment-method {
    padding: 15px 0;
    gap: 10px;
    }

    .payment-right { 
    gap:10px;
    }   

    .payment-popup {
    position: absolute;
    right: 60px;
    top: 95%;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    padding: 10px 0;
    z-index: 100;
    width: 140px;
    }

    .summary-row {
    grid-template-columns: 150px 120px;
    }

    .order-btn {
    margin-top:15px;
    padding: 10px 15px;
        height: 35px;
        width: 120px;
    outline: none;
    box-shadow: none;
    }

    .buy{
    margin-top: 10px;
    }

       /* adress */
    .container-wrapper {
    padding: 0rem;
    }

    .container-main {
    width: 100%;
    max-width: 20rem;
    }

    .form-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    }

    .phone{
        width: 89%;
    }
        
    }

</style>