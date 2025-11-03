<script setup lang="ts">
import { ref,computed,defineProps, defineEmits,onMounted } from 'vue';
import { useReviewStore } from "../stores/reviewStore";
import type { OrderItemDetail } from '../interfaces/order';
import Notification from "../components/Notification.vue";
import { getImage } from "../utils/format";
import type { Review } from '../interfaces/review';
import Loading from './Loading.vue';

const props = defineProps<{
  orderItem: OrderItemDetail
}>();

const existingReview = ref<Review|null>(null); 
const isReadonly = ref(false);

onMounted(async()=>{
    console.log(props.orderItem.id)
    const res = await reviewStore.getReviewsByOrderItemIdOfMeStore(props.orderItem.id!);
    console.log("Full response:", res)
    if (res && Array.isArray(res) && res.length > 0){
        existingReview.value = res[0];
        console.log(`gia tri lay duoc: ${existingReview.value}`)
        isReadonly.value = true;
    }
    else {
        isReadonly.value = false;
    }
})

const emit = defineEmits(["close"]);
const handleClose = () => {
  emit("close");
};

const reviewStore = useReviewStore();
const textToast = ref("");
const showNotification = ref(false);
const comment = ref("");
const rating = ref(1);
const reviewImages = ref<File[]>([]);

const fileInput = ref<HTMLInputElement | null>(null);

const ratingTextColor = (r: number) => {
    return r >= 4 ? '#f6a700' : '#333';
};

const ratingText = (r: number) => {
    switch(r) {
        case 1: return "Tệ";
        case 2: return "Không hài lòng";
        case 3: return "Bình thường";
        case 4: return "Hài lòng";
        case 5: return "Tuyệt vời";
        default: return "";
    }
};

const getImageUrl = (file: File) => window.URL.createObjectURL(file);

const selectRating = (r: number) => {
    rating.value = r;
};

const openFileDialog = () => {
    fileInput.value?.click();
};

const isMaxImages = computed(() => reviewImages.value.length >= 4);

const handleUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const files = Array.from(target.files);
        const remainingSlots = 4 - reviewImages.value.length; 
        if (remainingSlots <= 0) return;
        reviewImages.value.push(...files.slice(0, remainingSlots));
    }
};

const removeImage = (index: number) => {
    reviewImages.value.splice(index, 1);
};

const handleSubmit = async () => {
    textToast.value=""
    if (!comment.value && reviewImages.value.length === 0) {
        textToast.value="Vui lòng nhập nội dung"
        showNotification.value=false
        return;
    }

    try {
        console.log("Submit Review data:", {
        order_item_id:props.orderItem.id,
        rating:rating.value,
        comment:comment.value,
        reviewImages:reviewImages.value
        });
        await  reviewStore.createReviewStore({
            order_item_id: props.orderItem.id!,
            rating: rating.value,
            comment: comment.value,
            review_images: reviewImages.value
        });
        textToast.value="Đánh giá thành công"
        showNotification.value=true

        comment.value = "";
        rating.value = 0;
        reviewImages.value = [];

        setTimeout(() => {
            handleClose();
        }, 1900);
    } catch (error) {
        textToast.value="Comment phải lớn hơn 10 kí tự"
        showNotification.value=false
    }
};
</script>

