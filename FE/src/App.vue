<script setup>
import jwt_decode from "jwt-decode"
import { useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { onMounted } from 'vue'
const router = useRouter()
setInterval(() => {
  const token = localStorage.getItem("authToken")
  if (!token) return

  try {
    const decoded = jwt_decode(token)
    const now = Date.now() / 1000
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      router.push({ name: "Login" })
    }
  } catch {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    router.push({ name: "Login" })
  }
}, 60 * 1000) // ตรวจทุก 1 นาที
const notificationStore = useNotificationStore()
onMounted(() => {
  const loggedInUserId = localStorage.getItem('userId'); 
  if (loggedInUserId) {
    notificationStore.fetchPendingAppointments(loggedInUserId);
    setInterval(() => {
      notificationStore.fetchPendingAppointments(loggedInUserId);
    }, 60000);
  } else {
    console.log('ยังไม่ได้ล็อกอิน, จะไม่เริ่มการแจ้งเตือน');
  }
})
</script>

<template>
  <RouterView />
  
</template>
<!-- <template>
  <AppointmentsFeedback />
</template>

<script setup>
import AppointmentsFeedback from '@/pages/student/AppointmentsFeedback.vue'
</script> -->
