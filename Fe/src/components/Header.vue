<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import { useCategoryStore } from "../stores/categoryStore";
import type { ProductSummary } from "../interfaces/product";
import logo from "../assets/logo.jpg";
import { getImage } from "../utils/format";
import Notification from "./Notification.vue";
import { formatPrice } from "../utils/format";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import { useProductStore } from "../stores/productStore";

const productStore = useProductStore();
const cart = useCartStore();
const category = useCategoryStore();
const router = useRouter();
const products = ref<ProductSummary[]>([]);
const searchQuery = ref("");
const showNamDropdown = ref(false);
const showNuDropdown = ref(false);
const showPhuKienDropdown = ref(false);
const showFormSearch = ref(false);
const categoryMale = ref<string[]>([]);
const categoryFemale = ref<string[]>([]);
const searchBarRef = ref<HTMLElement | null>(null);
// const avatar = ref<string>("");
const showFormUser = ref(false);
const isLogin = ref(false);
const showMenuPhone = ref(false);
const MenuPhone = ref<HTMLElement | null>(null);
const listSearch = computed<ProductSummary[]>(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return products.value;
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(query)
  );
});
const u = useUserStore();

const { avatar } = storeToRefs(u);
onBeforeMount(async () => {
    isLogin.value = localStorage.getItem("user_id") ? true : false;
    await u.fetchProfile();
    if (localStorage.getItem('accessToken')) {
        await cart.getCartCountStore();
    }
  categoryMale.value = await category.getCategoryNameStore("Nam");
  categoryFemale.value = await category.getCategoryNameStore("Nữ");
  
  isLogin.value = localStorage.getItem("user_id") ? true : false;
  
  products.value = await productStore.getAllProductActiveStore();
});
const toastText = ref("");
const showNotification = ref<boolean>(false);
const goToCart = () => {
    toastText.value = "";
    showNotification.value = false;
    const login = localStorage.getItem('accessToken') ? true : false;
    if (!login) {
        setTimeout(() => {
            toastText.value = "❌ Vui lòng đăng nhập để thêm vào giỏ hàng!";
        }, 0) 
        setTimeout(() => {
            router.push({
                path: '/auth/login',
                query: {
                    redirect: "/cart/cartOfme" 
                }
            })
        }, 2000);
    }
    else {
        router.push("/cart/cartOfme");
    }
};
const goToLogin = () => {
  router.push("/auth/login");
};
const goToRegister = () => {
  router.push("/auth/register");
};
const goToLogout = async() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("avatar");
    avatar.value = "";
    isLogin.value = false;
    router.push("/home");   
    cart.resetCartCount()
};

const goToProfile = () => {
  router.push("/profile/orderOfme");
};
const getDiscountPercent = (
  originalPrice: number,
  flashPrice?: number
): number => {
  if (!flashPrice || flashPrice >= originalPrice) return 0;
  const percent = ((originalPrice - flashPrice) / originalPrice) * 100;
  return Math.round(percent);
};

const handleSearchClickOutside = (event: Event) => {
  if (
    searchBarRef.value &&
    !searchBarRef.value.contains(event.target as Node)
  ) {
    showFormSearch.value = false;
    searchQuery.value = "";
  }
  if (MenuPhone.value && !MenuPhone.value.contains(event.target as Node)) {
    showMenuPhone.value = false;
  }
};
onMounted(() => {
  document.addEventListener("click", handleSearchClickOutside);
//   document.addEventListener("click", handleSearchClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleSearchClickOutside);
//   document.removeEventListener("click", handleSearchClickOutside);
});
</script>

