<script setup lang="ts">
import bannerImage1 from "../assets/homes/banner.jpg";
import bannerImage2 from "../assets/homes/banner1.jpg";
import bannerImage3 from "../assets/homes/banner2.jpg";
import bannerItem1 from "../assets/homes/banner-item1.jpg";
import bannerItem2 from "../assets/homes/banner-item2.jpg";
import bannerItem3 from "../assets/homes/banner-item3.jpg";
import bannerItem4 from "../assets/homes/banner-item4.jpg";
import flashSale from "../assets/homes/flash-sale.jpg";
import PoLo from "../assets/homes/PoLoTrangHome.jpg";
import DoDa from "../assets/homes/DoDaTrangHome.jpg";
import Header from "../components/Header.vue";
import { getImage } from "../utils/getImage";
import { formatPrice } from "../utils/formatPrice";
import type { Voucher } from "../interfaces/voucher";
import type { ProductSummary, ProductPayload } from "../interfaces/product";
import type { FlashSale, FlashSaleProductSold } from "../interfaces/flashSale";

import { onBeforeUnmount, onMounted, computed, ref, watch } from "vue";
import { useProductStore } from "../stores/productStore";
import { voucherStore } from "../stores/voucherStore";
import { flashSaleStore } from "../stores/flashSaleStore";
import AddToCart from "../components/AddToCart.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const banners = [bannerImage1, bannerImage2, bannerImage3];
const useProduct = useProductStore();
const useVoucher = voucherStore();
const useFlashSale = flashSaleStore();
const currentIndex = ref(0);
let timer: number;
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const flashSaleHomes = ref<FlashSale | null>(null);
const vouchers = ref<Voucher[]>([]);
const totalSolds = ref<FlashSaleProductSold[]>([]);
const productBestSeller = ref<ProductSummary[]>([]);
const productLatests = ref<ProductSummary[]>([]);
const showAll = ref(false);
const showMoreBestSeller = ref(false);
const showMoreNewArrivals = ref(false);
const showFormAdd = ref(false);
const copiedList = ref<boolean[]>([])


const textTmp = `Tối giản nhưng không đơn điệu – Dòng sản phẩm Polo của 
    Giovanni Outlet chinh phục quý ông bởi sự tinh tế trong từng chi tiết.
    Chất liệu cotton thượng hạng kết hợp với
    đường may sắc sảo tạo nên vẻ ngoài hiện đại, lịch lãm và đầy cuốn hút.`;
const textAoda = `Sở hữu chất liệu cao cấp cùng kỹ thuật chế
    tác tinh tế, bộ sưu tập đồ da nam Giovanni Outlet thể hiện sự 
    trau chuốt trong từng chi tiết, mang đến trải nghiệm khác biệt.`;

const displayedProducts = computed(() => {
  if (!flashSaleHomes.value?.Products) return [];
  return showAll.value
    ? flashSaleHomes.value.Products
    : flashSaleHomes.value.Products.slice(0, 5);
});

const displayedBestSellerProducts = computed(() => {
  if (!productBestSeller.value) return [];
  return showMoreBestSeller.value
    ? productBestSeller.value
    : productBestSeller.value.slice(0, 5);
});
const displayedNewArrivalsProducts = computed(() => {
  if (!productLatests.value) return [];
  return showMoreNewArrivals.value
    ? productLatests.value
    : productLatests.value.slice(0, 5);
});

const btnShowMoreProductSale = () => {
  showAll.value = !showAll.value;
};

const btnShowMoreBestSeller = () => {
  showMoreBestSeller.value = !showMoreBestSeller.value;
};
const btnshowMoreNewArrivals = () => {
  showMoreNewArrivals.value = !showMoreNewArrivals.value;
};
const productDetail = ref<ProductPayload>();
const handleCart = async (id: number) => {
  productDetail.value = await useProduct.getProductByIdStore(id);
  if (productDetail) {
    showFormAdd.value = true;
  }
};

