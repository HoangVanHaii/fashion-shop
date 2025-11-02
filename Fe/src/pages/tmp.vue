

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Header from '../components/Header.vue'
import { useCartStore } from '../stores/cartStore'
import type { ProductSize,ProductPayload,ProductColor } from '../interfaces/product' 
import type { CartItemDetail } from '../interfaces/cart'
import { useRouter } from 'vue-router'
import {validateVoucherByCode} from '../utils/validateVoucher'
import Voucher from '../components/Voucher.vue'
import { getImage } from '../utils/format'
import Notification from '../components/Notification.vue'


const router = useRouter()
const cartStore = useCartStore() 
onMounted(async () => {
  await cartStore.getCart()
  await cartStore.checkSoldOut();
})
const toastText = ref<string>('')
const isNotification = ref<boolean>(false);

const handleSaveFavourite = async() => {
    toastText.value = '';
    // cartStore.shops.forEach(shop => {
    //     const selectedItems = shop.carts?.filter(item => item.selected && !item.sold_out) || []
    //     selectedItems.forEach(element => {
    //         favourite.addFavouriteStore()
    //     });
    // })
    setTimeout(() => {
        isNotification.value = true;
        toastText.value = 'Bạn đã thêm vào mục yêu thích'

    }, 0)
}
const voucher_code = ref<string>("GLOBAL102225")
watch(
  () => cartStore.total_price_after_reduction,
  async (total) => {
    const cart = cartStore.cartPay
    if (!cart) return 

    if (total > 0) {
      try {
        const discount = await validateVoucherByCode(voucher_code.value, total)
        cart.voucher_discount = discount

        // Lưu voucher_id vào cartPay
        cart.voucher_code = voucher_code.value
      } catch (err: any) {
        cart.voucher_discount = 0
        console.error(err.message)
      }
    } else {
      cart.voucher_discount = 0
    }
  }
)




const openDropdown = ref<number | null>(null)

const toggleDropdown = async (cartItem: CartItemDetail) => {
  if (openDropdown.value === cartItem.cart_item_id) {
    openDropdown.value = null
    return
  }
  
  
  await cartStore.getProductDetail(cartItem) 
  const currentProduct = cartStore.selectedProduct
  if (currentProduct) {
    afterColor.value = currentProduct.colors.find(c => c.color === cartItem.color) || null
  }
  openDropdown.value = cartItem.cart_item_id
  flagSize.value=true;

}
const afterColor = ref<ProductColor | null >(null);
const flagSize = ref<boolean>(true);
const selectColor = async (cartItem: CartItemDetail, product: ProductPayload, itemcolor: ProductColor) =>{
  flagSize.value = cartItem.color === itemcolor.color
  cartItem.color=itemcolor.color;
  afterColor.value = product.colors.find(c => c.color === itemcolor.color) || null
}
const selectSize = async (cartItem: CartItemDetail, size: ProductSize) => {
  cartItem.size_id = size.id!      
  cartItem.size = size.size!     
  openDropdown.value = null   
   flagSize.value = true;
  await cartStore.updateCartItemSize(cartItem,size.id!)    
}

const closeAllDropdowns = () => {
    toastText.value = '';
    if (flagSize.value) {
        openDropdown.value = null;
    }
    else {
        setTimeout(() => {
            isNotification.value = false;
            toastText.value = 'Bạn chưa chọn size cho màu mới!';
        }, 0);
    }
}
//Xác nhận xóa
const showDeleteConfirm = ref(false)

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  await cartStore.removeSelectedItemsApi()
  showDeleteConfirm.value = false
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const goToCheckout = () => {
  cartStore.filterSelectedItems() 
  router.push({ name: 'payment' })
    
}
//Xác nhận pay
const showPayConfirm = ref(false)

const confirmPay = () => {
  if(cartStore.totalSelectedItemCount>0){
    goToCheckout()
  }
  else{
    showPayConfirm.value = true
  }
  
}

const cancelPay = () => {
  showPayConfirm.value = false
}

//voucher
const showVoucher = ref(false)
const selectedVoucherCode = ref<string>("")

const openVoucherModal = () => {
  showVoucher.value = true
}

const closeVoucherModal = () => {
  showVoucher.value = false
}

