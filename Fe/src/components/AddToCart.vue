<script setup lang="ts">
import { getImage } from "../utils/format";
import type {
  ProductColor,
  ProductSize,
  ProductPayload,
} from "../interfaces/product";
import { formatPrice } from "../utils/format";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cartStore";
import Notification from "./Notification.vue";
const router = useRouter();
const emit = defineEmits(["close"]);
const loading = ref(false);
const handleClose = () => {
  emit("close");
};
const colorChose = ref<ProductColor>();
const sizeChose = ref<ProductSize>();
const image_main = ref<string>();
const ind = ref<number>(-1);
const quantity = ref(1);
const cart = useCartStore();
const showNotification = ref<boolean>(false);

onMounted(async () => {
  colorChose.value = props.product.colors.find((color) => color.is_main);
  if (!colorChose.value) {
    colorChose.value = props.product.colors[0];
  }
  sizeChose.value = colorChose.value?.sizes[0];
  image_main.value = colorChose.value?.image_url;
});
const preImage = () => {
  ind.value = ind.value - 1;
  if (ind.value === -1) {
    image_main.value = colorChose.value?.image_url;
    return;
  }
  if (ind.value < -1) {
    ind.value = 2;
  }
  image_main.value = colorChose.value?.images![ind.value];
};
const nextImage = () => {
  ind.value = ind.value + 1;
  if (ind.value === 3) {
    ind.value = -1;
    image_main.value = colorChose.value?.image_url;
    return;
  }
  image_main.value = colorChose.value?.images![ind.value];
};
const handleFormatQuantity = () => {
  if (quantity.value < 1) {
    quantity.value = 1;
  }
};
const toastText = ref("");
const handleAddToCart = async (size: ProductSize) => {
    showNotification.value = false;
    toastText.value = "";
    const login = localStorage.getItem('accessToken') ? true : false;
    if (!login) {
        setTimeout(() => {
            toastText.value = "❌ Vui lòng đăng nhập để thêm vào giỏ hàng!";
        }, 0)        
        return;
    }
    if (loading.value) return;
    loading.value = true;
    await cart.addToCartStore(size.id!, quantity.value || 1);
    if (cart.success) {
        showNotification.value = true;
        toastText.value = "🛒 Thêm vào giỏ hàng thành công!";
        setTimeout(() => {
            loading.value = false;
            handleClose();
        },1600);
    } else {
        toastText.value = cart.error || "❌ Thêm vào giỏ hàng thất bại!";
        showNotification.value = false;
    }
};

const props = defineProps<{ product: ProductPayload }>();
</script>

