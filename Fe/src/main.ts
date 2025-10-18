import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './routers/index'; 

const app = createApp(App);
app.use(createPinia()); 
app.use(router);  
app.mount('#app');