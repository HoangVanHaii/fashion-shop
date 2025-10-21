import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/Home.vue';
import DealHot from '../pages/DealHot.vue';
import AddToCart from '../components/AddToCart.vue';
import Voucher from '../components/Voucher.vue';

const routes = [
  { path: '/', redirect: '/addToCart' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/dealHot', name: 'DealHot', component: DealHot },
  { path: '/addToCart', name: 'Add', component: AddToCart },
  { path: '/selectVoucher', name: 'SelectVoucher', component: Voucher },
  
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

export default router;