onMounted(async () => {
  vouchers.value = await useVoucher.getTop4VoucherGlobal();
  flashSaleHomes.value = await useFlashSale.getFlashSaleHome();
  localStorage.setItem(
    "excludeIdHome",
    flashSaleHomes.value?.id ? flashSaleHomes.value.id.toString() : ""
  );

  totalSolds.value = await useFlashSale.getTotalSoldFlashSaleByIdStore();

    productBestSeller.value = await useProduct.getProductBestSellerStore();

  productLatests.value = await useProduct.getProductLatestStore();
    
  setTime();
  countdown = setInterval(setTime, 1000);

  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % banners.length;
  }, 4000);
});
const prevImage = () => {
  currentIndex.value = (currentIndex.value - 1 + banners.length) % banners.length;
};
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1 + banners.length) % banners.length;
};
const bannerItems = [bannerItem1, bannerItem2, bannerItem3, bannerItem4];
// const startDate = computed(() => flashSaleHomes.value?.start_date);
const endDate = computed(() => flashSaleHomes.value?.end_date);

let countdown: number;
const setTime = () => {
  if (!endDate.value) return;
  const endUtc = new Date(endDate.value);
  const end = new Date(
    endUtc.getUTCFullYear(),
    endUtc.getUTCMonth(),
    endUtc.getUTCDate(),
    23,
    59,
    0
  ).getTime();

  const now = new Date().getTime();
  const distance = end - now;
  if (distance <= 0) {
    hours.value = minutes.value = seconds.value = 0;
    clearInterval(countdown);
    return;
  }
  hours.value = Math.floor(distance / (1000 * 60 * 60));
  minutes.value = Math.floor((distance / (1000 * 60)) % 60);
  seconds.value = Math.floor((distance / 1000) % 60);
};
watch(() => flashSaleHomes.value?.end_date,
  () => {
    setTime();
  }
);
const getSold = (productId: number) => {
    if (productId) {
        const soldItem = totalSolds.value.find(
          (item) => item.product_id === productId
        );
        return soldItem ? soldItem.total_flash_sale_sold : 0;
    }
    return 0;
};
const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);    
    copiedList.value[index] = true

    setTimeout(() => {
        copiedList.value[index] = false
    }, 1000)
}
onBeforeUnmount(() => {
  clearInterval(timer);
  clearInterval(countdown);
});
</script>
<template>
  <Header />

  <div class="container">
    <div class="banner-container">
      <button class="btn btn-prev" @click="prevImage"><</button>
      <img
        :key="banners[currentIndex]"
        :src="banners[currentIndex]"
        :alt="'banner' + currentIndex"
        class="banner-image"
      />
      <button class="btn btn-next" @click="nextImage">></button>
    </div>
    <div class="promo-section">
      <div class="promo-row">
        <div
          v-for="(value, index) in bannerItems"
          :key="index"
          class="promo-item banner"
        >
          <img :src="value" alt="" />
        </div>
      </div>
      <div class="promo-row" v-if="vouchers.length >= 4">
        <div
          v-for="(voucher, index) in vouchers"
          :key="index"
          class="promo-item voucher"
        >
          <img :src="getImage(voucher.image_url)" alt="" />
          <div class="content-voucher">
            <div class="top-content">
              <div class="title">
                <p>NHẬP MÃ: {{ voucher.code }}</p>
              </div>
              <div class="description">
                <p>{{ voucher.description }}</p>
              </div>
            </div>
            <div class="btn-voucher">
              <button @click="copyText(voucher.code, index)">{{copiedList[index] ? 'Đã sao chép' :  'Sao chép'}}</button>
              <p class="condition">Điều kiện</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="promo-flashsale" v-if="displayedProducts.length > 0">
      <div class="flashsale-image">
        <img :src="flashSale" alt="flashsale" />
      </div>
      <div class="flashsale-title">
        <p>{{ flashSaleHomes?.title }}</p>

        <div class="flashsale-time">
          <span class="time-text">Kết thúc sau</span>
          <div class="time-boxes">
            <div class="time-box">
              <span class="time">{{ hours }}</span>
              <span class="text">Giờ</span>
            </div>
            <div class="time-box">
              <span class="time">{{ minutes }}</span>
              <span class="text">Phút</span>
            </div>
            <div class="time-box">
              <span class="time">{{ seconds }}</span>
              <span class="text">Giây</span>
            </div>
          </div>
        </div>
      </div>
      <div class="promo-product" :class="showAll ? 'grid-mode' : 'row-mode'">
        <div
          v-for="(product, index) in displayedProducts"
          :key="index"
          class="product-item"
          @click="
            router.push({
              name: 'product-detail',
              params: { id: product.id },
            })
          "
        >
          <div class="product-image">
            <img :src="getImage(product.thumbnail!)" alt="" />
          </div>
          <div class="promo-description">
            <div class="product-logo-color">
              <span class="logo">NAVA</span>
              <div class="list-color">
                <div
                  v-for="(img, index) in product.images.slice(0, 6)"
                  :key="index"
                  class="item-image"
                >
                  <img :src="getImage(img)" alt="" />
                </div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">
                <p>{{ product.name }}</p>
              </div>
              <div class="product-bottom">
                <div class="grid-prices">
                  <span class="grid-price-new">{{
                    product.flash_price
                      ? formatPrice(product.flash_price!)
                      : product.min_price
                  }}</span>
                  <span class="grid-price-old" v-if="product.flash_price">{{
                    formatPrice(product.max_price)
                  }}</span>
                </div>
                <div class="product-action" @click.stop>
                  <button @click="handleCart(product.id)">
                    <i class="fa-solid fa-cart-shopping"></i>
                  </button>
                  <button><i class="fa-solid fa-heart"></i></button>
                </div>
              </div>
              <div class="product-sold">
                <span>Đã bán {{ getSold(product.id) }} sản phẩm</span>
                <div class="progress-bar">
                  <div
                    class="progress"
                    :style="{
                      width:
                        Math.min(
                          (getSold(product.id) / product.sold_quantity) * 100,
                          100
                        ) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="btn-best-seller" @click="btnShowMoreProductSale">
        {{ showAll ? "Thu gọn" : "Xem thêm sản phẩm" }}
        <i
          :class="showAll ? 'fa-solid fa-angle-up' : 'fa-solid fa-arrow-right'"
        ></i>
      </button>
    </div>
    <div class="featured-products">
      <div class="best-sellers" v-if="productBestSeller.length > 0">
        <span class="title">TOP SẢN PHẨM BÁN CHẠY TẠI CỬA HÀNG</span>
        <div
          class="products-grid bestseller"
          :class="showMoreBestSeller ? 'flex-wrap' : 'no-flex-wrap'"
        >
          <div
            v-for="(product, index) in displayedBestSellerProducts"
            :key="index"
            class="grid-item"
            @click="
              router.push({
                name: 'product-detail',
                params: { id: product.id },
              })
            "
          >
            <div class="grid-image">
              <img :src="getImage(product.thumbnail!)" alt="" />
            </div>
            <div class="grid-description">
              <div class="grid-logo-color">
                <span class="grid-logo">NAVA</span>
                <div class="grid-colors">
                  <div
                    v-for="(img, ind) in product.images.slice(0, 6)"
                    :key="ind"
                    class="grid-item-image"
                  >
                    <img :src="getImage(img)" alt="" />
                  </div>
                </div>
              </div>
              <div class="grid-info">
                <div class="grid-name">
                  <p>{{ product.name }}</p>
                </div>
                <div class="grid-bottom">
                  <div class="grid-prices">
                    <span class="grid-price-new">{{
                      product.flash_price
                        ? formatPrice(product.flash_price!)
                        : formatPrice(product.min_price)
                    }}</span>
                    <span class="grid-price-old" v-if="product.flash_price">{{
                      formatPrice(product.max_price)
                    }}</span>
                  </div>
                  <div class="grid-action" @click.stop>
                    <button @click="handleCart(product.id)">
                      <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button><i class="fa-solid fa-heart"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-best-seller" @click="btnShowMoreBestSeller">
          {{ showMoreBestSeller ? "Thu gọn" : "Xem thêm sản phẩm" }}
          <i
            :class="
              showMoreBestSeller
                ? 'fa-solid fa-angle-up'
                : 'fa-solid fa-arrow-right'
            "
          ></i>
        </button>
      </div>
      <div class="new-arrivals" v-if="productLatests.length > 0">
        <span class="title">SẢN PHẨM MỚI RA MẮT</span>
        <div
          class="products-grid arrivals"
          :class="showMoreNewArrivals ? 'flex-wrap' : 'no-flex-wrap'"
        >
          <div
            v-for="(product, index) in displayedNewArrivalsProducts"
            :key="index"
            class="grid-item"
            @click="
              router.push({
                name: 'product-detail',
                params: { id: product.id },
              })
            "
          >
            <div class="grid-image">
              <img :src="getImage(product.thumbnail!)" alt="" />
            </div>
            <div class="grid-description">
              <div class="grid-logo-color">
                <span class="grid-logo">NAVA</span>
                <div class="grid-colors">
                  <div
                    v-for="(img, index) in product.images.slice(0, 6)"
                    :key="index"
                    class="grid-item-image"
                  >
                    <img :src="getImage(img)" alt="" />
                  </div>
                </div>
              </div>
              <div class="grid-info">
                <div class="grid-name">
                  <p>{{ product.name }}</p>
                </div>
                <div class="grid-bottom">
                  <div class="grid-prices">
                    <span class="grid-price-new">{{
                      product.flash_price
                        ? formatPrice(product.flash_price!)
                        : formatPrice(product.min_price)
                    }}</span>
                    <span class="grid-price-old" v-if="product.flash_price">{{
                      formatPrice(product.max_price)
                    }}</span>
                  </div>
                  <div class="grid-action" @click.stop>
                    <button @click="handleCart(product.id)">
                      <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button><i class="fa-solid fa-heart"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-new-arrival" @click="btnshowMoreNewArrivals">
          {{ showMoreNewArrivals ? "Thu gọn" : "Xem thêm sản phẩm" }}
          <i
            :class="
              showMoreNewArrivals
                ? 'fa-solid fa-angle-up'
                : 'fa-solid fa-arrow-right'
            "
          ></i>
        </button>
      </div>
    </div>
    <div class="section-wrapper">
      <div class="product-section">
        <div class="container-image">
          <img :src="PoLo" alt="" />
        </div>
        <div class="container-content">
          <span class="title">POLO</span>
          <span class="description">{{ textTmp }}</span>
          <button class="view-now">Xem ngay</button>
        </div>
      </div>
      <div class="product-section two">
        <div class="container-image">
          <img :src="DoDa" alt="" />
        </div>
        <div class="container-content">
          <span class="title">Đồ da</span>
          <span class="description">{{ textAoda }}</span>
          <button class="view-now">Xem ngay</button>
        </div>
      </div>
    </div>
    <AddToCart
      v-if="showFormAdd && productDetail"
      :product="productDetail"
      @close="showFormAdd = false"
    />
  </div>
