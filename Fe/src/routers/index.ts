import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../pages/Auth.vue';
import Header from '../components/Header.vue';
import VerifyOTP from '../components/VerifyOTP.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import CategoryGender from '../pages/CategoryGender.vue';
import Home from '../pages/Home.vue';
import DealHot from '../pages/DealHot.vue';
import AddToCart from '../components/AddToCart.vue';
import OrderSuccess from '../pages/OrderSuccess.vue';
import Order from '../pages/Order.vue';
import NavbarProfile from '../components/NavbarProfile.vue';
import Profile from '../pages/Profile.vue';
import OrderDetail from '../pages/OrderDetail.vue';
import Favourite from '../pages/Favourite.vue';
import Shop from '../pages/Shop.vue'
import HeaderSeller from '../components/sellers/Header.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/auth/login', name: 'login', component: Auth },
  { path: '/header', name: 'header', component: Header },
  { path: '/seller/header', name: 'header-seller', component: HeaderSeller },
  { path: '/auth/register', name: 'register-sendOTP', component: Auth },
  { path: '/verifyRegister', name: 'register-verify', component: VerifyOTP },
  { path: '/categoryGender', name: 'category-gender', component: CategoryGender },
  { path: '/product/:id', name: 'product-detail', component: ProductDetail },
  { path: '/dealHot', name: 'DealHot', component: DealHot },
  { path: '/addToCart', name: 'AddToCart', component: AddToCart },
  { path: '/orderSuccess', name: 'OrderSuccess', component: OrderSuccess },
  { path: '/profile/orderOfme', name: 'order-of-me', component: Order },
  { path: '/navbarProfile', name: 'nav-bar', component: NavbarProfile },
  { path: '/profile/me', name: 'profile', component: Profile },
  { path: '/profile/orderOfme/:id', name: 'order-detail', component: OrderDetail },
  { path: '/profile/favouriteOfme', name: 'favourite', component: Favourite },
  { path: '/shop/:id', name: 'shop', component: Shop },
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });

export default router;

