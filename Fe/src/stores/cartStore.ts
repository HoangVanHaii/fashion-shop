import { ref, reactive, computed, watch  } from 'vue'
import { defineStore } from "pinia";
import type { Cart, ShopCart, CartItemDetail } from '../interfaces/cart'
import { getCartCount, addToCart, fetchCartAPI ,updateSizeCartItemAPI, removeCartItemAPI, updateCartItemQuantityAPI } from "../services/cart";
import type { ProductPayload,ProductColor,ProductSize } from '../interfaces/product'
import { getProductIdBySize, getProductById,getProductSizesBySizeId } from '../services/product'

export const useCartStore = defineStore('cart', () => {
    const success = ref<boolean>(false);
    const error = ref<string | null>(null);
    const cartCount = ref<number[]>([]);
    const loading = ref<boolean>(false);
    const getCartCountStore = async () => {
        try {
            const res = await getCartCount();
            cartCount.value = res.data.counts;
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            return 0;
        }
    }
    const resetCartCount = () => {
        cartCount.value = [];
    };
    const addToCartStore = async (size_id: number, quantity: number) => {
        success.value = false;
        error.value = null;
        loading.value = true;
        try {
            const res = await addToCart(size_id, quantity); 
            const isExist = cartCount.value.includes(size_id);
            if (!isExist) {
                cartCount.value.push(size_id);
            }
            success.value = true;
            loading.value = false;
            return res;
        } catch (err: any) {
            const message = err.response.data.message;
            if (message == "your cart count is full size") {
                error.value = "❌ Sản phẩm này đã đầy trong giỏ hàng rồi"
            }
            if (err.response.status === 401 || err.response.status === 400) {
                error.value = '❌vui lòng đăng nhập trước';
            }
            loading.value = false;
        }
    }
    const cartPay = ref<Cart|null>(null)
    const shops= reactive<ShopCart[]>([])
    const selectedShops= ref<ShopCart[]>([])
    const totalQuantity = ref(0)
    const selectAll = ref(true)
    watch(shops, () => {
        shops.forEach(shop => {
            if (shop.carts) {
                shop.total_shop = shop.carts
                    .filter(item => item.selected && !item.sold_out)
                    .reduce((sum, item) => sum + (item.price_after_reduction ?? item.price) * item.quantity, 0);
            } else {
                shop.total_shop = 0;
            }
        });
    }, { deep: true });

    watch(() => cartPay.value?.shops,
    (newCartPayShops) => {
        if (!newCartPayShops) return;

        newCartPayShops.forEach(shop => {
        if (shop.carts) {
            shop.total_shop = shop.carts
            .filter(i => i.selected && !i.sold_out)
            .reduce((sum, i) => sum + (i.price_after_reduction ?? i.price) * i.quantity, 0);
        } else {
            shop.total_shop = 0;
        }
        });
    },
    { deep: true }
);

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

    watch(() => cartPay.value?.shops,
        (newCartPayShops) => {
            if (!newCartPayShops) return;

            newCartPayShops.forEach(shop => {
            if (shop.carts) {
                shop.total_shop = shop.carts
                .filter(i => i.selected && !i.sold_out)
                .reduce((sum, i) => sum + (i.price_after_reduction ?? i.price) * i.quantity, 0);
            } else {
                shop.total_shop = 0;
            }
            });
        },
        { deep: true }
    );
    
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


    const getCart = async () => {
        try {
            const res = await fetchCartAPI()
            const cart: Cart = res.data
            // const cartShops = cart.shops ?? []
            // shops.splice(0, shops.length, ...cartShops)
            shops.splice(0, shops.length, ...cart.shops)
            shops.forEach(shop => {
                shop.carts?.forEach(product => {
                    product.selected = selectAll.value
                })
            })
        } catch (error) {
            console.error('Lấy giỏ hàng thất bại:', error)
        }
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

    const toggleSelectAll = () => {
        shops.forEach(shop => {
        shop.carts?.forEach(item => (item as CartItemDetail).selected = selectAll.value)
        })
    }

    const removeCartItem = async (shop: ShopCart, cartItem: CartItemDetail) => {
        try {
            await removeCartItemAPI(cartItem.cart_item_id)
            const index = shop.carts?.findIndex(i => i.cart_item_id === cartItem.cart_item_id) ?? -1
            if (index !== -1) shop.carts?.splice(index, 1)
            for (let i = shops.length - 1; i >= 0; i--) {
                const currentShop = shops[i];
                if (!currentShop || !currentShop.carts?.length) {
                    shops.splice(i, 1);
                }
            }
            await getCartCountStore();
        } catch (error) {
            console.error('Xóa item giỏ hàng thất bại:', error)
        }
    }

    const removeSelectedItemsApi = async () => {

        const itemsToRemove: number[] = [];

        for (const shop of shops) {
            if (!shop.carts) continue;

            const selectedItems = shop.carts.filter(item => item.selected);
            for (const item of selectedItems) {
                itemsToRemove.push(item.cart_item_id);
            }


            shop.carts = shop.carts.filter(item => !item.selected);
        }

        for (let i = shops.length - 1; i >= 0; i--) {
            const shop = shops[i];
            if (!shop || !shop.carts || shop.carts.length === 0) {
                shops.splice(i, 1);
            }
        }

        try {
            await Promise.all(itemsToRemove.map(id => removeCartItemAPI(id)));
        } catch (error) {
            console.error("Xóa giỏ hàng lỗi:", error);
        }

        await getCartCountStore();
    };

    const removePaidItems = async () => {
        if (!cartPay.value?.shops?.length) return

        for (const shop of cartPay.value.shops) {
            if (!shop.carts || shop.carts.length === 0) continue

            for (const item of shop.carts) {
                try {
                    await removeCartItemAPI(item.cart_item_id) 
                    const shopIndex = shops.findIndex(s => s.shop_id === shop.shop_id)
                    if (shopIndex === -1) continue

                    const currentShop = shops[shopIndex]
                    if (!currentShop || !currentShop.carts) continue

                    const itemIndex = currentShop.carts.findIndex(i => i.cart_item_id === item.cart_item_id)
                    if (itemIndex !== -1) currentShop.carts.splice(itemIndex, 1)

                    if (currentShop.carts.length === 0) shops.splice(shopIndex, 1)
                } catch (err) {
                    console.error(`❌ Xóa item ${item.cart_item_id} thất bại:`, err)
                }
            }
        }
        cartPay.value = null
    }


    const checkSoldOut = async () => {
        for(const shop of shops){
            if(!shop.carts) continue;
            for(const item of shop.carts){
                try {
                    const productSizeCheck: ProductSize = await getProductSizesBySizeId(item.size_id);
                    if(productSizeCheck.stock > 0){
                        item.sold_out=false;
                        item.selected=false;
                    } else {
                        item.sold_out=true;
                    }
                } catch (error) {
                    console.error(`Kiểm tra stock cho item ${item.cart_item_id} thất bại:`, error)
                }
            }
        }
    }
    const selectedColor = ref<ProductColor | null>(null)

    const selectedProduct = ref<ProductPayload | null>(null)
    const getProductDetail = async (cartItem: CartItemDetail) => {
        try {
            const productId = await getProductIdBySize(cartItem.size_id) 
            const product: ProductPayload = await getProductById(productId.product_id) 
            selectedProduct.value = product || null
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

const updateCartItemQuantityDebounced = async (cartItem: CartItemDetail, newQuantity: number) => {  // Thêm async
  if (quantityTimeouts.has(cartItem.cart_item_id)) {
    clearTimeout(quantityTimeouts.get(cartItem.cart_item_id))
  }
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(async () => {
      try {
        await updateCartItemQuantityAPI(cartItem.cart_item_id, newQuantity)
        cartItem.quantity = newQuantity
        resolve(true)
      } catch (error) {
        reject(error)
      } finally {
        quantityTimeouts.delete(cartItem.cart_item_id)
      }
    }, 500)
    quantityTimeouts.set(cartItem.cart_item_id, timeout)
  })
}

    const filterSelectedItems = () => {
        if (!cartPay.value) {
            cartPay.value = { shops: [], total_quantity: 0, total_amount: 0,voucher_discount:0,voucher_code:"" }
        }
        cartPay.value.shops.splice(0, cartPay.value.shops.length)

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

    return { getCartCountStore , addToCartStore, success, error, loading, cartCount,shops, 
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
        cartPay,
        removePaidItems,
        resetCartCount
    };
},{
    persist:{
        paths: ['cartPay']
    } as any
})