</template>
<style scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
  /* background-color: red; */
}
.banner-container {
  width: 99%;
  height: 50%;
  position: relative;
}
.banner-image {
  width: 100%;
  height: 100%;
  /* object-fit: cover; */
  /* display: block; */
  border-radius: 5px;
}
.btn {
  position: absolute;
  top: 50%;
  font-size: 20px;
  background-color: rgb(219, 215, 215);
  border-radius: 5px;
  padding: 5px 8px;
  transform: translateY(-50%);
  color: black;
  cursor: pointer;
}
.btn:hover {
  background-color: rgb(255, 255, 255);
}
.btn-prev {
  left: 10px;
}
.btn-next {
  right: 10px;
}
.promo-section {
  display: flex;
  flex-direction: column;
  /* background-color: red; */
  width: 90%;
  margin: 40px 0;
  gap: 10px;
  justify-content: space-between;
  /* right: 10px; */
  /* justify-content: center; */
  /* background-color: aqua; */
  /* background-color: aqua; */
}
.promo-item {
  flex: 0 0 auto;
  height: 130px;
  width: 270px;
}
.promo-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}
.promo-item.banner img {
  height: 100%;
  width: 100%;
}
.promo-row {
  display: flex;
  flex-direction: row;
  gap: 50px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  /* background-color: aqua; */
  padding: 10px 10px;
  /* margin-right: 200px; */
  /* background-color: antiquewhite; */
  justify-content: space-between;
  scrollbar-width: none;
}

