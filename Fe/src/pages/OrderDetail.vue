<script setup lang="ts">
import Header from "../components/Header.vue";
import NavbarProfile from "../components/NavbarProfile.vue";
import Loading from "../components/Loading.vue";
import { ref, onMounted } from "vue";
import { useOrderStore } from "../stores/orderStore";
import { useRoute } from "vue-router";
import { formatDateTime, formatPrice, getImage } from "../utils/format";
import { useRouter } from "vue-router";
import Notification from "../components/Notification.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

import type { GetOrder } from "../interfaces/order";
import type { Cart, CartItemDetail, ShopCart } from "../interfaces/cart";
import { useCartStore } from "../stores/cartStore";

import type { OrderItemDetail } from "../interfaces/order";
import ReviewPopup  from "../components/Review.vue"

const cart = useCartStore();
const showFormConfirm = ref(false);
const showNotification = ref<boolean>(false);
const textToast = ref<string>("");
const router = useRouter();
const route = useRoute();
const order = useOrderStore();
const showReviewForm = ref(false);
const selectedOrderItem = ref<OrderItemDetail | null>(null);

onMounted(async () => {
  handleResize();
  const id = parseInt(route.params.id as string);
  await order.getOrderByIdStore(id);
  window.addEventListener("resize", handleResize);
});
const handleResize = () => {
  if (window.innerWidth > 768) {
    showNavbar.value = true;
  } else {
    showNavbar.value = false;
  }
};
const handleHideNavbar = () => {
  if (window.innerWidth <= 768) {
    showNavbar.value = false;
  }
};
const handleCancelled = async () => {
    showNotification.value = true;
    showFormConfirm.value = false;
    if (order.orderDetail?.order_id) {
        await order.cancelledOrderStore(order.orderDetail?.order_id);
        if (order.error) {
          textToast.value = "❌ Không thể hủy đơn hàng";
        } else {
          textToast.value = "✅ Hủy đơn hàng thành công";
        }
    }
};


