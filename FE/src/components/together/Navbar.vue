<!-- 📁 src/components/secretary/TopNavbar.vue -->
<template>
  <div
    class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between"
  >
    <!-- 🔹 ซ้าย: โลโก้ -->
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <!-- 🔹 ขวา: ชื่อผู้ใช้ + ปุ่มภาษา + Logout -->
    <div class="flex items-center space-x-3">
      <!-- ชื่อผู้ใช้ -->
      <p class="text-sm font-semibold hidden sm:block">
        👩‍💼 {{ userName || 'Guest' }}
      </p>

      <!-- ปุ่มสลับภาษา -->
      <button @click="toggleLang" class="text-xs font-bold">
        {{ currentLang === 'th' ? 'EN / TH' : 'TH / EN' }}
      </button>

      <!-- ปุ่ม Logout -->
      <button
        @click="logout"
        class="w-10 h-10 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
        title="Logout"
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
          <path
            d="M10 17l5-5-5-5M3 12h12M21 19V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentLang = ref('th')

// ✅ เก็บชื่อผู้ใช้
const userName = ref('Guest')

// โหลดชื่อผู้ใช้จาก localStorage
onMounted(() => {
  const name = localStorage.getItem('name') || ''
  const surname = localStorage.getItem('surname') || ''
  if (name || surname) {
    userName.value = `${name} ${surname}`.trim()
  }
})

// ✅ ตรวจอัปเดตชื่ออัตโนมัติเมื่อ localStorage เปลี่ยน
watchEffect(() => {
  const name = localStorage.getItem('name') || ''
  const surname = localStorage.getItem('surname') || ''
  userName.value = name || surname ? `${name} ${surname}`.trim() : 'Guest'
})

// ✅ ฟังก์ชันเปลี่ยนภาษา
function toggleLang() {
  currentLang.value = currentLang.value === 'th' ? 'en' : 'th'
}

// ✅ ฟังก์ชัน Logout
const logout = () => {
  localStorage.clear() // ล้าง token, role, name, etc.
  router.push({ name: 'Login' })
}
</script>

<style scoped>
/* เพิ่ม spacing ให้สวยขึ้นในจอเล็ก */
@media (max-width: 640px) {
  .text-sm {
    font-size: 0.8rem;
  }
}
</style>
