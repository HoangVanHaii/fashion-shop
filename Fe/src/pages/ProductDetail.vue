<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "../components/Header.vue";
import { getImage, formatPrice, formatDateTime } from "../utils/format";
import type {
  ProductPayload,
  ProductColor,
  ProductSize,
  ProductSummary,
} from "../interfaces/product";
import type { ReviewOfProduct, Review } from "../interfaces/review";
import { useProductStore } from "../stores/productStore";
import { useReviewStore } from "../stores/reviewStore";
import { useCartStore } from "../stores/cartStore";
import Notification from "../components/Notification.vue";
import { useAuthStore } from "../stores/authStore";
import type { ShopDetal } from "../interfaces/user";
import Loading from "../components/Loading.vue";
import { useFavouriteStore } from "../stores/favourite";
import type { Cart, CartItemDetail, ShopCart } from "../interfaces/cart";

const favourite = useFavouriteStore();
const auth = useAuthStore();
const route = useRoute();
const cart = useCartStore();
const router = useRouter();
const review = useReviewStore();
const product = useProductStore();
const url_main = ref<string>();
const productId = ref<ProductPayload>();
const colorChose = ref<ProductColor>();
const sizeChose = ref<ProductSize>();
const quantity = ref<number>(1);
const listpProducts = ref<ProductSummary[]>();
const productOfShop = ref<ProductSummary[]>();
const filterReviews = ref<Review[]>();
const selectedRating = ref<number | null>(null);
const reviewProduct = ref<ReviewOfProduct>();
const showReview = ref<boolean>(false);
const indexImage = ref<number>(-1);
const showNotification = ref<boolean>(false);
const copied = ref<Boolean>(false);
const toastText = ref("");
const shop = ref<ShopDetal>();

const handleOrder = (size: ProductSize) => {
  const carttmp = {
    cart_item_id: 1,
    size_id: size.id,
    name: productId.value?.name,
    quantity: quantity.value,
    price: size.price,
    price_after_reduction: size.flash_sale_price,
    size: size.size,
    color: colorChose.value?.color,
    image_url: colorChose.value?.image_url,
    total_price: size.flash_sale_price ? size.flash_sale_price * quantity.value : size.price * quantity.value,
  } as CartItemDetail
  const carts: CartItemDetail[] = [];
  carts.push(carttmp);

  const shop = {
    shop_id: productId.value?.shop_id,
    shop_name: productId.value?.shop_name,
    carts: carts
  } as ShopCart;
  const shops: ShopCart[] = [];
  shops.push(shop);
  const cartPay = {
    shops: shops,
    total_quantity: 1,
    total_amount: carttmp.total_price
  } as Cart
  cart.cartPay = cartPay;
  router.push({ name: 'payment' });
}
const loadData = async () => {
  const id: number = parseInt(route.params.id as string);

  productId.value = await product.getProductByIdStore(id);
  colorChose.value = productId.value?.colors.find((cl) => cl.is_main == true);
  if (!colorChose.value) {
    colorChose.value = productId.value?.colors[0];
  }
  sizeChose.value = colorChose.value?.sizes[0];
  url_main.value = colorChose.value?.image_url;

  let result = await product.searchByCategoryStore(
    productId.value?.category_name || ""
  );
  listpProducts.value = result.filter((p) => p.id !== productId.value?.id);
  reviewProduct.value = await review.getReviewsByProductIdStore(id);
  filterReviews.value = reviewProduct.value?.Reviews;

  shop.value = await auth.getShopByidStore(productId.value?.shop_id || 3);
  let shopStore: ProductSummary[] = await product.getProductByShopStore(
    productId.value?.shop_id || 3
  );
  productOfShop.value = shopStore.filter((p) => p.id !== productId.value?.id);
};
onMounted(async () => {
  await loadData();
  favourite.getFavouriteOfMeStore();
});
watch(quantity, (newVal, oldVal) => {
  const max = sizeChose.value?.stock ?? Infinity;

  if (newVal < 1) {
    quantity.value = 1;
  } else if (newVal > max) {
    quantity.value = max;
  }
});
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      router.go(0);
    }
  }
);
const getUniqueSizes = () => {
  const getUniqueSizes = new Set<string>();
  productId.value?.colors.forEach((color) => {
    color.sizes.forEach((size) => {
      getUniqueSizes.add(size.size);
    });
  });
  return [...getUniqueSizes].join(" - ");
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
const handleFilter = async (rating: number | null) => {
  selectedRating.value = rating;
  // alert(rating);
  if (!reviewProduct.value) return;

  if (rating === null) {
    filterReviews.value = reviewProduct.value.Reviews;
  } else {
    filterReviews.value = reviewProduct.value.Reviews.filter(
      (review) => review.rating === rating
    );
  }
};
const handleIncre = () => {
  indexImage.value++;
  if (indexImage.value >= 4) {
    indexImage.value = -1;
  }
};
const hanlderDecre = () => {
  indexImage.value--;
  if (indexImage.value < -1) {
    indexImage.value = 3;
  }
};


const handleAddToCart = async (size: ProductSize) => {
  showNotification.value = false;
  toastText.value = "";
  await cart.addToCartStore(size.id!, quantity.value || 1);
  if (cart.success) {
    showNotification.value = true;
    toastText.value = "🛒 Thêm vào giỏ hàng thành công!";
  } else {
    toastText.value = cart.error || "❌ Thêm vào giỏ hàng thất bại!";
    showNotification.value = false;
  }
};
const toggleFavourite = async (id: number) => {
  if (favourite.isFavourite(id)) {
    await favourite.deleteFavouriteStore(id);
  } else {
    await favourite.addFavouriteStore(id);
  }
};
const copiedLink = () => {
  const path = route.fullPath;
  const baseUrl = window.location.origin;
  navigator.clipboard.writeText(baseUrl + path);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1000);
};
// const handleOrder(size: ProductSize){