const handleSelectVoucher = async (code: string, id_shop: number) => {
  selectedVoucherCode.value = code
  cartStore.filterSelectedItems()
  const cart = cartStore.cartPay
  if (cart && cartStore.total_price_after_reduction > 0) {
    try {
      const discount = await validateVoucherByCode(code, cartStore.total_price_after_reduction,id_shop)
      cart.voucher_discount = discount
      cart.voucher_code = code
      
      
    } catch (err: any) {
      cart.voucher_discount = 0
      console.error(err.message)
    }
  }
  closeVoucherModal()
}

// watch(
//   () => cartStore.total_price_after_reduction,
//   async (total) => {
//     const cart = cartStore.cartPay
//     if (!cart) return 

//     if (total > 0) {
//       try {
//         const discount = await validateVoucherByCode(selectedVoucherCode.value, total)
//         cart.voucher_discount = discount

//         cart.voucher_code = selectedVoucherCode.value
//       } catch (err: any) {
//         cart.voucher_discount = 0
//         console.error(err.message)
//       }
//     } else {
//       cart.voucher_discount = 0
//     }
//   }
// )

const selectedAddress = ref(0)

const addresses = [
  {
    id: 1,
    name: 'Trần Huy Vui',
    phone: '0123456789',
    street: '31 Bình phú',
    district: 'Phường 10, Quận 6, TP. Hồ Chí Minh',
    isDefault: true,
    label: 'Mặc định'
  },
  {
    id: 2,
    name: 'Trần Huy Vui',
    phone: '0123457891',
    street: '31 Bình phú',
    district: 'Phường 10, Quận 6, TP. Hồ Chí Minh',
    isDefault: false
  }
]

const handleConfirm = () => {
  console.log('Địa chỉ được chọn:', addresses[selectedAddress.value])
}

const handleCancel = () => {
  console.log('Hủy')
}

const handleAddAddress = () => {
  console.log('Thêm địa chỉ mới')
}

</script>


<style scoped>

button:focus,
input:focus {
  outline: none;
  box-shadow: none;
}

.cart-page {
  font-size: 18px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 110px;
  background-color: #f6f3f3;
  width: 90%;
  margin: 0 auto;
}

.cart-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tab {
  display: flex;
  border-radius: 5px;
  background-color: #d7d4d4a2;
  padding: 10px 20px 10px 50px;
  margin-bottom: 10px;
}

.divider {
  width: 1px;
  background-color: #060606ff;
  margin: 0 15px;
}

.checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: #f26b3a;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding-left: 20px;
  padding-top:12px;
  padding-bottom: 12px;
  font-weight: 600;
  margin-bottom: 15px;
  border-radius: 6px;
  box-shadow: 0px 3px 6px rgba(0,0,0,0.4);
}

.header1 {
  flex:1.8;
  align-items: center;
  gap: 8px;
  /* padding-left: 40px; */
  text-align: left;
}

.header2 {
  flex:3;
  display: flex;
   justify-content: space-between;
   text-align: center;
}
.header_price{
  flex:1.5;
}

.header_quantity{
  flex:1.7
} 

.header_total{
  flex:1;
}

.header_v{
  flex:1.4;
}

.shop-container {
  margin-bottom: 15px;
  padding: 8px 16px;
  background-color: #fff;
  /* border-radius: 8px; */
  box-shadow: 0px 4px 8px rgba(0,0,0,0.3);
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
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 17px;
  padding-bottom: 10px;
  background-color: white;
  border-bottom: 0.5px solid #9d9b9b;
  position:relative;
}

.cart-item:last-child {
  border-bottom: none;
}

.soldout{
  position: absolute;
  left:80px;
  top:40%;
  background-color: yellow;
  border-radius: 6px;
  font-size: 14px;
  width: 80px;
}
.size-item.disabled {
  opacity: 0.4;             
  cursor: none;    
  pointer-events: none;    
}


.cart-item.disabled  .checkbox  {
  opacity: 0;             
  pointer-events: none;    
}

.cart-item.disabled .item-quantity{
  opacity: 0.6;           
  pointer-events: none; 
}

.item-quantity button{
    cursor: pointer;
}

.cart-item img {
  width: 120px;
  height: 120px;
  border-radius: 5px;
  margin-top: 15px;
  border: 0.3px solid #9c9a9a;
  position: relative;
}

.item-info {
  display: flex;
  flex: 1;
  /* gap: 16px; */
  text-align: left;
  align-items: center;
}

.item-info > .item-name {
  width: 15%;
  font-weight: 600;
}

