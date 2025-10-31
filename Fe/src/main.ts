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
>>>>>>> 3f0046b263cd1286add0233e47b1568b424b7712
