<script setup lang="ts">
import Header from '../components/Header.vue';
import type { ProductSummary } from '../interfaces/product';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { getImage, formatPrice } from '../utils/getImage'

const route = useRoute();
const product = useProductStore();
const productMen = ref<ProductSummary[]>([])
const sortOptions = [
  { label: 'Tên A → Z', value: 'name-asc' },
  { label: 'Tên Z → A', value: 'name-desc' },
  { label: 'Giá thấp → cao', value: 'price-asc' },
  { label: 'Giá cao → thấp', value: 'price-desc' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Bán chạy nhất', value: 'bestseller' }
];

onMounted(async () => {
    const gender = route.query.gender as string;
    console.log("gender",   gender);
    productMen.value = await product.searchByCategoryGenderStore(gender);
    console.log(productMen.value);
})
const selectedSort = ref('name-asc');
const showSortDropdown = ref(false);
const showFilterDropdown = ref(false);

const handleSortChange = (value: string) => {
  selectedSort.value = value;
  showSortDropdown.value = false;
  console.log('Sort by:', value);
};

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value;
  console.log('Toggle filter');
};
</script>

<template>
    <Header></Header>
    <div class="filter-section">
        <div class="breadcrumb">
            <a href="/" class="breadcrumb-item">Trang chủ</a>
            <span class="separator">|</span>
            <span class="breadcrumb-item active">Nam</span>
        </div>

        <div class="filter-bar">
            <div class="filter-left">
                <span>Loại</span>
            </div>

            <div class="filter-right">
                <span class="sort-label">Sắp xếp:</span>
                <div class="sort-dropdown" @click="showSortDropdown = !showSortDropdown">
                    <button class="sort-btn">
                        <span>{{ sortOptions.find(opt => opt.value === selectedSort)?.label }}</span>
                        <span class="arrow">▼</span>
                    </button>
          
                    <div v-if="showSortDropdown" class="dropdown-menu" @mouseleave="showSortDropdown = false">
                        <div
                            v-for="option in sortOptions"
                            :key="option.value"
                            class="dropdown-item"
                            :class="{ active: selectedSort === option.value }"
                            @click="handleSortChange(option.value)"
                        >
                            {{ option.label }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="category">

            </div>
            <div class="product">
                <div
                    v-for="(product, index) in productMen"
                    :key="index"
                    class="product-item"
                >
                    <div class="product-image">
                        <img :src="getImage(`${product.thumbnail}`)" alt="productImage">
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
                                    <img :src="getImage('/uploads/products/anh1.jpg')" alt="anhproduct">
                                </div>
                                
                            </div>
                        </div>
                        <div class="product-info">
                            <div class="product-name">  
                                <p>{{ product.name }}</p>

                            </div>
                            <div class="product-bottom">
                                <div class="product-prices">
                                    <span class="price-new" >{{ formatPrice(product.min_price) }}</span>
                                    <span v-if="product.flash_price" class="price-old">{{ formatPrice(product.flash_price) }}</span>
                                </div>
                                <div class="product-action">
                                    <button><i class="fa-solid fa-cart-shopping"></i></button>
                                    <button><i class="fa-solid fa-heart"></i></button>
                                </div>
                            </div>
                            <div class="total-orders">
                                <span>Đã bán 100 sản phẩm</span>
                                <div class="thanh"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container{
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    gap:2rem;
}
.category{
    width: 20%;
    background-color: rebeccapurple;
    height: 100%;
}
.product{
    width: 70%;
    background-color: #666;
    height: 100%;
    overflow-y: auto;
    
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* tự chia cột theo kích thước */
    gap: 20px; /* khoảng cách giữa các sản phẩm */
    padding: 20px;
    box-sizing: border-box;

}
.filter-section {
    width: 100%;
    background: white;
    position: fixed;
    top: 18%;
    overflow-y: auto;
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

.separator {
  color: #999;
}

.filter-bar {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}


.filter-btn {
    background: white;
    border: 1px solid #ddd;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
}

.filter-btn:hover {
    border-color: #ff6b35;
    color: #ff6b35;
}

.filter-label {
    letter-spacing: 1px;
}

.filter-icon {
    font-size: 10px;
}

.filter-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.sort-label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
}

.sort-dropdown {
    position: relative;
}

.sort-btn {
    background: white;
    border: 1px solid #ddd;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 14px;
    min-width: 180px;
    justify-content: space-between;
    transition: all 0.3s;
}

.sort-btn:hover {
    border-color: #ff6b35;
}

.arrow {
    font-size: 10px;
    color: #666;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 100;
    overflow: hidden;
    }

    .dropdown-item {
    padding: 10px 20px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #f5f5f5;
    }

    .dropdown-item:last-child {
    border-bottom: none;
    }

    .dropdown-item:hover {
    background: #f5f5f5;
    color: #ff6b35;
    }

    .dropdown-item.active {
    background: #fff5f0;
    color: #ff6b35;
    font-weight: 500;
}

.filter-content {
    padding: 20px 40px;
    background: #f9f9f9;
    border-top: 1px solid #e0e0e0;
}

.filter-categories {
    display: flex;
    gap: 50px;
}

.filter-category {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.filter-category h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.filter-category label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
}

.filter-category input[type="checkbox"] {
    cursor: pointer;
}
.product-item{
    flex: 0 0 auto;
    width: 200px;
    height: 350px;
    background-color: rgb(246, 235, 235);
    /* margin: 10px 0; */
    border-radius: 2px;
    display: flex;
    /* padding: 2px; */
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.9);
}
.promo-product .product-item .product-image{
    /* background-color: rgb(177, 104, 8); */
    /* margin: 2px 0; */
    width: 100%;
    height: 55%;
    border-radius: 2px;
    
}
 .product-image img{
    width: 100%;
    height: 100%;
    border-radius: 2px;
}
.promo-description{
    width: 90%;
    height: 45%;
    /* background-color: rgb(147, 147, 231); */
    /* margin-left: 20px; */
}

