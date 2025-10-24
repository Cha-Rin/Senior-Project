<!-- 📁 src/components/secretary/TopNavbar.vue -->
<template>
  <div class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between">
    <!-- ซ้าย: โลโก้ (ไม่มี hamburger เพราะใช้ sidebar ถาวร) -->
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
      <span class="text-sm font-semibold whitespace-nowrap hidden sm:inline">
        สำนักวิชาเทคโนโลยีดิจิทัลประยุกต์
      </span>
    </div>

    <!-- ขวา: Language + Logout -->
    <div class="flex items-center space-x-3">
      <button @click="toggleLang" class="text-xs font-bold">
        {{ currentLang === 'th' ? 'EN / TH' : 'TH / EN' }}
      </button>
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
    stroke-linecap="round"
    stroke-linejoin="round"
    class="w-6 h-6 block"
  >
    <path d="M13.5 7.5L10.5 10.75M13.5 7.5L10.5 4.5M13.5 7.5L4 7.5M8 13.5H1.5L1.5 1.5L8 1.5" />
  </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentLang = ref('th')

function toggleLang() {
  currentLang.value = currentLang.value === 'th' ? 'en' : 'th'
}

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}
</script>