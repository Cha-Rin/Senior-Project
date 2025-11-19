import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import "@/assets/tailwind.css"
import i18n from './i18n'  

const app = createApp(App)
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)
app.use(router) 
app.use(VCalendar, {})
app.use(i18n)   // ⭐⭐ ต้องใส่อันนี้ ก่อน mount
app.mount('#app')