.promo-item.voucher {
  display: flex;
  flex-direction: row;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.08), 4px 0 8px rgba(0, 0, 0, 0.1),
    8px 0 16px rgba(0, 0, 0, 0.08);
  /* background-color: aqua; */
}
.promo-item.voucher img {
  width: 30%;
  height: 100%;
  margin-left: 5px;
}
.promo-item.voucher .content-voucher {
  display: flex;
  flex-direction: column;
  padding: 5px 5px;
  padding-bottom: 5px;
  padding-top: 5px;
  align-items: center;
  width: 55%;
  height: 100%;
  gap: 5px;
}
.content-voucher .top-content {
  display: flex;
  width: 100%;
  height: 70%;
  flex-direction: column;
  justify-content: center;
  /* background-color: aqua; */
  /* margin-bottom: 5px; */
  /* padding: 5px; */
}
.top-content .title {
  height: 60%;
  width: 100%;
  /* background-color: blue; */
  display: flex;
  justify-content: center;
  align-items: center;
}
.top-content .title p {
  text-align: center;
  color: red;
  padding: 5px;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
}
.top-content .description {
  height: 40%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: yellow; */
}
.top-content .description p {
  text-align: center;
  font-size: 14px;
  padding: 5px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* -webkit-line-clamp: 2; */
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  color: rgb(60, 57, 57);
  line-height: 1.5em;
}
.btn-voucher {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 20%;
  width: 100%;
  justify-content: center;
  gap: 10px;
}
.btn-voucher button {
  background-color: rgb(179, 4, 4);
  border: none;
  font-size: 11px;
  color: white;
  border-radius: 2px;
  padding: 2px;
  text-align: center;
}
.btn-voucher p {
  font-size: 12px;
  text-decoration: underline;
  color: rgb(96, 94, 94);
}

