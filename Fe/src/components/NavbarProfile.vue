<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { getImage } from "../utils/format";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const props = defineProps<{
  showMenu: boolean;
  showDetail: boolean;
  showNotification: boolean;
  showOrder: boolean;
  showVoucher: boolean;
  showFavourite: boolean;
  showRegisterSeller: boolean;
  showProfile: boolean;
  showAddress: boolean;
  showResetPassword: boolean;
}>();
const showMenu = ref<boolean>(props.showMenu);
const router = useRouter();
const auth = useAuthStore();
const showDetail = ref<boolean>(props.showDetail);
const showNotification = ref<boolean>(props.showNotification);
const showOrder = ref<boolean>(props.showOrder);
const showVoucher = ref<boolean>(props.showVoucher);
const showFavourite = ref<boolean>(props.showFavourite);
const showRegisterSeller = ref<boolean>(props.showRegisterSeller);

const showProfile = ref<boolean>(props.showProfile);
const showAddress = ref<boolean>(props.showAddress);
const showResetPassword = ref<boolean>(props.showResetPassword);
import { useUserStore } from '../stores/userStore'
const u = useUserStore();
onMounted(async () => {
  if (auth.user == null) {
    const res = await auth.getUserByIdStore(
      parseInt(localStorage.getItem("user_id") || "5")
    );
    auth.user = res.data;
  }
  await userStore.fetchProfile();
    window.addEventListener("resize", handleResize);
});
const handleResize = () => {
  if (window.innerWidth > 768) {
    showMenu.value = true;
  } else {
    showMenu.value = false;
  }
};
const { avatar } = storeToRefs(u);
import { storeToRefs } from "pinia";
const reset = (
  a: Ref<boolean>,
  b: Ref<boolean>,
  c: Ref<boolean>,
  d: Ref<boolean>,
  f: Ref<boolean>,
  e: Ref<boolean>,
  k: Ref<boolean>,
  g: Ref<boolean>,
  h: Ref<boolean>
) => {
  a.value = false;
  b.value = false;
  c.value = false;
  d.value = false;
  f.value = false;
  e.value = !e.value;
  k.value = false;
  h.value = false;
  g.value = false;
};

const goToAccount = () => {
  showDetail.value = !showDetail.value;
};
const goToFavourite = () => {
  reset(
    showDetail,
    showOrder,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showFavourite,
    showProfile,
    showAddress,
    showResetPassword
  );
  router.push({
    name: "favourite",
  });
};
const goToVoucher = () => {
  reset(
    showDetail,
    showFavourite,
    showOrder,
    showRegisterSeller,
    showNotification,
    showVoucher,
    showProfile,
    showAddress,
    showResetPassword
  );
};
const goToRegisterSeller = () => {
  reset(
    showDetail,
    showFavourite,
    showOrder,
    showVoucher,
    showNotification,
    showRegisterSeller,
    showProfile,
    showAddress,
    showResetPassword
  );
};
const goToNotification = () => {
  reset(
    showDetail,
    showFavourite,
    showOrder,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showProfile,
    showAddress,
    showResetPassword
  );
};
const goToOrder = () => {
  reset(
    showDetail,
    showFavourite,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showOrder,
    showProfile,
    showAddress,
    showResetPassword
  );
  router.push({
    name: "order-of-me",
  });
};
const goToProfile = () => {
  reset(
    showOrder,
    showFavourite,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showProfile,
    showOrder,
    showAddress,
    showResetPassword
    );
    showDetail.value = true;
  router.push({
    name: "profile",
  });
};
const goToAddress = () => {
  reset(
    showOrder,
    showFavourite,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showAddress,
    showProfile,
    showOrder,
    showResetPassword
    );
    showDetail.value = true;
};
const goToResetPass = () => {
  reset(
    showOrder,
    showFavourite,
    showVoucher,
    showRegisterSeller,
    showNotification,
    showResetPassword,
    showAddress,
    showProfile,
    showOrder
    );
    showDetail.value = true;
};
const emit = defineEmits(["update:show-menu"]);

