//  import { createApp } from 'vue';
// import App from './App.vue';
// import { createPinia } from 'pinia';
// import index from './routers/index'; 
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// const pinia = createPinia()
// const app = createApp(App);
// app.use(createPinia()); 
// app.use(index);  
// pinia.use(piniaPluginPersistedstate)      
// app.mount('#app');


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

app.mount('#app');