<script setup lang="ts">
import Header from '../../components/sellers/Header.vue';
import Navbar from '../../components/sellers/Navbar.vue';
import { ref, onMounted } from 'vue';
import { formatPrice, getImage } from '../../utils/format';
import { useRouter } from 'vue-router';
import Loading from '../../components/Loading.vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import Notification from '../../components/Notification.vue';
import { useProductSellerStore } from '../../stores/sellers/productStore';
import type { ProductColor, ProductPayload } from '../../interfaces/product';
import ConfirmUpdate from './ConfirmUpdate.vue';

const product = useProductSellerStore();
const router = useRouter();
const nav2 = ref<string>('Tất cả')
const toggle = ref(false)
const showFormConfirm = ref<boolean>(false);
const messageAction = ref<string>("Xác nhận hành động này");
const showNotification = ref<boolean>(false);
const texNotification = ref<string>('');
const totalStockList = ref<number[]>([])
const minPriceList = ref<number[]>([])
const maxPriceList = ref<number[]>([])
const type = ref<string>('active');
const stock = ref<number>(0);
const checkButton = ref<boolean>(true);
const listId = ref<number[]>([]);
const listSize = ref<number[]>([])
onMounted(async () => {
    await product.getAllProductPayloadStore();
    for (const p of product.listProduct) {
        listId.value.push(p.id!);
        for (const c of p.colors) {
            for (const s of c.sizes) {
                listSize.value.push(s.id!);
            }
        }
    }
    totalStockList.value = product.filteredProductByStatus.map(product => {
        return product.colors.reduce((sum, color) => {
            const stock = color.sizes.reduce((s, size) => s + size.stock, 0)
            return sum + stock
        }, 0)
    })

    minPriceList.value = product.filteredProductByStatus.map(product => {
        const prices = product.colors.flatMap(color => color.sizes.map(size => size.price))
        return Math.min(...prices)
    })

    maxPriceList.value = product.filteredProductByStatus.map(product => {
        const prices = product.colors.flatMap(color => color.sizes.map(size => size.price))
        return Math.max(...prices)
    })

})

const handleRefresh = () => {
    router.go(0);
};

const handleAction = async () => {
    showFormConfirm.value = false;
    texNotification.value = ''
    if (checkButton.value) {
        if (stock.value < 0) {
            showNotification.value = false;
            texNotification.value = '❌ Số lượng phải lớn hơn hoặc bằng 0'
            return;
        }
        // cập nhật toàn bộ số lượng
        // alert(stock .value+ "  " + listSize.value);
        await product.updateSizesStore(listSize.value.join(','), stock.value);
        for (const p of product.listProduct) {
            for (const c of p.colors) {
                for (const s of c.sizes) {
                s.stock = stock.value;
                }
            }
        }
        totalStockList.value = product.filteredProductByStatus.map(product => {
            return product.colors.reduce((sum, color) => {
                const stock = color.sizes.reduce((s, size) => s + size.stock, 0)
                return sum + stock
            }, 0)
        })

    } else {
        if (type.value != 'active' && type.value != 'hidden') {
            showNotification.value = false;
            texNotification.value = '❌ Trạng thái phải là hoạt động hoặc ẩn'
            return;
        }
        await product.updateStatusStore(type.value, listId.value.join(','));
        product.listProduct = product.listProduct.map(p => {
            if (listId.value.includes(p.id!)) {
                return { ...p, status: type.value }; 
            }
                return p; 
        });
        
    }
    showNotification.value = true;
    texNotification.value = '✅ Cập nhật thành công'
    
    // texNotification.value = ''
}
const getStock = (color: ProductColor) => {
    let stock = 0;
    color.sizes.forEach(s => {
        stock += s.stock;
    })
    return stock
}
const handleHidden = async (productUpdate: ProductPayload) => {
    await product.updateStatusStore('hidden', productUpdate.id!.toString());
    productUpdate.status = 'hidden';
}

