import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, OderPayLoad } from '../interfaces/order'
import { createOrderAPI } from '../services/order'

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<Order | null>(null) // order vừa tạo

  const createOrder = async (payload: OderPayLoad) => {
    const res = await createOrderAPI(payload)
    currentOrder.value = res
    return res
  }

  return { 
    currentOrder, 
    createOrder
 }
})