// }
</script>

<template>
  <Header></Header>
  <Notification :text="toastText" :isSuccess="showNotification" />
  <Loading :loading="product.loading" />
  <div class="container" v-if="!product.loading">
    <div class="breadcrumb">
      <a href="/home" class="breadcrumb-item">Trang chủ</a>
      <span class="separator">|</span>
      <span
        class="breadcrumb-item active"
        @click="router.push('/CategoryGender?gender=Nam')"
        >{{ productId?.category_name }}</span
      >
      <span class="separator">|</span>
      <span class="breadcrumb-item active" id="product-name">{{
        productId?.name
      }}</span>
    </div>

    <div class="product-information">
      <div class="detail-image">
        <img :src="getImage(`${colorChose?.image_url}`)" class="detail" />
        <img
          v-for="image in colorChose?.images"
          :src="getImage(image)"
          class="detail"
        />
      </div>
      <div class="automatic-redirect-image">
        <button @click="hanlderDecre"><</button>
        <img
          :src="
            getImage(
              colorChose?.images![indexImage] || colorChose?.image_url || ''
            )
          "
          class="auto-image"
        />
        <button @click="handleIncre" style="right: 10px">></button>
      </div>
      <div class="main-image">
        <img :src="getImage(`${colorChose?.image_url}`)" class="main" />
      </div>

      <div class="infor">
        <h2>{{ productId?.name }}</h2>
        <span
          >Mã sản phẩm: <strong>19088{{ productId?.id }}</strong></span
        >
        <div class="price">
          <span class="txt">Giá:</span>
          <span class="old-price" v-if="sizeChose?.flash_sale_price">{{
            formatPrice(sizeChose?.price)
          }}</span>
          <span class="new-price">{{
            formatPrice(sizeChose?.flash_sale_price || sizeChose?.price || 0)
          }}</span>
        </div>
        <div class="size">
          <span class="txt">Kích thước: </span>
          <button
            class="btn-size"
            v-for="(size, index) in colorChose?.sizes"
            :key="index"
            :class="{ 'active-size': size === sizeChose }"
            @click="sizeChose = size"
          >
            {{ size.size }}
          </button>
        </div>
        <div class="color">
          <div class="name-color">
            <span class="txt">Màu sắc:</span>
            <span class="txt-color">{{ colorChose?.color }}</span>
          </div>
          <div class="other-color">
            <img
              class="img-color"
              v-for="(color, index) in productId?.colors"
              :key="index"
              :src="getImage(color.image_url)"
              alt=""
              :class="{ 'active-color': color == colorChose }"
              @click="
                (colorChose = color),
                  (sizeChose = colorChose.sizes[0]),
                  (quantity = 0),
                  (indexImage = -1)
              "
            />
          </div>
        </div>
        <div class="quantity">
          <span class="txt">Số lượng: </span>
          <div class="inc-dec-quantity">
            <button class="dec" @click="quantity = Math.max(quantity - 1, 1)">
              -
            </button>
            <input v-model="quantity" type="number" />
            <button
              class="dec"
              @click="quantity = Math.min(quantity + 1, sizeChose?.stock!)"
            >
              +
            </button>
          </div>
          <span v-if="sizeChose?.stock == 0" style="color: red">Hết hàng!</span>
          <span class="share"><i class="fa-solid fa-share"></i> Chia sẻ </span>
        </div>
        <div class="order-cart">
          <button
            class="cart"
            @click="handleAddToCart(sizeChose!)"
            :disabled="sizeChose?.stock == 0"
          >
            Thêm vào giỏ hàng
          </button>
          <button
            class="order"
            @click="handleOrder()"
            :disabled="sizeChose?.stock == 0"
          >
            Mua ngay
          </button>
        </div>
        <div class="share">
          <span class="share-with"
            ><i class="fa-solid fa-share"></i> Chia sẻ tới:
          </span>
          <i class="fa-brands fa-facebook-messenger"></i>
          <i class="fa-brands fa-facebook"></i>
          <i class="fa-brands fa-instagram"></i>
          <i class="fa-brands fa-twitter"></i>
          <span> hoặc </span>
          <i class="fa-solid fa-link" v-if="!copied" @click="copiedLink"></i>
          <i v-else class="fa-regular fa-copy"></i>
        </div>
      </div>
    </div>

    <div class="product" id="product-shop">
      <div class="shop">
        <div class="logo">
          <img
            :src="getImage(shop?.logo || '/upload/user/default-avatar.png')"
            alt=""
            class="img"
          />
        </div>
        <div class="shop-infor">
          <span class="title">{{ shop?.shop_name }}</span>
          <span>{{ shop?.description }}</span>
          <button
            @click="router.push({ name: 'shop', params: { id: shop?.id } })"
          >
            Xem shop
          </button>
        </div>
        <div class="shop-rating">
          <span class="txt">Xếp hạng</span>
          <div class="other-infor">
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
        <div class="visit-shop">
          <span>Số lượt truy cập</span>
          <div style="color: red; font-size: 18px">{{ shop?.visit_count }}</div>
        </div>
      </div>
      <div class="title">
        <h3>
          Ghé thăm sản phẩm của
          <strong style="color: red"> {{ shop?.shop_name }}</strong>
        </h3>
      </div>
      <div class="other-product">
        <div
          v-for="(product, index) in productOfShop?.slice(0, 5)"
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
            <img :src="getImage(`${product.thumbnail}`)" alt="productImage" />
          </div>
          <div class="promo-description">
            <div class="product-logo-color">
              <span class="logo">NAVA</span>
              <div class="list-color">
                <div
                  v-for="(value, index) in product.images"
                  :key="index"
                  class="item-image"
                >
                  <img :src="getImage(`${value}`)" alt="anhproduct" />
                </div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">
                <p>{{ product.name }}</p>
              </div>
              <div class="product-bottom">
                <div class="product-prices">
                  <span class="price-new">{{
                    formatPrice(product.min_price)
                  }}</span>
                  <span v-if="product.flash_price" class="price-old">{{
                    formatPrice(product.flash_price)
                  }}</span>
                </div>
                <div class="product-action">
                  <button><i class="fa-solid fa-cart-shopping"></i></button>
                  <button @click.stop="toggleFavourite(product.id)">
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
        <button class="btn-see-more-product">
          <i
            class="fa-solid fa-arrow-right"
            @click="router.push({ name: 'shop', params: { id: shop?.id } })"
          ></i>
        </button>
      </div>
    </div>
    <div class="product-detail">
      <div class="description-product">
        <span class="txt-des">Mô tả sản phẩm</span>
      </div>
      <span class="txt-info">Thông tin sản phẩm</span>
      <div class="information-detail">
        <ul>
          <li>Tên sản phẩm: {{ productId?.name }}</li>
          <li>
            Màu sắc:
            {{ productId?.colors.map((color) => color.color).join(" - ") }}
          </li>
          <li>Thông số size: {{ getUniqueSizes() }}</li>
          <li>Thể loại sản phẩm: {{ productId?.category_name }}</li>
        </ul>
      </div>
      <div class="detail-product">
        <div class="main">
          <span style="padding: 4px">Màu sắc thanh lịch</span>
          <img
            class="main-image"
            :src="getImage(colorChose?.image_url!)"
            alt=""
          />
        </div>
        <div class="detail-image">
          <img
            class="detail-1"
            :src="getImage(colorChose?.images![1] || '')"
            alt=""
          />
          <span>Chât liệu thoáng mát</span>
          <img
            class="detail-2"
            :src="getImage(colorChose?.images![2] || '')"
            alt=""
          />
        </div>
      </div>
      <div class="see-more">
        <button
          @click="showReview = true"
          v-if="!showReview"
          class="btn-see-more"
        >
          Xem thêm
        </button>
      </div>
    </div>
    <div class="feed-back" v-if="showReview">
      <span class="txt-feed-back">Đánh giá sản phẩm</span>
      <div class="filter-box">
        <div class="average-rating">
          <span class="number-rating">{{
            Math.round((reviewProduct?.average_rating ?? 0) * 10) / 10
          }}</span>
          <span>trên</span>
          <span class="max-rating">5</span>
        </div>
        <div class="filter-number-star">
          <button
            @click="handleFilter(null)"
            :class="{ actives: selectedRating === null }"
          >
            Tất cả
          </button>
          <button
            v-for="n in 5"
            :key="n"
            @click="handleFilter(n)"
            :class="{ actives: selectedRating === n }"
          >
            {{ n }} Sao
          </button>
        </div>
        <div class="rating-star">
          <span class="star-wrapper" v-for="n in 5" :key="n">
            <i class="fa-solid fa-star base-star"></i>
            <i
              class="fa-solid fa-star overlay-star"
              :style="{
                width: getStarFill(n, reviewProduct?.average_rating ?? 0) + '%',
              }"
            ></i>
          </span>
        </div>
      </div>
      <div class="main-feed-back">
        <div
          v-for="(reviewItem, index) in filterReviews"
          :key="index"
          class="review-item"
        >
          <div class="image-user">
            <img
              :src="getImage(reviewItem.user_image_url!)"
              alt=""
              class="img"
            />
          </div>
          <div class="content">
            <span
              ><strong>{{ reviewItem.user_name }}</strong></span
            >
            <div>
              <i
                class="fa-solid fa-star"
                v-for="n in 5"
                :key="n"
                :style="{
                  color:
                    n <= Math.round(reviewItem?.rating ?? 0)
                      ? 'rgb(255, 193, 7)'
                      : 'rgb(211, 211, 211)',
                }"
              ></i>
            </div>
            <span>{{ formatDateTime(reviewItem.created_at) }}</span>
            <span class="comment">{{ reviewItem.comment }}</span>
          </div>
          <div class="rev-img">
            <div v-for="(image, ind) in reviewItem.review_images" :key="ind">
              <img :src="getImage(image.image_url)" alt="" class="img-review" />
              <!-- <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review">
                            <img :src="getImage(image.image_url)" alt="" class="img-review"> -->
            </div>
          </div>
        </div>
        <div class="no-rev" v-if="reviewProduct?.total_reviews == 0">
          Chưa có đánh giá nào cho sản phẩm này
        </div>
      </div>
      <button @click="showReview = false" v-if="showReview" class="btn-close">
        Thu gọn
      </button>
    </div>
    <div class="product">
      <div class="title"><h3>Sản phẩm tương tự</h3></div>
      <div class="other-product">
        <div
          v-for="(product, index) in listpProducts?.slice(0, 5)"
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
            <img :src="getImage(`${product.thumbnail}`)" alt="productImage" />
          </div>
          <div class="promo-description">
            <div class="product-logo-color">
              <span class="logo">NAVA</span>
              <div class="list-color">
                <div
                  v-for="(value, index) in product.images"
                  :key="index"
                  class="item-image"
                >
                  <img :src="getImage(`${value}`)" alt="anhproduct" />
                </div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">
                <p>{{ product.name }}</p>
              </div>
              <div class="product-bottom">
                <div class="product-prices">
                  <span class="price-new">{{
                    formatPrice(product.min_price)
                  }}</span>
                  <span v-if="product.flash_price" class="price-old">{{
                    formatPrice(product.flash_price)
                  }}</span>
                </div>
                <div class="product-action">
                  <button><i class="fa-solid fa-cart-shopping"></i></button>
                  <button @click.stop="toggleFavourite(product.id)">
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
        <button class="btn-see-more-product">
          <i
            class="fa-solid fa-arrow-right"
            @click="router.push('/CategoryGender?gender=Nữ')"
          ></i>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.product-action button:hover {
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
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 8%;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f3f3f3;
}
.breadcrumb {
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-left: -7px;
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
.product-information {
  background-color: white;
  width: 90%;
  height: auto;
  padding: 10px;
  /* padding: 10px 60px; */
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
}

.detail-image {
  display: flex;
  flex-direction: column;
  width: 12%;
  height: auto;
  gap: 4px;
}
.detail {
  width: 100%;
  height: 140px;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); */
}
.main-image {
  width: 40%;
  height: auto;
  /* border: 1px solid black; */
}
.detail-product .main .main-image {
  .main-image {
    width: 40%;
    height: auto;
    border: none;
  }
}
.main {
  width: 100%;
  height: 84%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.infor {
  padding: 2px 5px;
}
.txt {
  font-weight: 100;
  font-size: 26px;
}
.price {
  margin-top: 20px;
  display: flex;
  gap: 40px;
  align-items: center;
}
.old-price {
  font-size: 24px;
  margin-left: 70px;
  text-decoration: line-through;
}
.new-price {
  font-size: 30px;
  color: red;
}
h2 {
  font-size: 30px;
}
.size {
  margin-top: 20px;
  display: flex;
  gap: 7px;
}
.btn-size {
  background: none;
  width: 14%;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 4px;
}
.active-size {
  border: 1px solid rgb(45, 235, 45);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.btn-size:hover {
  transform: translateY(-0.5px);
}
.color {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
.other-color {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  gap: 5px;
}
.img-color:hover {
  cursor: pointer;
  transform: translateY(-0.5px);
}
.name-color {
  display: flex;
  gap: 20px;
  align-items: end;
}
.txt-color {
  font-size: 30px;
}
.img-color {
  width: 35px;
  height: 40px;
  border: 1px solid rgb(207, 207, 207);
  border-radius: 3px;
}
.active-color {
  border: 1px solid rgb(51, 241, 51);
  border-radius: 3px;
}
.quantity {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  gap: 40px;
}
input {
  width: 26px;
  height: 20px;
  padding-left: 15px;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.dec {
  width: 30px;
  height: 26px;
  background: none;
  outline: none;
  border: 1px solid rgb(212, 212, 212);
}
.dec:hover {
  cursor: pointer;
  background-color: rgb(240, 240, 240);
}
.inc-dec-quantity {
  margin-top: 1px;
}
.order-cart {
  display: flex;
  gap: 14px;
  margin-top: 50px;
  justify-content: space-between;
}
.cart,
.order {
  height: 48px;
  width: 236px;
  border-radius: 10px;
  font-size: 18px;
}
.order:hover {
  cursor: pointer;
  transform: translateY(-0.5px);
  background-color: rgb(223, 18, 18);
}
.cart:hover {
  cursor: pointer;
  transform: translateY(-0.5px);
  background-color: rgb(254, 254, 254);
}
.order {
  background-color: rgb(235, 19, 19);
  color: white;
  border: none;
}
.cart {
  background-color: rgb(255, 255, 255);
  color: rgb(241, 40, 40);
  border: 1px solid rgb(216, 7, 7);
}
.share {
  margin-top: 40px;
  /* display: no; */
}
.quantity .share {
  display: none;
}
x .fa-facebook-messenger {
  margin-left: 4px;
  color: rgb(82, 216, 250);
}
.fa-facebook {
  margin-left: 4px;
  color: blue;
}
.fa-instagram {
  margin-left: 4px;
  color: rgb(165, 84, 240);
}
.fa-twitter {
  margin-left: 4px;
  background-color: rgb(48, 161, 236);
  color: white;
}
.product-detail {
  display: flex;
  flex-direction: column;
  padding: 0px 10px;
  width: 91%;
  margin: 0 auto;
  margin-top: 10px;
  background-color: white;
}
.description-product {
  width: 130px;
  padding: 3px;
  display: flex;
  justify-content: center;
  margin-top: 4px;
  border: 1px solid rgb(207, 206, 206);
  border-top: 3px solid #ff6b35;
}
.txt-info {
  font-size: 24px;
  font-weight: 545;
  margin-top: 20px;
}
.information-detail {
  margin-left: 10px;
  font-size: 19px;
}
.detail-product .detail-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 15%;
  height: 45%;
}
.detail-product .main-image {
  width: 100%;
  height: 94%;
}
.detail-product {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 400px;
  justify-content: center;
}
.detail-product .main {
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
  width: 20%;
  height: 80%;
  margin-top: 25px;
}
.detail-1,
.detail-2 {
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid black;
}
.detail-product .main .main-image {
  border: 1px solid black;
}
.see-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 5px;
}
.btn-see-more,
.btn-close {
  width: 150px;
  height: 25px;
  border-radius: 8px;
  background: none;
  text-decoration: underline;
  color: blue;
  margin-top: 10px;
  border: 0.2px solid rgb(122, 122, 122);
}
.btn-see-more {
  background-color: #fae7e7;
}
.btn-close {
  border: 1px solid rgb(189, 189, 189);
}
.btn-close:hover {
  cursor: pointer;
  background-color: white;
  transform: translateY(-0.5px);
}
.btn-see-more:hover {
  cursor: pointer;
  background-color: rgb(247, 247, 247);
  transform: translateY(-0.5px);
}
.other-product {
  width: 90%;
  /* background-color: #666; */
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  display: flex;
  gap: 20px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  margin-top: 20px;
}
.product-item {
  flex: 0 0 auto;
  width: 200px;
  height: 350px;
  background-color: rgb(246, 235, 235);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}
.product-item .product-image {
  width: 100%;
  height: 55%;
  border-radius: 2px;
}
.product-image img {
  width: 100%;
  height: 100%;
  border-radius: 2px;
}
.promo-description {
  width: 90%;
  height: 45%;
}

.promo-description .product-logo-color {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 20%;
}
.product-logo-color .logo {
  font-size: 11px;
  color: rgb(92, 85, 85);
}
.product-logo-color .list-color {
  display: flex;
  flex-direction: row;
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
.product-info {
  width: 100%;
  /* background-color: rgb(197, 67, 2); */
  height: 65%;
}
.product-name {
  width: 100%;
  height: 35%;
}
.product-name p {
  font-size: 16px;
}

.product-bottom {
  width: 100%;
  height: 35%;
  display: flex;
  flex-direction: row;
  margin-top: 10px;
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
  color: black;
  /* -webkit-text-stroke: 1px black; */
}
.product-action .fa-cart-shopping {
  color: black;
}
.product {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 30px;
  margin: 0 auto;
  margin-bottom: 50px;
  align-items: center;
  width: 92%;
  background-color: white;
  margin-top: 10px;
}
#product-shop {
  background-color: rgb(255, 247, 247);
}
.title {
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
}
h3 {
  font-size: 24px;
}
.btn-see-more-product {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: none;
  /* text-decoration: underline; */
  border: 1px solid rgb(189, 189, 189);
  color: black;
  font-size: 20px;
  margin-top: 150px;
  margin-left: 20px;
}
.btn-see-more-product:hover {
  cursor: pointer;
  background-color: rgb(247, 247, 247);
  transform: translateY(-0.5px);
}
.txt-feed-back {
  font-size: 24px;
  font-weight: 545;
  margin-top: 20px;
  margin-left: 66px;
}
.filter-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
  /* align-items: end; */
  justify-self: center;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 90%;
  border: 1px solid rgb(207, 206, 206);
  padding: 20px;
  background-color: hsl(0, 100%, 98%);
}
.average-rating {
  font-size: 18px;
  color: rgb(255, 39, 39);
}
.rating-star {
  margin-left: 2px;
}
.number-rating {
  font-size: 33px;
  font-weight: 500;
}
.average-rating span {
  margin-left: 5px;
}
.max-rating {
  font-size: 23px;
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
  left: 0;
}

.overlay-star {
  color: rgb(245, 20, 20);
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
}
.filter-number-star {
  padding: 5px;
  display: flex;
  gap: 25px;
}
.filter-number-star button {
  background-color: white;
  width: 70px;
  height: 30px;
  border: 1px solid rgb(189, 189, 189);
  font-size: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
  border-radius: 4px;
}
.filter-number-star button.actives {
  border: 1px solid rgb(247, 89, 89);
  font-weight: 400;
  color: rgb(255, 39, 39);
}
.review-item {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: left;
  gap: 15px;
  border-bottom: 1px solid rgb(207, 206, 206);
  padding: 15px 0px;
  width: 98%;
}
.feed-back {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.main-feed-back {
  display: flex;
  flex-direction: column;
  align-items: start;
  /* margin-bottom: 20px; */
  width: 93%;
  padding: 4px;
  background-color: white;
}
.image-user {
  width: 4%;
  height: auto;
  border-right: 1px solid rgb(163, 29, 29);
}
.img {
  width: 50px;
  height: 50px;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: auto;
}
.rev-img {
  display: grid;
  grid-template-columns: repeat(2, minmax(80px, 1fr));
  gap: 7px;
}
.img-review {
  width: 80px;
  height: 80px;
  margin-top: 10px;
  margin-right: 10px;
  border: 1px solid rgb(189, 189, 189);
}
.comment {
  margin-top: 5px;
  font-size: 18px;
  max-width: 500px;
}
.shop {
  padding: 5px;
  background-color: rgb(255, 237, 237);
  width: 91%;
  height: 80px;
  margin: 0 auto;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 5px;
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.shop-infor .title {
  font-weight: 600;
  font-size: 20px;
  margin-right: 7px;
}
.shop-infor button {
  border-radius: 5px;
  border: 1px solid rgb(173, 173, 173);
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.shop-infor button:hover {
  cursor: pointer;
  transform: translateY(-0.2px);
}
.shop .logo {
  border-right: 1px solid rgb(148, 148, 148);
  padding-right: 10px;
}
.shop .logo .img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.shop .shop-infor {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  /* margin: 10px; */
  gap: 5px;
  border-right: 1px solid rgb(148, 148, 148);
  padding-right: 10px;
  height: 80px;
}
.shop-rating {
  display: flex;
  flex-direction: row;
  gap: 15px;
  height: 80px;
  border-right: 1px solid rgb(148, 148, 148);
  justify-content: center;
  align-items: center;
  padding-right: 10px;
}
.visit-shop {
  display: flex;
  flex-direction: row;
  gap: 15px;
  height: 80px;
  border-right: 1px solid rgb(148, 148, 148);
  justify-content: center;
  align-items: center;
  padding-right: 10px;
}
.cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
.cart:disabled :hover {
  cursor: default;
  transform: translateY(0px);
  background-color: rgb(189, 189, 189);
}
.order:disabled {
  background-color: #f18f8f;
  cursor: not-allowed;
  opacity: 0.7;
}
.order:disabled :hover {
  cursor: default;
  transform: translateY(0px);
  background-color: rgb(189, 189, 189);
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .main {
    height: 80%;
  }
  .detail {
    width: 100px;
    height: 120px;
  }
  .order-cart {
    display: flex;
    gap: 8px;
    margin-top: 50px;
    justify-content: space-between;
  }
  .cart,
  .order {
    height: 48px;
    width: 206px;
    border-radius: 10px;
    font-size: 18px;
  }
}
@media (max-width: 1024px) {
  .main {
    height: 80%;
  }
  .detail {
    width: 100px;
    height: 120px;
  }
  .infor {
    width: 60%;
  }
  .product-information {
    width: 97%;
  }
  .order-cart {
    display: flex;
    gap: 8px;
    margin-top: 50px;
    justify-content: space-between;
  }
  .detail {
    width: 88px;
    height: 111px;
  }
  .cart,
  .order {
    height: 48px;
    width: 49%;
    border-radius: 10px;
    font-size: 16px;
  }
  h2 {
    font-size: 24px;
  }
  .txt {
    font-size: 21px;
  }
  .old-price {
    font-size: 20px;
    margin-left: 20px;
  }
  .new-price {
    font-size: 24px;
    color: red;
  }
  .btn-size {
    width: 12%;
    font-size: 14px;
  }
  .txt-color {
    font-size: 24px;
  }
  .img-color {
    width: 32px;
    height: 37px;
  }
  .product-detail {
    width: 97%;
  }
  .detail-product .main {
    width: 25%;
    height: 70%;
    margin-top: 25px;
    margin-right: 10px;
  }
  .detail-1,
  .detail-2 {
    height: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-left: 10px;
  }
  .filter-number-star {
    width: 60%;
    /* max-width: 450px; */
    overflow-y: auto;
    scrollbar-width: none;
    margin-left: 5px;
  }
  .filter-number-star button {
    width: auto;
    border: 1px solid rgb(189, 189, 189);
    font-size: 12px;
  }
  .star-wrapper {
    font-size: 15px;
    margin-top: 10px;
  }
  .image-user {
    width: 40px;
    height: auto;
    border-right: 1px solid rgb(163, 29, 29);
  }
  .image-user .img {
    width: 40px;
    height: 40px;
  }
}
@media screen and (max-width: 768px) {
  .visit-shop {
    display: none;
  }
  .shop-infor .title {
    font-size: 16px;
  }
  .shop-rating .txt {
    display: none;
  }
  .detail-image {
    display: none;
  }
  .main-image {
    display: none;
  }
  .automatic-redirect-image {
    display: flex;
    position: relative;
    width: 85%;
    height: 100%;
    margin: 0 auto;
  }
  .automatic-redirect-image button {
    position: absolute;
    top: 45%;
    background-color: rgba(255, 255, 255, 0.7);
    border: none;
    font-size: 24px;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    cursor: pointer;
  }
  .auto-image {
    width: 99%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .product-information {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    /* height: 500px; */
  }
  .container {
    margin-top: 21%;
  }
  .breadcrumb {
    margin-bottom: 0px;
  }
  .product-information {
    align-items: start;
  }
  .infor {
    width: 90%;
  }
  .share {
    display: none;
  }
  .quantity {
    justify-content: space-between;
  }
  .quantity .share {
    display: flex;
    margin-top: 6px;
    color: blue;
  }

  .order-cart {
    flex-direction: column;
    gap: 10px;
    width: 100%;
    /* margin: 10px auto; */
    margin-top: 20px;
    margin-left: 10px;
  }
  .order-cart .cart,
  .order {
    width: 100%;
  }
  .txt-color {
    font-size: 20px;
  }
  .information-detail {
    font-size: 19px;
  }
  .detail-product {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 400px;
    /* justify-content: center; */
  }
  .detail-product .main {
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    /* align-items: center; */
    width: 40%;
    height: 60%;
    margin-top: 25px;
  }
  .detail-product .main .main-image {
    display: flex;
    /* width: 35%;
            height: 70%; */
  }
  .detail-product .detail-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    height: 40%;
    margin-left: 10px;
  }
  .filter-number-star {
    overflow-y: auto;
    max-width: 300px;
    scrollbar-width: none;
    background-color: rgb(255, 255, 255);
  }
  .average-rating {
    font-size: 14px;
    display: none;
    margin-top: 10px;
  }
  .filter-box {
    flex-direction: row-reverse;
  }
  .filter-number-star button {
    width: auto;
    border: 1px solid rgb(189, 189, 189);
    font-size: 10px;
  }
  .image-user {
    width: 45px;

    height: auto;
  }
  .image-user .img {
    width: 40px;
    height: 40px;
  }
  .title h3 {
    font-size: 20px;
  }
  .product-item {
    width: 146px;
    height: 280px;
  }
  .list-color {
    gap: 2px;
  }
  .list-color .item-image {
    width: 20px;
    height: 20px;
  }
  .product-name p {
    font-size: 14px;
  }
  .product-bottom .product-prices span {
    font-size: 14px;
  }
  .other-product {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .product {
    width: 99%;
  }
}
</style>