const handleActive = async (productUpdate: ProductPayload) => {
    await product.updateStatusStore('active', productUpdate.id!.toString());
    productUpdate.status = 'active';
}
const hanldeStock = (value: number) => {
    stock.value = value;
}
const handleType = (value: string) => {
    type.value = value;
}
</script>
<template>
    <Header :nav1="'Sản phẩm'" :nav2="nav2"></Header>
    <Loading :loading="product.loading" />
    <ConfirmUpdate  v-if="showFormConfirm"
        :message="messageAction"
        @close="showFormConfirm = false"
        @confirm="handleAction"
        @type="handleType"
        @stock="hanldeStock"
    />
    <Notification :text="texNotification" :isSuccess="showNotification"/>
    <div class="container">
        <Navbar 
         :isShow='false'
        :showManagermentOrder= 'true'
        :showManagermentProduct= 'true'
        :showData= 'false'
        :showCustomCare= 'false'
        :showManagermentShop= 'false'
        :showMarketing= 'false'
        :showVoucher= 'false'
        :showFlashSale= 'false'
        :showAllOrder= 'false'
        :showAllProduct= 'true'
        :showAddProduct= 'false'
        :showReview= 'false'
        :showProfileShop= 'false'
        :showProfile= 'false'
        :showStatistical= 'false'
        class="abs"
        ></Navbar>

        <div class="order" v-if="product.listProduct.length != 0">
            <p class="title">Sản phẩm</p>
            <div class="main-order">
                <div class="status">
                    <span
                        v-for="item in [
                            { label: 'Tất cả', count: product.listProduct.length },
                            { label: 'Đang hoạt động', count: product.quantityActive },
                            { label: 'Bị cấm', count: product.quantityBanned },
                            { label: 'Chưa hiển thị', count: product.quantityHidden }
                        ]"
                        :key="item.label"
                        :class="{ active: product.selectedStatus === item.label }"
                        @click="product.selectedStatus = item.label"
                        >
                        {{ item.label }} ({{ item.count }})
                    </span>
                </div>
                <hr>
                <div class="total-product">
                    <span >
                   <strong> {{ product.listProduct.length }} Sản phẩm trưng bày</strong>
                    </span>
                    <div class="btn">
                        <div class="dropdown"  @mouseleave="toggle = false" @click.stop="toggle = !toggle" >
                            <div class="selected"><span> Xử lý hàng loạt <i class="fa-solid fa-chevron-down"  :class="{move: toggle === true}"></i></span> </div>
                            <ul v-if="toggle" class="options">
                                <button class="option" @click="showFormConfirm = true, messageAction='Nhập số lượng tồn kho', checkButton = true">Cập nhật tồn kho</button>
                                <button class="option" @click="showFormConfirm = true, messageAction='Bật/Tắt hàng loạt', checkButton = false">Bật/Tắt</button>
                            </ul>
                        </div>
                        <button class="add-product"> <i class="fa-solid fa-plus"></i> Thêm sản phẩm mới</button>
                    </div>
                </div>
                <div class="list-product">
                    <div class="name-column">
                        <span
                            v-for="colum in [
                                'Sản phẩm',
                                'Lượt bán ra',
                                'Giá',
                                'Kho hàng',
                                'Thao tác'
                            ]"
                            :class="{ small: colum === 'Kho hàng' ,big: colum === 'Sản phẩm' }"
                            :key="colum">
                            {{ colum }}
                        </span>
                    </div>
                    <div class="list-product-detail">
                         <div class="none-product" v-if="product.filteredProductByStatus?.length == 0">
                            <div class="img">
                                <img src="..//../assets/none-order.jpg" alt="" />
                            </div>
                            <div class="refresh-now">
                                <span>Không tìm thấy đơn hàng nào</span>
                                <span @click="handleRefresh" style="color: blue; "
                                ><i class="fa-solid fa-rotate-right"></i> Vui lòng tải lại</span
                                >
                            </div>
                        </div>
                        <div class="product-detail" v-for="(product, index) in product.filteredProductByStatus" :key="index">
                            <div class="item">
                                <div class="infor-order">
                                   <div class="img-name">
                                        <img :src="getImage(product.colors[0]?.image_url || '')" alt="">
                                        <div>
                                            <span>{{ product.name }}</span>
                                            <span class="product_id">Mã sản phẩm:  {{ product.id }}</span>
                                        </div>
                                   </div>
                                   <span>{{ product.sold_product }}</span>
                                   <span class="min-max-price">{{ formatPrice(minPriceList[index] || 0) }} - {{ formatPrice(maxPriceList[index] || 0) }}</span>
                                   <span class="stock">{{ totalStockList[index] }}</span>
                                </div>
                                <div class="action">
                                     <i @click="handleHidden(product)" v-if="product.status == 'active'" class="fa-solid fa-toggle-on"></i>
                                     <i @click="handleActive(product)" v-if="product.status == 'hidden'" class="fa-solid fa-toggle-off"></i>
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </div>
                            </div>
                            <div class="product">
                                <div class="main-product" v-for="color in product.colors">
                                    <div class="img-name-product">
                                        <img :src="getImage(color.image_url)" alt="">
                                        <div>
                                            <span class="name-product">{{ color.color }}</span>
                                            <span style="font-size: 15px;">Mã màu: {{ color.id }}</span>
                                            <div class="size">
                                                <span>Size: </span>
                                                <span v-for="(size, ind) in color.sizes" :key="ind">{{ size.size }}{{ ind < color.sizes.length -1 ? '-' : '' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="quantity">{{ color.sold_count }}</span>
                                    <!-- <div class="old-new-price"> -->
                                        <!-- <span class="old" v-if="">{{ formatPrice(product.price) }}</span> -->
                                        <!-- <span v-if="product.flash_price"> - </span> -->
                                        <span class="new"> {{ formatPrice(color.sizes[0]?.price || 0) }}</span>
                                    <!-- </div/>  -->
                                    <span class="sale">{{getStock(color) }}</span>
                                </div>
                            </div>                        
                            <hr class="hr">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
::-webkit-scrollbar {
  width: 6px; 
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f9f9f9;
}

::-webkit-scrollbar-thumb {
  background: #999; 
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.container{
    margin-top: 60px;
    display: flex;
    justify-content: space-between;
    height: 90vh;
    overflow: hidden;
}
.order{
    width: 81.3%;
    /* height: 30px; */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    /* height: 115vh; */
    overflow-y: auto;
}
.main-order {
    display: flex;
    flex-direction: column;
    width: 90%;
    margin: 0 auto;
}
.title{
    margin-left: 54px;
    font-size: 24px;
}
.status {
  display: flex;
  /* gap: 15px; */
  width: 70%;
  justify-content: space-between;
}

.status span {
  cursor: pointer;
  color: #333;
  transition: color 0.2s, font-weight 0.2s;
}
.move {
    transform: rotate(180deg);
}
.status span.active {
  color: red;
  /* font-weight: 600; */
  text-decoration: underline;
}
.order hr{
    width: 100%;
}
.search{
    display: flex;
}
.dropdown {
  position: relative;
  width: auto;
  user-select: none;
}

.selected {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    /* display: flex;
    align-items: center; */
    /* display: flex; */
    /* justify-content: space-between; */
    /* font-weight: 0 !important; */
}

.options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    margin: 0px 0 0;
    list-style: none;
    padding: 0;
}

.option {
    padding: 2px;
    cursor: pointer;
    width: 100%;
    height: 25px;
    background: none;
    border: none;
    border-bottom: 1px solid rgb(108, 108, 108);
}

.option:hover {
    background: #fec02e;
    color: white;
}

.total-product {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
}
.total-product div {
    display: flex;
    gap: 10px;
}
.total-product div .add-product {
    background-color: red;
    color: white;
    border-radius: 4px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}
.total-product div .add-product:hover{
    transform: translateY(-1px);
}
.total-product span{
    /* margin-top: 10px; */
    /* font-weight: bold;    */
    font-size: 18px;
}

.name-column{
    display: flex;
    justify-content: space-between;
    /* gap: 10px; */
    margin-top: 20px;
    background-color: #e3e3e3;
    height: 40px;
    /* padding: 6px;
    padding-top: 8px;
    padding-left: 8px; */
    border-radius: 6px;
}
.name-column span {
    width: 14%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* text-align: center; */
}
.product-detail{
    width: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    
}
.list-product-detail {
    margin-top: 3px;
    border: 1px solid rgb(194, 194, 194);
    border-radius: 5px;
    /* height: ; */
    overflow-y: auto;
    height: 83vh;
}
.small {
    width: 7% !important;
}
.big{
    width: 40% !important;
}
.item{
    width: 100%;
    display: flex;
}
.item span{
    /* width: 16%; */
    display: flex;
    justify-content: center;
    align-items: center;
}
.order_id, .order_total{
    width: 8.2% !important;
}
.order_total {
    color: red;
}
.item .infor-order{
    display: flex;
    justify-content: space-between;
    width: 90%;
    margin-top: 20px;
    /* background-color:#333 */
}
.infor-order .img-name {
    width: 44%;
    display: flex;
    margin-left: 15px;
}
.infor-order .img-name img {
    width: 22%;
    height: 95%;
    /* height: 60; */
}
.infor-order .img-name div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 70%;
    margin-left: 14px;
    /* background-color: red; */
}
.infor-order span {
    width: 12%;
}
.infor-order .min-max-price {
    width: 18%;
}
.infor-order .stock {
    display: flex;
    justify-content: start;
}
.infor-order .img-name div span {
    width: 100%;
    display: inline-block; 
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    margin-left: 10px;
}
.product_id {
    color: #333;
    font-size: 14px;
}
.item .action{
    width: 9%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    font-size: 23px;
}
.item .action button{
    width: 60%;
    cursor: pointer;
    background:none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

}
.fa-toggle-on {
    color: green;
    cursor: pointer;
}
.fa-toggle-off {
    color: #4b4b4b;
    cursor: pointer;
}
.fa-pen-to-square{
    color: red;
    cursor: pointer;
}
.item .action button:hover{
    transform: translateY(-1px);
}

.product{
    width: 74%;
    background-color: #e6e6e6;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    gap: 10px;

}
.main-product {
    display: flex;
    width: 96%;
    margin: 0 auto;
    margin-bottom: 5px;
    margin-top: 5px;
}
.main-product .img-name-product{
    display: flex;
    flex-direction: row;
    width: 45%;
    /* background-color: red;
    justify-content: space-between !important; */
}
.main-product .img-name-product img{
    width: 65px;
    height: 65px;    
}
.main-product .img-name-product div{
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 5px;
    width: 76%;
    gap: 2px;
}
.size{
    display: flex !important;
    flex-direction: row !important;
    justify-content: flex-start !important;
    margin-left: 0 !important;
    font-size: 15px !important;

}
.main-product .img-name-product div .name-product {
    display: inline-block; 
    max-width: 94%; 
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle; 
    font-size: 16px;
    font-weight: 600; 
}
.new{
    width: 23%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.main-product .quantity{
    width: 12%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.main-product .old-new-price{ 
    width: 26%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px
}
.main-order .old-new-price .old {
    text-decoration: line-through;
}
.main-order .sale {
    /* width: 23%; */
    width: 16%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.hr{
    width: 90%;
}
.none-product {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.none-product .img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
}
.none-product .img img {
  width: 60%;
}
.refresh-now {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.refresh-now .refresh,
.fa-rotate-right {
  color: blue !important;
}
.refresh-now .refresh:hover {
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1) !important; 
  cursor: pointer !important;
}
.fa-rotate-right:hover {
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.refresh-now .purchase-now {
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  width: 40%;
  height: 30px;
}
.refresh-now .purchase-now:hover {
  cursor: pointer;
  transform: translateY(-1px);
}
@media(max-width: 767px){

    .title{
        margin-left: 32px;
        font-size: 24px;
    }
    .order{
        width: 100%;
    }
    .list-product{
        overflow-x: auto;
    }
    .name-column, .list-product-detail {
        width: 800px;
    }

    .status{
        width: 95%;
        min-height: 40px;
        font-size: 20px;
        white-space: nowrap;
        overflow-x: auto;
        display: flex;
        gap: 20px;
  }
    .abs{
        position: fixed;
        z-index: 99999;
        background-color: white;
        right: 0;
        width: 200px;
    }
  .status span {
    text-decoration: none !important;
  }
    .status::-webkit-scrollbar {
    display: none;
  }
}
@media(max-width: 520px) {
    .dropdown .selected {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3px;
        height: 30px;
    }
    .title{
        margin-left: 24px;
        font-size: 24px;
    }
}
</style>