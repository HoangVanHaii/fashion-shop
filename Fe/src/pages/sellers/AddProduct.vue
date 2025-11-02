<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Header from '../../components/sellers/Header.vue';
import Navbar from '../../components/sellers/Navbar.vue';
import api from '../../services/api';
import axios from 'axios';

interface ProductColor {
  id?: number;
  product_id?: number;
  color: string;
  image_url: string;
  is_main?: boolean;
  sizes: ProductSize[];
  images?: string[];
  sold_count?: number;
}

interface ProductSize {
  product_id?: number;
  id?: number;
  size: string;
  stock: number;
  price: number;
  flash_sale_price?: number;
}

interface ProductPayload {
  id?: number;
  shop_id: number;
  shop_name?: string;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  status?: string;
  colors: ProductColor[];
  sold_product?: number;
}

// Form data
const productData = reactive<ProductPayload>({
  shop_id: 1, // TODO: Get from auth
  category_id: 0,
  name: '',
  description: '',
  status: 'draft',
  colors: [
    {
      color: '',
      image_url: '',
      is_main: true,
      images: [],
      sizes: [
        { size: 'S', stock: 10, price: 200000 },
        { size: 'M', stock: 10, price: 210000 },
        { size: 'L', stock: 10, price: 220000 }
      ]
    }
  ]
});

// Available categories - TODO: Fetch from API
const categories = ref([
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Quần' },
  { id: 3, name: 'Đầm' },
  { id: 4, name: 'Phụ kiện' }
]);

// Available sizes
const availableSizes = ['One size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39'];

// Steps tracking
const steps = reactive([
  { id: 1, title: 'Điền thông tin', completed: false },
  { id: 2, title: 'Thêm ít nhất 1 ảnh đơn', completed: false },
  { id: 3, title: 'Tên sản phẩm nhiều nhất là 200 ký tự', completed: false },
  { id: 4, title: 'Thêm miêu tả ít nhất 100 ký tự cho phần mô tả sản phẩm', completed: false },
  { id: 5, title: 'Thêm thể loại sản phẩm', completed: false }
]);

// Computed
const selectedCategoryName = computed(() => {
  const cat = categories.value.find(c => c.id === productData.category_id);
  return cat ? cat.name : '';
});

// Methods
const addColor = () => {
  productData.colors.push({
    color: '',
    image_url: '',
    is_main: false,
    images: [],
    sizes: [
      { size: 'S', stock: 10, price: 200000 },
      { size: 'M', stock: 10, price: 210000 },
      { size: 'L', stock: 10, price: 220000 }
    ]
  });
};

const removeColor = (index: number) => {
  if (productData.colors.length > 1) {
    productData.colors.splice(index, 1);
    // Ensure at least one color is marked as main
    if (!productData.colors.some(c => c.is_main)) {
      productData.colors[0]!.is_main = true;
    }
  }
};

const setMainColor = (index: number) => {
  productData.colors.forEach((color, i) => {
    color.is_main = i === index;
  });
};

