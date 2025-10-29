<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { voucherStore } from "../stores/voucherStore";
import { formatDateTime, formatPrice, getImage } from "../utils/format";
const useVoucher = voucherStore();
import type { Voucher } from "../interfaces/voucher";
import { useCartStore } from '../stores/cartStore'
import Notification from '../components/Notification.vue';

const cartStore = useCartStore() 
const vouhers = ref<Voucher[]>([]);
const selectedVoucher = ref<number>();
const voucherDetail = ref<Voucher | null>(null);

onMounted(async () => {
  vouhers.value = await useVoucher.getAllVoucherStore();
});
const check = ref<Boolean>(false);
const textSearch = ref<string>("");
const isValid = computed(() => {
  check.value = false;
  voucherDetail.value = null;
  return textSearch.value?.length > 3;
});
const emit = defineEmits(["close","selected"]);
const handleClose = () => {
  emit("close");
};
const handleSearchVoucher = async () => {
  check.value = true;
  voucherDetail.value = await useVoucher.getVoucherByCodeStore(
    textSearch.value
  );
};

const handleOK = () => {
  const voucher = vouhers.value.find(v => v.id === selectedVoucher.value) || 
                  (voucherDetail.value && voucherDetail.value.id === selectedVoucher.value
                    ? voucherDetail.value
                    : null);

  if (voucher) {
    console.log( voucher.code)
    emit("selected", voucher.code,voucher.shop_id); 
  } else {
    console.warn("Bạn chưa chọn voucher nào!");
  }

  handleClose(); 
};


const isEligible = (voucher: Voucher) => {
  if (voucher.scope === 'GLOBAL') {
    return cartStore.total_price_after_reduction >= voucher.min_order_value;
  }
  else if(voucher.scope === 'SHOP' && voucher.shop_id){
    const shop = cartStore.shops.find(s => s.shop_id === voucher.shop_id);
    if (!shop) return false;
    const total = shop.total_shop || 0
    return total >= voucher.min_order_value
  }
  return false
};

</script>
<template>
  <!-- <Notification :text="toastText" :isSuccess="showNotification" /> -->
  <div class="modal" @click="handleClose">
    <div class="container" @click.stop>
      <div class="title">
        <span>Chọn Voucher</span>
      </div>
      <div class="content">
        <div class="search">
          <span>Mã voucher</span>
          <div class="acctions">
            <input
              type="text"
              v-model="textSearch"
              placeholder="Nhập mã voucher"
            />
            <button :disabled="!isValid" @click="handleSearchVoucher">
              Áp dụng
            </button>
          </div>
        </div>
        <div v-if="voucherDetail" class="voucher">
          <div class="voucher-image">
            <img :src="getImage(voucherDetail.image_url)" alt="" />
          </div>
          <div class="description">
            <span class="des">{{ voucherDetail.description }}</span>
            <span class="des-min"
              >Đơn tối thiểu
              {{ formatPrice(voucherDetail.min_order_value) }}</span
            >
            <div class="expiry-terms">
              <span class="expiry"
                ><i class="fa-solid fa-clock"></i> HSD:
                {{ formatDateTime(voucherDetail.end_date) }}</span
              >
              <span class="terms">Điều kiện</span>
            </div>
          </div>
          <div class="select">
            <input
              type="radio"
              :value="voucherDetail.id"
              name="voucher_select"
              v-model="selectedVoucher"
            />
          </div>
        </div>
        <div v-if="check && !voucherDetail" class="notification">
          <span class="failed1"
            >Rất tiếc, mã voucher bạn nhập không hợp lệ hoặc đã hết hạn sử dụng.
            Vui lòng kiểm tra lại.</span
          ><br />
          <span class="failed2"
            >Xem xét các voucher tương tự có sẵn bên dưới.</span
          >
        </div>
        <div class="list-voucher" v-if="!voucherDetail">
          <div v-for="voucher in vouhers" class="voucher" :class="{ 'disabled-voucher': !isEligible(voucher) }">
            <div class="voucher-image">
              <img :src="getImage(voucher.image_url)" alt="" />
            </div>
            <div class="description">
              <span class="des">{{ voucher.description }}</span>
              <span class="des-min"
                >Đơn tối thiểu {{ formatPrice(voucher.min_order_value) }}</span
              >
              <div class="expiry-terms">
                <span class="expiry"
                  ><i class="fa-solid fa-clock"></i> HSD:
                  {{ formatDateTime(voucher.end_date) }}</span
                >
                <span class="terms">Điều kiện</span>
              </div>
            </div>
            <div class="select">
              <input
                type="radio"
                :value="voucher.id"
                name="voucher_select"
                v-model="selectedVoucher"
                :disabled="!isEligible(voucher)"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="btn">
        <button class="btn-back" @click="handleClose">Trở lại</button>
        <button class="btn-ok" @click="handleOK">OK</button>
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
  /* background-color: antiquewhite; */
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  width: 450px;
  height: 600px;
  background-color: #ffffff;
  display: flex;
  gap: 10px;
  flex-direction: column;
  /* justify-content: center; */
  align-items: center;
}
.title {
  width: 90%;
  /* background-color: yellow; */
  height: 7%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #333;
}
.title span {
  font-size: 20px;
}
.content {
  /* background-color: rgb(152, 152, 245); */
  width: 90%;
  height: 80%;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
  gap: 30px;
  /* align-items: center; */
}
.search {
  /* background-color: rebeccapurple; */
  width: 95%;
  height: 10%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background-color: #f4f2f2;
}
.search .acctions {
  padding-top: 6px;
  padding-bottom: 6px;
  display: flex;
  gap: 5px;
}
.acctions input {
  font-size: 17px;
  border-radius: 4px;
}
.acctions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
  transition: all 0.3s;
  border-radius: 2px;
}