.promo-flashsale {
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 172, 45);
  width: 95%;
  margin-top: 10px;
  height: auto;
  margin-bottom: 20px;
  align-items: center;
  padding-bottom: 20px;
}
.promo-flashsale .flashsale-image {
  width: 100%;
  height: 150px;
}
.promo-flashsale .flashsale-image img {
  width: 100%;
  height: 100%;
}
.flashsale-title {
  width: 100%;
  height: auto;
  /* height: 990px; */
  display: flex;
  flex-direction: column;
  gap: 1px;
  /* margin-bottom: 9px; */
}
.flashsale-title p {
  width: 80%;
  font-weight: bold;
  margin-top: 10px;
  margin-left: 20px;
  font-size: 25px;
  /* background-color: rgb(168, 9, 49); */
  margin-bottom: 0;
}
.flashsale-time {
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin-right: 38px;
  gap: 20px;
  margin-bottom: 5px;
  /* margin-top: 0px; */
}
.flashsale-time .time-text {
  font-size: 22px;
  color: red;
}
.time-boxes {
  display: flex;
  flex-direction: row;
  /* background-color: aqua; */
  gap: 20px;
}
.flashsale-time .time-box {
  display: flex;
  flex-direction: column;
  width: 60px;
  height: 70px;
  background-color: red;
  border-radius: 5px;
  /* align-items: center; */
}
.time-box .time,
.time-box .text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.time-box .time {
  width: 100%;
  height: 60%;
  text-align: center;
  font-size: 25px;
  color: rgb(216, 216, 19);
}
.time-box .text {
  width: 100%;
  height: 40%;
  text-align: center;
  font-size: 16px;
  border-top: 0.5px solid;
  border-color: rgb(158, 158, 59);
  color: rgb(216, 216, 19);
}

.promo-product.row-mode {
  width: 98%;
  /* height: 500px; */
  display: flex;
  flex-direction: row;
  gap: 9px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 22px;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.promo-product.grid-mode {
  width: 95%;
  height: 500px;
  display: flex;
  flex-direction: row;
  gap: 40px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  height: auto;
  padding-bottom: 22px;
}
.promo-product .product-item {
  flex: 0 0 auto;
  width: 220px;
  height: 350px;
  background-color: rgb(242, 242, 242);
  /* margin: 10px 0; */
  border-radius: 2px;
  display: flex;
  /* padding: 2px; */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.9);
}
.promo-product .product-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}