.promo-description .product-logo-color{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 20%;
    /* background-color: rgb(51, 255, 0); */

}
.product-logo-color .logo{
    font-size: 11px;
    color: rgb(92, 85, 85);
}
.product-logo-color .list-color{
    display: flex;
    flex-direction: row;
    /* background-color: red; */
    gap: 8px;
}
.list-color .item-image{
    width:26px;
    height: 26px;
    /* background-color: yellow; */
    border: 1px solid;
}
.list-color .item-image img{
    width: 100%;
    height: 100%;
}
.promo-product .product-info{
    width: 100%;
    /* background-color: rgb(197, 67, 2); */
    height: 65%;
}
.product-info .product-name{
    width: 100%;
    height: 35%;
}
.product-info .product-name p{
    font-size: 16px;
}

.promo-product .product-bottom{
    /* background-color: rgb(25, 0, 255); */
    width: 100%;
    height: 35%;
    display: flex;
    flex-direction: row;
    /* align-items: center;
    justify-content: center;
    justify-items: center; */
    gap: 10px;
}

.product-bottom .product-prices{
    width: 50%;
    height: 100%;
    /* background-color: black; */
    display: flex;
    flex-direction: column;
    gap: 1px;
    /* margin: ; */
}
.product-bottom .product-prices span{
    color: black;
    font-size: 18px;
    /* background-color: aqua; */
}
.product-bottom .product-prices .price-old{
    text-decoration: line-through;
}
.product-bottom .product-prices .price-new{
    color: red;
}
.product-bottom .product-action{
    width: 50%;
    height: 100%;
    /* background-color: red; */
    display: flex;
    justify-content: center;
    justify-items: center;
    align-items: center;
    gap: 5px;
}
.product-bottom .product-action button{
    /* width: 50%;
    height: 50%; */
    border: none;
    color: white;
    background-color: transparent;
}
.product-action i{
    /* color: red; */
    /* border: 1px solid; */
    font-size: 20px;
    -webkit-text-stroke: 1px black; /* Viền đen */
}
.product-action .fa-cart-shopping{
    color: black;
}

@media screen and (max-width: 768px) {
    .breadcrumb,
    .filter-bar {
            padding: 12px 20px;
    }

    .filter-bar {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
    }

    .filter-left,
    .filter-right {
        width: 100%;
    }

    .filter-right {
        justify-content: space-between;
    }

    .sort-btn {
        width: 100%;
    }

    .filter-categories {
        flex-direction: column;
        gap: 20px;
    }

    .filter-content {
        padding: 15px 20px;
    }
}

@media screen and (max-width: 480px) {
    .breadcrumb {
        font-size: 12px;
    }

    .filter-btn,
    .sort-btn {
        font-size: 13px;
        padding: 6px 15px;
    }

    .sort-label {
        font-size: 13px;
    }
}
</style>