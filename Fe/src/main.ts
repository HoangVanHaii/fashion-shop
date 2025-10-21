import { createApp } from 'vue';
import App from './App.vue';
// import './.css';
import { createPinia } from 'pinia';
import router from './routers'; 

const app = createApp(App);
app.use(createPinia()); 
app.use(router);  
app.mount('#app');