.size-selector {
  flex:0.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.size-selector img{
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-top: 15px;
  border: 1px solid #131212;
}

.size-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s;
  background: white;
  font-size: 14px;
}

.size-header:hover {
  border-color: #f26b3a;
  background-color: #fff9f5;
}

.size-header i {
  transition: transform 0.2s;
  color: #666;
  font-size: 12px;
}

.size-header i.open {
  transform: rotate(180deg);
  color: #f26b3a;
}

.size-dropdown {
  position: absolute;
  top: 55%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 100;
  min-width: 320px;
  margin-top: 8px;
  padding: 16px;
}

.size-option {
  padding: 0 12 12 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #d20d0d;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.colors-row {
  display: flex;
  flex-wrap: wrap; /* xuống hàng khi quá nhiều */
  gap: 12px;       /* khoảng cách giữa ảnh */
  margin-bottom: 16px;
  /* background-color: red; */
}

.size-dropdown > div:has(img) {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 0.5px solid #f0f0f0;
}

.size-dropdown img {
  width: 60px !important;
  height: 60px !important;
  object-fit: cover;
  margin-top: 0 !important;
  border: 2px solid #e0e0e0; 
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.size-dropdown img:hover {
  border-color: #f26b3a; /* màu khi hover */
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(242, 107, 58, 0.3);
}

.size-dropdown img.selected {
  border-color: #f26b3a; /* giữ màu cam khi click */
  box-shadow: 0 4px 12px rgba(242, 107, 58, 0.3);
}
.available-sizes {
  padding: 8px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}


.size-item {
  padding: 10px 16px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #333;
  /* background-color: red; */
}

.size-item:hover {
  border-color: #f26b3a;
  background-color: #fff9f5;
  transform: translateY(-2px);
}

.size-item.selected {
  background-color: #f26b3a;
  border-color: #f26b3a;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 8px rgba(242, 107, 58, 0.3);
}

.selected-size {
  display: flex;
  gap: 4px;
  font-size: 13px;
  padding: 6px 12px;
  color: #666;
  font-weight: 500;
}

.item-info > .item-price {
  flex:0.7;
  text-align: center;
  color: #888;
}

.item-info > .item-quantity {
  flex:0.7;
  display: flex;
  justify-content: center;
}

.item-info > .item-total {
  flex:0.5;
  text-align: center;
  color: #e53935;
}

.item-info > i {
  flex:0.55;
  text-align: center;
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
  padding: 6px 20px;
  z-index: 10;
}

.left-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-footer-voucher {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 50px;
  margin-right: 60px;
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

.cart-footer i {
  font-size: 35px;
  color: #f26b3a;
  cursor: pointer;
  margin-right: 8px;
  transition: transform 0.2s, color 0.2s;
}

.cart-footer .voucher {
  display: flex;
  align-items: center;
  pointer-events: none;
  cursor: default;
  font-size: 25px;
}

.cart-footer .left {
  display: flex;
  align-items: center;
  gap: 70px;
}

.cart-footer .left div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-footer .right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.right p {
  text-align: left;
}

.total-amount {
  color: #e53935;
}

.checkout-btn {
  background: #e53935;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 50px;
  margin-left: 40px;
  width: 200px;
  font-size: 22px; 
}

/* Xác nhận */
/* Modal overlay mờ nền */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Hộp nội dung modal */
.modal-content {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 400px;
  animation: fadeIn 0.3s ease;
}

/* Nội dung */
.modal-message {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
}

.btn-cancel,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-pay {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  width:100%;
  cursor: pointer;
  background-color: #e53935;
  color: white;
}

.btn-cancel {

  background-color: #e53935;
  color:white;
  width:30%;
}

.btn-delete {
  background-color: #ccc;
  color: white;
  width:30%;
}

.btn-cancel:hover {
  background-color: #bbb;
}

.btn-delete:hover {
  background-color: #c62828;
}

/* Animation mờ */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}


/* adress */
.container-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
  /* divide-y divide-gray-200; */
  border-top: 1px solid #e5e7eb;
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

/* Radio Button */
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

/* Address Info */
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

.info-street {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.25rem 0;
}

.info-district {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0.5rem 0;
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

/* Add Address Section */
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

/* Footer Actions */
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
/* ----------------------------- */
/*  Destop (1024px – 1300px) */
/* ----------------------------- */
@media (max-width: 1300px) and (min-width: 1024px) {
  .cart-page {
    font-size: 15px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f5f5f5;
  }


  .tab {
    padding: 10px 16px;
  }

  .cart-header {
    padding: 12px 12px;
  }

  .header1 {
    flex:3;
    margin-left: 20px;
  }

  .header2 {
    flex:3;
    padding-right: 0px;
  }

  .header_total{
    flex:0.4;
  }

  .header_quantity{
    flex:0.5;
  }

  .header_v{
  flex:0.3;
  }


 .header_price {
    flex:0.8;
  }

  .cart-item img {
    width: 100px;
    height: 100px;
  }

  .item-info {
    gap: 10px;
  }

  .item-info > .item-name {
    flex:0.7;
  }

  .size-selector {
    flex:0.7;
  }
  .item-info > .item-quantity{
    flex:0.5;
  }
  .item-info > .item-price{
    flex:0.7;
    text-align: center;

  }
  .item-info > .item-total {
    flex:0.4;
    text-align: center;
  }

  .item-info > i {
    flex:0.3;
    text-align: center;
  }

  /* Footer */
  .cart-footer {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
  }

  .cart-footer-voucher {
    gap: 40px;
    margin-right: 20px;
  }

  .cart-footer .left {
    gap: 30px;
  } 

  .cart-footer .right {
    gap: 10px;
  }

  .checkout-btn {
    padding: 8px 16px;
    font-size: 16px;
    width: 180px;
    margin: 0 auto;
  }
}

/* ----------------------------- */
/*  Tablet (940px – 1024px) */
/* ----------------------------- */
@media (max-width: 1024px) and (min-width: 940px) {
  .cart-page {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f5f5f5;
  }


  .tab {
    padding: 10px 16px;
  }

  .cart-header {
    padding: 12px 12px;
  }

  .header1 {
    flex:3;
    margin-left: 20px;
  }

  .header2 {
    flex:3;
    padding-right: 0px;
  }

  .header_total{
    flex:0.4;
  }

  .header_quantity{
    flex:0.5;
  }

  .header_v{
  flex:0.3;
}


 .header_price {
    flex:0.8;
  }

  .cart-item img {
    width: 100px;
    height: 100px;
  }

  .item-info {
    gap: 10px;
  }

  .item-info > .item-name {
    flex:0.7;
  }

  .size-selector {
    flex:0.7;
  }
  .item-info > .item-quantity{
    flex:0.5;
  }
  .item-info > .item-price{
    flex:0.7;
    text-align: center;

  }
  .item-info > .item-total {
    flex:0.4;
    text-align: center;
  }

  .item-info > i {
    flex:0.3;
    text-align: center;
  }

  /* Footer */
  .cart-footer {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
  }

  .cart-footer-voucher {
    gap: 40px;
    margin-right: 20px;
  }

  .cart-footer .left {
    gap: 30px;
  } 

  .cart-footer .right {
    gap: 10px;
  }

  .checkout-btn {

    padding: 8px 16px;
    font-size: 16px;
    width: 180px;
    margin: 0 auto;
  }
}
/* ----------------------------- */
/*  Tablet (768px – 940px) */
/* ----------------------------- */

@media (max-width: 940px) and (min-width: 768px) {
  .cart-page {
    font-size: 17px;
    background-color: #ececec;
  }

  .tab {
    padding: 8px 12px;
    background-color: #d4d4d4;
  }

  /* Ẩn header hoàn toàn */
  .cart-header {
    display: none;
  }

  /* Shop container */
  .shop-container {
     position: relative;
    background: white;
    margin-bottom: 12px;
    padding: 0;
    box-shadow: none;
   
  }

  /* Shop header */
  .shop {
    padding: 10px 12px;
    font-weight: 400;
    background: #FFF1E2;
    border-bottom: none;
  }
  /* Cart item */
  .cart-item {
     width: 90%;
      margin-top:10px;
    margin-bottom:10px;
    margin-left: 3.5%;
    position: relative;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    gap: 10px;
    background: white;
    border-bottom: none;
    border-radius: 8px;
    box-shadow: 4px 4px 8px rgba(127, 125, 125, 0.5);
  
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .checkbox {
    width: 25px;
    height: 25px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .cart-item img {
    width: 150px;
    height:150px;
    padding-top: 0;
    flex-shrink: 0;
    margin-left: 0;
  }

  /* Item info */
  .item-info {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .item-info > .item-name {
    width: 100%;
    font-weight: 400;
    color: #000;
    padding-right: 25px;
  }

  /* Size selector */
  .size-selector {
    width: 100%;
  }

  .size-header {
    padding: 0px 4px;
    border: 1px solid #191717;
    width: 120px;
    
  }

  .selected-size {
    color: #666;
  }

  /* Price */
  .item-info > .item-price {
    display: flex;
    gap: 8px;
    width: 100%;
  
    color: #e53935;
  }

  .item-info > .item-price s {
    color: #999;

  }

  /* Quantity */
  .item-info > .item-quantity {
    margin-top: 2px;
  }

  .item-quantity button {
    width: 24px;
    height: 24px;
   
  }

  .item-quantity input {
    width: 40px;
    height: 20px;

  }

  /* Ẩn total */
  .item-info > .item-total {
    display: none;
  }

  /* Icon delete */
  .item-info > i {
    position: absolute;
    right: 30px;
    top: 75px;
    font-size: 25px;
    color: #666;
  }

  /* Footer */
  .cart-footer {
    padding: 12px;
  }

  .cart-footer-voucher {
    justify-content: flex-start;
    gap: 12px;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .cart-footer i {
    font-size: 30px;
  }

  .left-right {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .cart-footer .left {
    flex: 1;
    min-width: 100%;
    gap: 20px;
  }

  .cart-footer .right {
    flex: 1;
    max-width: 100%;
    justify-content: flex-end;
     position: relative;
     margin-bottom: 60px;
  }

  .checkout-btn {
    position:absolute;
    right: 0px;
    top: 80px;
    padding: 10px 24px;
    width: auto;
    margin: 0;
  }
}
  
/* ----------------------------- */
/* 📱 Mobile (≤767px) */
/* ----------------------------- */
@media (max-width: 767px) and (min-width: 550px) {
  .cart-page {
    font-size: 16px;
    background-color: #ececec;
  }

  .tab {
    padding: 8px 12px;
    background-color: #d4d4d4;
  }

  /* Ẩn header hoàn toàn */
  .cart-header {
    display: none;
  }

  /* Shop container */
  .shop-container {
     position: relative;
    background: white;
    margin-bottom: 12px;
    padding: 0;
    box-shadow: none;
   
  }

  /* Shop header */
  .shop {
    padding: 10px 12px;
    font-weight: 400;
    background: #FFF1E2;
    border-bottom: none;
  }
  /* Cart item */
  .cart-item {
     width: 90%;
      margin-top:10px;
    margin-bottom:10px;
    margin-left: 3.5%;
    position: relative;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    gap: 10px;
    background: white;
    border-bottom: none;
    border-radius: 8px;
    box-shadow: 4px 4px 8px rgba(127, 125, 125, 0.5);
  
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .checkbox {
    width: 25px;
    height: 25px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .cart-item img {
    width: 150px;
    height:150px;
    padding-top: 0;
    flex-shrink: 0;
    margin-left: 0;
  }

  /* Item info */
  .item-info {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .item-info > .item-name {
    width: 100%;
    font-weight: 400;
    color: #000;
    padding-right: 25px;
  }

  /* Size selector */
  .size-selector {
    width: 100%;
  }

  .size-header {
    padding: 0px 4px;
    border: 1px solid #191717;
    width: 120px;
    
  }

  .selected-size {
    color: #666;
  }

  /* Price */
  .item-info > .item-price {
    display: flex;
    gap: 8px;
    width: 100%;
  
    color: #e53935;
  }

  .item-info > .item-price s {
    color: #999;

  }

  /* Quantity */
  .item-info > .item-quantity {
    margin-top: 2px;
  }

  .item-quantity button {
    width: 24px;
    height: 24px;
   
  }

  .item-quantity input {
    width: 40px;
    height: 20px;

  }

  /* Ẩn total */
  .item-info > .item-total {
    display: none;
  }

  /* Icon delete */
  .item-info > i {
    position: absolute;
    right: 30px;
    top: 75px;
    font-size: 25px;
    color: #666;
  }

  /* Footer */
  .cart-footer {
    padding: 12px;
  }

  .cart-footer-voucher {
    justify-content: flex-start;
    gap: 12px;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .cart-footer i {
    font-size: 30px;
  }

  .left-right {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0px;
  }

  .cart-footer .left {
    flex: 1;
    min-width: 100%;
    gap: 20px;
  }

  .cart-footer .right {
    flex: 1;
    max-width: 100%;
    justify-content: flex-end;
     position: relative;
     margin-bottom: 30px;
  }

  .checkout-btn {
    position:absolute;
    font-size:15px;
    right: 0px;
    top: 60px;
    padding: 10px 24px;
    width: 180px;
    margin: 0;
  }

  .size-dropdown {
  min-width: 220px;
  }

  .voucher span{
    font-size:20px;
  }
}
@media (max-width: 550px) {
  .cart-page {
    font-size: 11px;
    padding-top: 85px;
    background-color: #ececec;
    width: 100%;
  }

  .cart-content {
  flex: 1;
  padding: 5px;
  overflow-y: auto;
  }

  .tab {
    padding: 8px 12px;
    background-color: #d4d4d4;
  }

  /* Ẩn header hoàn toàn */
  .cart-header {
    display: none;
  }

  /* Shop container */
  .shop-container {
     position: relative;
    background: white;
    margin-bottom: 7px;
    padding: 0;
    box-shadow: none;
   
  }

  /* Shop header */
  .shop {
    padding: 5px 12px;
    font-weight: 400;
    background: #FFF1E2;
    border-bottom: none;
  }
  /* Cart item */
  .cart-item {
     width:94.5%;
    margin-top:5px;
    margin-bottom:5px;
    margin-left: 1.5%;
    position: relative;
    flex-direction: row;
    align-items: center;
    padding: 5px;
    gap: 5px;
    background: white;
    border-bottom: none;
    border-radius: 8px;
    box-shadow: 4px 4px 8px rgba(127, 125, 125, 0.5);
  
  }

  .cart-item:last-child {
    border-bottom: none;
  }

  .checkbox {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .cart-item img {
    width: 70px;
    height:70px;
    padding-top: 0;
    flex-shrink: 0;
    margin-left: 0;
    margin-top: 0;
  }

  /* Item info */
  .item-info {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .item-info > .item-name {
    width: 100%;
    font-weight: 400;
    color: #000;
    padding-right: 25px;
  }

  /* Size selector */
  .size-selector {
    width: 100%;
  }

  .size-header {
    padding: 0px 4px;
    border: 1px solid #191717;
    width: 90px;
    font-size:11px;
    
  }

  .selected-size {
    color: #666;
    font-size:10px;
    padding-bottom: 0;
  }

  /* Price */
  .item-info > .item-price {
    display: flex;
    gap: 8px;
    width: 100%;
  
    color: #e53935;
  }

  .item-info > .item-price s {
    color: #999;

  }

  /* Quantity */
  .item-info > .item-quantity {
    margin-top: 2px;
    position: absolute;
    right: 10px;
    bottom: 7px;
  }

  .item-quantity button {
    width: 20px;
    height: 18.5px;
  }

  .item-quantity input {
    width: 20px;
    height: 15px;
    font-size: 11px;;

  }

  /* Ẩn total */
  .item-info > .item-total {
    display: none;
  }

  /* Icon delete */
  .item-info > i {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 15px;
    color: #666;
  }

  /* Footer */
  .cart-footer {
    padding: 12px;
  }

  .cart-footer-voucher {
    justify-content: flex-start;
    gap: 12px;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .cart-footer i {
    font-size: 30px;
  }

  .left-right {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0px;
  }

  .cart-footer .left {
    flex: 1;
    min-width: 100%;
    gap: 20px;
  }

  .cart-footer .right {
    flex: 1;
    max-width: 100%;
    justify-content: flex-end;
     position: relative;
     margin-bottom: 30px;
  }

  .checkout-btn {
    position:absolute;
    font-size:15px;
    right: 0px;
    top: 60px;
    padding: 10px 24px;
    width: 180px;
    margin: 0;
  }

  .size-dropdown {
  top: 40%;
  left: 0%;
  min-width: 100px;
  }

  .size-option {
  margin-bottom: 6px;
  font-size: 11px;
}

.size-dropdown > div:has(img) {
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 6px;
}

.size-dropdown img {
  width: 40px !important;
  height: 40px !important;
}

.available-sizes {
  padding: 0px 0;
}

.size-item {
  padding: 5px 8px;
  font-size: 11px;
  width: 40px;

}

  .voucher span{
    font-size:15px;
  }

  .checkout-btn {
    position: absolute;
    right:0;
    top:45px;
  width: 140px;
  font-size: 12px; 
}
}
</style>