.acctions button:not(:disabled) {
  background-color: red;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 2px;
}
.notification .failed1 {
  color: red;
}
.notification .failed2 {
  color: blue;
  font-size: 18px;
}

.list-voucher {
  height: auto;
  display: flex;
  flex-direction: column;
  /* background-color: aquamarine; */
  /* justify-content: center; */
  row-gap: 15px;
  overflow-y: auto;
  align-items: center;
  scrollbar-width: none;
}
.voucher {
  width: 95%;
  height: 100px;
  background-color: rgb(229, 227, 227);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  padding: 0 5px;
  border: 1px solid #e5e4e4;
}
.voucher-image {
  width: 95px;
  height: 95px;
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
  width: 60%;
  height: 95px;
  gap: 10px;
  justify-content: center;
  /* align-items: center; */
  /* background-color: blue; */
}
.description .des {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.description .des-min {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expiry-terms {
  display: flex;
  flex-direction: row;
  /* background-color: red; */
  justify-content: space-between;
}
.expiry-terms .expiry {
  color: #979696;
  width: 70%;
  /* background-color: #e5e4e4; */
  font-size: 14px;
}
.expiry-terms .terms {
  font-size: 13px;
  color: blue;
}
.select input {
  width: 20px;
  height: 20px;
}
input {
  padding: 3px;
  border: none;
  border: 0.3px solid rgb(145, 145, 145);
  outline: none;
}
.btn {
  bottom: 10px;

  width: 90%;
  /* background-color: yellowgreen; */
  display: flex;
  flex-direction: row;
  /* justify-items: end; */
  justify-content: end;
  gap: 10px;
  /* padding: 0 5px; */
  /* height: 5%; */
  margin-right: 20px;
}
.btn button {
  width: 90px;
  padding: 4px;

  border-radius: 3px;
}
.btn-back {
  background-color: transparent;
  border: solid 1px #979696;
  cursor: pointer;
}
.btn-ok {
  border: none;
  background-color: red;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.disabled-voucher {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.7);
}

@media (max-width: 768px) {
  .container {
    width: 350px;
    height: 450px;
  }
  .title span {
    font-size: 15px;
  }
  .acctions input {
    font-size: 12px;
    padding: 4px 0;
    text-align: start;
  }
  .search span {
    font-size: 13px;
  }
  .description .des {
    font-size: 13px;
  }
  .description .des-min {
    font-size: 12px;
  }
  .expiry-terms .expiry,
  .expiry-terms .terms {
    font-size: 11px;
  }
  .select input {
    width: 14xpx;
    height: 14px;
  }

}
</style>