const handleReOrder = async (getOrder: GetOrder, shop_name: string) => {
  const cartItems: CartItemDetail[] = getOrder.items.map((item) => ({
    cart_item_id: item.id ?? 0, // nếu không có id thì bạn có thể tự sinh
    size_id: item.size_id,
    name: item.product_name,
    quantity: item.quantity,
    price: item.price,
    price_after_reduction: item.flash_price, // có thể null nếu không có giảm giá
    size: item.size,
    color: item.color,
    image_url: item.image_url,
    total_price: item.quantity * item.price,
  }));

  const totalShop = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  const shopCart: ShopCart = {
    shop_id: getOrder.shop_id,
    shop_name: shop_name ,
    carts: cartItems,
    total_shop: 23982934,
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const carttpmp: Cart = {
    shops: [shopCart],
    total_quantity: totalQuantity,
    total_amount: totalShop, // có thể dùng totalShop hoặc getOrder.total nếu cần khớp backend
    voucher_discount: getOrder.discount_value,
  };
  cart.cartPay = carttpmp;
  // console.log(cart.cartPay);
  // return;/
      router.push({ name: 'payment' });
}


const handleReview = (item: OrderItemDetail) => {
  selectedOrderItem.value = item;
  showReviewForm.value = true;
};

const showNavbar = ref<boolean>(true);
</script>
<template>
  <Header></Header>
  <ConfirmDialog
    v-if="showFormConfirm && order.orderDetail"
    :message="'Xác nhận hủy đơn hàng?'"
    @close="showFormConfirm = false"
    @confirm="handleCancelled"
  />
  <Notification :text="textToast" :isSuccess="showNotification" />
  <Loading :loading="order.loading" />
  <div class="breadcrumb" v-if="!order.loading">
    <a href="/home" class="breadcrumb-item">Trang chủ</a>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">Hồ sơ</span>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">Đơn hàng</span>
    <span class="separator">|</span>
    <span class="breadcrumb-item active" id="product-name">Chi tiết đơn</span>
  </div>
  <div class="container" @click="handleHideNavbar" v-if="!order.loading">
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
      <div class="infor-address">
        <div class="progress-bar-container">
          <div class="progress-bar-animated"></div>
        </div>
        <div class="address">
          <span class="title-ad"
            ><i class="fa-solid fa-location-dot"></i> Địa chỉ nhận hàng</span
          >
          <div class="shipping-name">
            <span>{{ order.orderDetail?.shipping_name }} | {{ "  " }}</span>
            <span class="phone">{{ order.orderDetail?.shipping_phone }}</span>
          </div>
          <span class="name-address">{{
            order.orderDetail?.shipping_address
          }}</span>
        </div>
      </div>
      <div class="list-order">
        <div class="card-order">
          <div class="header-shop">
            <div class="header-left">
              <i class="fa-solid fa-store"></i>
              <span>{{ order.orderDetail?.shop_name }}</span>
              <button
                @click="
                  router.push({
                    name: 'shop',
                    params: { id: order.orderDetail?.shop_id },
                  })
                "
              >
                Xem shop
              </button>
            </div>
            <div class="status-order">
              <div
                class="completed"
                v-if="order.orderDetail?.status == 'completed'"
              >
                <i class="fa-solid fa-truck-fast"></i>
                <span class="success">Giao hàng thành công |{{ " " }}</span>
                <span>Hoàn thành</span>
              </div>
              <span
                class="pending"
                v-if="order.orderDetail?.status == 'pending'"
                >Chờ xác nhận</span
              >
              <span
                class="confirmed"
                v-if="order.orderDetail?.status == 'confirmed'"
                >Chờ lấy hàng</span
              >
              <span
                class="shipped"
                v-if="order.orderDetail?.status == 'shipped'"
                >Đang giao</span
              >
              <span
                class="cancelled"
                v-if="order.orderDetail?.status == 'cancelled'"
                >Đã hủy</span
              >
            </div>
          </div>
          <div class="product" v-for="product in order.orderDetail?.items">
            <div class="detail-product">
              <div class="detail-left">
                <img
                  :src="getImage(product.image_url || '')"
                  alt=""
                  @click="
                    router.push({
                      name: 'product-detail',
                      params: { id: product.product_id },
                    })
                  "
                />
                <div class="infor-product">
                  <span class="name">{{ product.product_name }}</span>
                  <span
                    >Phân loại hàng: {{ product.color }},
                    {{ product.size }}</span
                  >
                  <span>x{{ product.quantity }}</span>
                </div>
              </div>
              <div class="detail-right">
                <button v-if="order.orderDetail?.status == 'completed'" @click="handleReview(product)">
                  Đánh giá
                </button>
                <div class="price">
                  <span class="old" v-if="product.flash_price">{{
                    formatPrice(product.price)
                  }}</span>
                  <span>{{
                    formatPrice(product.flash_price || product.price!)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="total-price">
            <div class="infor-price">
              <div class="first-total">
                <span>Tổng tiền hàng: </span>
                <span>{{
                  formatPrice(
                    (order.orderDetail?.total || 0) +
                      (order.orderDetail?.discount_value || 0)
                  )
                }}</span>
              </div>
              <div class="voucher-total">
                <span>Giảm giá Voucher: </span>
                <span
                  >-{{
                    formatPrice(order.orderDetail?.discount_value || 0)
                  }}</span
                >
              </div>
              <div class="last-total">
                <span>Thành tiền: </span>
                <span class="last-price">{{
                  formatPrice(order.orderDetail?.total || 0)
                }}</span>
              </div>
            </div>
            <hr />
            <div class="create-date">
              <span><i class="fa-regular fa-calendar"></i> Ngày mua hàng:</span>
              <span> {{ formatDateTime(order.orderDetail?.created_at) }}</span>
            </div>
            <hr />
            <div class="payment-method">
              <span
                ><i class="fa-solid fa-money-check-dollar"></i> Phương thức
                thành toán:
              </span>
              <span v-if="order.orderDetail?.payment_method == 'cod'">
                Thanh toán khi nhận hàng</span
              >
              <span v-if="order.orderDetail?.payment_method == 'vnpay'">
                VNPay</span
              >
            </div>
            <hr />
            <!-- <hr v-if="order.orderDetail?.status == 'pending' && order.orderDetail.payment_method == 'cod'"> -->
            <div class="request-payment">
              <span
                ><i class="fa-solid fa-bell"></i>Vui lòng thanh toán
                <span style="color: red"
                  >{{ formatPrice(order.orderDetail?.total || 0) }}
                </span>
                khi nhận hàng</span
              >
            </div>
            <hr />
            <div class="btn">
              <button
                class="see-order-detail"
                @click="router.push({ name: 'order-of-me' })"
              >
                Trở lại
              </button>
              <button @click="handleReOrder(order.orderDetail, order.orderDetail.shop_name || '')"
                class="re-order"
                v-if="
                  order.orderDetail?.status === 'completed' ||
                  order.orderDetail?.status == 'cancelled'
                "
              >
                Mua lại
              </button>
              <button
                class="re-order"
                v-if="order.orderDetail?.status === 'pending'"
                @click="showFormConfirm = true"
              >
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ReviewPopup 
      v-if="showReviewForm && selectedOrderItem" 
      :orderItem="selectedOrderItem" 
      @close="showReviewForm = false" 
    />
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
.automatic-redirect-image {
  display: none;
}
.breadcrumb-item {
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.3s;
}
#product-name {
  color: black;
}
.breadcrumb-item:hover {
  color: #ff6b35;
}

.breadcrumb-item.active {
  color: #a1a1a1;
  font-weight: 500;
}
.breadcrumb-item.active:hover {
  cursor: pointer;
}
.container {
  width: 100%;
  background-color: rgb(247, 247, 247);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 1px;
  overflow: hidden;
  scrollbar-width: none;
  height: 74vh;
}
.order {
  width: 75%;
  overflow-y: auto;
  /* scrollbar-width: thin; */
  background-color: white;
  border-top-left-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding-top: 10px;
  height: 100%;
}
.infor-address {
  width: 85%;
  display: flex;
  flex-direction: column;
  background-color: #dfdfdf;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
}
.progress-bar-container {
  width: 100%;
  /* padding: 5px 0; */
  overflow: hidden;
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
.address {
  margin-top: 10px;
  /* margin-right: 10px; */
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-bottom: 13px;
}
.address span {
  margin-left: 45px;
  font-size: 18px;
}
.shipping-name .phone {
  margin-left: 2px;
  color: #6b6b6b;
  font-size: 16px;
}
.address .title-ad,
.fa-location-dot {
  color: red;
  font-size: 19px;
  margin-left: 10px;
}
.name-address {
  margin-top: 3px;
  font-size: 14px !important;
  color: #474747;
}
.list-order {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 85%;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.card-order {
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
  width: 100%;
  background-color: #f5f5f5;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.4);
}
.header-shop {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 10px;
  margin: 10px;
  border-bottom: 1px solid rgb(184, 184, 184);
}
.header-left i {
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
.header-left button {
  background: none;
  border: 1px solid rgb(180, 180, 180);
  font-size: 13px;
}
.header-left button:hover {
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
.status-order .completed .success,
i {
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
.product {
  width: 90%;
  display: flex;
  flex-direction: column;
  border-bottom: 0.5px solid rgb(163, 163, 163);
  padding-bottom: 5px;
  margin: 0 auto;
  padding-top: 5px;
  /* background-color: red; */
}
.detail-product {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.detail-left {
  width: 60%;
  display: flex;
  flex-direction: row;
}
.detail-left img {
  border: 0.5px solid rgb(141, 141, 141);
  width: 20%;
}
.infor-product {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  color: #707070;
  font-size: 15px;
  margin-left: 15px;
}
.name {
  font-weight: 400;
  font-size: 18px;
  color: #000000;
}
.detail-right {
  /* width: 35%; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: red;
  font-size: 20px;
}
.price {
  display: flex;
  flex-direction: column;
}
.old {
  text-decoration: line-through;
  color: #000000;
  font-size: 17px;
}
.detail-right button:hover {
  background-color: #eefdff;
  cursor: pointer;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
}
.detail-right button {
  background-color: white;
  color: rgb(3, 149, 175);
  border: 0.5px solid rgb(0, 119, 255);
  margin-right: 20px;
}
.total-price {
  padding: 10px;
  background-color: rgb(231, 231, 231);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 97.7%;
  gap: 4px;
}
.infor-price {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  margin-right: 37px;
}
.payment-method {
  margin: -5px 0;
  margin-right: 40px;
  display: flex;
  gap: 20px;

  /* margin: 0 auto; */
}
.fa-money-check-dollar {
  color: rgb(211, 211, 7);
}
.first-total,
.voucher-total,
.last-total {
  display: flex;
  flex-direction: row;
  gap: 40px;
}
hr {
  width: 90%;
  border: 0.1px solid rgb(220, 220, 220);

  color: red;
}
.first-total,
.voucher-total,
.last-total {
  display: flex;
  justify-content: space-between;
  margin-right: 4px;
}
.last-price {
  font-size: 20px;
  color: red;
}
.request-payment {
  display: flex;
  flex-direction: row;
  gap: 40px;
  margin: -5px 0;
  margin-right: 40px;
}
.create-date {
  margin: -5px 0;
  display: flex;
  flex-direction: row;
  gap: 40px;
  margin-right: 40px;
}
.btn {
  display: flex;
  flex-direction: row;
  justify-content: end;
  width: 29%;
}
.fa-bell {
  color: yellowgreen;
}
.btn button {
  background: none;
  margin: 4px;
  width: 45%;
  height: 30px;
}
.re-order {
  background-color: red !important;
  color: white;
  border: 0.5px solid rgb(218, 16, 16);
}
.re-order:hover {
  background-color: rgb(240, 1, 1) !important;
  cursor: pointer;
  box-shadow: 0 4px 5px rgba(228, 55, 55, 0.1);
}
.test {
  width: 100%;
  height: 400px;
  background-color: red;
}
.see-order-detail {
  color: blue;
  border: 0.5px solid rgb(16, 36, 218);
}
.see-order-detail:hover {
  background-color: #dfdfdf;
  cursor: pointer;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
}
@media (max-width: 1024px) {
  .container {
    border-radius: 0px;
  }
  .order {
    border-radius: 0px;

    width: 75%;
  }
  .status {
    width: 85%;
  }
  .list-order {
    width: 85%;
  }
  .search {
    width: 84%;
  }
}
@media (max-width: 768px) {
  .container {
    margin-top: 100px;
  }
  .breadcrumb {
    display: none;
  }
  .order {
    width: 100%;
    margin-top: 24px;
  }
  .list-order {
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

  .status span {
    text-decoration: none !important;
  }
  .search button {
    width: 30px;
  }
  .status::-webkit-scrollbar {
    display: none;
  }
  .search {
    width: 95%;
  }
  .list-order {
    width: 95%;
  }
  .total-price {
    width: 94%;
    margin: 0 auto;
  }
  .btn {
    width: 60%;
  }
  .detail-left img {
    width: 40px;
    height: 60px;
  }
}
@media (max-width: 375px) {
  .header-left span {
    font-size: 17px;
  }
  .header-left button {
    font-size: 14px;
  }
  .infor-product span {
    font-size: 13px;
  }
  .name {
    font-size: 15px;
  }
  .price span {
    font-size: 18px;
  }
  .price .old {
    font-size: 15px;
  }
}
</style>
