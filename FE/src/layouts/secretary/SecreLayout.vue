<!-- 📁 src/layouts/secretary/SecreLayout.vue -->
<template>
  <div class="layout">
    <!-- Top Navbar -->
    <TopNavbar />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- ใช้ Sidebar ตาม path -->
      <SidebarAppointment v-if="isAppointmentRoute" />
      <SidebarDocument v-else-if="isDocumentRoute" />
      <SidebarSecretary v-else /> <!-- สำหรับหน้าอื่นๆ เช่น Homepage -->

      <!-- Page Content -->
      <div class="page-wrapper"> 
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TopNavbar from '@/components/secretary/TopNavbar.vue'
import SidebarSecretary from '@/components/secretary/SidebarSecretary.vue'
import SidebarAppointment from '@/components/secretary/SidebarAppointment.vue'
import SidebarDocument from '@/components/secretary/SidebarDocument.vue'

// ตรวจสอบว่า route อยู่ในหมวด Appointment หรือไม่
const isAppointmentRoute = computed(() => {
  const path = window.location.pathname
  return [
    '/appointment',
    '/request-appointment',
    '/history-appointment', // ✅ ใช้ Sidebar Appointment สำหรับ /history (Appointment)
    '/feedback'
  ].some(p => path.startsWith(p))
})

// ตรวจสอบว่า route อยู่ในหมวด Document หรือไม่
const isDocumentRoute = computed(() => {
  const path = window.location.pathname
  return [
    '/request-document',
    '/status',
    '/history-document', // ✅ ใช้ Sidebar Document สำหรับ /history-document
    '/rating-document'
  ].some(p => path.startsWith(p))
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  margin-top: 50px; /* ความสูงของ navbar */
}

.page-wrapper {
  flex: 1;
  padding: 2rem;
  background: #f9fafb;
  overflow-y: auto;
}
</style>