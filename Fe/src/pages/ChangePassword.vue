<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "../stores/userStore";
import NavbarProfile from "../components/NavbarProfile.vue";
import Header from "../components/Header.vue";
import Loading from "../components/Loading.vue";
import Notification from "../components/Notification.vue";
import type { User } from "../interfaces/user";

const userStore = useUserStore();
const textToast = ref("");
const showNotification = ref(false);
const showNavbar = ref(true);
const oldPass = ref<string>("")
const newPass = ref<string>("")
const confrimPass = ref<string>("")



onMounted(()=>{
   handleResize();
  window.addEventListener("resize", handleResize);
})

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

const handleChangePassWord = async ()=>{
  textToast.value=""
  if(!newPass.value || !oldPass.value || !confrimPass){
     textToast.value="Vui lòng nhập đầy đủ thông tin"
    showNotification.value=false
    return
  }
  if(newPass.value !==confrimPass.value ){
    textToast.value="Xác nhận mật khẩu không chính xác"
    showNotification.value=false
    return
  }
  if(newPass.value ===oldPass.value ){
    textToast.value="Mật khẩu cũ và mật khẩu mới giống nhau"
    showNotification.value=false
    return
  }
  try {
    await userStore.changePasswordStore(oldPass.value,newPass.value)
    textToast.value="Đổi mật khẩu thành công"
    showNotification.value=true
    newPass.value=""
    oldPass.value=""
    confrimPass.value=""
  } catch (error:any) {
     if(error?.response?.data?.message === "Invalid current password"){
      textToast.value = ''
      textToast.value = "Mật khẩu không chính xác";
      showNotification.value = false;
    }
    
    else{
      console.log(1)
    textToast.value = ''
    textToast.value = "Đổi mật khẩu thất bại";
    showNotification.value = false;   
    }
  }
  
}
</script>

<template>
    <Header></Header>
    <Notification :text="textToast" :isSuccess="showNotification" />
    <Loading :loading="userStore.loading" />

    <div class="breadcrumb">
        <a href="/home" class="breadcrumb-item">Trang chủ</a>
        <span class="separator">|</span>
        <span class="breadcrumb-item active">Hồ sơ</span>
        <span class="separator">|</span>
        <span >Đổi mật khẩu</span>
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

        <div v-if="userStore.user" class="profilee">
            <div class="header-profile">
                <span>Hồ sơ của tôi</span>
                <span>Quản lý thông tin hồ sơ để bảo mật tài khoản</span>
            </div>
            <div class="body">
                <div class="left-section">
                    <div class="body-header">
                        <span>Mật khẩu cũ</span>
                        <span>Mật khẩu mới</span>
                        <span>Xác nhận mật khẩu</span>
                    </div>

                    <div class="content">
                        <input v-model="oldPass" type="password"  autocomplete="new-password"/>
                        <input v-model="newPass" type="password" autocomplete="new-password"/>

                       
                        <div class="passConfrim">
                        <input v-model="confrimPass" type="password"  autocomplete="new-password" />
                        </div>
                        <button @click="handleChangePassWord">
                          Lưu thay đổi
                        </button>
                    </div>
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
  /* min-width: 230px; */
  flex:1;

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
  flex:1.5;
  flex-direction: column;
  max-width: 500x;


}

.content input {
  height: 40px;
  margin-bottom: 10px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
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

.passConfrim {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.passConfrim input {
  background-color: #b5b5b5;
  flex: 1;
  margin-bottom: 0;
}

.passConfrim span {
  color: #0d8def;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.passConfrim span:hover {
  text-decoration: underline;
}

button {
  background-color: #ff6b35;
  color: white;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  width: 200px;
 align-self:flex-start;
 margin-top: 10px;

}

button:hover {
  background-color: #ff5722;
  transform: scale(1.08);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.5);
}

button:active {
  transform: scale(0.98);
}

@media (max-width:770px){
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


.profilee {
  width: 100%;
  overflow-y: auto;
  background-color: white;
  border-top-left-radius: 10px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
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
  padding: 40px 0px 40px 20px;
  gap: 0px;
  flex: 1;
}

.left-section {
  display: flex;
  flex: 0.9;
  gap: 10px;
  width: 100%;
}

.body-header {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  text-align: right;
  color: #666666;
  /* min-width: 230px; */
  flex:1;

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
  flex:1.5;
  flex-direction: column;
  max-width: 500x;


}

.content input {
  height: 40px;
  margin-bottom: 10px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
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

.passConfrim {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.passConfrim input {
  background-color: #b5b5b5;
  flex: 1;
  margin-bottom: 0;
}

.passConfrim span {
  color: #0d8def;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.passConfrim span:hover {
  text-decoration: underline;
}

button {
  background-color: #ff6b35;
  color: white;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  width: 200px;
 align-self:flex-start;
 margin-top: 10px;

}

button:hover {
  background-color: #ff5722;
  transform: scale(1.08);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.5);
}

button:active {
  transform: scale(0.98);
}


}

</style>