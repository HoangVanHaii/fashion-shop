<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Header from '../../components/sellers/Header.vue';
import Navbar from '../../components/sellers/Navbar.vue';
import api from '../../services/api';
import Notification from '../../components/Notification.vue';

const textToast = ref<string>('');
const showNotification = ref<boolean>(false);

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

interface ImageFiles {
  mainImage: File | null;
  mainImagePreview: string;
  subImages: File[];
  subImagePreviews: string[];
}

// Form data
const productData = reactive<ProductPayload>({
  shop_id: 1,
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

const colorImages = ref<Map<number, ImageFiles>>(new Map([
  [0, { mainImage: null, mainImagePreview: '', subImages: [], subImagePreviews: [] }]
]));

const categories = ref([
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Quần' },
  { id: 3, name: 'Đầm' },
  { id: 4, name: 'Phụ kiện' }
]);

const availableSizes = ['One size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39'];

const steps = reactive([
  { id: 1, title: 'Điền thông tin', completed: false },
  { id: 2, title: 'Thêm ít nhất 1 ảnh đơn', completed: false },
  { id: 3, title: 'Tên sản phẩm nhiều nhất là 200 ký tự', completed: false },
  { id: 4, title: 'Thêm miêu tả ít nhất 100 ký tự cho phần mô tả sản phẩm', completed: false },
  { id: 5, title: 'Thêm thể loại sản phẩm', completed: false }
]);

const nameLength = computed(() => productData.name.length);
const descLength = computed(() => productData.description?.length || 0);

const initImageFiles = (colorIndex: number) => {
  if (!colorImages.value.has(colorIndex)) {
    colorImages.value.set(colorIndex, {
      mainImage: null,
      mainImagePreview: '',
      subImages: [],
      subImagePreviews: []
    });
  }
};

const addColor = () => {
  const newIndex = productData.colors.length;
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
  initImageFiles(newIndex);
};

const removeColor = (index: number) => {
  if (productData.colors.length > 1) {
    productData.colors.splice(index, 1);
    
    const newMap = new Map<number, ImageFiles>();
    colorImages.value.forEach((value, key) => {
      if (key < index) {
        newMap.set(key, value);
      } else if (key > index) {
        newMap.set(key - 1, value);
      }
    });
    colorImages.value = newMap;
    
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
    initImageFiles(colorIndex);
    const imageData = colorImages.value.get(colorIndex)!;
    
    imageData.mainImage = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      imageData.mainImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    updateSteps();
  }
};

const handleSubImagesUpload = (colorIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    initImageFiles(colorIndex);
    const imageData = colorImages.value.get(colorIndex)!;
    
    Array.from(files).forEach(file => {
      if (imageData.subImages.length < 3) {
        imageData.subImages.push(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          imageData.subImagePreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  }
};

const removeSubImage = (colorIndex: number, imageIndex: number) => {
  const imageData = colorImages.value.get(colorIndex);
  if (imageData) {
    imageData.subImages.splice(imageIndex, 1);
    imageData.subImagePreviews.splice(imageIndex, 1);
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
    window.history.back();
  }
};

const validateForm = (): boolean => {
  textToast.value = '';
  if (!productData.name.trim()) {
    setTimeout(() => {
      textToast.value = 'Vui lòng nhập tên sản phẩm';
    }, 0);
    showNotification.value = false;
    return false;
  }
  if (productData.name.length > 200) {
        setTimeout(() => {
              textToast.value = ('Tên sản phẩm không được vượt quá 200 ký tự');
        }, 0);
         showNotification.value = false;

    return false;
  }
  if (!productData.category_id) {
    setTimeout(() => {
          textToast.value = ('Vui lòng chọn thể loại sản phẩm');

    }, 0);
    showNotification.value = false;

    return false;
  }
  if (!productData.description || productData.description.length < 100) {
    setTimeout(() => {
          textToast.value = ('Mô tả sản phẩm phải có ít nhất 100 ký tự');

    }, 0);
    showNotification.value = false;

    return false;
  }
  
  let hasMainImage = false;
  colorImages.value.forEach(imageData => {
    if (imageData.mainImage) hasMainImage = true;
  });
  
  if (!hasMainImage) {
    setTimeout(() => {
          textToast.value = ('Vui lòng thêm ít nhất 1 ảnh chính cho sản phẩm');

    }, 0);
    showNotification.value = false;

    return false;
  }
  
  // Check if all colors have names
  const allColorsNamed = productData.colors.every(c => c.color.trim());
  if (!allColorsNamed) {
    setTimeout(() => {
          textToast.value = ('Vui lòng đặt tên cho tất cả các màu');
    }, 0);
    showNotification.value = false;

    return false;
  }
  
  return true;
};

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('images', file);
  
  const response = await api.post('/seller/product/product-image', formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  
  return response.data.urls[0];
};

const uploadAllImages = async (): Promise<void> => {
  const uploadPromises: Promise<void>[] = [];
  
  for (let colorIndex = 0; colorIndex < productData.colors.length; colorIndex++) {
    const color = productData.colors[colorIndex];
    const imageData = colorImages.value.get(colorIndex);
    
    if (!imageData) continue;
    
    if (imageData.mainImage) {
      const promise = uploadImage(imageData.mainImage).then(path => {
        color!.image_url = path;
      }).catch(err => {
        console.error(`❌ Failed to upload main image:`, err);
        throw err;
      });
      uploadPromises.push(promise);
    }
    
    if (imageData.subImages.length > 0) {
      for (let i = 0; i < imageData.subImages.length; i++) {
        const file = imageData.subImages[i];
        const promise = uploadImage(file!).then(path => {
          if (!color!.images) color!.images = [];
          color!.images[i] = path;
        }).catch(err => {
          console.error(`❌ Failed to upload sub image ${i}:`, err);
          throw err;
        });
        uploadPromises.push(promise);
      }
    }
  }
  
  await Promise.all(uploadPromises);
};

const handleSave = async () => {
  if (!validateForm()) return;
  
  try {
    productData.status = 'draft';
setTimeout(() => {
       textToast.value = ('Đã lưu nháp thành công!');
  
}, 0);
    showNotification.value = true;

  } catch (error) {
    console.error('Error saving draft:', error);
setTimeout(() => {
      textToast.value = ('Có lỗi xảy ra khi lưu nháp');
  
}, 0);         showNotification.value = true;

  }
};

const handleSaveAndPublish = async () => {
  if (!validateForm()) return;
  
  try {
    productData.status = "active";
    
    await uploadAllImages();
    
    const payload = {
      shop_id: productData.shop_id,
      category_id: productData.category_id,
      name: productData.name,
      description: productData.description ?? "",
      status: productData.status ?? "active",
      colors: JSON.stringify(productData.colors)
    };
    
    
    await api.post("/seller/product/addProduct", payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    textToast.value = ("✅ Đã lưu và hiển thị sản phẩm thành công!");
    showNotification.value = true;
    
    setTimeout(() => {
      window.location.href = '/seller/product';
    }, 1200);
    
  } catch (error: any) {
    console.error("❌ Error publishing product:", error);
    console.error("Error details:", error.response?.data);
    textToast.value = (`Có lỗi xảy ra khi xuất bản sản phẩm: ${error.response?.data?.message || error.message}`);
         showNotification.value = false;

  }
};

const updateSteps = () => {
  steps[0]!.completed = !!productData.name && !!productData.category_id;
  
  let hasMainImage = false;
  colorImages.value.forEach(imageData => {
    if (imageData.mainImage) hasMainImage = true;
  });
  steps[1]!.completed = hasMainImage;
  
  steps[2]!.completed = productData.name.length > 0 && productData.name.length <= 200;
  steps[3]!.completed = (productData.description?.length || 0) >= 100;
  steps[4]!.completed = !!productData.category_id;
};
</script>

<template>
  <Header :nav1="'Sản phẩm'" :nav2="'Thêm sản phẩm'"></Header>
  <Notification :text="textToast" :isSuccess="showNotification"/>
  <Navbar 
    :isShow='false'
    :showManagermentOrder='false'
    :showManagermentProduct='true'
    :showData='false'
    :showCustomCare='false'
    :showManagermentShop='false'
    :showMarketing='false'
    :showVoucher='false'
    :showFlashSale='false'
    :showAllOrder='false'
    :showAllProduct='false'
    :showAddProduct='true'
    :showReview='false'
    :showProfileShop='false'
    :showProfile='false'
    :showStatistical='false'
    class="abs"
  ></Navbar>
  
  <div class="add-product-page">
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
                    <img 
                      v-if="colorImages.get(colorIndex)?.mainImagePreview" 
                      :src="colorImages.get(colorIndex)?.mainImagePreview" 
                      alt="Main image"
                    >
                    <span v-else class="upload-icon">📷</span>
                  </label>
                </div>
              </div>

              <div class="sub-images-upload">
                <label class="upload-label">Ảnh phụ (3 ảnh chi tiết)</label>
                <div class="sub-images-grid">
                  <div 
                    v-for="(preview, imgIndex) in (colorImages.get(colorIndex)?.subImagePreviews || [])" 
                    :key="imgIndex" 
                    class="sub-image-box"
                  >
                    <img :src="preview" alt="">
                    <button @click="removeSubImage(colorIndex, imgIndex)" class="remove-sub-image" type="button">✕</button>
                  </div>
                  <label 
                    v-if="!colorImages.get(colorIndex)?.subImagePreviews || colorImages.get(colorIndex)!.subImagePreviews.length < 3"
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

.abs {
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

@media (max-width: 1024px) and (min-width: 678px) {
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
    padding: 0px;
  }
  .content-wrapper {
    display: flex;
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
    overflow: auto;
  }
  .sizes-table table {
    width: 700px;
  }
  .abs {
    display: flex;
    position: fixed;
    z-index: 99999;
    background-color: white;
    right: 0;
    width: 200px;
  }
}
</style>