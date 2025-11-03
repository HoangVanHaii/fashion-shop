<script setup lang="ts">
import Header from '../../components/Header.vue';
import { formatDateTime } from '../../utils/format';
import { flashSaleSellerStore } from '../../stores/sellers/flashSaleStore';
import { onMounted, watch } from 'vue';
import { ref } from 'vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import Notification from '../../components/Notification.vue';
import Navbar from '../../components/sellers/Navbar.vue';

const showConfirmDialog = ref(false);
const toastText = ref("");
const isNotification = ref<boolean>(false);
const useFlashSale = flashSaleSellerStore();
const idChoose = ref<number | null>(null);
const status = ref<string>("");
const searchTime = ref<string>('');



onMounted( async () => {
    await useFlashSale.getFlashSaleSeller("");
    useFlashSale.filterFlashSale(status.value, "");
})

watch([status, searchTime], () => {
    useFlashSale.filterFlashSale(status.value, searchTime.value);
})
const handleNotification = () => {
    toastText.value = ''
    isNotification.value = false;
    setTimeout(() => {
        toastText.value = 'Bạn không thể bật khi chưa tham gia Flash Sale này';
    }, 0);
}
const handleCancelFlashSale = async () => {
    showConfirmDialog.value = false;
    toastText.value = '';
    if (idChoose.value) {
        await useFlashSale.cancelAllFlashSaleItemStore(idChoose.value)
        useFlashSale.$patch((state) => {
            const index = state.flashSale.findIndex(item => item.id! === idChoose.value)
            if (index !== -1) {
                state.flashSale[index]!.shop_has_sale = false;
            }
        })
        if (useFlashSale.isSuccess) {
            isNotification.value = true;
            toastText.value = 'Bạn đã hủy tất cả sản phẩm trong Flash Sale';
        }
        else {
            isNotification.value = false;
            toastText.value = 'Không thể hủy tất cả sản phẩm trong Flash Sale'
        }
    }
}
const handleShowFormConfirm = (id: number) => {
    idChoose.value = id;
    toastText.value = "";
    showConfirmDialog.value = true;
}
const handleCancelConfirm = () => {
    showConfirmDialog.value = false;
}

</script>


