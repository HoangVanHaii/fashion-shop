import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../pages/Auth.vue';
import Header from '../components/Header.vue';
import VerifyOTP from '../components/VerifyOTP.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import CategoryGender from '../pages/CategoryGender.vue';
import Notification from '../components/Notification.vue';

const routes = [
  { path: '/', redirect: '/header' },
  { path: '/auth/login', name: 'login', component: Auth },
  { path: '/notification', name: 'noti', component: Notification },
  { path: '/header', name: 'header', component: Header },
  { path: '/auth/register', name: 'register-sendOTP', component: Auth },
  { path: '/verifyRegister', name: 'register-verify', component: VerifyOTP },
  { path: '/categoryGender', name: 'category-gender', component: CategoryGender },
  { path: '/product/:id', name: 'product-detail', component: ProductDetail }
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

export default router;