import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { Cart, ShopCart, CartItemDetail } from '../interfaces/cart'
import { fetchCartAPI , removeCartItemAPI} from '../services/cart'

export const useCartStore = defineStore('cart', () =>{
    const shops= reactive<ShopCart[]>([])
    const totalQuantity = ref(0)
    // const token = localStorage.getItem('token') || "";
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjA4NTE2NjgsImV4cCI6MTc2MDg1NTI2OH0.opd_G7ebwtGVUQft-6AmwMlb0ODdWk9-VwS2DBek6D0"
    const selectAll = ref(true)
    const total = computed(() => {
        let sum = 0
        shops.forEach(shop => {
            const shopTotal = shop.carts?.reduce((s, p) => {
            return p.selected ? s + p.price * p.quantity : s
            }, 0) || 0
            sum += shopTotal
        })
        return sum
    })

    const getCart= async(token:string)=>{
        const cart:Cart=await fetchCartAPI(token)
        shops.splice(0,shops.length,...cart.shops)
        shops.forEach(shop=>{
            shop.carts?.forEach(product=>{
                product.selected = selectAll.value
            })
        })
    }

    const increase = (cartItem : CartItemDetail)=>{
        cartItem.quantity++
    }
    
    const decrease = (cartItem: CartItemDetail)=> {
    if (cartItem.quantity > 1) cartItem.quantity--
    }
    const toggleSelectAll = () => {
        shops.forEach(shop => {
        shop.carts?.forEach(item => (item as CartItemDetail).selected = selectAll.value)
        })
    }

    const removeCartItem = async (shop : ShopCart, cartItem : CartItemDetail) =>{
        await removeCartItemAPI(cartItem.cart_item_id)
        const index = shop.carts?.findIndex(i=>i.cart_item_id===cartItem.cart_item_id) ?? -1
        if(index!==-1) shop.carts?.splice(index,1)
    }

    return { 
        shops, 
        total, 
        totalQuantity, 
        selectAll, 
        getCart, 
        increase, 
        decrease, 
        toggleSelectAll, 
        removeCartItem 
    }
})