<template>
  <Loading :loading="reviewStore.loading" />
  <Notification :text="textToast" :isSuccess="showNotification" />
  <div class="review-overlay">
    <div class="review-modal">
      <h3>{{ isReadonly ? 'Đánh Giá Của Bạn' : 'Đánh Giá Sản Phẩm' }}</h3>

      <div class="header">
        <img :src="getImage(props.orderItem.image_url)" />
        <div class="species">
          <span>{{ props.orderItem.product_name }}</span>
          <span>Phân loại hàng: {{ props.orderItem.color }}, {{ props.orderItem.size }}</span>
        </div>
      </div>

      <div class="quality">
        <span>Chất lượng sản phẩm</span>
        <div class="star">
          <i 
            v-for="i in 5" 
            :key="i" 
            class="fa-solid fa-star star-item"
            :class="{ 
              filled: isReadonly ? i <= (existingReview?.rating || 0) : i <= rating, 
              outlined: isReadonly ? i > (existingReview?.rating || 0) : i > rating 
            }"
            @click="!isReadonly && selectRating(i)"
          ></i>
          <span :style="{ color: ratingTextColor(isReadonly ? (existingReview?.rating || 0) : rating) }">
            {{ ratingText(isReadonly ? (existingReview?.rating || 0) : rating) }}
          </span>
        </div>
      </div>

      <div class="comment">
        <textarea 
          v-if="!isReadonly"
          v-model="comment" 
          placeholder="Hãy chia sẻ những phản hồi của bạn về sản phẩm này với những người mua khác nhé.">
        </textarea>
        
        <div v-else class="review-text">
          {{ existingReview?.comment }}
        </div>

        <div v-if="isReadonly && existingReview?.review_images && existingReview.review_images.length > 0" class="btn-upload">
          <div class="preview-images">
            <div v-for="(img, index) in existingReview?.review_images" :key="index" class="preview-item">
              <img :src="getImage(img.image_url)" />
            </div>
          </div>
        </div>

        <div v-if="!isReadonly" class="btn-upload">
          <button 
            @click="openFileDialog" 
            :disabled="isMaxImages"
            :style="{ opacity: isMaxImages ? 0.5 : 1, cursor: isMaxImages ? 'not-allowed' : 'pointer' }"
          >
            <i class="fa-solid fa-camera"></i>
            <span>Thêm hình ảnh</span>
          </button>

          <div class="preview-images">
            <div v-for="(img, index) in reviewImages" :key="index" class="preview-item">
              <img :src="getImageUrl(img)" />
              <button class="remove-btn" @click="removeImage(index)">×</button>
            </div>
          </div>
        </div>

        <input 
          type="file" 
          multiple 
          accept="image/*" 
          ref="fileInput" 
          style="display:none" 
          @change="handleUpload"
        />
      </div>

      <div class="footer">
        <button @click="handleClose">{{ isReadonly ? 'Đóng' : 'Trở lại' }}</button>
        <button v-if="!isReadonly" @click="handleSubmit" class="submit-btn">Hoàn Thành</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.review-modal {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.review-modal h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
}

.header {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
}

.header img {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #333;
}

.species {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
}

.species span:first-child {
    font-weight: 500;
    color: #333;
}

.species span:last-child {
    font-size: 14px;
    color: gray;
}

.quality {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 16px;
}

.quality span:first-child {
    font-weight: 500;
    color: #333;
}

.quality span:last-child {
    padding-left: 8px;
}

.star {
    display: flex;
    align-items: center;
    gap: 4px;
}

.star-item {
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    color: transparent;
    -webkit-text-stroke: 1px #f6a700;
}

.star-item.filled {
    color: #f6a700;
    -webkit-text-stroke: 0px;
}

.star-item:hover {
    transform: scale(1.15);
}

.comment {
    background-color: rgb(245, 245, 245);
    border-radius: 8px;
    padding: 16px;
}

.comment textarea {
    width: 95%;
    height: 100px;
    border: none;
    border-radius: 6px;
    padding: 12px;
    outline: none;
    resize: none;
    font-family: inherit;
    background-color: white;
    color: #333;
}

.review-text {
    min-height: 100px;
    padding: 12px;
    background-color: white;
    border-radius: 6px;
    line-height: 1.6;
    word-break: break-word;
    color: #333;
}

.btn-upload {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.btn-upload button {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #ee4d2d;
    color: #ee4d2d;
    background-color: rgb(249, 240, 240);
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
}

.btn-upload button:hover:not(:disabled) {
    background-color: #ee4d2d;
    color: white;
}

.btn-upload button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-upload i {
    font-size: 16px;
}

.preview-images {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.preview-item {
    position: relative;
    width: 60px;
    height: 60px;
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.preview-item .remove-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 12px;
}

.preview-item .remove-btn:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.footer button {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid #ccc;
    background-color: white;
    color: black;
}

.footer button:hover {
    background-color: #f5f5f5;
}

.footer button.submit-btn {
    background-color: #ee4d2d;
    color: white;
    border: none;
}

.footer button.submit-btn:hover {
    background-color: #d94426;
}
</style>