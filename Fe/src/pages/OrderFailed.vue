<script setup lang="ts">
import { useProductStore } from "../stores/productStore";
import type { ProductSummary, ProductPayload } from "../interfaces/product";
import { formatPrice, getImage } from "../utils/format";
import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import Header from "../components/Header.vue";
import AddToCart from "../components/AddToCart.vue";
import { useFavouriteStore } from "../stores/favourite";

const router = useRouter();
const product = useProductStore();
const products = ref<ProductSummary[]>([]);
const showFormAdd = ref(false);
const showMore = ref(false);
const favourite = useFavouriteStore();

onMounted(async () => {
  products.value = await product.getProductByNameStore("áo");
  await favourite.getFavouriteOfMeStore();
  // alert(products.value[0]?.category_name);
});

const productDetail = ref<ProductPayload>();
const handleCart = async (id: number) => {
  productDetail.value = await product.getProductByIdStore(id);
  if (productDetail) {
    showFormAdd.value = true;
  }
};
const btnShowMore = () => {
  showMore.value = !showMore.value;
};
const displayProduct = computed(() => {
  if (!products.value) return [];
  return showMore.value ? products.value : products.value.slice(0, 10);
});
</script>

<template>
  <Header />
  <div class="container">
    <div class="top-content">
      <span class="content1"
        ><i class="fa-solid fa-xmark"></i>Lỗi khi đặt hàng
        </span
      >
      <span class="content2">Cảm ơn bạn đã đồng hành cùng Nava nhé</span>
      <div class="btn-top">
        <button @click="router.push('/home')">Trang chủ</button>
        <button @click="router.push('/profile/orderOfme')">Đơn mua</button>
      </div>
    </div>
    <div class="product-like" v-if="products.length > 0">
      <span class="title">Sản phẩm tương tự</span>
      <div class="products-grid">
        <div
          v-for="(product, index) in displayProduct"
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
    <button class="btn-show-more" @click="btnShowMore">
      {{ showMore ? "Thu gọn" : "Xem thêm sản phẩm" }}
      <i
        :class="showMore ? 'fa-solid fa-angle-up' : 'fa-solid fa-arrow-right'"
      ></i>
    </button>
    <AddToCart
      v-if="showFormAdd && productDetail"
      :product="productDetail"
      @close="showFormAdd = false"
    />
  </div>
</template>
<style scoped>
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
.container {
  width: 100%;
  height: 100%;
  /* background-color: aqua; */
  margin-top: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.top-content {
  width: 100%;
  height: 300px;
  background-color: rgb(239, 108, 60);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* justify-content: space-between; */
  gap: 15px;
}
.top-content i {
  font-size: 50px;
  color: rgb(208, 4, 4);
}
.top-content span {
  color: white;
}
.content1 {
  font-size: 40px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.content2 {
  font-size: 20px;
}
.btn-top {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
.btn-top button {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 30px;
  padding-right: 30px;
  color: white;
  border: 1px solid white;
  border-radius: 3px;
  background-color: transparent;
  cursor: pointer;
}
.btn-top button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.product-like {
  width: 90%;
  /* background-color: red; */
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.product-like .title {
  margin-top: 40px;
  margin-bottom: 40px;
  display: flex;
  justify-content: flex-start;
  /* background-color: red; */
  width: 100%;
  font-size: 30px;
}
.products-grid {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 50px;
  column-gap: 40px;
}
.grid-item {
  flex: 0 0 auto;
  width: 220px;
  height: 350px;
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
  color: black;
}
.grid-action .fa-cart-shopping {
  color: black;
}
.btn-best-seller {
  padding: 5px;
  font-size: 17px;
  border-radius: 4px;
  margin: 10px 0;
}
.btn-best-seller:hover,
.view-now:hover {
  background: #000;
  color: #fff;
}
.btn-best-seller i {
  vertical-align: middle;
}
.btn-show-more {
  padding: 5px;
  font-size: 17px;
  border-radius: 4px;
  margin: 30px 0px;
}
.btn-show-more:hover {
  background: #000;
  color: #fff;
}
@media (max-width: 768px) {
  .product-like {
    width: 97%;
  }
  .products-grid {
    row-gap: 40px;
    /* background-color: aqua; */
    column-gap: 5px;
  }
  .grid-item {
    flex: 0 0 auto;
    width: 175px;
    height: 330px;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.9);
  }
}
</style>
