<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "../stores/userStore";
import NavbarProfile from "../components/NavbarProfile.vue";
import Header from "../components/Header.vue";
import Loading from "../components/Loading.vue";
import Notification from "../components/Notification.vue";
import type { User } from "../interfaces/user";
import { getImage } from "../utils/format";

const userStore = useUserStore();
const showNavbar = ref(true);
// const BASE_URL = "http://localhost:3000"; 
const avatarUrl = computed(() => {
  const avatar = userStore.user?.avatar;
  if (!avatar) return "";
  return avatar.startsWith("http") ? avatar : `${import.meta.env.VITE_API_URL}${avatar}`;
});

// Lưu dữ liệu gốc để so sánh
const originalUserData = ref<User | null>(null);

// Kiểm tra có thay đổi không
const hasChanges = computed(() => {
  if (!userStore.user || !originalUserData.value) return false;
  
  const current = userStore.user;
  const original = originalUserData.value;
  
  return (
    current.name !== original.name ||
    current.phone !== original.phone ||
    current.gender !== original.gender ||
    current.date_of_birth?.toString() !== original.date_of_birth?.toString()
  );
});

const handleResize = () => {
  showNavbar.value = window.innerWidth > 960;
};
const handleHideNavbar = () => {
  if (window.innerWidth <= 960) showNavbar.value = false;
};

onMounted(() => {
  handleResize();
  userStore.fetchProfile().then(() => {
    // Lưu dữ liệu gốc sau khi fetch xong
    if (userStore.user) {
      originalUserData.value = { ...userStore.user };
    }
  });
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => window.removeEventListener("resize", handleResize));

const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<string | null>(null);

const triggerFileInput = () => fileInput.value?.click();
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  previewImage.value = URL.createObjectURL(file);

  try {
    await userStore.updateAvatar(file);
    textToast.value = "Ảnh đại diện đã được cập nhật!";
    showNotification.value = true;
  } catch {
    textToast.value = "Cập nhật ảnh đại diện thất bại!";
    showNotification.value = true;
  }
};

const textToast = ref("");
const showNotification = ref(false);

const change = async () => {
  textToast.value = "";
  showNotification.value = false;
  if (!userStore.user) return;
  if (!userStore.user.name || !userStore.user.phone) {
    textToast.value = "";
    textToast.value = "Vui lòng nhập đầy đủ họ tên và số điện thoại.";
    showNotification.value = false;
    return;
  }
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(userStore.user.phone)) {
    textToast.value = "";
    textToast.value = "Số điện thoại không hợp lệ.";
    showNotification.value = false;
    return;
  }
  try {
    textToast.value = "";
    if (userStore.user.date_of_birth && !(userStore.user.date_of_birth instanceof Date)) {
      userStore.user.date_of_birth = new Date(userStore.user.date_of_birth);
    }
    await userStore.updateInfo();
    
    // Cập nhật lại dữ liệu gốc sau khi lưu thành công
    originalUserData.value = { ...userStore.user };
    textToast.value = "";
    textToast.value = "Đã cập nhật thông tin mới";
    showNotification.value = true;
  } catch {
    textToast.value = "";
    textToast.value = "Cập nhật thông tin thất bại";
    showNotification.value = true;
  }
};

const showEmailModal = ref(false);
const showOtpForm = ref(false);
const newEmail = ref("");
const password = ref("");
const otp = ref("");

const openEmailForm = () => {
showEmailModal.value = true;
showOtpForm.value = false;
newEmail.value = "";
password.value = "";
otp.value = "";
};
const closeEmailModal = () => (showEmailModal.value = false);

const sendChangeEmail = async () => {
  textToast.value=""

  if (!newEmail.value || !password.value) {
    textToast.value = "Vui lòng nhập đủ email mới và mật khẩu";
    showNotification.value = true;
    return;
  }
  try {
       await userStore.changeEmail(newEmail.value, password.value);
    
    if (userStore.emailPending) {
      showOtpForm.value = true;
      textToast.value = "OTP đã được gửi, vui lòng kiểm tra email";
      showNotification.value = true;
    }
  } catch(error:any) {
    if(error?.response?.data?.message === "Email already exists"){
      textToast.value = ''
      textToast.value = "Email đã tồn tại, vui lòng chọn email khác.";
      showNotification.value = false;
    }
    else if(error?.response?.data?.message === "Invalid password"){
      textToast.value = ''
      textToast.value = "Mật khẩu không chính xác";
      showNotification.value = false;
    }
    
    else{
      console.log(1)
    textToast.value = ''
    textToast.value = "Email đã tồn tại hoặc sai mật khẩu";
    showNotification.value = false;   
    }
    
    // textToast.value = "Gửi yêu cầu đổi email thất bại";
    // showNotification.value = true;
  }
};

