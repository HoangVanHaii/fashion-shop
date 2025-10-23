import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../pages/Auth.vue';
import Header from '../components/Header.vue';
import VerifyOTP from '../components/VerifyOTP.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import CategoryGender from '../pages/CategoryGender.vue';
import Notification from '../components/Notification.vue';
import Home from '../pages/Home.vue';
import DealHot from '../pages/DealHot.vue';
import AddToCart from '../components/AddToCart.vue';
import Voucher from '../components/Voucher.vue';
import OrderSuccess from '../pages/OrderSuccess.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/auth/login', name: 'login', component: Auth },
  { path: '/notification', name: 'noti', component: Notification },
  { path: '/header', name: 'header', component: Header },
  { path: '/auth/register', name: 'register-sendOTP', component: Auth },
  { path: '/verifyRegister', name: 'register-verify', component: VerifyOTP },
  { path: '/categoryGender', name: 'category-gender', component: CategoryGender },
  { path: '/product/:id', name: 'product-detail', component: ProductDetail },
  { path: '/dealHot', name: 'DealHot', component: DealHot },
  { path: '/addToCart', name: 'AddToCart', component: AddToCart },
  { path: '/selectVoucher', name: 'SelectVoucher', component: Voucher },
  { path: '/orderSuccess', name: 'OrderSuccess', component: OrderSuccess },
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

export default router;

