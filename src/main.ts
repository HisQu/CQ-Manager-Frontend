import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n } from './i18n'
import router from "./router.ts"
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Use a different accent colour on the dev server, so it is easy to tell apart from production.
if (import.meta.env.DEV) {
    document.documentElement.classList.add('dev-environment')
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(i18n)
    .use(router)
    .use(pinia)
    .mount('#app')