const verifyOtp = async () => {
  if (!otp.value) return;
  try {
    await userStore.verifyChangeEmail(otp.value);
    showOtpForm.value = false;
    showEmailModal.value = false;
    textToast.value = "Email đã được đổi thành công";
    showNotification.value = true;
  } catch {
    textToast.value = "Xác thực OTP thất bại";
    showNotification.value = true;
  }
};
</script>

<template>
  <Header></Header>
  <Notification :text="textToast" :isSuccess="showNotification" />
  <Loading :loading="userStore.loading" />

  <div class="breadcrumb">
    <a href="/home" class="breadcrumb-item">Trang chủ</a>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">Hồ sơ</span>
  </div>

  <div class="container" @click="handleHideNavbar">
    <NavbarProfile
      v-model:show-menu="showNavbar"
      :show-detail="true"
      :show-address="false"
      :show-favourite="false"
      :show-notification="false"
      :show-order="false"
      :show-profile="true"
      :show-register-seller="false"
      :show-reset-password="false"
      :show-voucher="false"
    />

    <div v-if="userStore.user" class="profilee">
      <div class="header-profile">
        <span>Hồ sơ của tôi</span>
        <span>Quản lý thông tin hồ sơ để bảo mật tài khoản</span>
      </div>

      <div class="body">
        <div class="left-section">
          <div class="body-header">
            <span>Tên đăng nhập</span>
            <span>Tên</span>
            <span>Email</span>
            <span>Số điện thoại</span>
            <span>Giới tính</span>
            <span>Ngày sinh</span>
          </div>

          <div class="content">
            <input v-model="userStore.user.email" readonly />
            <input v-model="userStore.user.name" />

            <!-- EMAIL HIỂN THỊ VÀ MỞ MODAL -->
            <div class="email">
              <input v-model="userStore.user.email" readonly />
              <span @click="openEmailForm">Thay đổi</span>
            </div>

            <input v-model="userStore.user.phone" />

            <div class="sex">
              <label>
                <input type="radio" name="gender" value="male" v-model="userStore.user.gender" />
                Nam
              </label>
              <label>
                <input type="radio" name="gender" value="female" v-model="userStore.user.gender" />
                Nữ
              </label>
              <label>
                <input type="radio" name="gender" value="other" v-model="userStore.user.gender" />
                Khác
              </label>
            </div>

            <div class="birth-day">
              <input
                type="date"
                :value="userStore.user?.date_of_birth instanceof Date
                  ? userStore.user.date_of_birth.toISOString().substr(0,10)
                  : userStore.user?.date_of_birth || ''"
                @input="(e: Event) => {
                  const target = e.target as HTMLInputElement | null;
                  if (!target || !userStore.user) return;
                  userStore.user.date_of_birth = target.value ? new Date(target.value) : undefined;
                }"
              />
            </div>
            <button class="btnSave" @click="change" :disabled="!hasChanges">Lưu thay đổi</button>
          </div>
        </div>

        <div class="avatar">
           <img :src=" getImage(userStore.avatar || '') ||previewImage || avatarUrl" alt="avatar" />
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" style="display: none" />
          <button @click="triggerFileInput">Chọn ảnh</button>
        </div>
      </div>

    </div>
  </div>

  <div v-if="showEmailModal" class="modal-overlay" @click="closeEmailModal">
  <div class="modal-content" @click.stop autocomplete="off">
    <button class="close-btn" @click="closeEmailModal">&times;</button>
    <h3>Đổi Email</h3>

    <div v-if="!showOtpForm" class="email-section">
      <input v-model="newEmail" type="email" placeholder="Nhập email mới" autocomplete="off" />
      <input v-model="password" type="password" placeholder="Nhập mật khẩu" autocomplete="new-password" />
      <button @click="sendChangeEmail">Gửi</button>
    </div>

    <div v-if="showOtpForm" class="otp-section">
      <input v-model="otp" type="text" placeholder="Nhập OTP" autocomplete="off" />
      <button class="submit" @click="verifyOtp">Xác nhận</button>
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
  height: 74vh;
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

#product-name {
  color: black;
}

