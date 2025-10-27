 import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './routers/index'; 
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App);
app.use(createPinia()); 
app.use(router);  
pinia.use(piniaPluginPersistedstate)      
app.mount('#app');