.promo-product .product-item .product-image {
  /* background-color: rgb(177, 104, 8); */
  /* margin: 2px 0; */
  width: 100%;
  height: 53%;
  border-radius: 2px;
  border-bottom: 0.1px solid rgb(228, 227, 227);
}
.promo-product .product-image img {
  width: 100%;
  height: 100%;
  border-radius: 2px;
}
.promo-description {
  margin-top: 2px;
  width: 90%;
  height: 47%;
  /* background-color: rgb(147, 147, 231); */
  /* margin-left: 20px; */
}

.promo-description .product-logo-color {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 20%;
  /* background-color: rgb(51, 255, 0); */
}
.product-logo-color .logo {
  font-size: 11px;
  color: rgb(92, 85, 85);
}
.product-logo-color .list-color {
  display: flex;
  flex-direction: row;
  /* background-color: red; */
  gap: 8px;
}
.list-color .item-image {
  width: 26px;
  height: 26px;
  /* background-color: yellow; */
  border: 1px solid;
}
.list-color .item-image img {
  width: 100%;
  height: 100%;
}
.promo-product .product-info {
  width: 100%;
  /* background-color: rgb(250, 237, 231); */
  height: 65%;
}
.product-info .product-name {
  width: 100%;
  height: 35%;
}
.product-info .product-name p {
  font-size: 16px;
}

.promo-product .product-bottom {
  /* background-color: rgb(25, 0, 255); */
  width: 100%;
  height: 35%;
  display: flex;
  flex-direction: row;
  /* align-items: center;
    justify-content: center;
    justify-items: center; */
  gap: 10px;
  margin-bottom: 5px;
}

.product-bottom .product-prices {
  width: 50%;
  height: 100%;
  /* background-color: black; */
  display: flex;
  flex-direction: column;
  gap: 1px;
  /* margin: ; */
}
.product-bottom .product-prices span {
  color: black;
  font-size: 18px;
  /* background-color: aqua; */
}
.product-bottom .product-prices .price-old {
  text-decoration: line-through;
}
.product-bottom .product-prices .price-new {
  color: red;
}
.product-bottom .product-action {
  width: 50%;
  height: 100%;
  /* background-color: red; */
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  gap: 5px;
}
.product-bottom .product-action button {
  /* width: 50%;
    height: 50%; */
  border: none;
  color: white;
  background-color: transparent;
}
.product-action i {
  /* color: red; */
  /* border: 1px solid; */
  font-size: 20px;
  -webkit-text-stroke: 1px black; /* Viền đen */
}
.product-action .fa-cart-shopping {
  color: black;
}

.total-orders {
  margin-top: 8px;
  width: 100%;
  height: 25%;
  /* background-color: aqua; */
}

.product-sold {
  margin-top: 6px;
  width: 100%;
  height: 30px;
  /* background-color: blue; */
}
.product-sold span {
  font-size: 15px;
}
.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #443838;
  border-radius: 6px;
}
.progress {
  height: 100%;
  background-color: red;
  border-radius: 6px;
}
.btn-flashsale {
  background-color: rgb(41, 41, 41);
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 10px;
  margin-top: 5px;
  color: white;
}

