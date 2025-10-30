<script setup lang="ts">
import { computed, onMounted } from 'vue';
import homeSeller from '../../assets/homeSeller.jpg';
import homeSeller1 from '../../assets/homeSeller1.jpg';
import homeSeller2 from '../../assets/homeSeller2.jpg';
import Header from '../../components/Header.vue';
import { flashSaleSellerStore } from '../../stores/sellers/flashSaleStore';
import { formatDateTime, formatPrice } from '../../utils/format';
import { ref } from 'vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import Notification from '../../components/Notification.vue';
import { userStore } from '../../stores/sellers/userStore';
import type { ShopToDoSummary, ShopStatistic } from '../../interfaces/user';

const shopToDoSummary = ref<ShopToDoSummary | null>(null);
const shopStatistic = ref<ShopStatistic | null>(null);
const showForm1 = ref(false);
const showForm2 = ref(false);
const showForm3 = ref(false);
const showForm4 = ref(false);
const shopSeller = userStore();
const toastText = ref("");
const showConfirmDialog = ref(false);
const isNotification = ref<boolean>(false);
const idChoose = ref<number | null>(null);
const useFlashSale = flashSaleSellerStore();

onMounted( async () => {
    await useFlashSale.getFlashSaleSellerHome("active");
    shopToDoSummary.value = await shopSeller.getShopTodoSummaryStore();
    shopStatistic.value = await shopSeller.getShopStatisticStore();

})
const handleShowFormConfirm = (id: number) => {
    idChoose.value = id;
    toastText.value = "";
    showConfirmDialog.value = true;
}
const handleCancelConfirm = () => {
    showConfirmDialog.value = false;
    // isNotification.value = true;
}
const handleCancelFlashSale = async () => {
    showConfirmDialog.value = false;
    if (idChoose.value) {
        await useFlashSale.cancelAllFlashSaleItemStore(idChoose.value)
        useFlashSale.$patch((state) => {
            const index = state.flashSaleHome.findIndex(item => item.id! === idChoose.value)
            if (index !== -1) {
                state.flashSaleHome[index]!.shop_has_sale = false;
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
const handleNotification = () => {
    isNotification.value = false;
    toastText.value = 'Bạn không thể bật khi chưa tham gia Flash Sale này'
}
const conversionRate = computed(() =>{
    const orders = shopStatistic?.value?.totalOrder ?? 0;
    const visits = shopStatistic?.value?.totalVisit ?? 0;
    if (visits === 0) {
        return 0;
    }
    const rate = (orders / visits) * 100;
    return Math.floor(rate); 
});

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
        <div class="component-left"></div>
        <div class="container-content">
            <div class="top-content">
                <div class="left-content">
                    <div class="container-todo">
                        <div class="title">
                            <span>Danh sách việc cần làm</span>
                        </div>
                        <div class="list-todo"> 
                            <div class="todo">
                                <span>{{ shopToDoSummary?.pendingOrderCount || 0 }}</span>
                                <span><i class="fa-solid fa-hourglass-half"></i> Chờ xử lý</span>
                            </div>
                            <div class="todo">
                                <span>{{ shopToDoSummary?.confirmedOrderCount || 0 }}</span>
                                <span><i class="fa-solid fa-check"></i> Đã xử lý</span>
                            </div>
                            <div class="todo">
                                <span>{{ shopToDoSummary?.cancelledOrderCount || 0 }}</span>
                                <span><i class="fa-regular fa-calendar-xmark"></i> Đơn đã hủy</span>
                            </div>
                            <div class="todo">
                                <span>{{ shopToDoSummary?.bannedProductCount || 0 }}</span>
                                <span><i class="fa-solid fa-ban"></i> Sản phẩm bị khóa</span>
                            </div>
                        </div>

                    </div>
                    <div class="sales-analysis">
                        <div class="title">
                            <span>Phân tích bán hàng</span>
                        </div>
                        <div class="list-sales-analysis"> 
                            <div class="analysis">
                                
                                <div class="text">
                                    <span>Doanh số</span>
                                    <i class="fa-regular fa-circle-question" 
                                        @mouseenter="showForm1 = true" 
                                        @mouseleave="showForm1 = false"
                                    ></i>
                                    <div class="text-question" v-if="showForm1" >
                                        <p>Tổng giá trị các đơn hàng đã hoàn thành.</p>
                                    </div>
                                </div>
                                <span>{{ formatPrice(shopStatistic?.totalRevenue || 0) }}</span>
                            </div>
                            <div class="analysis">
                                <div class="text">
                                    <span>Lượt truy cập</span>
                                    <i class="fa-regular fa-circle-question"
                                        @mouseenter="showForm2 = true"
                                         @mouseleave="showForm2 = false"
                                    ></i>
                                    <div class="text-question" v-if="showForm2" >
                                        <p>Tổng số lần người dùng vào trang bán hàng của bạn.</p>
                                    </div>
                                </div>
                                <span>{{ shopStatistic?.totalVisit || 0 }}</span>
                            </div>
                            <div class="analysis">
                                <div class="text">
                                    <span>Đơn hàng</span>
                                    <i class="fa-regular fa-circle-question" 
                                        @mouseenter="showForm3 = true" 
                                        @mouseleave="showForm3 = false"
                                    ></i>
                                    <div class="text-question" v-if="showForm3" >
                                        <p>Tổng số đơn hàng được đặt/hoàn thành.</p>
                                    </div>
                                </div>
                                <span>{{ shopStatistic?.totalOrder || 0 }}</span>
                            </div>
                            <div class="analysis">
                                <div class="text">
                                    <span>Tỷ lệ chuyển đổi đơn hàng</span>
                                    <i class="fa-regular fa-circle-question"
                                    @mouseenter="showForm4 = true" @mouseleave="showForm4 = false"    
                                    ></i> 
                                    <div class="text-question" v-if="showForm4" >
                                        <p>Phần trăm lượt truy cập đã chuyển thành đơn hàng (Đơn hàng / Lượt truy cập).</p>
                                    </div>      
                                </div>
                                <span>{{ conversionRate }}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right-content">
                    <div class="title">
                        <span class="text">Nhiệm vụ người bán</span>
                        <span class="watch-more">Xem thêm</span>
                    </div>
                    <div class="task-content">   
                        <div class="list-task">
                            <div class="task">
                                <span class="text-task"> Tạo mã giảm giá</span>
                                <div class="image">
                                    <img :src="homeSeller" alt="">
                                    <span class="text-process">Tiến hành tạo 1 mã giảm giá</span>
                                </div>
                                    
                                <div class="btn">
                                    <button>Bắt đầu</button>

                                </div>
                            </div>
                        </div>
                        <div class="list-task">
                            <div class="task">
                                <span class="text-task">Đăng mới sản phẩm</span>
                                <div class="image">
                                    <img :src="homeSeller1" alt="">
                                    <span class="text-process">Tiến hành đăng 1 vài sản phẩm</span>
                                </div>
                                <div class="btn"> 
                                    <button>Bắt đầu</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bottom-content">
                <div class="container-title"> 
                    <span class="title">Chiến dịch giảm giá hàng loạt</span>
                    <span class="text">Xem thêmm</span>
                </div>
                <div v-if="useFlashSale.flashSaleHome.length === 0" class="no-content-sale">
                    <img :src="homeSeller2" alt="">
                    <span>Cửa hàng bạn chưa có chiến dịch giảm giá nào</span>
                    <button>Cùng xem chiến dịch giảm giá của hệ thống</button>
                </div>
                <div v-else class="content-sale">
                    <div class="title-row">
                        <span class="long-day">Khung giờ</span>
                        <span class="long">Tên Flash Sale</span>
                        <span class="short">Trạng thái</span>
                        <span class="short">Bật/Tắt</span>
                        <span class="short">Tháo tác</span>
                    </div>
                    <div class="list-flash-sale" >

                        <div class="content-row" v-for="(flashSale) in useFlashSale.flashSaleHome">
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
                    </div>
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
    .fa-circle-question{
        cursor: pointer;
    }
    .container{
        margin-top: 110px;
        /* padding-top: 110px; */
        width: 100%;
        background-color: rgb(195, 191, 191);
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
        width: 81.3%;
        height: 85vh;
        overflow-y: auto;
        /* background-color: red; */
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        /* justify-content: space-between; */

    }
    .top-content{
        margin-top: 5px;
        width: 100%;
        height: 42vh;
        /* background-color: aqua; */
        display: flex;
        border-radius: 6px;
        /* background-color: white; */
        flex-direction: row;
        gap: 4px;
        /* justify-content: space-between; */
    }
    .top-content .left-content{
        /* background-color: antiquewhite; */
        width: 70.5%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
        justify-content: space-between;
    }
    .left-content .container-todo{
        /* background-color: aquamarine; */
        width: 100%;
        height: 49.5%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        background-color: white;
        border-radius: 6px;
        /* justify-content: space-around; */
    }
    .fa-hourglass-half{
        color: rgb(38, 212, 38);
    }
    .fa-check{
        color: rgb(6, 190, 6);
    }
    .fa-ban{
        color: rgb(184, 12, 12);
    }
    .fa-calendar-xmark{
        color: red;
    }
    
    .container-todo .title, .sales-analysis .title{
        width: 95%;
        height: 25%;
        /* background-color: tan; */
        display: flex;
        align-items: center;
        /* justify-content: center; */
    }
    .container-todo .title span, .sales-analysis .title span{
        font-size: 25px;
    }
    .container-todo .list-todo, .sales-analysis .list-sales-analysis{
        /* background-color: red; */
        width: 95%;
        height: 73%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        gap: 5px;
    }
    .list-todo .todo, .list-sales-analysis .analysis{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        justify-content: space-around;
        /* background-color: aqua; */
        /* background-color: antiquewhite; */
        /* justify-content: center;  */
    }
    .list-todo .todo span, .list-sales-analysis .analysis span{
        font-size: 22px;
    }

    .left-content .sales-analysis{
        background-color: white;
        border-radius: 6px;
        width: 100%;
        height: 49.5%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        
    }
    .analysis .text{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 3px;
        position: relative;
        /* background-color: antiquewhite; */
        /* background-color: aquamarine; */
    }
    .analysis .text-question{
        right: 0%;
        /* margin-left: 220px; */
        margin-right: 20px;
        position: absolute;
        background-color: rgb(235, 232, 232);
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        width: 100px;
        height: auto;
        /* height: 120px; */
        z-index: 1000;
        /* padding: 5px; */
        text-align: center;
    }
    .analysis .text-question p{
        padding: 1px;
        margin: 1px;
        font-size: 15px;
        /* background-color: red; */
    }

    .top-content .right-content{
        
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        width: 29%;
        height: 100%;
        background-color: white;
        border-radius: 6px;
        
    }
    .right-content .title{
        width: 90%;
        height: 18%;
        /* background-color: antiquewhite; */
        display: flex;
        flex-direction: column;
        gap: 5px;
        justify-content: center;
        align-items: center;
        justify-content: center;
    }
    .right-content .title .text{
        font-size: 25px;
    }
    .right-content .watch-more{
        width: 93%;
        /* background-color: aqua; */
        text-align: end;
        text-decoration: underline;
        cursor: pointer;
        color: rgb(32, 32, 246);
    }

    .right-content .task-content{
        width: 95%;
        height: 80%;
        /* background-color: rgb(212, 255, 127); */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .task-content .list-task{
        display: flex;
        flex-direction: column;
        border-radius: 6px;
        border: 1px solid #333;
        width: 100%;
        height: 45%;
        justify-content: center;
        align-items: center;
    }
    .list-task .task{
        width: 90%;
        height: 100%;
        /* background-color: yellow; */
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }
    .list-task .task .text-task{
        font-size: 24px;
    }
    .list-task .task .image{
        display: flex;
        height: 20px;
    }
    .list-task .task .image img{
        width: 20px;
        border-radius: 50%;
        height: 100%;
    }
    
    .task .text-process{
        font-size: 19px;
    }
    .list-task .task .btn{
        /* background-color: red; */
        width: 99%;
        display: flex;
        /* flex-direction: ; */
        justify-content: end;
        /* background-color: red; */
    }
    .list-task .task button{
        width: 85px;
        background-color: transparent;
        border: 0.5px solid red;
        padding: 3px;
        font-size: 16px;
        border-radius: 4px;
        color: red;
        cursor: pointer;

        /* text-align: end; */
    }

    .bottom-content{
        width: 100%;
        height: 41vh;
        display: flex;
        flex-direction: column;
        /* background-color: green; */
        background-color: white;
        border-radius: 6px;
        align-items: center;
        justify-content: space-around;
    }
    .bottom-content .container-title{
        width: 92%; 
        /* background-color: aqua; */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 10%;
    }
    .bottom-content .container-title .title{
        font-size: 27px;
        /* background-color: red; */
    }
    .bottom-content .container-title .text{
        color: rgb(19, 19, 241);
        text-decoration: underline;
        cursor: pointer;
    }
    .bottom-content .no-content-sale{
        /* background-color: antiquewhite; */

        width: 95%;
        height: 85%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
    }
    .bottom-content .no-content-sale img{
        width: 140px;
        height: 140px;
    }
    .bottom-content .no-content-sale button{
        border: 0.5px solid red;
        border-radius: 4px;
        padding: 5px 20px;
        background-color: transparent;
        color: red;
        margin-top: 13px;
    }
    .bottom-content .content-sale{
        width: 95%;
        height: 85%;
        background-color: rgb(217, 216, 216);
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
        background-color: rgb(243, 242, 242);
        width: 100%;
        overflow-y: auto;
        height: auto;
        align-items: center;
        /* background-color: aqua; */
        /* justify-content: center; */
        /* gap: 10px; */
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
        .analysis .text-question{
            width: 80px;
        }
    }

    @media(max-width: 768px){
        .analysis .text-question p{
            font-size: 12px;
        }
        .bottom-content .content-sale{
            width: 100%;
            overflow-x: auto;
            /* background-color: red; */
            
            /* margin-left: 20px; */

        }
        .component-left{
            display: none;
        }
        .container-content, .top-content .right-content, .top-content .left-content{
            width: 100%;
        }
        .top-content{
            flex-direction: column;
        }
        .right-content .task-content{
            flex-direction: row;
        }
        .right-content .title{
            flex-direction: row;
            justify-content: space-around;
        }
        .right-content .title .text{
            font-size: 17px;
        }
        /* .right-content .watch-more */
        .right-content .watch-more{
            width: auto;
            font-size: 11px;
        }
        .list-task .task .text-task{
            font-size: 14px;
        }
        .list-task .task button{
            width: 60px;
            background-color: transparent;
            border: 0.5px solid red;
            padding: 2px;
            font-size: 9px;
            border-radius: 4px;
            color: red;

            /* text-align: end; */
        }
        .task .text-process{
            font-size: 11px;
        }
        .content-sale .title-row{
            width: 630px;
            overflow-x: auto;
            /* background-color: blueviolet; */
            /* padding-left: 100px; */
        }
        .content-sale .list-flash-sale{
            width: 630px;
        }
        .list-flash-sale .content-row{
            width: 100%;
            /* width: 1000px; */
        }
        .container-todo .title span, .sales-analysis .title span{   
            font-size: 16px;
        }
        .list-todo .todo span, .list-sales-analysis .analysis span{
            font-size: 12px;
        }
        .bottom-content .container-title .title{
            font-size: 19px;
            /* background-color: red; */
        }
    }

    
</style>