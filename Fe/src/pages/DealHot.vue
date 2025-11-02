<script setup lang="ts">
import Header from "../components/Header.vue";
import { ref, onMounted, computed } from "vue";
import type { FlashSale } from "../interfaces/flashSale";
import { getImage } from "../utils/format";
import { formatPrice } from "../utils/format";
import hotDeal1Image from "../assets/hotDeals/hotDeal1.jpg";
import hotDeal2Image from "../assets/hotDeals/hotDeal2.jpg";
import { flashSaleStore } from "../stores/flashSaleStore";
import type { ProductPayload, ProductSummary } from "../interfaces/product";
import { useProductStore } from "../stores/productStore";
import AddToCart from "../components/AddToCart.vue";
import { useRouter } from "vue-router";
import Loading from "../components/Loading.vue";
import { useFavouriteStore } from "../stores/favourite";

const favourite = useFavouriteStore();
const router = useRouter();
const flashSale1 = ref<FlashSale | null>(null);
const flashSale2 = ref<FlashSale | null>(null);
// const
const useFlashSale = flashSaleStore();
const useProduct = useProductStore();

const showFormAdd = ref(false);
const showMoreHotDeal1 = ref(false);
const showMoreHotDeal2 = ref(false);

onMounted(async () => {
  let excludeIds = localStorage.getItem("excludeIdHome") || "";
  localStorage.removeItem("excludeIds");
  const ids = excludeIds ? excludeIds.split(",") : [];

  flashSale1.value = await useFlashSale.getFlashSaleHotDeal1NotIN(excludeIds);
  await favourite.getFavouriteOfMeStore();

  if (flashSale1.value && flashSale1.value.id) {
    const id = flashSale1.value.id.toString();

    if (!ids.includes(id)) {
      ids.push(id);
      excludeIds = ids.join(",");
      localStorage.setItem("excludeIds", ids.join(","));
    }
  }
  flashSale2.value = await useFlashSale.getFlashSaleHotDeal2NotIN(excludeIds);
});
const productDetail = ref<ProductPayload>();
const handleCart = async (id: number) => {
  productDetail.value = await useProduct.getProductByIdStore(id);
  if (productDetail) {
    showFormAdd.value = true;
  }
};

const getDiscountPercent = (
  originalPrice: number,
  flashPrice?: number
): number => {
  if (!flashPrice || flashPrice >= originalPrice) return 0;
  const percent = ((originalPrice - flashPrice) / originalPrice) * 100;
  return Math.round(percent);
};

const displayedProductHotDeal1 = computed<ProductSummary[]>(() => {
  if (!flashSale1.value) return [];
  return showMoreHotDeal1.value
    ? flashSale1.value.Products
    : flashSale1.value.Products.slice(0, 6);
});
const displayedProductHotDeal2 = computed<ProductSummary[]>(() => {
  if (!flashSale2.value) return [];
  return showMoreHotDeal2.value
    ? flashSale2.value.Products
    : flashSale2.value.Products.slice(0, 6);
});

const btnShowMoreHotDeal1 = () => {
  showMoreHotDeal1.value = !showMoreHotDeal1.value;
};
const btnShowMoreHotDeal2 = () => {
  showMoreHotDeal2.value = !showMoreHotDeal2.value;
};
</script>
<template>
  <Header />
  <Loading :loading="useFlashSale.loading" />
  <div class="breadcrumb">
    <a href="/" class="breadcrumb-item">Trang chủ</a>
    <span class="separator">|</span>
    <span class="breadcrumb-item active">Ưu đãi cực hót</span>
  </div>
  <div class="container-deals">
    <div class="deal-item" v-if="flashSale1">
      <h3>{{ flashSale1?.title }}</h3>
      <div class="deal-content">
        <div class="deal-hot-image">
          <img :src="hotDeal1Image" alt="" />
        </div>
        <div class="deal-product">
          <div
            v-for="product in displayedProductHotDeal1"
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
      <button class="deal-btn" @click="btnShowMoreHotDeal1">
        {{ showMoreHotDeal1 ? "Thu gọn" : "Xem thêm sản phẩm" }}
        <i
          :class="
            showMoreHotDeal1
              ? 'fa-solid fa-angle-up'
              : 'fa-solid fa-arrow-right'
          "
        ></i>
      </button>
    </div>
    <div class="deal-item" v-if="flashSale2">
      <h3>{{ flashSale2?.title }}</h3>
      <div class="deal-content deal2">
        <div class="deal-hot-image">
          <img :src="hotDeal2Image" alt="" />
        </div>
        <div class="deal-product">
          <div
            v-for="product in displayedProductHotDeal2"
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
                    <button><i class="fa-solid fa-heart"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="deal-btn" @click="btnShowMoreHotDeal2">
        {{ showMoreHotDeal2 ? "Thu gọn" : "Xem thêm sản phẩm" }}
        <i
          :class="
            showMoreHotDeal2
              ? 'fa-solid fa-angle-up'
              : 'fa-solid fa-arrow-right'
          "
        ></i>
      </button>
    </div>
    <div v-if="!flashSale1 && !flashSale2">
      <h4>Hiện không có Ưu đãi hót nào</h4>
    </div>
    <AddToCart
      v-if="showFormAdd && productDetail"
      :product="productDetail"
      @close="showFormAdd = false"
    />
  </div>
