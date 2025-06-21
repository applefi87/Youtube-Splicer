import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css';
import { useClips } from './stores/clips';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Load clip list from URL or local storage if provided
const params = new URLSearchParams(window.location.search);
const encoded = params.get('data');
const store = useClips(pinia);
if (encoded) {
  store.loadEncoded(encoded);
} else {
  store.loadLocal();
}

app.mount('#app');
