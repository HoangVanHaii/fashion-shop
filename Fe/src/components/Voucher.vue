<script setup lang="ts">
import { onMounted , ref} from 'vue';
import { voucherStore } from '../stores/voucher';
import { getImage } from '../utils/getImage';
const useVoucher = voucherStore();
import type{ Voucher } from '../interfaces/voucher';
const vouhers = ref<Voucher[]>([]);

onMounted(() => {
    useVoucher.getAllVoucherStore();
    vouhers.value = useVoucher.allVouchers;
})
const emit = defineEmits(['close'])
const handleClose = () => {
    emit('close')
}

</script>
<template>
    <div class="modal" @click="handleClose">
        <div class="container">
            <div class="title">
                <span>Chọn Voucher</span>
            </div>
            <div class="content">
                <div class="search">
                    <span>Mã voucher</span>
                    <div class="acctions"> 
                        <input type="text" placeholder="nhập mã voucher">
                        <button>Áp dụng</button>
                    </div>
                </div>
                <div class="list-voucher">
                    <div v-for="voucher in vouhers" class="voucher">
                        <div class="voucher-image">
                             <img :src="getImage(voucher.image_url)" alt="">
                        </div>
                        <div class="description">
                            <span>{{ voucher.description }}</span>
                            <span>{{ voucher.discount_value }}</span>
                            <div class="expiry-terms">
                                <span class="expiry"><i class="fa-solid fa-clock"></i> HSD: {{ voucher.end_date }}</span>
                                <span class="terms">Điều kiện</span>
                            </div>
                        </div>
                        <div class="select">
                            <input type="radio">
                        </div>
                    </div>
                    
                </div>
                
            </div>
            <div class="btn">
                    <button class="btn-back">Trở lại</button>
                    <button class="btn-ok">OK</button>
                </div>
        </div>    
    </div>
</template>
<style scoped>
.modal{
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
.container{
    width: 450px;
    height:600px;
    background-color: #FFFFFF;
    display: flex;
    gap: 10px;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
}
.title{
    width: 90%;
    /* background-color: yellow; */
    height: 7%;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333;

}
.title span{
    font-size: 20px;
}
.content{
    /* background-color: rgb(152, 152, 245); */
    width: 90%;
    height: 80%;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    gap: 30px;
    /* align-items: center; */
}
.search{
    /* background-color: rebeccapurple; */
    width: 95%;
    height: 10%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background-color: #f4f2f2;
}
.search .acctions{
    display: flex;
    gap: 5px;
}
.acctions input{
    font-size: 17px;
    border-radius: 4px;
}
.acctions button{
    font-size: 15px;
    border-radius: 3px;
}
.list-voucher{
    height: auto;
    display: flex;
    flex-direction: column;
    /* background-color: aquamarine; */
    /* justify-content: center; */
    row-gap: 15px;
    overflow-y: auto;
    align-items: center;

    /* scrollbar/ */
}
.voucher{
    width: 95%;
    height: 100px;
    background-color: rgb(229, 227, 227);
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    padding: 0 5px;
    border: 1px solid #e5e4e4;
    
}
.voucher-image{
    width: 95px;
    height: 95px;
    /* background-color: rgb(46, 226, 43); */
}
.voucher-image img{
    width: 100%;
    height: 100%;
    border-radius: 3px;
}
.description{
    display: flex;
    flex-direction: column;
    /* background-color: aliceblue; */
    /* justify-content: space-between; */
    width: 50%;
    height: 95px;
    gap: 10px;
    justify-content: center;
    /* align-items: center; */
}
.expiry-terms{
    display: flex;
    flex-direction: row;
    justify-content: space-between;

}
.expiry-terms .expiry{
    color: #979696;
}
.expiry-terms .terms{
    color: blue;
}
.select input{
    width: 20px;
    height: 20px;
}
.btn{
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
.btn button{
    width: 90px;
    padding: 4px;
    
    border-radius: 3px;
}
.btn-back{
    background-color: transparent;
    border: solid 1px #979696;
}
.btn-ok{
    border: none;
    background-color: red;
    color: white;
}
</style>