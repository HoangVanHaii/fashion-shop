<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAddressStore } from '../stores/addressStore';
import Header from '../components/Header.vue';
import Notification from '../components/Notification.vue';
import NavbarProfile from '../components/NavbarProfile.vue';
import type { Address } from '../interfaces/address';
import Loading from '../components/Loading.vue';

const addressStore = useAddressStore()
const toastText = ref<string>('')
const isNotification = ref<boolean>(false);

const selectedAddress = ref(0)
onMounted(async()=>{
    await addressStore.getAddressesByUserStore();
    if(addressStore.addressDefault.id){
        selectedAddress.value = addressStore.addressDefault.id
    }
     window.addEventListener("resize", handleResize);
})
const showNavbar = ref(true);
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

const handleConfirm = async (address:Address) => {
  const selected =address
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



  } catch (err) {
    toastText.value=""
    toastText.value="Cập nhật địa chỉ mặc định thất bại"
    isNotification.value = false
  }
};

// add address
const showAddAddressForm = ref<boolean>(false)
const openAddAddressForm = ()=>{
    newAddress.value = {
        name: '',
        phone: '',
        address: '',
        is_default: false
    }
    // showListAddress.value = false
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
    // showListAddress.value = true
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

const handleDelete = async(address :Address)=>{
     toastText.value=""
    try {
        if(address.id){
            await addressStore.deleteAddressStore(address.id)
            toastText.value="Đã xóa địa chỉ thành công"
            isNotification.value = true
        }
       
    } catch (error) {
        toastText.value=""
        toastText.value="Lỗi khi xóa địa chỉ"
        isNotification.value = false
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

<template>
    <Header></Header>
    <Notification :text="toastText" :isSuccess="isNotification" />
    <Loading :loading="addressStore.loadingAddress" />
    <!-- <Loading :loading="userStore.loading" /> -->
    <div class="breadcrumb">
        <a href="/home" class="breadcrumb-item">Trang chủ</a>
        <span class="separator">|</span>
        <span class="breadcrumb-item active">Hồ sơ</span>
    </div>

    <div class="container" @click="handleHideNavbar">
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

        <div class="container-wrapper">
            <div class="container-main">

                 <div class="header">
                    <div class="header-profile">
                        <span>Hồ sơ của tôi</span>
                        <span>Quản lý thông tin hồ sơ để bảo mật tài khoản</span>
                    </div>
                
                    <div class="add-address-section">
                        <button @click="openAddAddressForm" class="btn-add-address">
                        <span> + Thêm địa chỉ mới</span>
                        </button>
                    </div>
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
                        <!-- <div class="radio-group">
                        <input
                            type="radio"
                            :id="`address-${address.id}`"
                            :value="index"
                            v-model="selectedAddress"
                            class="radio-input"
                        />
                        </div> -->

                        <!-- Address Info -->
                        <div class="address-info">
                        <div class="info-header">
                            <h3 class="info-name">{{ address.name }}</h3>
                            <span class="info-phone"> | {{ address.phone }}</span>
                        </div>

                         <p class="info-address">{{ displayAddress(address.address) }}</p>


                        <span v-if="address.is_default" class="badge-default">
                        Mặc định
                        </span>
                        </div>

                        <!-- Edit Link -->
                        <div class="action-edit">
                            <div class="href">
                                <a href="#" class="link-update" @click="handleUpdate(address)">Cập nhật</a>
                                 <a v-if="!address.is_default" href="#" class="link-update" @click="handleDelete(address)" >Xóa</a>
                            </div>
                        
                        <button class="setDefault" @click="handleConfirm(address)" :disabled="address.is_default">
                            Thiết lập mặc định
                        </button>
                        </div>
                    </div>
                    </div>
                </div>

                

                <!-- Footer Buttons -->
                <div class="footer-actions">
                    <!-- <button @click="handleCancel" class="btn-cancel">
                    Hủy
                    </button>
                    <button @click="handleConfirm" class="btn-confirm">
                    Xác nhận
                    </button> -->
                </div>
            </div>
        </div>


        <!-- addAddress -->

        <div v-if="showAddAddressForm" class="modal-overlay">
            <div class="container-wrapper">
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
    </div>
</template>

<style scoped>
.container {
  width: 100%;
  background-color: rgb(247, 247, 247);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 1px;
  overflow: hidden;
  scrollbar-width: none;
  /* height: 74vh; */
  height: auto;
}

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

.breadcrumb-item {
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.3s;
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


.container-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
    width: 90%;  

}

.container-main {
  width: 60%;
  /* max-width: 28rem; */
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header */
.header{
    display: flex;
     justify-content: space-between; 
  align-items: center; 
}
.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding:30px 10px 10px 10px;
  font-size:20px;
}

.header-profile {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 20px 30px;
  border-bottom: 1px solid #efefef;
  gap: 5px;
}
.header-profile > span:first-child {
  font-size: 20px;
  font-weight: 500;
  color: #333333;
}

.header-profile > span:last-child {
  font-size: 16px;
  color: #666666;
  font-weight: 400;
}

.btn-add-address {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #ef4444 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.btn-add-address:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.5);
}

.btn-add-address:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

/* Address List */
.address-list {
  /* divide-y divide-gray-200; */
  border-top: 1px solid #e5e7eb;
   max-height: 500px;
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
    padding-left:15px;
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
  font-size: 1rem;
}

.info-phone {
  color: #6b7280;
  font-size: 0.95rem;
}

.info-street {
  font-size: 0.975rem;
  color: #4b5563;
  margin: 0.25rem 0;
}

.info-district {
  font-size: 0.975rem;
  color: #4b5563;
  margin: 0.5rem 0;
}

.badge-default {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #fef2f2;
  color: #dc2626;
  font-size: 0.85rem;
  border-radius: 0.25rem;
  border: 1px solid #fecaca;
}

/* Edit Link */
.href{
    display:flex;
    gap:15px;
}
.action-edit {
    display:flex;
    flex-direction: column;
  align-items: flex-end;
    gap:10px;
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.setDefault{
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    cursor:pointer;
}

.disable {
  opacity: 0.6; 
  pointer-events: none;  
  cursor: not-allowed;  
}

.link-update {
  color: #3b82f6;
  font-size: 0.975rem;
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




/* Footer Actions */
.footer-actions {
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 20px;
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
    width: 89%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay .container-wrapper {
  min-height: auto;
  background-color: transparent;
  padding: 2rem 1rem;
  width: 100%;
  max-width: 90%;
  position: relative;
}

.modal-overlay .container-main {
  width: 100%;
  max-width: 600px;
}

@media (max-width: 1235px) {
  .container-wrapper {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 70%;

  }

  .container-main {
    width: 80%;
  }


  .address-info {
    padding-left: 10px;  /* Giảm padding */
  }

  .info-name {
    font-size: 0.9rem;  /* Giảm font size */
  }

  .info-phone {
    font-size: 0.85rem;
  }
  .setDefault {
    padding: 3px 8px;
    font-size: 0.85rem;
  }
  .btn-add-address {
  width:140px;
  padding: 12px 12px;
  font-size: 12px;
    }

}
@media (max-width: 768px) and (min-width:450px){
  .container-wrapper {
    width: 100%;
    padding: 0;
  }

  .container-main {
    width: 90%;
    border-radius: 0;
  }
}
@media (max-width:450px){
    .container-wrapper {
    width: 100%;
    padding: 0;
  }

  .container-main {
    width: 90%;
    border-radius: 0;
  }
  .info-name {
        font-size: 0.85rem;
    }

    .info-phone {
        font-size: 0.8rem;
    }

    .info-address {
        font-size: 0.8rem;
    }

    .badge-default {
        font-size: 0.75rem;
    }

    .link-update {
        font-size: 0.85rem;
    }

    .setDefault {
        font-size: 0.75rem;
        padding: 3px 6px;
        width: 80px;
    }

    .header-profile > span:first-child {
        font-size: 16px;
    }

    .header-profile > span:last-child {
        font-size: 14px;
    }

    .btn-add-address {
        font-size: 11px;
        padding: 10px 10px;
    }
}
</style>