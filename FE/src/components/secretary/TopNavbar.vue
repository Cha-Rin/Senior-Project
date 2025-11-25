<template>
  <div
    class="fixed top-0 left-0 w-full z-50 bg-[#003366] text-white px-4 py-2 shadow-md flex items-center justify-between"
  >
    <!-- 🔹 โลโก้ -->
    <div class="flex items-center space-x-3">
      <img src="@/assets/logo.jpg" alt="logo" class="h-8" />
    </div>

    <!-- 🔹 ด้านขวา -->
    <div class="flex items-center space-x-4">
      
      <!-- ===================== 🔔 NOTIFICATION ===================== -->
      <div class="relative"  v-if="showBell">
        <button
          @click="togglePopover"
          class="h-10 px-4 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>

          <span
            v-if="activeStore.activeCount > 0"
            class="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {{ activeStore.activeCount }}
          </span>
        </button>

        <!-- POPUP -->
        <div
          v-if="isPopoverOpen"
          class="absolute right-0 mt-2 w-72 md:w-80 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div class="py-2 px-4 border-b border-gray-200 font-bold">
            Pending list ({{ activeStore.activeCount }})
          </div>

          <ul class="max-h-80 overflow-y-auto">
            <li
              v-if="activeStore.activeCount === 0"
              class="p-4 text-center text-gray-500"
            >
              No notifications
            </li>

            <li 
              v-for="app in activeStore.activeList" 
              :key="app.id"
              class="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div class="mb-2">
                <div class="flex justify-between">
                  <span class="font-semibold">{{ app.name }}</span>
                  <span class="text-sm text-gray-600">{{ app.topic }}</span>
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  <strong>ID:</strong> {{ app.id }}
                </div>

                <div class="text-xs text-gray-500">
                  <strong>Time :</strong> {{ app.time || '-' }}
                </div>
              </div>

              <div class="flex justify-end space-x-2">
                <button
                  @click="activeStore.markDone(app.id)"
                  class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  Complete
                </button>

                <button
                  @click="activeStore.cancel(app.id)"
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Cancal
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- ===================== 👤 EMAIL ===================== -->
      <p class="text-sm font-semibold hidden sm:block">
         <strong>{{ userEmail }}</strong>
      </p>


      <!-- ===================== 🚪 LOGOUT ===================== -->
      <button
        @click="logout"
        class="w-10 h-10 flex items-center justify-center rounded hover:bg-white hover:text-[#003366] transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5m0 0l-5-5m5 5H3"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useRoute } from "vue-router"
const route = useRoute()
import jwt_decode from "jwt-decode"
import { useActiveNotificationStore } from "@/stores/useActiveNotificationStore.js"

const router = useRouter()
const currentLang = ref("th")
const activeStore = useActiveNotificationStore()
const isPopoverOpen = ref(false)


// =============== 👤 USER EMAIL ===============
const userEmail = ref("Guest")


onMounted(() => {
  const token = localStorage.getItem("authToken")
  if (!token) return

  try {
    const decoded = jwt_decode(token)
    userEmail.value = decoded.email || "Unknown"
    const userId = decoded.user_id

    // รายชื่อหน้า Document System
    const documentPages = [
      "RequestDocument",
      "Status",
      "HistoryDocument",
      "RatingDocument"
    ]
    
    // ❌ ถ้าอยู่ในหน้า Document -- หยุด ไม่ต้อง fetch appointment
    if (documentPages.includes(route.name)) {
      return
    }

    // ✔ ถ้าไม่ใช่หน้า Document -- ค่อย fetch appointment
    activeStore.fetchActiveAppointments(userId)
    setInterval(() => activeStore.fetchActiveAppointments(userId), 15000)

  } catch (err) {
    console.error("❌ Failed to decode token:", err)
  }
})


// onMounted(() => {
//   const token = localStorage.getItem("authToken")
//   if (!token) return

//   try {
//     const decoded = jwt_decode(token)
//     userEmail.value = decoded.email || "Unknown"
//     const userId = decoded.user_id

//     activeStore.fetchActiveAppointments(userId)
//     setInterval(() => activeStore.fetchActiveAppointments(userId), 15000)
//   } catch (err) {
//     console.error("❌ Failed to decode token:", err)
//   }
// })


// ซ่อน bell ถ้าเป็นหน้า Document System
const showBell = computed(() => {
  const hideList = [
    "RequestDocument",
    "Status",
    "HistoryDocument",
    "RatingDocument"
  ]
  return !hideList.includes(route.name)
})

// ================= LANGUAGE =================
// function toggleLang() {
//   currentLang.value = currentLang.value === "th" ? "en" : "th"
// }

// ================= POPOVER =================
const togglePopover = () => {
  isPopoverOpen.value = !isPopoverOpen.value
}

// ================= LOGOUT =================
const logout = () => {
  localStorage.clear()
  router.push({ name: "Login" })
}
</script>