const handleMainImageUpload = (colorIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      productData.colors[colorIndex]!.image_url = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubImagesUpload = (colorIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    const color = productData.colors[colorIndex];
    if (!color?.images) color!.images = [];
    
    Array.from(files).forEach(file => {
      if (color!.images!.length < 3) {
        const reader = new FileReader();
        reader.onload = (e) => {
          color!.images!.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  }
};

const removeSubImage = (colorIndex: number, imageIndex: number) => {
  const color = productData.colors[colorIndex];
  if (color!.images) {
    color!.images.splice(imageIndex, 1);
  }
};

const addSize = (colorIndex: number) => {
  const color = productData.colors[colorIndex];
  const existingSizes = color!.sizes.map(s => s.size);
  const availableSize = availableSizes.find(s => !existingSizes.includes(s));
  
  if (availableSize) {
    color!.sizes.push({
      size: availableSize,
      stock: 10,
      price: 200000
    });
  }
};

const removeSize = (colorIndex: number, sizeIndex: number) => {
  const color = productData.colors[colorIndex];
  if (color!.sizes.length > 1) {
    color!.sizes.splice(sizeIndex, 1);
  }
};

const handleCancel = () => {
  if (confirm('Bạn có chắc muốn hủy? Tất cả thông tin sẽ bị mất.')) {
    // Reset or navigate away
    window.history.back();
  }
};

const validateForm = (): boolean => {
  if (!productData.name.trim()) {
    alert('Vui lòng nhập tên sản phẩm');
    return false;
  }
  if (productData.name.length > 200) {
    alert('Tên sản phẩm không được vượt quá 200 ký tự');
    return false;
  }
  if (!productData.category_id) {
    alert('Vui lòng chọn thể loại sản phẩm');
    return false;
  }
  if (!productData.description || productData.description.length < 100) {
    alert('Mô tả sản phẩm phải có ít nhất 100 ký tự');
    return false;
  }
  
  // Check if at least one color has main image
  const hasMainImage = productData.colors.some(c => c.image_url);
  if (!hasMainImage) {
    alert('Vui lòng thêm ít nhất 1 ảnh chính cho sản phẩm');
    return false;
  }
  
  // Check if all colors have names
  const allColorsNamed = productData.colors.every(c => c.color.trim());
  if (!allColorsNamed) {
    alert('Vui lòng đặt tên cho tất cả các màu');
    return false;
  }
  
  return true;
};

const handleSave = async () => {
    if (!validateForm()) return;

  
  try {
    productData.status = 'draft';
    // TODO: Call API to save product
    console.log('Saving draft:', productData);
    alert('Đã lưu nháp thành công!');
  } catch (error) {
    console.error('Error saving draft:', error);
    alert('Có lỗi xảy ra khi lưu nháp');
  }
};
interface ImageFiles {
  mainImage: File | null;
  subImages: File[];
}

const imageFiles = ref<Map<number, ImageFiles>>(new Map());

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('images', file);
  const response = await api.post(`http://localhost:3000/api/seller/product-image`, formData, {
    headers: {
                  "Content-Type": "multipart/form-data"

    }
  });
  return response.data.urls[0];
};
// Upload all images for all colors
const uploadAllImages = async (): Promise<void> => {
  const uploadPromises: Promise<void>[] = [];
  
  for (let colorIndex = 0; colorIndex < productData.colors.length; colorIndex++) {
    const color = productData.colors[colorIndex];
    const colorFiles = imageFiles.value.get(colorIndex);
    
    if (!colorFiles) continue;
    
    // Upload main image
    if (colorFiles.mainImage) {
      const promise = uploadImage(colorFiles.mainImage).then(path => {
        color!.image_url = path;
      });
      uploadPromises.push(promise);
    }
    
    // Upload sub images
    if (colorFiles.subImages.length > 0) {
      const subImagePromises = colorFiles.subImages.map(async (file, index) => {
        const path = await uploadImage(file);
        if (!color!.images) color!.images = [];
        color!.images[index] = path;
      });
      uploadPromises.push(...subImagePromises);
    }
  }
  
  await Promise.all(uploadPromises);
};
const handleSaveAndPublish = async () => {
  if (!validateForm()) return;
  try {
    productData.status = "active";
    await uploadAllImages();

    const formData = new FormData();
    formData.append("category_id","skjfksdkdfksj");
    formData.append("name", productData.name);
    formData.append("description", productData.description ?? "");
    formData.append("colors", JSON.stringify(productData.colors));
    // formData.append('images', )


    console.log("📤 Sending to server: ", productData);

    await api.post("/seller/product/addProduct", formData, {
       headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    alert("✅ Đã lưu và hiển thị sản phẩm thành công!");
  } catch (error) {
    console.error("❌ Error publishing product:", error);
    alert("Có lỗi xảy ra khi xuất bản sản phẩm");
  }
};

// Update steps based on form data
const updateSteps = () => {
  steps[0]!.completed = !!productData.name && !!productData.category_id;
  steps[1]!.completed = productData.colors.some(c => c.image_url);
  steps[2]!.completed = productData.name.length > 0 && productData.name.length <= 200;
  steps[3]!.completed = (productData.description?.length || 0) >= 250;
  steps[4]!.completed = !!productData.category_id;
};

// Watch for changes
const nameLength = computed(() => productData.name.length);
const descLength = computed(() => productData.description?.length || 0);
</script>

<template>
    <Header :nav1="'Sản phẩm'" :nav2="'Thêm sản phẩm'"></Header>
    <Navbar 
        :isShow='false'
        :showManagermentOrder= 'false'
        :showManagermentProduct= 'true'
        :showData= 'false'
        :showCustomCare= 'false'
        :showManagermentShop= 'false'
        :showMarketing= 'false'
        :showVoucher= 'false'
        :showFlashSale= 'false'
        :showAllOrder= 'false'
        :showAllProduct= 'false'
        :showAddProduct= 'true'
        :showReview= 'false'
        :showProfileShop= 'false'
        :showProfile= 'false'
        :showStatistical= 'false'
        class="abs"
        ></Navbar>
  <div class="add-product-page">
    
    <!-- <div class="page-header">
      <div class="breadcrumb">
        <span class="icon">🏠</span>
        <span>Trang chủ</span>
        <span class="separator">›</span>
        <span>Tất cả</span>
        <span class="separator">›</span>
        <span class="active">Thêm 1 sản phẩm mới</span>
      </div>
      <div class="user-menu">
        <span class="icon">⋮⋮⋮</span>
        <div class="user-avatar">
          <div class="avatar-circle">T</div>
          <span>TenNguoiBan</span>
          <span class="icon">▼</span>
        </div>
      </div>
    </div> -->

    <div class="content-wrapper">
      <aside class="sidebar">
        <div class="progress-section">
          <h3>Gợi ý điền thông tin</h3>
          <ul class="steps-list">
            <li v-for="step in steps" :key="step.id" :class="{ completed: step.completed }">
              <span class="step-indicator"></span>
              <span class="step-text">{{ step.title }}</span>
            </li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>
            <span class="icon">💡</span>
            Gợi ý
          </h3>
          <div class="tips-content">
            <p class="tip-title">Thể loại</p>
            <p class="tip-text">
              - Việc đăng tải sản phẩm đúng thể loại giúp người mua dễ dàng tìm thấy sản phẩm của bạn hơn và người mua cũ thể có thể chọn ra những items trong ngành hàng đó.
            </p>
            <p class="tip-text">
              - Người lâm có hướng dẫn chọn đúng mục thể loại cho sản phẩm 
              <a href="#" class="link">tại đây</a>.
            </p>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <section class="product-info-section">
          <h2>
            <span class="icon">✏️</span>
            Điền thông tin sản phẩm
          </h2>

          <div class="form-section">
            <h3>Thông tin cơ bản</h3>
          </div>

          <div class="form-group">
            <label>Tên sản phẩm</label>
            <input 
              v-model="productData.name" 
              type="text" 
              placeholder="Tên sản phẩm"
              maxlength="200"
              @input="updateSteps"
            >
            <span class="char-count">{{ nameLength }}/200</span>
          </div>

          <div class="form-group">
            <label>*Thể loại</label>
            <div class="select-wrapper">
              <select v-model="productData.category_id" @change="updateSteps">
                <option value="0">Chọn thể loại</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <span class="icon">▼</span>
            </div>
          </div>

          <div class="form-group">
            <label>*Mô tả sản phẩm</label>
            <textarea 
              v-model="productData.description"
              placeholder="Nhập mô tả sản phẩm..."
              rows="6"
              maxlength="5000"
              @input="updateSteps"
            ></textarea>
            <span class="char-count">{{ descLength }}/5000</span>
          </div>
        </section>

        <section class="variants-section">
          <h2>Thông tin bán hàng</h2>

          <div v-for="(color, colorIndex) in productData.colors" :key="colorIndex" class="color-card">
            <div class="color-header">
              <label class="color-name-input">
                *Chi tiết
                <input 
                  v-model="color.color" 
                  type="text" 
                  placeholder="Tên màu (VD: Trắng, Xanh da)"
                >
              </label>
              <button 
                v-if="productData.colors.length > 1"
                @click="removeColor(colorIndex)" 
                class="remove-color-btn"
                type="button"
              >
                ✕
              </button>
            </div>

            <div class="images-section">
              <div class="main-image-upload">
                <label class="upload-label">Ảnh chính</label>
                <div class="image-upload-box">
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleMainImageUpload(colorIndex, $event)"
                    :id="`main-image-${colorIndex}`"
                    hidden
                  >
                  <label :for="`main-image-${colorIndex}`" class="upload-area">
                    <img v-if="color.image_url" :src="color.image_url" alt="Main image">
                    <span v-else class="upload-icon">📷</span>
                  </label>
                </div>
              </div>

              <div class="sub-images-upload">
                <label class="upload-label">Ảnh phụ (Tối đa 3 ảnh)</label>
                <div class="sub-images-grid">
                  <div v-for="(img, imgIndex) in (color.images || [])" :key="imgIndex" class="sub-image-box">
                    <img :src="img" alt="">
                    <button @click="removeSubImage(colorIndex, imgIndex)" class="remove-sub-image" type="button">✕</button>
                  </div>
                  <label 
                    v-if="!color.images || color.images.length < 3"
                    class="add-sub-image"
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      @change="handleSubImagesUpload(colorIndex, $event)"
                      hidden
                      multiple
                    >
                    <span>+</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="sizes-table">
              <table>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Giá (₫)</th>
                    <th>Số lượng</th>
                    <!-- <th>Flash Sale (₫)</th> -->
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(size, sizeIndex) in color.sizes" :key="sizeIndex">
                    <td>
                      <select v-model="size.size" class="size-select">
                        <option v-for="s in availableSizes" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </td>
                    <td>
                      <input v-model.number="size.price" type="number" class="price-input" min="0">
                    </td>
                    <td>
                      <input v-model.number="size.stock" type="number" class="stock-input" min="0">
                    </td>
                    <!-- <td>
                      <input v-model.number="size.flash_sale_price" type="number" class="price-input" min="0" placeholder="Không bắt buộc">
                    </td> -->
                    <td>
                      <button 
                        v-if="color.sizes.length > 1"
                        @click="removeSize(colorIndex, sizeIndex)" 
                        class="remove-size-btn"
                        type="button"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button @click="addSize(colorIndex)" class="add-size-btn" type="button">
                + Thêm size
              </button>
            </div>

            <div class="main-color-toggle">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :checked="color.is_main"
                  @change="setMainColor(colorIndex)"
                >
                <span>Đặt làm màu chính</span>
              </label>
            </div>
          </div>

          <button @click="addColor" class="add-color-btn" type="button">
            + Thêm màu sắc
          </button>
        </section>

        <div class="action-buttons">
          <button @click="handleCancel" class="btn-cancel" type="button">Hủy</button>
          <button @click="handleSave" class="btn-save" type="button">Lưu & Ẩn</button>
          <button @click="handleSaveAndPublish" class="btn-submit" type="button">Lưu & Hiển thị</button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.add-product-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  margin-top: 50px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}
.abs{
    display: none;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.breadcrumb .separator {
  color: #999;
}

.breadcrumb .active {
  color: #333;
  font-weight: 500;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e91e63;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-section,
.tips-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.progress-section h3,
.tips-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.steps-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.step-indicator {
  width: 12px;
  height: 12px;
  border: 2px solid #ddd;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.steps-list li.completed .step-indicator {
  background: #4CAF50;
  border-color: #4CAF50;
}

.tips-content {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.6;
}

.tip-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.tip-text {
  margin-bottom: 0.75rem;
}

.link {
  color: #2196F3;
  text-decoration: none;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-info-section,
.variants-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.product-info-section h2,
.variants-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #e91e63;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  appearance: none;
  background: white;
  cursor: pointer;
}

.select-wrapper .icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2196F3;
}

.char-count {
  position: absolute;
  right: 0.5rem;
  bottom: -1.5rem;
  font-size: 0.85rem;
  color: #999;
}

.color-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.color-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.color-name-input {
  flex: 1;
  display: block;
  font-weight: 500;
  color: #333;
}

.color-name-input input {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-color-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.images-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.upload-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 0.9rem;
}

.image-upload-box {
  width: 150px;
  height: 150px;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #2196F3;
}

.upload-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.upload-icon {
  font-size: 2rem;
}

.sub-images-grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 1rem;
}

.sub-image-box {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.sub-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-sub-image {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-sub-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 2rem;
  color: #999;
  transition: border-color 0.2s;
}

.add-sub-image:hover {
  border-color: #2196F3;
}

.sizes-table {
  margin-bottom: 1rem;
}

.sizes-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.sizes-table th,
.sizes-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.sizes-table th {
  background: #f9f9f9;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
}

.size-select,
.price-input,
.stock-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.size-select {
  max-width: 80px;
}

.price-input,
.stock-input {
  max-width: 120px;
}

.remove-size-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.add-size-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px dashed #2196F3;
  border-radius: 4px;
  color: #2196F3;
  cursor: pointer;
  font-size: 0.9rem;
}

.main-color-toggle {
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.add-color-btn {
     padding: 0.5rem 1rem;
  background: white;
  border: 1px dashed #2196F3;
  border-radius: 4px;
  color: #2196F3;
  cursor: pointer;
  font-size: 0.9rem;
}
.variant-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.variant-header label {
  flex: 1;
}

.remove-variant-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.variant-table {
  overflow-x: auto;
}

.variant-table table {
  width: 100%;
  border-collapse: collapse;
}

.variant-table th,
.variant-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.variant-table th {
  background: #f5f5f5;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
}

.image-cell {
  width: 80px;
}

.image-preview {
  position: relative;
  width: 60px;
  height: 60px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f44336;
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
}

.image-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
}

.image-thumbnails {
  width: 200px;
}

.thumbnail-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.add-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
  font-size: 1.2rem;
}

.input-price,
.input-quantity {
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.add-variant-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px dashed #2196F3;
  border-radius: 4px;
  color: #2196F3;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 0;
}

.btn-cancel,
.btn-save,
.btn-submit {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-save {
  background: #2196F3;
  color: white;
}

.btn-submit {
  background: #f2112f;
  color: white;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-save:hover {
  background: #1976D2;
}

.btn-submit:hover {
  background: #e11d1d;
}
@media (max-width: 1024px) and (min-width: 678px){
    .sidebar {
        width: 90%;
    }
    .content-wrapper {
          display: flex;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        padding: 1.5rem 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }
}

@media (max-width: 767px) {
    .sidebar {
        display: none;
    }
    .images-section {
        display: flex;
        flex-direction: column;
    }
    .add-product-page {
        /* width: ; */
        padding: 0px;
    }
    .content-wrapper {
        display: flex;
        /* gap: 1.5rem; */
        width: 90%;
        padding: 0px;
        padding-top: 20px;
    }
    .main-content {
        width: 100%;
    }
    .sub-images-grid {
        display: grid;
        grid-template-columns: repeat(2, 100px);
        gap: 1rem;
    }
    .sizes-table {
        /* overflow-y: auto; */
        /* width: 700px; */
        overflow: auto;
    }
    .sizes-table table{
        width: 700px;
    }
    .abs{
        display: flex;
        position: fixed;
        z-index: 99999;
        background-color: white;
        right: 0;
        width: 200px;
    }
}
</style>