</template>

<style scoped>
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
.container-deals {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  gap: 70px;
  margin-top: 50px;
  margin-bottom: 100px;
}
.deal-item {
  width: 85%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* background-color: aqua; */
  align-items: center;
  /* background-color: blue; */
}
.deal-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  /* align-items: center; */
  gap: 30px;
  justify-content: space-between;
  /* background-color: antiquewhite; */
}
.deal-content.deal2 {
  flex-direction: row-reverse;
}
.deal-hot-image {
  width: 25%;
}
.deal-hot-image img {
  width: 100%;
}

.deal-product {
  width: 68%;

  /* background-color: rgb(207, 255, 205); */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  row-gap: 50px;
  justify-content: space-between;
}

.deal-item-product {
  flex: 0 0 auto;
  width: 220px;
  height: 350px;
  /* background-color: rgb(17, 28, 143); */
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.9);
}
.deal-item-product:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 8px rgba(14, 13, 13, 0.9);
}

.deal-item-product .deal-image {
  width: 100%;
  height: 55%;
  border-radius: 2px;
  position: relative;
}
.deal-image .container-percent {
  position: absolute;
  top: 0px;
  border-radius: 2px;
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
}
.deal-logo-color {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 30%;
  background-color: #fff;
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
}

.deal-bottom {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 35%;
  /* background-color: aqua; */
}
.deal-prices {
  display: flex;
  flex-direction: column;
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
.deal-action button:hover {
  cursor: pointer;
  transform: translateY(-1px);
}
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
.deal-action .fa-cart-shopping {
  color: black;
}
.deal-btn {
  padding: 5px;
  border-radius: 3px;
}
.deal-btn:hover {
  background: #000;
  color: #fff;
}
@media (max-width: 1200px) {
  .deal-content {
    gap: 10px;
  }
  .deal-product {
    gap: 5px;
    row-gap: 40px;
  }
  .deal-item-product {
    width: 190px;
    height: 300px;
  }
  .deal-logo {
    font-size: 10px;
  }
  .deal-colors {
    gap: 6px;
  }
  .deal-item-image {
    width: 23px;
    height: 23px;
  }
  .deal-info .deal-name p,
  .deal-prices span {
    font-size: 14px;
  }
}
@media (max-width: 768px) {
  .deal-item {
    width: 90%;
  }
  h3 {
    font-size: 14px;
  }
  .deal-hot-image {
    display: none;
  }
  .deal-content {
    gap: 6px;
  }
  .deal-item {
    width: 96%;
  }
  .deal-product {
    width: 100%;
    /* gap: 10px; */
    column-gap: 5px;
    row-gap: 35px;
    /* background-color: #ff6b35; */
  }
  .deal-item-product {
    width: 150px;
    height: 250px;
  }
  .deal-logo {
    font-size: 9px;
  }
  .deal-colors {
    gap: 4px;
  }
  .deal-item-image {
    width: 19px;
    height: 19px;
  }
  .deal-info .deal-name p,
  .deal-prices span {
    font-size: 13px;
  }
}
@media(max-width: 350px){
    .deal-item-product {
        width: 130px;
        height: 225px;
    }
}
</style>
