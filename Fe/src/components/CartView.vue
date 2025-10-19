<template>
  <div class="cart-page">
    <!-- DANH SÁCH GIỎ HÀNG -->
    <div class="cart-content">
      <div class="tab">
        <span>Trang chủ</span>
        <span class="divider"></span>
        <span class="cart" :style="{color:'#828080ff'}">Giỏ hàng()</span>
      </div>

      <div class="cart-header">
        <div class="header1">
          <span>Sản phẩm</span>
        </div>
        <div class="header2">
          <span>Đơn giá</span>
          <span>Số lượng</span>
          <span>Số tiền</span>
          <span>Thao tác</span>
        </div>
      </div>

      <div v-for="shop in cartStore.shops" :key="shop.shop_id" class="shop-container">
        <div class="shop">
          <input class="checkbox" type="checkbox" />
          <span class="shop-name">{{ shop.shop_name }}</span>
        </div>

        <div v-for="product in shop.carts" :key="product.cart_item_id" class="cart-item">
          <input class="checkbox" type="checkbox" v-model="product.selected" />
          <!-- <img :src="product.image" alt="product" /> -->
          <img src="../assets/ao-thun.jpg" alt="product" />
          <div class="item-info">
            <span class="item-name">{{ product.name }}</span>
            <div>
              <span>Phân loại hàng:</span>
              <div>
                <span>{{ product.color }} | </span>
                <span>Size {{ product.size }}</span>
              </div>
            </div>
            <span class="item-price">{{ product.price.toLocaleString() }}đ----{{ product.price.toLocaleString() }}đ</span>
            <div class="item-quantity">
              <button @click="cartStore.decrease(product)">-</button>
              <input type="number" v-model.number="product.quantity" min="1" />
              <button @click="cartStore.increase(product)">+</button>
            </div>
            <p class="item-total">{{ (product.price * product.quantity).toLocaleString() }}đ</p>
            <i class="fa-solid fa-trash-can"
   @click="() => { 
     console.log('Xóa thử:', product.cart_item_id)
     cartStore.removeCartItem(shop, product)
   }">
</i>
          </div>
        </div>
      </div>
    </div>

    <!-- THANH TỔNG TIỀN (STICKY DƯỚI MÀN HÌNH) -->
    
    <div class="cart-footer">
      <div class="cart-footer-voucher">
        <div class="voucher">
          <i class="fa-solid fa-ticket"></i>
          <span >Voucher</span>
        </div>
        <a href="">Chọn hoặc nhập mã voucher</a> 
      </div>
      <div class="left-right">
        <div class="left">
        <div>
          <input class="checkbox" type="checkbox" v-model="cartStore.selectAll" @change="cartStore.toggleSelectAll" />
          <span>Chọn tất cả()</span>
        </div>
        <span>Xóa</span>
        <span>Lưu vào mục yêu thích</span>
      </div>
      <div class="right">
        <p>
          Tổng số (sản phẩm): <br />
          Tiết kiệm:
        </p>
        <p>
          <span class="total-amount">{{ cartStore.total.toLocaleString() }}đ</span> <br/>
          <span class="total-amount">{{ cartStore.total.toLocaleString() }}đ</span>
        </p>
        <button class="checkout-btn">Mua hàng</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,computed } from 'vue'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore() 

// const token = localStorage.getItem('token') || ''
 const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjA4NTYyMTUsImV4cCI6MTc2MDg1OTgxNX0.5dFeaWCFVQoo8Uur91A85vioTawKGxZtJQ65Holw5SU"
onMounted(async () => {
  await cartStore.getCart(token)
})
</script>

<style scoped>


.cart-page {
  font-size: 18px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.cart-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 160px; /* chừa chỗ cho footer */
  overflow-y: auto;
}

.tab {
  display: flex;
  border-radius: 10px;
  background-color: #a9a7a7a2;
  padding: 10px 20px 10px 50px;
  margin-bottom: 10px;
  font-size: 18px;
}

.divider {
  width: 1px;
  background-color: #060606ff;
  margin: 0 15px;
}

.checkbox {
  width: 24px;
  height: 24px;
  accent-color: #f26b3a;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 12px 20px;
  font-weight: 600;
  margin-bottom: 5px;
}

.header1 {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 40px;
  padding-bottom: 12px;
  font-size: 18px;
}

.header2 {
  display: flex;
  gap: 200px;
  padding-right: 20px;
  font-size: 18px;
}

.shop-container {
  margin-bottom: 7px;
  padding: 8px 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 5px 5px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.shop {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  background: #FFF1E2;
  padding-left: 17px;
}

.shop-name {
  font-weight: 400;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 17px;
  padding-bottom: 10px;
  background-color: white;
  border-bottom: 2px solid #000; /* Thêm dòng này */
}

/* Nếu muốn loại bỏ border của item cuối cùng */
.cart-item:last-child {
  border-bottom: none;
}

.cart-item img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  padding-top: 15px;
}

