import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../pages/Auth.vue';
import Header from '../components/Header.vue';
import VerifyOTP from '../components/VerifyOTP.vue';
import CategoryMen from '../pages/CategoryMen.vue';

const routes = [
  { path: '/', redirect: '/header' },
  { path: '/auth/login', name: 'login', component: Auth },
  { path: '/header', name: 'header', component: Header },
  { path: '/auth/register', name: 'register-sendOTP', component: Auth },
  { path: '/verifyRegister', name: 'register-verify', component: VerifyOTP },
  { path: '/categoryMen', name: 'categoryMen', component: CategoryMen}
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

export default router;