<template>
  <div class="modal" @click="handleClose">
    <div class="container" @click.stop>
      <div class="product-image">
        <div class="main-image">
          <button class="btn btn-prev" @click="preImage()"><</button>
          <button class="btn btn-close" @click="handleClose">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <img :src="getImage(`${image_main}`)" alt="" />
          <button class="btn btn-next" @click="nextImage()">></button>
        </div>
        <div class="item-images">
          <div
            class="image"
            @click="(image_main = colorChose?.image_url), (ind = -1)"
          >
            <img :src="getImage(`${colorChose?.image_url}`)" />
          </div>
          <div
            class="image"
            v-for="(img, index) in colorChose?.images"
            @click="(image_main = img), (ind = index)"
          >
            <img :src="getImage(img)" alt="" />
          </div>
        </div>
      </div>
      <div class="product-content">
        <div class="product-description">
          <span class="name">{{ props.product?.name }}</span>
          <span class="code">Mã sản phẩm: 1900{{ product.id }}</span>
        </div>
        <div class="product-prices">
          <span>Giá:</span>
          <span class="new-price">{{
            sizeChose?.flash_sale_price
              ? formatPrice(sizeChose.flash_sale_price)
              : formatPrice(sizeChose?.price || 0)
          }}</span>
          <span class="old-price" v-if="sizeChose?.flash_sale_price">{{
            formatPrice(sizeChose?.price)
          }}</span>
        </div>
        <div class="product-sizes">
          <span class="text-size">Kích thước: </span>
          <div class="list-size">
            <div
              v-for="size in colorChose?.sizes"
              class="size"
              :class="{ 'active-size': size === sizeChose }"
              @click="sizeChose = size"
            >
              {{ size.size }}
            </div>
          </div>
        </div>
        <div class="product-colors">
          <div class="text-color">
            <span>Màu sắc: </span>
            <span class="text">{{ colorChose?.color }}</span>
          </div>
          <div class="list-color" >
            <div
              v-for="color in props.product.colors"
              class="color"
              :class="{ 'active-color': color === colorChose }"
              @click="
                (colorChose = color),
                  (sizeChose = colorChose?.sizes[0]),
                  (image_main = colorChose?.image_url),
                  (quantity = 1)
              "
            >
              <img :src="getImage(color.image_url)" alt="" />
            </div>
          </div>
          <div class="product-quantity">
            <span>Số lượng: </span>
            <div class="btn-quantity">
              <button class="dec" @click="quantity = Math.max(quantity - 1, 1)">
                -
              </button>
              <input
                v-model="quantity"
                type="number"
                @keyup.enter="handleFormatQuantity"
              />
              <button
                class="dec"
                @click="quantity = Math.min(quantity + 1, sizeChose?.stock!)"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div class="btn-bottom">
          <div class="btn-addtocart">
            <button
              @click="handleAddToCart(sizeChose!)"
              :class="(sizeChose?.stock! ) <= 0 ? 'stock' : ''"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
          <Notification :text="toastText" :isSuccess="showNotification" />

          <div class="share">
            <span class="share-with"
              ><i class="fa-solid fa-share"></i> Chia sẻ tới:
            </span>
            <i class="fa-brands fa-facebook-messenger"></i>
            <i class="fa-brands fa-facebook"></i>
            <i class="fa-brands fa-instagram"></i>
            <i class="fa-brands fa-twitter"></i>
          </div>
          <button
            class="btn-detail"
            @click="
              router.push({
                name: 'product-detail',
                params: { id: product.id },
              })
            "
          >
            Xem chi tiết sản phẩm >>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.container {
  position: fixed;
  width: 600px;
  height: 400px;
  border-radius: 4px;
  padding: 10px;
  background-color: white;
  display: flex;
  transform: translateY(30px);
  flex-direction: row;
}
.product-image {
  /* background-color: aqua; */
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* gap: 10px; */
  justify-content: space-between;

  /* padding: 3px; */
}
.main-image {
  position: relative;
  width: 95%;
  /* background-color: red; */
  height: 77%;
  border: solid 1px #e9e7e7;
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn {
  position: absolute;
  top: 50%;
  font-size: 20px;
  background-color: rgb(215, 215, 215);
  border-radius: 5px;
  padding: 1px 3px;
  transform: translateY(-50%);
  color: black;
  z-index: 10;
  cursor: pointer;
  border: 0.3px solid #333;
}
.btn-close {
  display: none;
}
.btn:hover {
  background-color: rgb(255, 255, 255);
}
.btn-prev {
  left: 10px;
}
.btn-close {
  right: 0px;
  top: 10px;
}
.btn-next {
  right: 10px;
}
.main-image img {
  width: 95%;
  height: 95%;
}
.item-images {
  /* background-color: blue; */
  width: 95%;
  height: 20%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ccc;
}
.image {
  width: 65px;
  height: 65px;
  cursor: pointer;
}
.image img {
  width: 100%;
  height: 100%;
}
.product-content {
  display: flex;
  width: 45%;
  padding: 10px;
  flex-direction: column;
  gap: 5px;
  /* background-color: aqua; */
}
.product-description {
  width: 100%;
  height: 15%;
  /* background-color: antiquewhite; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}
.product-description .code {
  font-size: 13px;
}
.product-prices {
  width: 100%;
  height: 7%;
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  gap: 20px;
  align-items: center;
  /* background-color: red; */
}
.old-price {
  font-size: 15px;
  /* display: flex;
    justify-content: center;
    align-items: center; */
  text-decoration: line-through;
}
.new-price {
  color: red;
}
.product-sizes {
  width: 100%;
  height: 25%;
  display: flex;
  flex-direction: row;
  align-items: center;
  /* background-color: rgb(138, 138, 227); */
}
.text-size {
  width: 35%;
  /* background-color: antiquewhite; */
}
.list-size {
  width: 65%;
  /* background-color: aquamarine; */
  display: flex;
  flex-direction: row;
  /* collum-gap: 15px; */
  column-gap: 15px;
  row-gap: 10px;
  flex-wrap: wrap;
}
.size {
  width: 40px;
  height: 25px;
  /* background-color: red; */
  border: 1px solid;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.active-size {
  border: 1px solid rgb(45, 235, 45);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
}

.product-colors {
  display: flex;
  flex-direction: column;
  /* background-color: rgb(122, 122, 218); */
  width: 100%;
  height: 25%;
}
.text-color {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 20%;
  /* background-color: rgb(0, 255, 81); */
  gap: 15px;
}
.text-color .text {
  color: rgb(74, 73, 73);
}
.list-color {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  height: 50%;
  /* background-color: rgb(234, 234, 145); */
  align-items: center;
}
.color {
  width: 30px;
  height: 30px;
  /* background-color: red; */
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
}
.color img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
}
.active-color {
  border: 1px solid rgb(45, 235, 45);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.4);
}
.product-quantity {
  display: flex;
  flex-direction: row;
  gap: 15px;
  /* align-items: center; */
  margin-top: 5px;
  margin-bottom: 5px;
}

