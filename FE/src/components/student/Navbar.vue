<template>
  <!-- 🔵 Navbar -->
  <div class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between">
    
    <!-- 🔹 ซ้าย: Hamburger + Logo -->
    <div class="flex items-center space-x-3">
      <button @click="menuOpen = !menuOpen" class="text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <!-- 🔹 ขวา: Email + Lang + Logout -->
    <div class="flex items-center space-x-3">

      <!-- 📧 แสดงอีเมล -->
      <p class="text-sm font-semibold hidden sm:block">
         {{ studentEmail }}
      </p>

      <!-- 🌐 ปุ่มเปลี่ยนภาษา -->
      <!-- <button
        @click="toggleLang"
        class="text-xs font-bold border border-white px-2 py-1 rounded hover:bg-white hover:text-[#003366] transition"
      >
        {{ currentLang === 'th' ? 'EN / TH' : 'TH / EN' }}
      </button> -->

      <!-- 🚪 Logout -->
      <button
        @click="logout"
        class="w-10 h-10 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-6 h-6"
        >
          <path d="M13.5 7.5L10.5 10.75M13.5 7.5L10.5 4.5M13.5 7.5L4 7.5M8 13.5H1.5L1.5 1.5L8 1.5" />
        </svg>
      </button>

    </div>

    <!-- 🔻 Sidebar -->
    <transition name="slide">
      <div v-if="menuOpen" class="fixed inset-0 z-40 bg-black bg-opacity-50" @click="menuOpen = false">
        <nav
          class="w-64 h-full bg-[#003366] text-white p-6 space-y-6"
          @click.stop
        >
          <SidebarItem icon="home" label="Homepage" to="/student/path" />
          <SidebarItem icon="user" label="Choose Topic" to="/student/appointment/topic" />
          <SidebarItem icon="clock" label="History" to="/student/appointment/historytest" />
          <SidebarItem icon="message-square" label="Feedback" to="/student/feedback/appointments" />
        </nav>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SidebarItem from './SidebarItemApp.vue'
import jwt_decode from "jwt-decode"

const router = useRouter()
const menuOpen = ref(false)
const currentLang = ref('th')

// ✅ ตัวแปรใหม่ — แสดง Email
const studentEmail = ref("Guest")

onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const decoded = jwt_decode(token)
    studentEmail.value = decoded.email || "Unknown"
  } catch (err) {
    console.error("❌ Failed to decode user token:", err)
  }
})

// function toggleLang() {
//   currentLang.value = currentLang.value === 'th' ? 'en' : 'th'
// }

const logout = () => {
  localStorage.clear()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