<template>
    <Header />
    <ConfirmDialog v-if="showConfirmDialog"
        :message="'Bạn có chắc chắn hủy hết sản phẩm trong Flash Sale này?'"
        @close="handleCancelConfirm"
        @confirm="handleCancelFlashSale"
    />
    <Notification 
        :text="toastText"
        :isSuccess="isNotification" 
     />
    <div class="container">
         <Navbar 
         :isShow='false'
        :showManagermentOrder= 'false'
        :showManagermentProduct= 'false'
        :showData= 'false'
        :showCustomCare= 'false'
        :showManagermentShop= 'false'
        :showMarketing= 'true'
        :showVoucher= 'false'
        :showFlashSale= 'true'
        :showAllOrder= 'false'
        :showAllProduct= 'false'
        :showAddProduct= 'false'
        :showReview= 'false'
        :showProfileShop= 'false'
        :showProfile= 'false'
        :showStatistical= 'false'
        class="abs"
        ></Navbar>
        <div class="container-content">
            <div class="top-content">
                <span class="content1">Danh sách chương trình</span>
                <span class="content2">Chạy Flash Sale để tăng doanh số</span>
            </div>
            <div class="navbar">
                <div class="navbar-content">
                    <span @click="status = ''" :class="{ 'active-tab': status === ''}">Tất cả</span>
                    <span @click="status = 'active'" :class="{ 'active-tab': status === 'active'}">Đang diễn ra</span>
                    <span @click="status = 'pending'" :class="{ 'active-tab': status === 'pending'}">Sắp diễn ra</span>
                    <span @click="status = 'ended'" :class="{ 'active-tab': status === 'ended'}">Đã kết thúc</span>
                </div>
            </div>
            <div class="search-time">
                <span>Khung giờ</span>
                <input type="datetime-local" class="input-time" v-model="searchTime" >
            </div>
            <div class="content-sale">
                <div class="title-row">
                    <span class="long-day">Khung giờ</span>
                    <span class="long">Tên Flash Sale</span>
                    <span class="short">Trạng thái</span>
                    <span class="short">Bật/Tắt</span>
                    <span class="short">Tháo tác</span>
                </div>
                <div class="list-flash-sale" >

                    <div class="content-row" v-for="(flashSale) in useFlashSale.displayFlashSale">
                        <div class="date">
                            <span class="long-date">{{ formatDateTime(flashSale.start_date) }} </span>
                            <span class="long-date">{{ formatDateTime(flashSale.end_date) }}</span>
                        </div>
                        <span class="long">{{ flashSale.title }}</span>
                        <span class="short">{{ flashSale.status }} </span>
                        <span class="short" v-if="!flashSale.shop_has_sale" @click="handleNotification"><i class="fa-solid fa-toggle-off"></i></span>
                        <span class="short" v-else @click="handleShowFormConfirm(flashSale.id!)"><i class="fa-solid fa-toggle-on"></i></span>
                        <span class="short"><i class="fa-solid fa-pen-to-square"></i></span>
                    </div>
                    
                    <!-- <div class="content-row" v-for="(flashSale) in useFlashSale.displayFlashSale">
                        <div class="date">
                            <span class="long-date">{{ formatDateTime(flashSale.start_date) }} </span>
                            <span class="long-date">{{ formatDateTime(flashSale.end_date) }}</span>
                        </div>
                        <span class="long">{{ flashSale.title }}</span>
                        <span class="short">{{ flashSale.status }} </span>
                        <span class="short" v-if="!flashSale.shop_has_sale" @click="handleNotification"><i class="fa-solid fa-toggle-off"></i></span>
                        <span class="short" v-else @click="handleShowFormConfirm(flashSale.id!)"><i class="fa-solid fa-toggle-on"></i></span>
                        <span class="short"><i class="fa-solid fa-pen-to-square"></i></span>
                    </div> -->
                    
                    
                    
                    
                </div>
            </div>
        </div>
    </div>


</template>

