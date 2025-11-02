<script setup lang="ts">
import { getImage } from "../utils/format";
import Header from "../components/Header.vue";
import { ref, onMounted } from "vue";
import type { ProductSummary, ProductPayload } from "../interfaces/product";
import { useProductStore } from "../stores/productStore";
import { useRouter } from "vue-router";
import { formatPrice } from "../utils/format";
import { voucherStore } from "../stores/voucherStore";
import { formatDateTime } from "../utils/format";
import type { Voucher } from "../interfaces/voucher";
import { useAuthStore } from "../stores/authStore";
import type { ShopDetal } from "../interfaces/user";
import AddToCart from "../components/AddToCart.vue";
import { useRoute } from "vue-router";
import Loading from "../components/Loading.vue";
import { useVoucherStore } from "../stores/userVoucher";
import { useFavouriteStore } from "../stores/favourite";

const userVoucher = useVoucherStore()
const favourite = useFavouriteStore()
const productDetail = ref<ProductPayload>();
const showFormAdd = ref(false);
const route = useRoute();
const useShop = useAuthStore();
const dealContent = ref<HTMLElement | null>(null);
const router = useRouter();
const product = useProductStore();
const showAllDeal = ref(false);
const products = ref<ProductSummary[]>([]);
const useVoucher = voucherStore();
const vouchers = ref<Voucher[]>([]);
const shop = ref<ShopDetal | null>(null);
const productSale = ref<ProductSummary[]>([]);
const productForMe = ref<ProductSummary[]>([]);
const listSaveVoucher = ref<Boolean[]>([]);
const loading = ref(false);

// onMounted(async () => {
//     const id = parseInt(route.params.id as string);
//     shop.value = await useShop.getShopByidStore(id);
//     products.value = await product.getProductByShopStore(id);
//     vouchers.value = await useVoucher.getAllVoucherByShopIdStore(id);
//     const token = localStorage.getItem('accessToken') || '';
//     if (token.length > 10) {
//         await favourite.getFavouriteOfMeStore();
//         await userVoucher.getVoucherUserByUserIdStore();
//     }
//     checkVoucherUser();
//     distributeProducts();
// });
onMounted(async () => {
    loading.value = true;
  const id = parseInt(route.params.id as string);

  const [shopRes, productsRes, vouchersRes] = await Promise.all([
    useShop.getShopByidStore(id),
    product.getProductByShopStore(id),
    useVoucher.getAllVoucherByShopIdStore(id),
  ]);
  shop.value = shopRes;
  products.value = productsRes;
    vouchers.value = vouchersRes;

    distributeProducts();
    loading.value = false;

  const token = localStorage.getItem('accessToken') || '';
  if (token.length > 10) {
    await Promise.all([
      favourite.getFavouriteOfMeStore(),
      userVoucher.getVoucherUserByUserIdStore(),
    ]);
  }
  checkVoucherUser();

});


const distributeProducts = () => {
  const saleProducts: ProductSummary[] = [];
  const noSaleProducts: ProductSummary[] = [];

  products.value.forEach((product) => {
    if (getDiscountPercent(product.min_price, product.flash_price) > 0) {
      saleProducts.push(product);
    } else {
      noSaleProducts.push(product);
    }
  });

  saleProducts.sort((a, b) => {
    const discountA = getDiscountPercent(a.max_price, a.flash_price);
    const discountB = getDiscountPercent(b.max_price, b.flash_price);

    return discountB - discountA;
  });

  productSale.value = saleProducts.slice(0, 8);

  productForMe.value = [...noSaleProducts, ...saleProducts];
};
const checkVoucherUser = () => {
  listSaveVoucher.value = [];
    for (const currentVoucher of vouchers.value) {
    const isSaved = userVoucher.listUserVoucher.some(
      (userVoucher) => userVoucher.voucher_id === currentVoucher.id
    );
    listSaveVoucher.value[currentVoucher.id!] = isSaved;
    }
    console.log(listSaveVoucher.value);
};

