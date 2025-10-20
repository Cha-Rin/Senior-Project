import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import "@/assets/tailwind.css"

const app = createApp(App)
import { createPinia } from 'pinia'
const pinia = createPinia()
app.use(pinia)
app.use(router) 
app.use(VCalendar, {})
app.mount('#app')