.item-info {
  display: flex;
  flex: 1;
  gap: 16px;
  text-align: left;
  align-items: center;
  font-size: 18px;
}

.item-info > .item-name {
  width: 15%;
  font-weight: 600;
}

.item-info > div:first-of-type {
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-info > .item-price {
  width: 18%;
  text-align: right;
  color: #888;
}

.item-info > .item-quantity {
  width: 25%;
  display: flex;
  justify-content: center;
}

.item-info > .item-total {
  width: 8%;
  text-align: right;
  color: #e53935;
}

.item-info > i {
  width: 210px;
  text-align: right;
  cursor: pointer;
}

.item-quantity button {
  width: 20px;
  height: 26px;
  font-size: 12px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0; 
}

.item-quantity input {
  width: 40px;
  text-align: center;
  border: 1px solid #ccc;
}

/* Footer */
.cart-footer {
  position: sticky;
  bottom: 0;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  padding: 12px 20px;
  z-index: 10;
}
.left-right{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top:10px;
}
.cart-footer-voucher{
  display:flex;
  justify-content: flex-end;
  align-items: center;
  gap:100px;
  margin-right: 150px;
}
.cart-footer i {
  font-size: 35px;        /* kích thước hợp lý */
  color: #f26b3a;         /* màu nổi bật giống theme */
  cursor: pointer;        /* con trỏ nhấn được */
  margin-right: 8px;      /* cách text hoặc các phần tử khác */
  transition: transform 0.2s, color 0.2s; /* hiệu ứng khi hover */
}

.cart-footer .voucher {
    display:flex;
   align-items: center;
  pointer-events: none; /* tắt tất cả sự kiện chuột */
  cursor: default; 
  font-size: 25px;     /* con trỏ chuột mặc định */
}


.cart-footer .left {
  display: flex;
  align-items: center;
  gap: 70px;
}

.cart-footer .right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.right p{
  text-align: left;
}
.total-amount {
  color: #e53935;
  font-size: 18px;

}

.checkout-btn {
  background: #e53935;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-right:100px;
  margin-left:40px;
   width: 200px;
   font-size:22px;
}
/* ----------------------------- */
/* 💻 Tablet (768px – 1024px) */
/* ----------------------------- */
@media (max-width: 1024px) and (min-width: 768px) {
  .cart-page {
    padding: 0 40px;
  
  }

  .tab {
    font-size: 16px;
    padding: 10px 16px;
  }

  .header1, .header2 {
    font-size: 16px;
    gap: 100px;
  }

  .cart-item img {
    width: 100px;
    height: 100px;
  }

  .item-info {
    font-size: 16px;
    gap: 10px;
    flex-wrap: wrap;
  }

  .item-info > .item-name {
    width: 40%;
  }

  .item-info > div:first-of-type {
    width: 30%;
  }

  .item-info > .item-price,
  .item-info > .item-total {
    width: auto;
    text-align: left;
  }

  .item-info > i {
    width: auto;
  }

  .cart-footer {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
  }

  .checkout-btn {
    padding: 8px 20px;
    font-size: 16px;
  }
}

/* ----------------------------- */
/* 📱 Mobile (≤767px) */
/* ----------------------------- */
@media (max-width: 767px) {
  .cart-page {
    padding: 0 12px;
    
  }

  .tab {
    font-size: 15px;
    padding: 8px 12px;
  }

  .cart-header {
    display: none; /* Ẩn tiêu đề cột */
  }

  .shop-container {
    padding: 8px;
  }

  .shop {
    font-size: 15px;
    padding-left: 10px;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #ddd;
    gap: 8px;
  }

  .cart-item img {
    width: 90px;
    height: 90px;
    padding-top: 5px;
  }

  .item-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-size: 15px;
    width: 100%;
  }

  .item-info > .item-name {
    width: 100%;
  }

  .item-info > div:first-of-type {
    display: none; /* Ẩn “Phân loại hàng” */
  }

  .item-info > .item-price {
    width: 100%;
    text-align: left;
    color: #666;
  }

  .item-info > .item-quantity {
    justify-content: flex-start;
  }

  .item-info > .item-total {
    width: 100%;
    text-align: left;
    color: #e53935;
    font-weight: bold;
  }

  .item-info > i {
    width: auto;
    text-align: left;
  }

  .cart-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  }

  .cart-footer .right {
    width: 100%;
    justify-content: space-between;
  }

  .checkout-btn {
    width: 100%;
    text-align: center;
    padding: 10px;
    font-size: 16px;
  }
}

</style>

