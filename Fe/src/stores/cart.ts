import { defineStore } from 'pinia'
import { ref, reactive, computed, watch  } from 'vue'
import type { Cart, ShopCart, CartItemDetail } from '../interfaces/cart'
import { fetchCartAPI ,updateSizeCartItemAPI, removeCartItemAPI, updateCartItemQuantityAPI} from '../services/cart'
import type { ProductPayload,ProductColor,ProductSize } from '../interfaces/product'
import { getProductIdBySize, getProductById,getProductSizesBySizeId } from '../services/product'


export const useCartStore = defineStore('cart', () =>{
    const cartPay = ref<Cart|null>(null)
    const shops= reactive<ShopCart[]>([])
    const selectedShops= ref<ShopCart[]>([])
    const totalQuantity = ref(0)
    const selectAll = ref(true)
    const total_price_after_reduction = computed(() => {
        let sum = 0
        shops.forEach(shop => {
            const shopTotal = shop.carts?.reduce((s, p) => {
            return (p.selected && !p.sold_out) ? s + p.price_after_reduction! * p.quantity : s
            }, 0) || 0
            sum += shopTotal
        })
        return sum
    })

    const total_price = computed(() => {
        let sum = 0
        shops.forEach(shop => {
            const shopTotal = shop.carts?.reduce((s, p) => {
            return (p.selected && !p.sold_out) ? s + p.price * p.quantity : s
            }, 0) || 0
            sum += shopTotal
        })
        return sum
    })

    const totalItemCount = computed(() => {
        return shops.reduce((sum, shop) => 
            sum + (shop.carts?.filter(item => !item.sold_out).length || 0),
            0
        )
        })


    const totalSelectedItemCount = computed(() => {
        return shops.reduce((sum, shop) => {
            return sum + (
            shop.carts?.filter(item => item.selected && !item.sold_out).length || 0
            )
        }, 0)
    })


    const getCart= async()=>{
        const cart:Cart=await fetchCartAPI()
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

    const toggleSelectShop = (shop: ShopCart, value: boolean) => {
    shop.carts?.forEach(item => {
        if(!item.sold_out)item.selected = value})
    }

    const shopSelected = (shop: ShopCart) => {
        return computed(() => {
            let selected=true
            shop.carts?.forEach(item=>{
                if(item.sold_out) return
                if(item.selected === false) selected = false
            })
            return selected
        })
    }

    watch(shops,()=>{
        selectAll.value = shops.every(shop => shop.carts?.every(item => item.selected))
    },{deep: true})

    // watch(shops,() =>{
    //     shops.forEach(shop => {
    //     shop.carts?.forEach(item => {if (item.sold_out && item.selected) item.selected = false  })
    //     })
    // },
    // { deep: true }
    // )




    const toggleSelectAll = () => {

        shops.forEach(shop => {
        shop.carts?.forEach(item => (item as CartItemDetail).selected = selectAll.value)
        })
    }

// const toggleSelectAll = async () => {
//     await nextTick()
//   shops.forEach(shop => {
//     shop.carts?.forEach(item => {
//       if (!item.sold_out) {
//         item.selected = selectAll.value
//       }
//     })
//   })
// }


    const removeCartItem = async (shop : ShopCart, cartItem : CartItemDetail) =>{
        await removeCartItemAPI(cartItem.cart_item_id)
        const index = shop.carts?.findIndex(i=>i.cart_item_id===cartItem.cart_item_id) ?? -1
        if(index!==-1) shop.carts?.splice(index,1)

        for (let i = shops.length - 1; i >= 0; i--) {
            const currentShop  = shops[i];
            if (!currentShop  || !currentShop .carts?.length) {
                shops.splice(i, 1);
            }
        }
    }

    const removeSelectedItemsApi = async() =>{
        for(const shop of shops){
            if(!shop.carts) continue
            const selectItems = shop.carts.filter(item=>item.selected)
            for(const item of selectItems){
                await removeCartItemAPI(item.cart_item_id)
                const index = shop.carts.findIndex(i=>i.cart_item_id === item.cart_item_id)
                if(index !== -1) shop.carts.splice(index,1)
            }
        }

        for (let i = shops.length - 1; i >= 0; i--) {
            const shop = shops[i];
            if (!shop || !shop.carts?.length) {
                shops.splice(i, 1);
            }
        }
    }

    const checkSoldOut = async ()=>{
        console.log("da goi check")
        for(const shop of shops){
            if(!shop.carts) continue;
            for(const item of shop.carts){
                const productSizeCheck : ProductSize = await getProductSizesBySizeId(item.size_id);
                if(productSizeCheck.stock > 0){
                    item.sold_out=false;
                    item.selected=false;
                }
                else  item.sold_out=true;
            }
        }
    } 
    const selectedColor = ref<ProductColor | null>(null)

    const selectedProduct = ref<ProductPayload | null>(null)
    const getProductDetail = async (cartItem: CartItemDetail) => {
        try {
            const productId = await getProductIdBySize(cartItem.size_id)
            const product: ProductPayload = await getProductById(productId)            
            selectedProduct.value = product || null // default lấy color đầu tiên nếu ko tìm thấy
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error)
        }
    }

    const updateCartItemSize = async (cartItem: CartItemDetail, newSizeId: number) => {
        try {
            await updateSizeCartItemAPI(cartItem.cart_item_id, newSizeId);
            // checkSoldOut();
            cartItem.size_id = newSizeId;
        } catch (error) {
            console.error('Cập nhật size thất bại:', error);
        }
    };

    const updateCartItemQuantity = async (cartItem: CartItemDetail, newQuantity: number) => {
        try {
            await updateCartItemQuantityAPI(cartItem.cart_item_id, newQuantity);
            
            cartItem.quantity = newQuantity;
            checkSoldOut();
        } catch (error) {
            console.error('Cập nhật size thất bại:', error);
        }
    };

    const quantityTimeouts = new Map<number, ReturnType<typeof setTimeout>>()

    const updateCartItemQuantityDebounced = (cartItem: CartItemDetail, newQuantity: number) => {
        if (quantityTimeouts.has(cartItem.cart_item_id)) {
            clearTimeout(quantityTimeouts.get(cartItem.cart_item_id))
        }
        const timeout = setTimeout(async () => {
            try {
            await updateCartItemQuantityAPI(cartItem.cart_item_id, newQuantity)
            cartItem.quantity = newQuantity
            } catch (error) {
            console.error('Cập nhật quantity thất bại:', error)
            } finally {
            quantityTimeouts.delete(cartItem.cart_item_id)
            }
        }, 500)

        quantityTimeouts.set(cartItem.cart_item_id, timeout)
    }

    const filterSelectedItems = () => {
        if (!cartPay.value) {
            cartPay.value = { shops: [], total_quantity: 0, total_amount: 0,voucher_discount:0,voucher_code:"" }
        }
        cartPay.value?.shops.splice(0, cartPay.value?.shops.length)

        shops.forEach(shop => {
            const selectedItems = shop.carts?.filter(item => item.selected && !item.sold_out) || []
            if (selectedItems.length > 0) {
                cartPay.value!.shops.push({
                    ...shop,
                    carts: selectedItems
                })
            }
        })
    }


    
    return { 
        shops, 
        total_price_after_reduction,
        total_price,
        totalQuantity, 
        selectAll, 
        getCart, 
        increase, 
        decrease, 
        toggleSelectAll, 
        removeCartItem,
        shopSelected,
        toggleSelectShop,
        totalItemCount,
        totalSelectedItemCount,
        removeSelectedItemsApi,
        getProductDetail,
        selectedColor,
        updateCartItemSize,
        updateCartItemQuantity,
        updateCartItemQuantityDebounced,
        selectedShops,
        filterSelectedItems,selectedProduct,
        checkSoldOut,
        cartPay
    }
},{
    persist:{
        paths: ['cartPay']
    } as any
})