<style scoped>
    .fa-toggle-on{
        color: rgb(24, 206, 55);
        font-size: 25px;
        cursor: pointer;
    }
    .fa-toggle-off{
        cursor: pointer;
        font-size: 25px;
        
    }
    .fa-pen-to-square{
        cursor: pointer;
        font-size: 20px;
    }
    .navbar-content .active-tab{
        border-bottom: 2px solid red;
    }
    .container{
        margin-top: 110px;
        /* padding-top: 110px; */
        width: 100%;
        /* background-color: rgb(195, 191, 191); */
        height: 83vh;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .component-left{
        width: 17%;
        /* position: fixed; */
        height: 83vh;
        /* padding: 10px; */
        background-color: white;
        /* background-color: aqua; */
    }
    .container-content{
        width: 81%;
        /* height: 78vh; */
        /* overflow-y: auto; */
        /* background-color: red; */
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        background-color: white;
        margin-top: 5px;
        /* background-color: rgb(137, 221, 143); */
        gap: 7px;
        border-radius: 7px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        /* justify-content: space-between; */

    }
    .top-content{
        width: 95%;
        height: 70px;
        display: flex;
        flex-direction: column;
        /* align-items: center; */
        gap: 15px;
        justify-content: center;
        /* background-color: red; */
        /* background-color: red; */
        margin-bottom: 15px;
    }
    .top-content .content1{
        font-size: 25px;
    }
    .top-content .content2{
        font-size: 22px;
        color: rgb(112, 111, 111);
    }
    .navbar{
        margin-top: 20px;
        width: 95%;
        border-bottom: 0.5px solid #848181;
    }
    .navbar-content{
        display: flex;
        flex-direction: row;
        /* justify-content: center; */
        align-items: center;
        justify-content: space-between;
        width: 50%;
        padding-bottom: 3px;
        /* background-color: yellow; */
        /* left: 0%; */
    }
    .navbar-content span{
        font-size: 20px;
        cursor: pointer;
    }
    .search-time{
        width: 95%;
        /* background-color: aqua; */
        display: flex;
        margin-top: 15px;
        margin-bottom: 15px;

        gap: 30px;
    }
    .input-time{
        width: 170px;
        height: 20px;
    }
    .search-time span{
        font-size: 17px;
    }
    .content-sale{
        /* margin-top: 20px; */
        width: 95%;
        height: 70vh;
        /* height: 100%; */
        /* height: 600px; */
        /* background-color: rgb(14, 34, 152); */
        /* background-color: rgb(188, 188, 188); */
        /* background-color: antiquewhite; */
        display: flex;
        flex-direction: column;
        /* gap: 10px; */
        /* overflow-y: auto; */
        /* align-items: center; */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        border: 1px solid #908f8f;
        border-radius: 3px;
        background-color: rgb(201, 200, 200);
        /* background-color: red; */
        /* justify-content: center; */
    }
    .content-sale .title-row{
        display: flex;
        width: 98%;
        height: 40px;
        justify-content: space-between;
        align-items: center;
        margin: 0 auto;
        background-color: rgb(201, 200, 200);
        /* background-color: rgb(217, 216, 216); */
        /* background-color: aqua; */
    }
    .content-sale .title-row span{
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    .content-sale .title-row .long{
        width: 35%;
    }
    .content-sale .title-row .short{
        width: 11%;
    }
    .content-sale .list-flash-sale{
        
        display: flex;
        flex-direction: column;
        background-color: white;
        width: 100%;
        height: 40vh;
        /* height: auto; */
        overflow-y: auto;
        align-items: center;
    }
    .content-sale .list-flash-sale::-webkit-scrollbar{
        width: 0px;
    }
    .list-flash-sale .content-row{
        width: 98%;
        height: 50px;
        /* background-color: #d0cfcf; */
        display: flex;
        flex-direction: row;
        
        align-items: center;
        /* background-color: aquamarine; */
        justify-content: space-between;
        border-bottom: 1px solid #d0cfcf;

    }
    .list-flash-sale .content-row .long, .list-flash-sale .content-row .short{
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        /* background-color: aqua; */
        /* overflow: hidden; */
    }
    .list-flash-sale .content-row .date{
        display: flex;
        flex-direction: column;
        /* background-color: #333; */
        align-items: center;
        justify-content: center;
        gap: 2px;
        width: 20%;
        /* display: inline-block; */
        /* white-space: nowrap ; */
        /* background-color: red; */
        /* text-overflow: ellipsis; */
        /* max-width: 100px; */
        /* background-color: rgb(114, 114, 221); */
    }
    .content-row .date .long-date{
        /* background-color: aquamarine; */
        text-align: center;
        width: 100%;
        display: inline-block; 
        white-space: nowrap; 
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .abs {
        z-index: 999;
        background-color: white;
    }
    
    .list-flash-sale .content-row .long{
        width: 35%;
        /* background-color: red; */
    }
    .list-flash-sale .content-row .short{
        width: 11%;
    }
    .content-sale .title-row .long-day{
        width: 20%;
        /* background-color: #908f8f; */
    }

    @media(max-width: 1200px){
        .content-sale .list-flash-sale{
            /* background-color: red; */
            height: 58vh;
        }
    }
    @media(max-width: 768px){
        .component-left{
            display: none;
        }
        .container-content{
            width: 95%;
        }
        .abs{
            position: fixed;
            z-index: 99999;
            background-color: white;
            right: 0;
            width: 200px;
        }
        .content-sale{
            overflow-y: auto;
            /* background-color: aqua; */
        }
        .content-sale .list-flash-sale{
            width: 600px;
        }
        .content-sale .title-row{
            width: 600px;
        }
        .navbar .navbar-content{
            width: 100%;
            /* background-color: red; */
        }
        .navbar .navbar-content span{
            font-size: 15px;
        }
        .search-time span{
            font-size: 13.5px;
        }
        .content-sale .title-row span{
            font-size: 15px;
        }
        .list-flash-sale .content-row span{
            font-size: 13px;
        }
    }
    
</style>