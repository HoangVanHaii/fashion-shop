<script setup lang="ts">
import Header from "../components/Header.vue";
import NavbarProfile from "../components/NavbarProfile.vue";
import Loading from "../components/Loading.vue";
import { ref, onMounted } from "vue";
import { getImage } from "../utils/format";
import { formatPrice } from "../utils/format";
import { useRouter } from "vue-router";
import { useFavouriteStore } from "../stores/favourite";
import Notification from "../components/Notification.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";

const showFormConfirm = ref(false);
const favourite = useFavouriteStore();
const showNotification = ref<boolean>(false);
const toastText = ref<string>("");
const router = useRouter();
const favouriteDelete_id = ref<number | null>(null);

onMounted(async () => {
  handleResize();
  await favourite.getFavouriteOfMeStore();
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

const handleRefresh = () => {
  router.go(0);
};

const handleDelete = async () => {

  showNotification.value = false;
    toastText.value = "";
    showFormConfirm.value = false;
    if (favouriteDelete_id.value) {
        await favourite.deleteFavouriteStore(favouriteDelete_id.value);
        if (!favourite.error) {
          showNotification.value = true;
          toastText.value = "✅ Xóa khỏi mục yêu thích thành công!";
        } else {
          toastText.value = "❌ Xóa khỏi mục yêu thích thật bại thất bại!";
          showNotification.value = false;
        }
    }
};
const showNavbar = ref<boolean>(true);
</script>
<template>
    <ConfirmDialog
        v-if="showFormConfirm && favouriteDelete_id"
        :message="'Xác nhận xóa khỏi mục yêu thích?'"
        @close="showFormConfirm = false"
        @confirm="handleDelete"
    />
  <Header></Header>
  <Notification :text="toastText" :isSuccess="showNotification" />
  <Loading :loading="favourite.loading" />
  <div class="breadcrumb">
    <a href="/home" class="breadcrumb-item">Trang chủ</a>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">Hồ sơ</span>
    <span class="separator">|</span>
    <span class="breadcrumb-item active" id="product-name">Đơn hàng</span>
  </div>
  <div class="container" @click="handleHideNavbar">
    <NavbarProfile
      v-model:show-menu="showNavbar"
      :show-detail="false"
      :show-address="false"
      :show-favourite="true"
      :show-notification="false"
      :show-order="false"
      :show-profile="false"
      :show-register-seller="false"
      :show-reset-password="false"
      :show-voucher="false"
    />
    <div class="order">
      <div class="search">
        <input
          v-model="favourite.searchText"
          type="text"
          placeholder="Nhập tên sản phẩm để tìm kiếm"
        />
        <button><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
      <div class="list-order">
        <div
          class="none-order"
          v-if="favourite.searchFilteredFavourite?.length == 0"
        >
          <div class="img">
            <img :src="getImage('/uploads/reviews/none-order.jpg')" alt="" />
          </div>
          <div class="refresh-now">
            <span v-if="favourite.searchFilteredFavourite?.length != 0"
              >Không tìm thấy sản phẩm yêu thích nào</span
            >
            <span v-if="favourite.listFavourite?.length == 0"
              >Mục này còn trống, xem sản phẩm thôi nào</span
            >
            <button
              v-if="favourite.listFavourite?.length == 0"
              class="purchase-now"
              @click="router.push({ name: 'Home' })"
            >
              Xem ngay
            </button>
            <span
              v-if="favourite.listFavourite?.length != 0"
              class="refresh"
              @click="handleRefresh"
              ><i class="fa-solid fa-rotate-right"></i> Vui lòng tải lại</span
            >
          </div>
        </div>
        <div
          class="card-order"
          v-for="favour in favourite.searchFilteredFavourite"
        >
          <div class="header-shop">
            <div class="header-left">
              <i class="fa-solid fa-store"></i>
              <span>{{ favour.shop_name }}</span>
            </div>
            <div class="see-shop">
              <button @click="router.push({name: 'shop', params: {id: favour.shop_id}})">Xem shop</button>
            </div>
          </div>
          <div class="product">
            <div class="detail-product" v-for="product in favour.products">
              <div class="detail-left">
                <img
                  :src="getImage(product.image_url || '')"
                  alt=""
                  @click="
                    router.push({
                      name: 'product-detail',
                      params: { id: product?.product_id },
                    })
                  "
                />
                <div class="infor-product">
                  <span class="name">{{ product.product_name }}</span>
                  <span
                    >Phân loại hàng: {{ product?.color }},
                    {{ product?.size }}</span
                  >
                </div>
              </div>
              <div class="detail-right">
                <div class="price">
                  <span class="old" v-if="product?.flash_price">{{
                    formatPrice(product?.price)
                  }}</span>
                  <span>{{
                    formatPrice(product?.flash_price || product?.price!)
                  }}</span>
                </div>
              </div>
              <div class="btn">
                <button
                  class="see-detail"
                  @click="
                    router.push({
                      name: 'product-detail',
                      params: { id: product.product_id },
                    })
                  "
                >
                  Xem chi tiết
                </button>
                <button @click="showFormConfirm = true, favouriteDelete_id = product.product_id">
                  Loại bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
.order::-webkit-scrollbar {
  display: none;
}
.search {
  width: 80%;
  background-color: #f7f7f7;
  padding: 7px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search input {
  font-size: 15px;
  border: none;
  outline: none;
  width: 85%;
  padding: 5px;
  background: none;
  margin-left: 10px;
}
.search button {
  width: 5%;
  height: 85%;
  border: none;
  background-color: #ff6b35;
  margin-right: 6px;
  border-radius: 6px;
  color: white;
  font-size: 17px;
}
.list-order {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 81.5%;
  height: auto;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
}
.card-order {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  background-color: #f5f5f5;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.4);
}
.header-shop {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 10px;
  margin: 10px 20px;
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
.see-shop button {
  background-color: white;
  border-radius: 3px;
  border: 1px solid rgb(0, 191, 255);
  color: rgb(0, 191, 255);
  height: 30px;
  width: 100%;
}
.product {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.detail-product {
  display: flex;
  flex-direction: row;
  width: 90%;
  border-bottom: 1px solid rgb(151, 151, 151);
  padding-bottom: 10px;
}
.detail-left {
  width: 50%;
  display: flex;
  flex-direction: row;
}
.detail-left img {
  border: 0.5px solid rgb(141, 141, 141);
  width: 20%;
}
.detail-right {
  width: 12%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: red;
  font-size: 20px;
}
.btn {
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  width: 39%;
}
.btn button {
  border: 0.5px solid rgb(191, 191, 191);
  border-radius: 4px;
  color: rgb(113, 113, 113);
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
}
.btn .see-detail {
  border: 0.5px solid rgb(210, 0, 0);
  color: rgb(222, 0, 0);
}
button:hover {
  transform: translateY(-1.5px);
  cursor: pointer;
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
}
.btn button {
  background: none;
  margin: 4px;
  width: 45%;
  height: 30px;
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
  color: blue;
}
.refresh-now .refresh:hover {
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
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
@media (max-width: 1024px) {
  .container {
    border-radius: 0px;
  }
  .order {
    border-radius: 0px;
    width: 75%;
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
  .search button {
    width: 30px;
  }

  .search {
    width: 95%;
  }
  .list-order {
    width: 95%;
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