.profilee {
  width: 75%;
  overflow-y: auto;
  background-color: white;
  border-top-left-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.profilee::-webkit-scrollbar {
  display: none;
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
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.header-profile > span:last-child {
  font-size: 14px;
  color: #666666;
  font-weight: 400;
}

.body {
  display: flex;
  padding: 40px 50px;
  gap: 80px;
  flex: 1;
}

.left-section {
  display: flex;
  flex: 0.8;
  gap: 30px;
}

.body-header {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  text-align: right;
  color: #666666;
  min-width: 130px;
}

.body-header span {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 15px;
}

.content {
  display: flex;
  flex:1;
  flex-direction: column;
  padding-right: 50px;
  border-right: 1px solid #efefef;
  max-width: 500x;
}

.content input {
  height: 40px;
  margin-bottom: 10px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #cccccc;
  background-color: #f5f5f5;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
  color: #333333;
  max-width: 350px;
}

.content input:focus {
  border-color: #0d8def;
  background-color: white;
}

.email {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.email input {
  flex: 1;
  margin-bottom: 0;
}

.email span {
  color: #0d8def;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.email span:hover {
  text-decoration: underline;
}

.sex {
  display: flex;
  gap: 35px;
  height: 40px;
  align-items: center;
  margin-bottom: 10px;
}

.sex label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
}

.sex input[type="radio"] {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: #333333;
}

.birth-day {
  height: 40px;
  display: flex;
  align-items: center;
}

.birth-day input {
  margin: 0;
  width: 220px;
}

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding-top: 10px;
  padding-left: 30px;
  min-width: 200px;
}

.avatar img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
}

.avatar button {
  background-color: white;
  color: #666666;
  padding: 8px 24px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.avatar button:hover {
  background-color: #fafafa;
  border-color: #999999;
}

.btnSave {
  /* position: absolute; */
  /* bottom: 40px;   */
  left: 30%;
  transform: translateX(-50%);
  background-color: #ee4d2d;
  color: white;
  padding: 10px 50px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  margin-left: 60px;
  /* text-align: center; */
  /* align-items: center; */
  transition: all 0.2s ease;
}

.btnSave:hover:not(:disabled) {
  background-color: #d73211;
}

.btnSave:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Modal overlay và form */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px 25px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  animation: fadeIn 0.3s ease;
}

.modal-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.modal-content input {
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.modal-content input:focus {
  border-color: #b7360b;
  background-color: #fefefe;
}

.modal-content button {
  background-color: #eff1f3;
  color: #000000;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  margin-top:12px;
  margin-left:40%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-content button:hover {
  background-color: #8f918c;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.otp-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}


@media (max-width: 1350px) and (min-width: 1040px){
    .avatar {
    flex:0.2;
    padding-top: 10px;
    padding-left: 0px;
    min-width: 100px;
    }
    .btnSave {
          left: 40%;
    }
}
@media (max-width: 1040px) and (min-width: 960px){
    .body {
    justify-content: flex-start;
    padding-left: 0px; 
    gap: 30px; 
    }
    .left-section {
        gap: 15px;
    }
    .avatar {
        padding-left: 0;
    }
    .btnSave {
        bottom: 40px;
    }
    .content {
    padding-right: 15px;
    }
    .body-header {
    min-width: 110px;
    }
    .content {
    min-width: 280px;
    }
}
@media (max-width: 960px){
    .container {
    flex-direction: column;
    height: auto;
  }

  .profilee {
    width: 100%;
    position: relative;
  }

  .header-profile {
    padding: 15px 20px;
  }

  .body {
    margin-top: 270px;
    flex-direction: column;
    padding: 10px;
    gap: 0;
    align-items: center;

  }

  .left-section {
    flex-direction: row;
    width: 100%;
    gap: 15px;
    flex: 1;
  }

  .body-header {
    min-width: 110px;
    text-align: right;
    padding-right: 0;
    font-size: 13px;
  }
.btnSave {
  width: 120px !important;
}
  .body-header span {
    height: 50px;
    padding: 0;
    justify-content: flex-end;
  }

  .content {
    border-right: none;
    padding-right: 0;
    width: 100%;
    max-width: 100%;
  
    padding-bottom: 30px;
    margin-bottom: 30px;
    margin-top:5px;
  }

  .content input {
    max-width: 95%;
    width: 100%;
    height: 36px;
  }

  .email {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .email input {
    margin-bottom: 10px;
    max-width: 100%;
    width: 100%;
  }

  .sex {
    gap: 20px;
  }

  .birth-day input {
    width: 100%;
    
  }

  .avatar {
    padding-left: 0;
    width: 100%;
    padding-top: 0;
    gap: 15px;
    position: absolute;
    left: 5%;
    top:120px;
  border-bottom: 1px solid black;
  padding-bottom:20px;


  }

  .avatar img {
    width: 150px;
    height: 150px;
  }

  .btnSave {
    left: 55%;
    bottom: 10px;
    width: calc(40% - 40px);
    max-width: 400px;
    padding: 12px 20px;
  }
  .breadcrumb{
    display:none;
  }

  .modal-content {
  
  width: 200px;
}

.modal-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.modal-content input {
  margin-top:5px;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

}
</style>