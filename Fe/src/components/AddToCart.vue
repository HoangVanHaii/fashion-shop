<script setup lang="ts">
import { getImage } from '../utils/getImage';
import type { ProductSummary } from '../interfaces/product';
import { formatPrice } from '../utils/formatPrice';
import { ref } from 'vue';
const emit = defineEmits(['close']);
const handleClose = () => {
    emit('close')
}
const quantity = ref(1);
const props = defineProps(['product'])
</script>

<template>
    <div class="modal" @click="handleClose" >

        <div class="container" @click.stop>
            <div class="product-image">
                <div class="main-image">
                    <button class="btn btn-prev" @click=""><</button>
                    <button class="btn btn-close" @click=""><i class="fa-solid fa-xmark"></i></button>
                    <img :src="getImage('/uploads/products/ao-blazer-nu-den-main.jpg')" alt="">
                    <button class="btn btn-next" @click="">></button>
                </div>
                <div class="item-images">
                    <div class="image">
                        <img :src="getImage('/uploads/products/ao-blazer-nu-den-main.jpg')" alt="">
                    </div>
                    <div class="image" v-for="value in props.product.images">
                        <img :src="getImage(value)" alt="">
                    </div>
                </div>
            </div>
            <div class="product-content">
                <div class="product-description">
                    <span class="name">{{ props.product?.name }}</span>
                    <span class="code">Mã sản phẩm: 1900{{ product.id }}</span>
                </div>
                <div class="product-prices">
                    <span>Giá:</span>
                    <span class="new-price" v-if="product.flash_price">{{ formatPrice(product.max_price)}}</span>
                    <span class="old-price">{{ product.flash_price ? formatPrice(product.flash_price!) : product.min_price }}</span>
                </div>
                <div class="product-sizes">
                    <span class="text-size">Kích thước: </span>
                    <div class="list-size">
                        <!-- <div v-for="value in source" class="size">
        
                        </div> -->
                        <div class="size">X</div>
                        <div class="size">M</div>
                        <div class="size">L</div>
                        <div class="size">XL</div>
                        <div class="size">M</div>
                        <div class="size">S</div>
                       
                        <!-- <div <div class="size">XS</div> class="size">XXL</div> -->
                    </div>
                </div>
                <div class="product-colors">
                    <div class="text-color">
                        <span>Màu sắc: </span>
                        <span class="text">Trắng</span>
                    </div>
                    <div class="list-color">

                        <div class="color"></div>
                        <div class="color"></div>
                        <div class="color"></div>
                        <div class="color"></div>
                        <div class="color"></div>
                        <!-- <div v-for="value in source" class="color">
    
                        </div> -->
                    </div>
                    <div class="product-quantity">
                        <span>Số lượng: </span>
                        <div class="btn-quantity">
                            <button class="dec" @click="quantity = Math.max(quantity - 1, 1)">-</button>
                            <input v-model="quantity" type="number"/>
                            <button class="dec" @click="quantity = Math.min(quantity + 1, product.stock!)">+</button>
                        </div>
                    </div>
                </div>
                <div class="btn-bottom">
                    <div class="btn-addtocart">
                        <button>Thêm vào giỏ hàng</button>
                    </div>
                    <div class = share>
                        <span class="share-with"><i class="fa-solid fa-share"></i> Chia sẻ tới: </span>
                        <i class="fa-brands fa-facebook-messenger"></i>
                        <i class="fa-brands fa-facebook"></i>
                        <i class="fa-brands fa-instagram"></i>
                        <i class="fa-brands fa-twitter"></i>
                    </div>
                    <button class="btn-detail">Xem chi tiết sản phẩm >></button>
                </div>
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
    /* box-shadow: 0 2px 4px rgba(120, 118, 118, 0.2); */
    /* background-color: rgba(132, 132, 132, 0.6); */
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}