const getDiscountPercent = (
  originalPrice: number,
  flashPrice?: number
): number => {
  if (!flashPrice || flashPrice >= originalPrice) return 0;
  const percent = ((originalPrice - flashPrice) / originalPrice) * 100;
  return Math.round(percent);
};
const btnShowMoreDeal = () => {
  showAllDeal.value = !showAllDeal.value;
};
const distanceContent = (distance: number) => {
  if (dealContent.value) {
    dealContent.value.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  }
};
const handleCart = async (id: number) => {
  productDetail.value = await product.getProductByIdStore(id);
  if (productDetail) {
    showFormAdd.value = true;
  }
};
const getStarFill = (starIndex: number, rating: number): number => {
  if (starIndex <= Math.floor(rating)) {
    return 100;
  } else if (starIndex - 1 < rating && rating < starIndex) {
    return (rating - (starIndex - 1)) * 100;
  } else {
    return 0;
  }
};
const formatIsoToDate = (
  dateInput: string | Date | null | undefined
): string => {
  if (!dateInput) {
    return "---";
  }
  let date: Date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");
  return `${formattedDay}/${formattedMonth}/${year}`;
};

const handleSaveVoucher = async (voucher: Voucher) => {
    listSaveVoucher.value[voucher.id!] = true;
    userVoucher.listUserVoucher.push({
        id: Math.floor(Math.random() * 10000), 
        voucher_id: voucher.id!,
        code: voucher.code,
        description: voucher.description ?? "",
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        start_date: voucher.start_date,
        end_date: voucher.end_date,
        used_date: null
    })
    await userVoucher.saveVoucherStore(voucher.id!);
}
const handleSpace = async () => {
    window.scrollTo({
        top: 350,
        behavior: "smooth"
    })
}
</script>
<template>
  <Header />
  <Loading 
    :loading="loading"
  />
  <AddToCart
    v-if="showFormAdd && productDetail"
    :product="productDetail"
    @close="showFormAdd = false"
  />
  <div class="breadcrumb" v-if="shop?.id">
    <a href="/" class="breadcrumb-item">Trang chủ</a>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">{{ shop?.shop_name || "shop" }}</span>
  </div>
  <div class="container">
    <div class="top-content">
      <div class="left-content">
        <img :src="getImage('/uploads/users/default-avatar.png')" alt="" />
        <div class="container-rating">
          <span class="name">Fashion-shop</span>
          <div class="rating-star">
            <span class="star-wrapper" v-for="n in 5" :key="n">
              <i class="fa-solid fa-star base-star"></i>
              <i
                class="fa-solid fa-star overlay-star"
                :style="{ width: getStarFill(n, shop?.rating ?? 0) + '%' }"
              ></i>
            </span>
          </div>
        </div>
      </div>
      <div class="right-content">
        <div class="content">
          <span><i class="fa-solid fa-box-open"></i>Sản phẩm: {{ shop?.visit_count ? shop.visit_count : 0 + 18 }}</span>
          <span
            ><i class="fa-regular fa-star"></i>Đánh giá:
            {{ shop?.rating || 0 }}</span
          >
        </div>
        <div class="content">
          <span
            ><i class="fa-solid fa-users"></i>Lượt truy cập:
            {{ shop?.visit_count }}</span
          >
          <span
            ><i class="fa-solid fa-user-check"></i>Tham gia:
            {{ formatIsoToDate(shop?.created_at!) }}</span
          >
        </div>
      </div>
    </div>

    <div class="voucher-container">
      <span class="title-voucher">VOUCHER</span>
      <div class="list-voucher">
        <div v-for="voucher in vouchers.slice(0, 4)" class="voucher">
          <div class="voucher-image">
            <img :src="getImage(voucher.image_url)" alt="" />
          </div>
          <div class="description">
            <span class="des">{{ voucher.description }}</span>
            <span class="des-min"
              >Đơn tối thiểu {{ formatPrice(voucher.min_order_value) }}</span
            >
            <div class="expiry-terms">
              <span class="expiry">
                <i class="fa-solid fa-clock"></i> HSD:
                {{ formatDateTime(voucher.end_date) }}
              </span>
              <span class="terms">Điều kiện</span>
            </div>
          </div>
          <div class="select">
            <button @click="handleSaveVoucher(voucher)" v-if="!listSaveVoucher[voucher.id!]">Lưu </button>
            <button class="use" v-else @click="handleSpace" >Dùng</button>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-content">
      <div class="deal-hot">
        <span class="title-deal"
          ><i class="fa-solid fa-fire"></i> Ưu đãi khủng</span
        >
        <div class="btn-deal">
          <button @click="distanceContent(-100)">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <button @click="distanceContent(100)">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div
          class="deal-product"
          :class="showAllDeal ? 'yes' : 'no'"
          ref="dealContent"
        >
          <div
            v-for="product in productSale"
            class="deal-item-product"
            @click="
              router.push({
                name: 'product-detail',
                params: { id: product.id },
              })
            "
          >
            <div class="deal-image">
              <div
                class="container-percent"
                v-if="
                  getDiscountPercent(product.min_price, product.flash_price) > 0
                "
              >
                <span class="text-percent"
                  >{{
                    getDiscountPercent(product.min_price, product.flash_price)
                  }}%
                </span>
              </div>
              <img :src="getImage(product.thumbnail!)" alt="" />
            </div>
            <div class="deal-description">
              <div class="deal-logo-color">
                <span class="deal-logo">NAVA</span>
                <div class="deal-colors">
                  <div
                    v-for="(img, ind) in product?.images.slice(0, 6)"
                    :key="ind"
                    class="deal-item-image"
                  >
                    <img :src="getImage(img)" alt="" />
                  </div>
                </div>
              </div>
              <div class="deal-info">
                <div class="deal-name">
                  <p>{{ product.name }}</p>
                </div>
                <div class="deal-bottom">
                  <div class="deal-prices">
                    <span class="deal-price-new">{{
                      product.flash_price
                        ? formatPrice(product.flash_price!)
                        : product.min_price
                    }}</span>
                    <span class="deal-price-old" v-if="product.flash_price">
                      {{ formatPrice(product.max_price) }}</span
                    >
                  </div>
                  <div class="deal-action" @click.stop>
                    <button @click="handleCart(product.id)">
                      <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button @click.stop="favourite.toggleFavouriteInstant(product.id)">
                      <i
                        v-if="favourite.isFavourite(product.id)"
                        class="fa-solid fa-heart"
                      ></i>
                      <i
                        v-if="!favourite.isFavourite(product.id)"
                        class="fa-regular fa-heart"
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container-btn">
          <button class="show-more-deal" @click="btnShowMoreDeal">
            {{ showAllDeal ? "Thu gọn " : "Xem thêm sản phẩm " }}
            <i
              :class="
                showAllDeal ? 'fa-solid fa-angle-up' : 'fa-solid fa-arrow-right'
              "
            ></i>
          </button>
        </div>
      </div>
    </div>
    <div class="container-product">
      <div class="container-title">
        <span>Dành riêng cho bạn</span>
      </div>
      <div class="product-me" :class="showAllDeal ? 'yes' : 'no'">
        <div
          v-for="product in productForMe"
          class="deal-item-product"
          @click="
            router.push({
              name: 'product-detail',
              params: { id: product.id },
            })
          "
        >
          <div class="deal-image">
            <img :src="getImage(product.thumbnail!)" alt="" />
          </div>
          <div class="deal-description">
            <div class="deal-logo-color">
              <span class="deal-logo">NAVA</span>
              <div class="deal-colors">
                <div
                  v-for="(img, ind) in product?.images.slice(0, 6)"
                  :key="ind"
                  class="deal-item-image"
                >
                  <img :src="getImage(img)" alt="" />
                </div>
              </div>
            </div>
            <div class="deal-info">
              <div class="deal-name">
                <p>{{ product.name }}</p>
              </div>
              <div class="deal-bottom">
                <div class="deal-prices">
                  <span class="deal-price-new">{{
                    product.flash_price
                      ? formatPrice(product.flash_price!)
                      : product.min_price
                  }}</span>
                  <span class="deal-price-old" v-if="product.flash_price">
                    {{ formatPrice(product.max_price) }}</span
                  >
                </div>
                <div class="deal-action" @click.stop>
                  <button @click="handleCart(product.id)">
                    <i class="fa-solid fa-cart-shopping"></i>
                </button>
                    <button @click.stop="favourite.toggleFavouriteInstant(product.id)">
                      <i
                        v-if="favourite.isFavourite(product.id)"
                        class="fa-solid fa-heart"
                      ></i>
                      <i
                        v-if="!favourite.isFavourite(product.id)"
                        class="fa-regular fa-heart"
                      ></i>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deal-action button:hover {
  cursor: pointer;
  transform: translateY(-1px);
}
.fa-solid.fa-heart {
  color: red;
}
.heart-filled {
  color: red;
  font-weight: 900;
}
.heart-empty {
  color: #ccc;
  font-weight: 400;
}
.breadcrumb {
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  /* background-color: red; */
  margin-left: -7px;
  border-bottom: 1px solid #e0e0e0;
  margin-top: 110px;
}
.automatic-redirect-image {
  display: none;
}
.breadcrumb-item {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}
.breadcrumb-item:hover {
  color: #ff6b35;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 500;
}
.container {
  margin-top: 30px;
  width: 100%;
  /* height: 100%; */
  height: auto;
  min-height: 100vh;
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-items: center;
}
.top-content {
  width: 90%;
  background-color: rgb(233, 232, 231);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* gap: 200px; */
  gap: 20px;
  height: 120px;
  align-items: center;
}
.left-content {
  width: 30%;
  height: 100px;
  background-color: rgb(140, 138, 140);
  display: flex;
  flex-direction: row;
  align-items: center;
  /* justify-content: g; */
  gap: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 7px;
  padding: 5px;
}
.left-content img {
  width: 94px;
  height: 94px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.left-content span {
  font-size: 25px;
  color: white;
}
.container-rating {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rating-star {
  margin-left: px;
}
.number-rating {
  font-size: 33px !important;
  font-weight: 500;
}
.average-rating span {
  margin-left: 5px;
}
.max-rating {
  font-size: 17px !important;
}
.star-wrapper {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 2px;
}

.base-star {
  color: rgb(211, 211, 211);
  position: absolute;
  top: 0;
  font-size: 16px;
  left: 0;
}

.overlay-star {
  color: rgb(245, 20, 20);
  position: absolute;
  font-size: 16px;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
}
.right-content {
  width: 70%;
  height: 100px;
  background-color: rgb(224, 223, 220);
  padding: 5px 5px;
  border-radius: 7px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.right-content .content {
  margin: 0px 50px;
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  /* align-items: start; */
  justify-content: center;
  gap: 20px;
}
.right-content .content span {
  color: rgb(209, 48, 48);
}
.voucher-container {
  margin-top: 20px;
  width: 95%;
  background-color: rgb(255, 255, 255);
  height: 170px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.voucher-container .title-voucher {
  /* background-color: aquamarine; */
  width: 97%;
  margin-bottom: 4px;
}
.list-voucher {
  width: 97%;
  height: auto;
  display: flex;
  flex-direction: row;
  column-gap: 30px;
  /* margin-left: 20px; */
  overflow-x: auto;
  /* align-items: center; */
  /* justify-content: center; */
  scrollbar-width: none;
}
.voucher {
  height: 130px;
  flex: 0 0 auto;
  width: 320px;
  background-color: rgb(246, 229, 225);
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 6px;
  box-shadow: 0 4px 8px rgba(65, 64, 64, 0.2);
  border-radius: 3px;
  padding: 0 5px;
  border: 1px solid #e5e4e4;
}
.voucher-image {
  /* width: 120px;
        height: 127px; */
  /* width: 40%; */
  width: 128px;
  height: 128px;
  /* background-color: rgb(46, 226, 43); */
}
.voucher-image img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
}
.description {
  display: flex;
  flex-direction: column;
  /* background-color: aliceblue; */
  /* justify-content: space-between; */
  /* width: 60%; */
  height: 95px;
  gap: 10px;
  width: 200px;
  justify-content: center;
  /* align-items: center; */
  /* background-color: blue; */
}
.description .des {
  /* display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden; */
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.description .des-min {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expiry-terms {
  display: flex;
  flex-direction: column;
  /* background-color: red; */
  justify-content: space-between;
  row-gap: 5px;
}
.expiry-terms .expiry {
  color: #767575;
  width: 100%;
  /* background-color: #e5e4e4; */
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expiry-terms .terms {
  font-size: 13px;
  color: blue;
}
.select button {
  background-color: red;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 4px 10px;
}
.select button:hover {
  background-color: rgb(239, 68, 68);
}
.select .use{
    background-color: white;
    color: red;
    border: 0.5px solid red;
}
.select .use:hover{
    background-color: rgb(242, 168, 168);
}

.bottom-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* background-color: aqua; */
  width: 95%;
  height: auto;
  /* margin-top: 100px; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  margin-bottom: 50px;
  border-radius: 8px;
}
.btn-deal button:hover {
  background-color: aliceblue;
}
.deal-hot {
  display: flex;
  flex-direction: column;
  background-color: rgb(226, 225, 224);
  width: 100%;
  border-radius: 9px;
  border: 0.1px solid #5f5e5e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  justify-content: center;

  align-items: center;
}
.deal-hot .title-deal {
  margin-left: 20px;
  margin-top: 10px;
  font-size: 25px;
  /* background-color: aqua; */
}
.deal-hot .title-deal i {
  color: rgb(248, 123, 7);
}
.btn-deal {
  width: 100%;
  /* background-color: aqua; */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  /* justify-content: center; */
  /* padding-right: 10px; */
}
.btn-deal button {
  margin-right: 10px;
  border: none;
  border-radius: 50%;
  width: 30px;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  font-size: 20px;
  /* text-align: center; */
}
.deal-product {
  width: 98%;
  /* background-color: red; */
  display: flex;
  flex-direction: row;
  gap: 30px;
  row-gap: 50px;
  justify-content: space-between;
  /* padding: 15px 10px; */
  /* margin-left: 4px; */
}
.deal-product.no {
  overflow-y: auto;
  scroll-behavior: smooth;
  stroke-width: 5px;
  overflow-x: scroll;
}
.deal-product::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.deal-product.yes {
  flex-wrap: wrap;
}
.deal-item-product {
  flex: 0 0 auto;
  width: 200px;
  height: 340px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
  background-color: rgb(240, 243, 232);
}
.deal-item-product:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}

.deal-item-product .deal-image {
  width: 100%;
  height: 55%;
  border-radius: 4px;
  position: relative;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
}
.deal-image .container-percent {
  position: absolute;
  top: 0px;
  border-radius: 4px;
  right: 0px;
  /* z-index: 1; */
  padding: 1px;
  padding-left: 2px;
  padding-right: 2px;
  background-color: red;
}
.container-percent .text-percent {
  color: white;
}
.deal-image img {
  width: 100%;
  height: 100%;
  border-radius: 2px;
}
.deal-description {
  width: 90%;
  height: 45%;
  display: flex;
  flex-direction: column;
  /* gap: 300px; */
  /* background-color: beige; */
}
.deal-logo-color {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 30%;
  /* background-color: #fff; */
}
.deal-logo {
  font-size: 12px;
  /* color: ; */
}
.deal-colors {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.deal-item-image {
  width: 26px;
  height: 26px;
  border: 1px solid;
}
.deal-item-image img {
  width: 100%;
  height: 100%;
  border-radius: 1px;
}
.deal-info {
  width: 100%;
  height: 70%;
  /* background-color: rgb(224, 250, 215); */
  display: flex;
  flex-direction: column;
}
.deal-info .deal-name {
  width: 100%;
  height: 50%;
}
.deal-info .deal-name p {
  font-size: 16px;
  width: 180px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
}

.deal-bottom {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 35%;
  justify-items: center;
  align-items: center;
  /* background-color: aqua; */
}
.deal-prices {
  display: flex;
  /* align-items: center; */
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  width: 50%;
  height: 100%;
}
.deal-prices span {
  color: black;
  font-size: 18px;
}

.deal-prices .deal-price-old {
  font-size: 15px;
  text-decoration: line-through;
}
.deal-prices .deal-price-new {
  color: red;
}

.deal-bottom .deal-action {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  gap: 5px;
}

.deal-bottom .deal-action button {
  border: none;
  color: white;
  background-color: transparent;
}
.deal-action i {
  font-size: 20px;
  color: black;
  /* -webkit-text-stroke: 1px black; */
}
.deal-action .fa-cart-shopping {
  color: black;
}
.container-btn {
  display: flex;
  justify-content: center;
  margin: 7px 0px;
}
.show-more-deal {
  display: flex;
  justify-content: center;
  align-items: center;
  /* width: auto; */
  /* width: 200px; */
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #333;
}
.show-more-deal:hover {
  background: #000;
  color: #fff;
}
.container-product {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  /* background-color: #767575; */
}
.container-title {
  width: 95%;
  /* background-colo  r: red; */
  margin-bottom: 15px;
  /* margin-left: 30px; */
}
.container-title span {
  font-size: 25px;
}
.product-me {
  width: 97%;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 30px;
  row-gap: 40px;
  /* margin-left: 20px; */
  overflow-x: auto;
  /* align-items: center; */
  /* justify-content: center; */
  scrollbar-width: none;
}
@media (max-width: 1024px) {
  .container-rating .name {
    font-size: 17px;
  }
  .base-star,
  .overlay-star {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .top-content {
    background-color: transparent;
  }
  .left-content {
    height: 150px;
    width: 35%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .left-content span {
    font-size: 17px;
    color: white;
  }
  .right-content {
    width: 60%;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* align-items: ; */
    gap: 10px;
    margin-left: 14px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  .right-content .content {
    margin: 0px 5px;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
    /* align-items: start; */
    justify-content: center;
    gap: 10px;
  }
  .right-content .content span {
    font-size: 16px;
    color: rgb(209, 48, 48);
  }
  .voucher {
    height: 110px;
    width: 250px;
  }
  .voucher-image {
    width: 110px;
    height: 110px;
  }
  .description {
    height: 110px;
    gap: 5px;
    width: 120px;
  }
  .select{
    width: 22px;
  }
  .select button{
    font-size: 10px;
    padding: 2px;
  }
  .deal-product {
    width: 98%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    row-gap: 25px;
    justify-content: space-between;
  }
  .deal-item-product {
    width: 150px;
    height: 240px;
  }
  .product-me {
    column-gap: 5px;
    row-gap: 25px;
  }
  .deal-info .deal-name p {
    font-size: 16px;
    width: 150px;
  }
  .deal-info .deal-name p {
    width: 100%;
    font-size: 13px;
  }
  
  .deal-prices span {
        font-size: 13px;
    }
    
    .deal-prices .deal-price-old {
        font-size: 12px;
    }
    .deal-action i {
        font-size: 15px;
    }
}
@media(max-width: 370px){
    .deal-item-product {
        width: 130px;
        height: 225px;
    }
    
}
</style>
