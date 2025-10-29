import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import index from './routers/index';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(index);

<<<<<<< HEAD
app.mount('#app');
=======
app.mount('#app');
>>>>>>> 7b848bd5f2dfdafa2c22ac67c7e1720b83e5df18