const handleShow = () => {
  emit("update:show-menu", !props.showMenu);
};
</script>
<template>
  <span class="hidden" @click="handleShow" @click.stop="handleShow"
    >Lối tắt ▼</span
  >
  <div class="menu" v-if="props.showMenu">
    <div class="profile">
      <div class="infor">
        <img :src="getImage(avatar)" alt="" />
      </div>
      <div class="user-name">
        <span class="title">{{ auth.user?.name }}</span>
        <span><i class="fa-solid fa-pen"></i> Sửa hồ sơ</span>
      </div>
    </div>
    <!-- <hr> -->
    <div class="navbar">
      <div
        @click="goToNotification"
        :class="{ active: showNotification === true }"
      >
        <i class="fa-regular fa-bell"></i>
        Thông báo
      </div>
      <div @click.stop="goToAccount">
        <i class="fa-regular fa-user"></i>
        <span>Tài khoản của tôi</span>
      </div>
      <div v-if="showDetail" class="detail-account">
        <span @click="goToProfile" :class="{ active: showProfile === true }"
          >Hồ sơ</span
        >
        <span @click="goToAddress" :class="{ active: showAddress === true }"
          >Địa chỉ</span
        >
        <span
          @click="goToResetPass"
          :class="{ active: showResetPassword === true }"
          >Đổi mật khẩu</span
        >
      </div>
      <div @click="goToOrder" :class="{ active: showOrder === true }">
        <i class="fa-solid fa-book"></i> Đơn hàng
      </div>
      <div @click="goToVoucher" :class="{ active: showVoucher === true }">
        <i class="fa-solid fa-ticket"></i> Kho voucher
      </div>
      <div @click="goToFavourite" :class="{ active: showFavourite === true }">
        <i class="fa-regular fa-heart"></i> Yêu thích
      </div>
      <div
        @click="goToRegisterSeller"
        :class="{ active: showRegisterSeller === true }"
      >
        <i class="fa-solid fa-pen-to-square"></i> Đăng ký làm người bán
      </div>
    </div>
  </div>
</template>
<style scoped>
.hidden {
  position: fixed;
  top: 105px;
  display: none;
}
.menu {
  display: flex;
  flex-direction: column;
  background-color: white;
  /* align-items: center; */
  width: 24%;
  height: 500px;
  border-top-right-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.profile {
  display: flex;
  flex-direction: row;
  border-top-right-radius: 10px;
  height: 90px;
  padding: 10px;
  border-bottom: 1px solid rgb(85, 85, 85);
  justify-content: center;
}
.profile .infor {
  width: 25%;
  height: 120px;
  height: auto;
  display: flex;
  align-items: end;
  flex-direction: column;
  justify-content: center;
}
.profile .infor img {
  width: 70px;
  height: 70px;
  margin: 0 auto;
  border-radius: 50%;
}
.navbar {
  width: 65%;
  margin-left: 30%;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.user-name {
  display: flex;
  flex-direction: column;
  width: 60%;
  justify-content: center;
  color: #707070;
}
.user-name .title {
  color: black;
  font-size: 20px;
}
.navbar div {
  display: flex;
  gap: 10px;
}
.drop-down {
  display: flex;
  flex-direction: column;
}
.navbar div {
  cursor: pointer;
}
.detail-account {
  display: flex;
  flex-direction: column;
  margin-left: 30%;
  cursor: default !important;
  /* background-color: red; */
}
.fa-bell,
.fa-heart {
  color: red;
}
.fa-user {
  color: rgb(0, 238, 255);
}
.fa-book {
  color: blue;
}
.fa-ticket {
  color: rgb(238, 1, 1);
}
.fa-pen-to-square {
  color: green;
}
.detail-account span {
  cursor: pointer;
}
.active {
  color: red;
}
@media (max-width: 1024px) {
  .menu {
    width: 24%;
  }
  .infor {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .user-name {
    font-size: 15px;
  }
  .user-name .title {
    font-size: 17px;
  }
  .navbar {
    margin-left: 15%;
  }
}
@media (max-width: 768px) {
  .hidden {
    display: flex;
  }
  .menu {
    position: absolute;
    margin-top: 20px;
    width: 45%;
  }
  .profile {
    height: 60px;
  }
  .user-name {
    font-size: 13px;
  }
  .infor {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .infor img {
    margin-bottom: 10px;
    margin: 0;
  }
  .user-name .title {
    font-size: 15px;
  }
  .navbar {
    margin-left: 8%;
    font-size: 14px;
  }
}
</style>
