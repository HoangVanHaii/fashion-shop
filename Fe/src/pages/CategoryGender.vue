<script setup lang="ts">
import Header from '../components/Header.vue';
import type { ProductSummary } from '../interfaces/product';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCategoryStore } from '../stores/categoryStore';
import { getImage, formatPrice } from '../utils/format'

const route = useRoute();
const router = useRouter();
const product = useProductStore();
const category = useCategoryStore();
const showcategory = ref<boolean>(window.innerWidth > 768)
const productGender = ref<ProductSummary[]>([])
const listCategory = ref<string[]>([])
const selectedSort = ref('name-asc');
const showSortDropdown = ref(false);
const selectedCategories = ref<string[]>([])
const sortOptions = [
    { label: 'Tên A → Z', value: 'name-asc' },
    { label: 'Tên Z → A', value: 'name-desc' },
    { label: 'Giá thấp → cao', value: 'price-asc' },
    { label: 'Giá cao → thấp', value: 'price-desc' },
    { label: 'Bán chạy nhất', value: 'bestseller' }
];

onMounted(async () => {
    const gender = route.query.gender as string;
    productGender.value = await product.searchByCategoryGenderStore(gender);
    const queryName = route.query.name as string | string[] | undefined;
    if (queryName) {
        if (Array.isArray(queryName)) {
            selectedCategories.value = queryName.map(n => n.toString().trim()).filter(Boolean);
        } else {
            selectedCategories.value = queryName
                .split(',')
                .map(n => n.trim())
                .filter(Boolean);
        }
    }
    listCategory.value = await category.getCategoryNameStore(gender);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
})
const handleScroll = () => {
    if (window.innerWidth > 768) {
        showcategory.value = true;
    } else {
        showcategory.value = false;
    }
}
const handleResize = () => {
    console.log(window.innerWidth);
    if (window.innerWidth > 769) {
        showcategory.value = true;
    } else {
        showcategory.value = false;
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
})

const handleCategoryChange = (categoryName: string, isChecked: boolean) => {
    if (isChecked) {
        if (window.innerWidth < 768) {
            showcategory.value = false;
        }
        if (!selectedCategories.value.includes(categoryName)) {
            selectedCategories.value.push(categoryName);
        }
    } else {
        selectedCategories.value = selectedCategories.value.filter(c => c !== categoryName);
    }
};

const filteredProducts = computed(() => {
    let filtered = [...productGender.value];
    
    if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(p => 
        p.category_name && selectedCategories.value.includes(p.category_name)
        );
    }
    
    return sortProducts(filtered, selectedSort.value);
});

const sortProducts = (products: ProductSummary[], sortKey: string) => {
    return products.sort((a, b) => {
        const nameA = (a.name ?? '').toString();
        const nameB = (b.name ?? '').toString();
        const priceA = Number(a.min_price ?? 0);
        const priceB = Number(b.min_price ?? 0);
        const soldA = Number(a.sold_quantity ?? a.flash_price ?? a.sold_quantity ?? 0);
        const soldB = Number(b.sold_quantity ?? b.flash_price ?? b.sold_quantity ?? 0);

        switch (sortKey) {
        case 'name-asc':
            return nameA.localeCompare(nameB);
        case 'name-desc':
            return nameB.localeCompare(nameA);
        case 'price-asc':
            return priceA - priceB;
        case 'price-desc':
            return priceB - priceA;
        case 'bestseller':
            return soldB - soldA;
        default:
            return 0;
        }
    });
};

const handleSortChange = (value: string) => {
    selectedSort.value = value;
    showSortDropdown.value = false;
};

const isCategorySelected = (categoryName: string) => {
    return selectedCategories.value.includes(categoryName);
};

const clearAllFilters = () => {
    selectedCategories.value = [];
};
const toggleCategory = () => {
    showcategory.value = !showcategory.value;
};

</script>