<template>
  <Notification :text="toastText" :isSuccess="showNotification" />
  <header class="header">
    <div class="top-bar">
      <div class="contact-info">
        <span>Hotline: 0000000 (8h-12h, 13h-5h)</span>
        <span class="divider">|</span>
        <span>Liên hệ</span>
      </div>
      <div class="store-info">
        <span><i class="fa-solid fa-bell"></i> Thông báo của tôi</span>
      </div>
    </div>

    <div class="main-header">
      <div class="container">
        <i
          class="fa-solid fa-bars"
          @click="showMenuPhone = !showMenuPhone"
          ref="MenuPhone"
        ></i>
        <div class="menu-phone" v-if="showMenuPhone">
          <a href="/home" class="nav-link">Trang chủ</a>
          <a href="/dealHot" class="nav-link">Ưu đãi cực hot</a>
          <a href="/CategoryGender?gender=Nam" class="nav-link"> Nam </a>
          <a href="/CategoryGender?gender=Nữ" class="nav-link">Nữ </a>
          <a href="/phu-kien" class="nav-link"> Phụ kiện </a>
        </div>
        <div class="logo">
          <img :src="logo" @click="router.push('/')" />
        </div>

        <nav class="nav-menu">
          <a href="/home" class="nav-link">Trang chủ</a>
          <a href="/dealHot" class="nav-link">Ưu đãi cực hot</a>

          <div
            class="dropdown"
            @mouseenter="showNamDropdown = true"
            @mouseleave="showNamDropdown = false"
          >
            <a href="/CategoryGender?gender=Nam" class="nav-link">
              Nam <span class="arrow">▼</span>
            </a>
            <div v-if="showNamDropdown" class="dropdown-menu">
              <a
                v-for="nameCateMen in categoryMale"
                :href="`/CategoryGender?gender=Nam&name=${nameCateMen}`"
                >{{ nameCateMen }}</a
              >
            </div>
          </div>

          <div
            class="dropdown"
            @mouseenter="showNuDropdown = true"
            @mouseleave="showNuDropdown = false"
          >
            <a href="/CategoryGender?gender=Nữ" class="nav-link">
              Nữ <span class="arrow">▼</span>
            </a>
            <div v-if="showNuDropdown" class="dropdown-menu">
              <a
                v-for="nameCateFemale in categoryFemale"
                :href="`/CategoryGender?gender=Nữ&name=${nameCateFemale}`"
                >{{ nameCateFemale }}</a
              >
            </div>
          </div>

          <div
            class="dropdown"
            @mouseenter="showPhuKienDropdown = true"
            @mouseleave="showPhuKienDropdown = false"
          >
            <a href="/phu-kien" class="nav-link">
              Phụ kiện <span class="arrow">▼</span>
            </a>
            <div v-if="showPhuKienDropdown" class="dropdown-menu">
              <a href="/phu-kien/tui">Túi xách</a>
              <a href="/phu-kien/giay">Giày dép</a>
              <a href="/phu-kien/non">Nón</a>
            </div>
          </div>
        </nav>

        <div ref="searchBarRef" class="search-bar">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            @focus="showFormSearch = true"
          />
          <div class="suggestions" v-if="showFormSearch">
            <h4>KẾT QUẢ TÌM KIẾM</h4>
            <div class="list-product">
              <div
                v-for="product in listSearch"
                class="product-item"
                @click="
                  router.push({
                    name: 'product-detail',
                    params: { id: product.id },
                  })
                "
              >
                <div class="container-image">
                  <span
                    class="discount-percent"
                    v-if="
                      getDiscountPercent(
                        product.max_price,
                        product.flash_price
                      ) > 0
                    "
                    >{{
                      getDiscountPercent(
                        product.max_price,
                        product.flash_price
                      )
                    }}%</span
                  >
                  <img :src="getImage(product.thumbnail || '')" alt="" />
                </div>
                <div class="container-content">
                  <span class="title">NAVA</span>
                  <span class="name">{{ product.name }}</span>
                  <div class="item-prices">
                    <span class="item-price-new">{{
                      product.flash_price
                        ? formatPrice(product.flash_price!)
                        : formatPrice(product.min_price)
                    }}</span>
                    <span class="item-price-old" v-if="product.flash_price">
                      {{ formatPrice(product.max_price) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <div class="cart-icon" @click="goToCart">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="cart-badge">{{
              cart.cartCount.length > 0 ? cart.cartCount.length : 0
            }}</span>
          </div>
          <div
            class="user-icon"
            @mouseenter="showFormUser = true"
            @mouseleave="showFormUser = false"
          >
            <i v-if="!avatar" class="fa-solid fa-user"></i>
            <img v-else :src="getImage(avatar)" class="avt" alt="" />
            <div class="user-container" v-if="showFormUser">
              <div v-if="!isLogin" class="guest-actions">
                <span @click="goToLogin" class="login">Đăng nhập</span>
                <span @click="goToRegister" class="register">Đăng ký</span>
              </div>
              <div v-else class="user-btn">
                <span @click="goToProfile" class="file">Hồ sơ</span>
                <span @click="goToLogout" class="logout">Đăng xuất</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.top-bar {
  background: linear-gradient(90deg, #ff6b35 0%, #ff8c5a 100%);
  color: white;
  padding: 8px 0;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px;
}

.contact-info {
  display: flex;
  align-items: center;
}

.divider {
  margin: 0 5px;
}
.fa-bars {
  display: none;
}
.store-info {
  cursor: pointer;
}

.main-header {
  background: white;
  padding: 12px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 30px;
}
.menu-phone {
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100px;
  position: absolute;
  top: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  padding: 10px;
}

.logo {
  cursor: pointer;
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 45px;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ff6b35;
}

.arrow {
  font-size: 10px;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 10px 0;
  min-width: 150px;
  /* margin-top: 10px; */
  z-index: 100;
}

.dropdown-menu a {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
  color: #ff6b35;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 8px 15px;
  width: 280px;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-bar input::placeholder {
  color: #999;
}

.search-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
}

.suggestions {
  background-color: rgb(243, 244, 240);
  z-index: 9999;
  width: 350px;
  min-height: 100px;
  max-height: 50vh;
  position: absolute;
  overflow-y: auto;
  top: 100%;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.9);
  scroll-behavior: smooth;
}
.suggestions::-webkit-scrollbar {
  width: 6px;
}
.suggestions {
  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;
}
.suggestions::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

h4 {
  text-align: center;
}
.list-product {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}
.product-item {
  width: 90%;
  height: 100px;
  background-color: white;
  display: flex;
  flex-direction: row;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  align-items: center;
  gap: 7px;
  position: relative;
  border-radius: 4px;
  cursor: pointer;
}
.discount-percent {
  position: absolute;
  background-color: rgb(202, 47, 47);
  border-radius: 2px;
  font-size: 13px;
  color: rgb(244, 229, 229);
}
.container-image {
  width: 95px;
  height: 95px;
  border-radius: 3px;
}
.container-image img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.container-content {
  /* width: ; */
  height: 80%;
  /* align-items: center; */
  justify-content: center;
  /* background-color: red; */
  display: flex;
  flex-direction: column;

  justify-content: space-between;
}
.container-content .name {
  color: #545454;
}
.container-content .title {
  color: black;
  font-size: 17px;
  font-weight: 500;
}
.item-prices {
  display: flex;
  flex-direction: row;
  gap: 6px;
}
.item-price-new {
  color: red;
  font-size: 17px;
}
.item-price-old {
  text-decoration: line-through;
  color: rgb(63, 60, 60);
  font-size: 15px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-icon {
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    object-fit: contain;
    border: 0.5px solid #b1afaf;
        
 }
.avt {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.cart-icon {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  /* background-color: red; */
}
.cart-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.user-container {
  top: 100%;
  background-color: rgb(255, 255, 255);
  width: 120px;
  height: auto;
  position: absolute;
  border-radius: 5px;
  /* width: auto;
        height: auto; */
  /* margin-right: 1000px; */
  right: 30px;
  /* top: 90px; */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 10px;
  margin-top: -27px;
}
.guest-actions,
.user-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.guest-actions span,
.user-btn span {
  padding: 7px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
}
.guest-actions .login {
  background-color: red;
  color: white;
}
.guest-actions .register {
  background-color: white;
  color: red;
  border: solid 1px red;
}
.user-btn span {
  /* background-color: red; */
  color: black;
  border: 1px solid #333;
}

/* Responsive */
@media screen and (max-width: 1024px) {
  .container {
    padding: 0 20px;
    gap: 15px;
    display: flex;
    justify-content: space-between;
  }

  .nav-menu {
    gap: 15px;
  }

  .nav-link {
    font-size: 14px;
  }

  .search-bar {
    width: 200px;
  }
}

@media screen and (max-width: 768px) {
  .top-bar {
    padding: 6px 20px;
    font-size: 11px;
  }
  .search-bar {
    display: none;
  }
  .fa-bars {
    display: flex;
    font-size: 25px;
  }
  .container {
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-menu {
    display: none;
  }
  .dropdown-menu {
    display: none;
  }
  .search-bar {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }

  .logo img {
    height: 40px;
  }

  .user-icon img,
  .cart-icon img {
    width: 24px;
    height: 24px;
  }
}
</style>