/* .quantity{
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    gap: 40px
} */
.btn-quantity {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  justify-items: center;
  gap: 1px;
  /* background-color: yellow; */
}

input {
  width: 24px;
  height: 17px;
  border: 1px solid #333;
  text-align: center;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input:focus {
  outline: none;
  border: 1px solid #007bff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}
.dec {
  width: 23px;
  height: 21px;
  background: none;
  border: 1px solid rgb(190, 189, 189);
}
.dec:hover {
  cursor: pointer;
  border: solid 1px red;
}
.btn-bottom {
  /* background-color: rgb(101, 220, 101); */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 23%;
  justify-content: space-between;
}
.btn-addtocart {
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.btn-addtocart .stock {
  background-color: #878282;
  pointer-events: none;
}
.btn-addtocart button {
  font-size: 13px;
  width: 60%;
  height: 27px;
  border-radius: 3px;
  color: white;
  background-color: red;
  border: none;
  cursor: pointer;
}
.share {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}
.fa-facebook-messenger {
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
  /* background-color: rgb(48, 161, 236); */
  color: white;
}
.btn-detail {
  color: rgb(48, 46, 46);
  background-color: transparent;
  border: none;
  text-decoration: underline;
  cursor: pointer;
}
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    /* align-items: center; */
    width: 330px;
    height: 550px;
  }
  .item-images {
    display: none;
  }
  .product-image {
    width: 100%;
    height: 60%;
  }
  .main-image {
    width: 100%;
    height: 100%;
    /* position: relative;
        display: flex;
        justify-content: center; */
  }

  .product-content {
    width: 94%;
    height: 40%;
    /* background-color: aquamarine; */
    gap: 2px;
  }
  .product-description {
    gap: 2px;
    /* background-color: #333; */
  }
  .product-description .name {
    font-size: 19px;
  }
  .code {
    display: none;
  }
  .product-prices {
    width: 100%;
    /* background-color: #ccc; */
    height: 15%;
    justify-content: flex-start;
    /* background-color: #007bff; */
  }
  input {
    border: 1px solid #333;
  }
  .product-sizes {
    width: 100%;
    height: 10%;
    /* background-color: antiquewhite; */
    /* background-color: aqua; */
  }
  .list-size {
    column-gap: 20px;
    row-gap: 10px;
  }
  .product-colors {
    height: 40%;
    /* background-color: greenyellow; */
  }
  .text-color {
    height: 25%;
    /* background-color: red; */
  }
  .product-description span {
    font-size: 12px;
  }
  .text-size {
    font-size: 16px;
  }
  .list-size{
    gap: 8px;
  }
  .size {
    width: 30px;
    height: 15px;
  }
  .product-colors {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .btn-bottom {
    height: 10%;
  }
  .color {
    width: 25px;
    height: 25px;
  }
  .share {
    display: none;
  }

  .btn-close {
    display: flex;
    background-color: rgb(224, 221, 221);
    color: rgb(210, 141, 141);
    font-size: 15px;
  }
  .btn-bottom {
    margin-top: 4px;
    height: 25%;
    gap: 5px;
    }
    .btn-addtocart button {
        font-size: 12px;
        width: 50%;
        height: 23px;
    }
    .size{
        font-size: 13px;
    }
    .btn-detail {
        font-size: 10px;
    }
}
@media (max-width: 420px) {
  .container {
    width: 240px;
    height: 400px;
  }
  .product-image {
    width: 100%;
    height: 55%;
  }
  .product-content {
    height: 45%;
  }
  .product-description {
    gap: 2px;
  }
  .product-description .name {
    font-size: 14px;
  }
  .product-prices span{
    font-size: 12px;
  }
  input {
    border: 0.5px solid #5b5959;
  }
  .product-sizes {
    width: 100%;
    height: 10%;
  }
  .list-size {
    column-gap: 20px;
    row-gap: 10px;
  }
  .product-colors {
    height: 40%;
    /* background-color: greenyellow; */
  }
  .text-color {
    height: 25%;
    /* background-color: red; */
  }
  .product-description span {
    font-size: 12px;
  }
  .text-size {
    font-size: 16px;
  }
  .list-size {
    column-gap: 6px;
    row-gap: 2px;
    }
  .size {
    width: 20px;
    height: 12px;
  }
  .product-colors {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .color {
    width: 25px;
    height: 25px;
  }
  .share {
    display: none;
  }

  .btn-close {
    display: flex;
  }
  .btn-bottom {
    margin-top: 10px;
    height: 20%;
    gap: 1px;
}
.btn-addtocart button {
    font-size: 9px;
    width: 45%;
    height: 15px;
    /* padding: 1px; */
}
.btn-detail {
    font-size: 8px;
}
}
</style>