.featured-products {
  width: 95%;
  /* height: 400px; */
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-color: red;; */
}
.featured-products .title {
  font-size: 24px;
  margin: 20px 0;
  text-decoration: underline;
}
.best-sellers,
.new-arrivals {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.products-grid {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  /* background-color: red; */
}
.products-grid.bestseller.no-flex-wrap {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.products-grid.bestseller.flex-wrap {
  justify-content: center;
  flex-wrap: wrap;
  height: auto;
  gap: 30px;
}

.products-grid.arrivals.no-flex-wrap {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.products-grid.arrivals.flex-wrap {
  /* justify-content: flex-start; */
  justify-content: center;
  flex-wrap: wrap;
  height: auto;
  gap: 30px;
}

.grid-item {
  flex: 0 0 auto;
  width: 220px;
  height: 350px;
  /* background-color: antiquewhite; */
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.9);
}
.grid-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}

.grid-item .grid-image {
  width: 100%;
  height: 55%;
  border-radius: 2px;
}
.grid-image img {
  width: 100%;
  height: 100%;
  border-radius: 2px;
}
.grid-description {
  width: 90%;
  height: 45%;
  display: flex;
  flex-direction: column;
  /* gap: 300px; */
}
.grid-logo-color {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 30%;
  background-color: #fff;
}
.grid-logo {
  font-size: 12px;
  /* color: ; */
}
.grid-colors {
  display: flex;
  flex-direction: row;
  gap: 8px;
}
.grid-item-image {
  width: 26px;
  height: 26px;
  border: 1px solid;
}
.grid-item-image img {
  width: 100%;
  height: 100%;
  border-radius: 1px;
}
.grid-info {
  width: 100%;
  height: 70%;
  /* background-color: rgb(224, 250, 215); */
  display: flex;
  flex-direction: column;
}
.grid-info .grid-name {
  width: 100%;
  height: 50%;
}
.grid-info .grid-name p {
  font-size: 16px;
}

.grid-bottom {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 35%;
  margin-top: 2px;
  /* background-color: aqua; */
}
.grid-prices {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 50%;
  height: 100%;
  /* background-color: aqua; */
  /* align-items: center; */
  justify-content: center;
}
.grid-prices span {
  color: black;
  font-size: 18px;
}

.grid-prices .grid-price-old {
  text-decoration: line-through;
}
.grid-prices .grid-price-new {
  color: red;
}

.grid-bottom .grid-action {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  gap: 5px;
}

.grid-bottom .grid-action button {
  border: none;
  color: white;
  background-color: transparent;
}
.grid-action i {
  font-size: 20px;
  -webkit-text-stroke: 1px black;
}
.grid-action .fa-cart-shopping {
  color: black;
}

.btn-best-seller:hover,
.btn-new-arrival:hover,
.view-now:hover {
  background: #000;
  color: #fff;
}
.btn-best-seller i {
  vertical-align: middle;
}
.btn-new-arrival, .btn-best-seller {
  padding: 5px;
  font-size: 17px;
  border-radius: 4px;
  margin: 30px 0;
}
.btn-new-arrival i {
  vertical-align: middle;
}
.section-wrapper {
  width: 90%;
  /* min-height: 400px; */
  height: auto;
  /* background-color: aqua; */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* background-color: red; */
  /* gap: 30px; */
  gap: 9px;
  align-items: center;
  /* margin-bottom: 100px; */
}
.section-wrapper .product-section {
  display: flex;
  flex-direction: row;
  width: 98%;
  height: 270px;
  justify-content: space-between;
}
.section-wrapper .product-section.two {
  display: flex;
  flex-direction: row-reverse;
}
.product-section .container-image {
  width: 49%;
  border-radius: 3px;
}
.product-section .container-image:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}
.product-section .container-image img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
}
.product-section .container-content {
  padding-top: 20px;
  padding-bottom: 20px;
  width: 49%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.container-content .title {
  font-size: 45px;
  padding-left: 10px;
}
.container-content .description {
  font-size: 25px;
  text-align: center;
}
.container-content button {
  font-size: 15px;
  padding: 5px;
  width: 100px;
  border-radius: 3px;
  background-color: transparent;
}

@media (max-width: 1200px) {
  .flashsale-time .time-box {
    width: 45px;
    height: 55px;
  }
  .time-box .time {
    font-size: 20px;
  }
  .time-box .text {
    font-size: 13px;
  }
  .time-boxes {
    gap: 12px;
  }
  .flashsale-time .time-text {
    font-size: 18px;
    color: red;
  }
  .flashsale-title p {
    font-size: 20px;
  }
  .flashsale-time {
    margin-right: 30px;
    gap: 20px;
  }
  .promo-flashsale .flashsale-image {
    width: 100%;
    height: 110px;
  }
  .promo-product.row-mode,
  .promo-product.grid-mode {
    gap: 14px;
  }
  .promo-product .product-item {
    width: 190px;
    margin-bottom: 5px;
  }

  .product-info .product-name {
    height: 30%;
  }
  .product-info .product-name p {
    font-size: 13px;
  }
  .product-logo-color .list-color {
    gap: 5px;
  }
  .list-color .item-image {
    width: 23px;
    height: 23px;
  }

  .promo-product .product-bottom {
    height: 35%;
    gap: 20px;
  }

  .product-bottom .product-prices span {
    font-size: 16px;
  }
  .product-sold {
    margin-top: 4px;
  }
  .product-sold span {
    font-size: 14px;
  }
  /**/
  .products-grid {
    gap: 100px;
  }
  .grid-item {
    width: 170px;
    height: 280px;
  }

  .grid-info .grid-name {
    height: 30%;
  }
  .grid-info .grid-name p {
    font-size: 13px;
  }
  .grid-logo-color .grid-colors {
    gap: 5px;
  }
  .list-color .item-image {
    width: 23px;
    height: 23px;
  }

  .grid-product .grid-bottom {
    height: 35%;
    gap: 20px;
  }

  .grid-bottom .grid-prices span {
    font-size: 16px;
  }
  .products-grid.bestseller.no-flex-wrap {
    justify-content: center;
    flex-wrap: wrap;
  }
  .products-grid.arrivals.no-flex-wrap {
    justify-content: center;
    flex-wrap: wrap;
  }

  .section-wrapper .product-section {
    height: 290px;
  }
  .product-section .container-content {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .container-content .title {
    font-size: 40px;
  }
  .container-content .description {
    font-size: 20px;
  }
  .container-content button {
    font-size: 14px;
  }
}
@media (max-width: 768px) {
  .banner-container {
    height: 30%;
  }

  .btn {
    font-size: 10px;
    padding: 2px 3px;
    border-radius: 2px;
  }
  .promo-section {
    gap: 10px;
    margin: 10px 0;
    width: 95%;
  }
  .promo-row {
    gap: 15px;
    padding: 5px 5px;
  }
  .promo-item {
    height: 90px;
    width: 170px;
  }
  .top-content .title p {
    font-size: 10px;
  }
  .top-content .description p {
    font-size: 9px;
    padding: 1px;
    line-height: 1.3em;
  }
  .btn-voucher {
    gap: 10px;
  }
  .btn-voucher button {
    font-size: 7px;
    border-radius: 1px;
  }
  .btn-voucher p {
    font-size: 7px;
  }

  /**/
  .promo-flashsale{
    width: 98%;
    /* background-color: aqua; */
  }
  .promo-product {
    height: 300px;
    /* background-color: red; */
  }
  .promo-product.grid-mode{
    column-gap: 5px;
    row-gap: 20px;
  }
  .flashsale-time .time-box {
    width: 20px;
    height: 16px;
  }
  .promo-product .product-item {
    width: 170px;
    height: 300px;
    margin-bottom: 5px;
    /* background-color: aqua; */
  }
  .time-box .time {
    font-size: 9px;
  }
  .time-box .text {
    font-size: 6px;
  }
  .time-boxes {
    gap: 4px;
  }
  .flashsale-time .time-text {
    font-size: 10px;
  }
  .flashsale-title p {
    font-size: 11px;
  }
  .flashsale-time {
    margin-right: 11px;
    gap: 7px;
  }
  .promo-flashsale .flashsale-image {
    height: 80px;
  }

  .product-info .product-name {
    height: 25%;
  }
  .product-info .product-name p {
    font-size: 12px;
  }
  .product-logo-color .list-color {
    gap: 3px;
  }
  .list-color .item-image {
    width: 20px;
    height: 20px;
  }

  .promo-product .product-bottom {
    height: 35%;
    gap: 20px;
  }
.featured-products .title{
    font-size: 15px;
}
  .product-bottom .product-prices span {
    font-size: 14px;
  }
  .product-sold {
    margin-top: 4px;
  }
  .product-sold span {
    font-size: 13px;
  }
  .section-wrapper {
    gap: 20px;
  }
  .section-wrapper .product-section {
    flex-direction: column;
    width: 98%;
    height: auto;
    align-items: center;
  }
  .section-wrapper .product-section.two {
    display: flex;
    flex-direction: column;
    width: 98%;
  }
  .product-section .container-content {
    padding-top: 5px;
    padding-bottom: 5px;
    width: 90%;
    gap: 10px;
  }
  .product-section .container-image {
    width: 95%;
    border-radius: 3px;
  }
  .container-content .title {
    font-size: 21px;
  }
  .container-content .description {
    font-size: 11px;
  }
  .container-content button {
    font-size: 11px;
    padding: 2px;
    width: 70px;
  }
}
</style>