.container{
    position: fixed;
    width: 600px;
    height: 400px;
    border-radius: 4px;
    padding: 10px;
    background-color: white;
    display: flex;
    flex-direction: row;
}
.product-image{
    /* background-color: aqua; */
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: 10px; */
    justify-content: space-between;

    /* padding: 3px; */
}
.main-image{
    position: relative;
    width: 95%;
    /* background-color: red; */
    height: 77%;
    border: solid 1px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.btn{
    position: absolute;
    top: 50%;
    font-size: 20px;
    background-color: rgb(215, 215, 215);
    border-radius: 5px;
    padding: 1px 3px;
    transform: translateY(-50%);
    color: black;
    z-index: 10;
    cursor: pointer;
}
.btn-close{
    display: none;
}
.btn:hover{
    background-color: rgb(255, 255, 255);
}
.btn-prev{
    left: 10px;
}
.btn-close{
    right: 0px;
    top: 10px;
}
.btn-next{
    right: 10px;
}
.main-image img{
    width: 95%;
    height: 95%;
}
.item-images{
    /* background-color: blue; */
    width: 95%;
    height: 20%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid;
}
.image{
    width: 65px;
    height: 65px;
}
.image img{
    width: 100%;
    height: 100%;
}
.product-content{
    display: flex;
    width: 45%;
    padding: 10px;
    flex-direction: column;
    gap: 5px;
    /* background-color: aqua; */
}
.product-description{
    width: 100%;
    height: 15%;
    /* background-color: antiquewhite; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
}
.product-description .code{
    font-size: 13px;
}
.product-prices{
    width: 100%;
    height: 7%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    align-items: center;
    /* background-color: red; */
}
.old-price{
    font-size: 15px;
    /* display: flex;
    justify-content: center;
    align-items: center; */
    text-decoration: line-through;

}
.new-price{
    color: red;
}
.product-sizes{
    width: 100%;
    height: 25%;
    display: flex;
    flex-direction: row;
    align-items: center;
    /* background-color: rgb(138, 138, 227); */
}
.text-size{
    width: 35%;
    /* background-color: antiquewhite; */
}
.list-size{
    width: 65%;
    /* background-color: aquamarine; */
    display: flex;
    flex-direction: row;
    /* collum-gap: 15px; */
    column-gap: 15px;
    row-gap: 10px;
    flex-wrap: wrap;
}
.size{
    width: 40px;
    height: 25px;
    /* background-color: red; */
    border: 1px solid;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.product-colors{
    display: flex;
    flex-direction: column;
    /* background-color: rgb(122, 122, 218); */
    width: 100%;
    height: 25%;
}
.text-color{
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 20%;
    /* background-color: rgb(0, 255, 81); */
    gap: 15px;
}
.text-color .text{
    color: rgb(74, 73, 73);
}
.list-color{
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
    height: 50%;
    /* background-color: rgb(234, 234, 145); */
    align-items: center;
}
.color{
    width: 30px;
    height: 30px;
    /* background-color: red; */
    border: 1px solid;
    border-radius: 4px;

}
.product-quantity{
    display: flex;
    flex-direction: row;
    gap: 15px;
    /* align-items: center; */
    margin-top: 5px;
    margin-bottom: 5px;
}

/* .quantity{
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    gap: 40px
} */
.btn-quantity{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    justify-items: center;
    gap: 1px;
    /* background-color: yellow; */
}

input{
    width: 24px;
    height: 17px;
}
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input:focus {
    outline: none; 
    border: 1px solid #007bff;
    box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}
.dec{
    width: 23px;
    height: 21px;
    background:none;
    border: 1px solid rgb(48, 48, 48);
}
.dec:hover{
    cursor: pointer;
    border: solid 1px red;
}
.btn-bottom{
    /* background-color: rgb(101, 220, 101); */
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 23%;
    justify-content: space-between;
}
.btn-addtocart{
    width: 100%;
    /* background-color: rgb(101, 178, 197); */
    display: flex;
    justify-content: center;
}
.btn-addtocart button{
    font-size: 13px;
    width: 60%;
    height: 27px;
    border-radius: 3px;
    color: white;
    background-color: red;
    border: none;
}
.share{
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
}
.fa-facebook-messenger{
    margin-left: 4px;
    color: rgb(82, 216, 250);
}
.fa-facebook{
    margin-left: 4px;
    color: blue;
}
.fa-instagram{
    margin-left: 4px;
    color: rgb(165, 84, 240);
}
.fa-twitter{
    margin-left: 4px;
    /* background-color: rgb(48, 161, 236); */
    color: white;
}
.btn-detail{
    color: rgb(48, 46, 46);
    background-color: transparent;
    border: none;
    text-decoration: underline;
}
@media(max-width : 768px){
    .container{
        flex-direction: column;
        /* align-items: center; */
        width: 350px;
        height: 700px;
    }
    .item-images{
        display: none;
    }
    .product-image{
        width: 100%;
        height: 60%;
    }
    .main-image{
        width: 100%;
        height: 100%;
        /* position: relative;
        display: flex;
        justify-content: center; */
    }
    
    .product-content{
        width: 99%;
        height: 40%;
        gap: 5px;
    }
    .product-description{
        width: 100%;
        height: 15%;
        display: flex;
        flex-direction: column;
        /* background-color: red; */
    }
    .product-description .name{
        font-size: 19px;
    }
    .code{
        display: none;
    }
    .product-prices{
        width: 100%;
        height: 15%;
        justify-content: flex-start;
        /* background-color: #007bff; */
    }
    input{
        border: 1px solid #333  ;
    }
    .product-sizes{
        width: 100%;
        height: 20%;
        /* background-color: aqua; */
    }
    .list-size{
        column-gap: 20px;
        row-gap: 10px;
    }
    .product-colors{
        height: 40%;
        /* background-color: greenyellow; */
    }
    .text-color{
        height: 25%;
        /* background-color: red; */
    }
    .product-description span{
        font-size: 12px;
    }
    .text-size{
        font-size: 16px;
    }
    .size{
        width: 40px;
        height: 15px;
    }
    .product-colors{
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .btn-bottom{
        height: 10%;
    }
    .color{
        width: 40px;
        height: 40px;
    }
    .share{
        display: none;
        
    }
    
    .btn-close{
        display:flex
    }
}


</style>