<template>
    <Header></Header>
    <div class="product-page">
        <div v-if="product.loading" class="loading-overlay">
            <div class="spinner"></div>
        </div>
    </div>
    <div class="filter-section">
        <div class="breadcrumb">
            <a href="/" class="breadcrumb-item">Trang chủ</a>
            <span class="separator">|</span>
            <span class="breadcrumb-item active">{{ route.query.gender}}</span>
        </div>

        <div class="filter-bar">
            <div class="filter-left">
                <div class="filter"@click="toggleCategory">
                    <i class="fa-solid fa-filter"></i>
                    <span>Lọc</span>
                </div>
                <span class="type">Loại</span>
                <span v-if="selectedCategories.length > 0" class="filter-count">
                    ({{ selectedCategories.length }} đã chọn)
                </span>
                <button 
                    v-if="selectedCategories.length > 0" 
                    @click="clearAllFilters" 
                    class="clear-filter-btn"
                >
                    Xóa bộ lọc
                </button>
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
        
    </div>
    <div class="container" v-if="!product.loading">
        <div class="category" v-show="showcategory">
            <div class="category-header">
                <h3>Danh mục</h3>
            </div>
            <div 
                v-for="categoryName in listCategory" 
                :key="categoryName"
                class="checkbox-category"
            >
                <label class="checkbox-label">
                    <input 
                        type="checkbox" 
                        :checked="isCategorySelected(categoryName)"
                        @change="(e) => handleCategoryChange(categoryName, (e.target as HTMLInputElement).checked)"
                    > 
                    <span class="category-name">{{ categoryName }}</span>
                </label>
            </div>
        </div>
        <div class="product">
            <div
                v-for="(product, index) in filteredProducts"
                :key="index"
                class="product-item"
                @click="router.push({
                    name: 'product-detail',
                    params: { id: product.id }
                })"
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
                                <img :src="getImage(`${value}`)" alt="anhproduct">
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
                        
                    </div>

                </div>
            </div>
            <div v-if="filteredProducts.length === 0" class="no-products">
                <i class="fa-solid fa-box-open"></i>
                <p>Không tìm thấy sản phẩm phù hợp</p>
                <button @click="clearAllFilters" class="clear-filter-btn-large">
                    Xóa bộ lọc
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.filter{
    display: none;
}
.container{
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    gap:2rem;
    padding: 10px;
    /* margin-bottom: ; */
}
.category{
    width: 20%;
    border-top: 1px solid black;
    height: 100px;
    padding: 4px;
}
.checkbox-category{
    font-size: 18px;
}
.product{
    width: 70%;
    /* background-color: #666; */
    height: 100%;
    overflow-y: none;
    
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
    gap: 20px; 
    padding: 20px;
    box-sizing: border-box;

}
.filter-section {
    width: 100%;
    background: white;
    position: relative;
    margin-top: 8.3%;
    /* overflow-y: auto; */
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
    padding: 8px 20px;
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
    width: 10px;
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.product-item:hover{
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}
.product-item .product-image{
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
}

.promo-description .product-logo-color{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 20%;
}
.product-logo-color .logo{
    font-size: 11px;
    color: rgb(92, 85, 85);
}
.product-logo-color .list-color{
    display: flex;
    flex-direction: row;
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
.product-info{
    width: 100%;
    /* background-color: rgb(197, 67, 2); */
    height: 65%;
}
.product-name{
    width: 100%;
    height: 35%;
}
.product-name p{
    font-size: 16px;
}

.product-bottom{
    width: 100%;
    height: 35%;
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    /* align-items: center;
    justify-content: center;
    justify-items: center; */
    /* gap: 10px; */
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
@media screen and (max-width: 1024px) and (min-width: 768px) {
    .filter-bar{
    }
}

@media screen and (max-width: 768px) {
    .breadcrumb,
    .filter-bar {
        padding: 12px 6px;
    }
    .category-name{
        font-size: 15px;
    }
    .filter{
        display: flex;
        gap: 3px;
        padding: 6px 12px;
        /* border: 1px solid #ddd; */
        cursor: pointer;
        /* background: white; */
        transition: all 0.3s;
    }
    .type, .filter-count, .clear-filter-btn {
        display: none;
    }
    .checkbox-label {
        width: 100px;
    }
    .category{
        width: 30%;
        height: auto;
        top: 160px;
        max-height: 300px;
        overflow-y: auto;
        position: fixed;
        margin: 7px;
        padding: 10px;
        z-index: 999;
        background-color: #f1f1f1;
        border-radius: 10px;
        border: 1px solid #a8a8a8;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    }
    .product-item{
        width: 120px;
        height: 260px;
        justify-content: start;

    }
    .product-item .product-image{
        height: 52%;
    }
    .product-image img{
        width: 100%;
        height: 100%;
    }
    .product{
        margin-left: -10px;
        grid-template-columns: repeat(auto-fill, minmax(114px, 0fr));
        width: 110%;
        justify-content: space-between;
    }
    .filter-bar {
        flex-direction: row;
        justify-content: space-around;
        width: 100%;
        margin-top: 14px;
    }
    .filter-section{
        padding: 0;
    }
    .filter-left,
    .filter-right {
        width: 100%;
        gap: 0px;
        justify-content: end;
    }

    .filter-right {
        justify-content: end;
        gap:3px;
    }

    .sort-btn {
        justify-content: start;
        min-width: 140px;
        /* min-height: 30px; */
    }

    .filter-categories {
        flex-direction: column;
        gap: 20px;
    }

    .filter-content {
        padding: 15px 20px;
    }
    .promo-description{
        margin-top: 6px;
    }
    .list-color .item-image{
        width: 18px;
        height: 18px;
    }
    .product-name{
        width: 100%;
        height: 35%;
    }
    .product-name p{
        font-size: 13px;
    }
    .product-bottom .product-prices .price-new{
        font-size: 16px;
    }
    .product-bottom .product-prices .price-old{
        font-size: 14px;
    }
    .product-bottom{
        justify-content: space-between;
    }
    .product-bottom .product-action{
        width: 40%;
        height: 100%;
        justify-items: end;
        align-items: end;
        gap: 0px;
    }
    .product-bottom .product-action button{
        /* width: 50%;
        height: 50%; */
        border: none;
        color: white;
        background-color: transparent;
    }
    .product-action i{
        font-size: 15px;
        -webkit-text-stroke: 1px black; /* Viền đen */
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
    .category{
        width: 30%;
        height: auto;
        top: 130px;
        max-height: 300px;
        overflow-y: auto;
        position: fixed;
    }
}
.filter-count {
    color: #ff6b35;
    font-size: 14px;
    font-weight: 500;
}

.clear-filter-btn {
    background: transparent;
    border: 1px solid #ddd;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    color: #666;
}

.clear-filter-btn:hover {
    background: #ff6b35;
    color: white;
    border-color: #ff6b35;
}

.result-count {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.category-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    /* border-bottom: 2px solid #ff6b35; */
}

.category-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
    font-weight: 600;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.2s;
}

.checkbox-label:hover {
    background: #f5f5f5;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #46da01;
}

.checkbox-label span {
    color: #333;
    user-select: none;
}

.no-products {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #999;
}

.no-products i {
    font-size: 64px;
    margin-bottom: 20px;
    color: #ddd;
}

.no-products p {
    font-size: 18px;
    margin-bottom: 20px;
}

.clear-filter-btn-large {
    background: #ff6b35;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
}

.clear-filter-btn-large:hover {
    background: #ff8c5a;
}
</style>