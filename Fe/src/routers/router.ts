import Pay from '../components/Pay.vue'
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/pay',
    name: 'pay',
    component: Pay
  },


]
const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router