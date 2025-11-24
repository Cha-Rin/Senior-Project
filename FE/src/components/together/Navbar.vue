<!-- 📁 src/components/secretary/TopNavbar.vue -->
<template>
  <div
    class="fixed top-0 left-0 w-full h-16 z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between"
  >
    <!-- 🔹 Logo -->
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <!-- 🔹 Right section -->
    <div class="flex items-center space-x-4">
      
      <!-- 👤 ชื่อ + อีเมล -->
      <div class="hidden sm:block text-right leading-tight">
        <p class="text-xs text-gray-300">{{ userEmail }}</p>
      </div>


      <!-- 🚪 Logout -->
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
          <path d="M10 17l5-5-5-5M3 12h12M21 19V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import jwt_decode from "jwt-decode"

const router = useRouter()
const currentLang = ref('th')

// 🧑‍💼 User Data
const userName = ref("Guest")
const userSurname = ref("")
const userEmail = ref("")

// 🧠 computed ชื่อเต็ม
const fullName = computed(() =>
  `${userName.value} ${userSurname.value}`.trim() || "Guest"
)

onMounted(() => {
  const token = localStorage.getItem("authToken")
  if (!token) return

  try {
    const decoded = jwt_decode(token)

    // 📌 ดึง name / surname / email จาก JWT
    userName.value = decoded.name || ""
    userSurname.value = decoded.surname || ""
    userEmail.value = decoded.email || ""

    // 📌 เก็บลง localStorage เผื่อหน้าอื่นต้องใช้
    localStorage.setItem("name", userName.value)
    localStorage.setItem("surname", userSurname.value)
    localStorage.setItem("email", userEmail.value)

  } catch (err) {
    console.error("❌ Failed to decode JWT:", err)
  }
})

// 🌐 Language Toggle
function toggleLang() {
  currentLang.value = currentLang.value === "th" ? "en" : "th"
}

// 🚪 Logout
const logout = () => {
  localStorage.clear()
  router.push({ name: "Login" })
}
</script>

<style scoped>
@media (max-width: 640px) {
  .text-sm {
    font-size: 0.85rem;
  }
}
</style>
