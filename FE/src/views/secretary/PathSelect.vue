<template>
  <div class="flex flex-col items-center justify-center min-h-screen space-y-6 bg-white px-4">
    <!-- Appointment Card -->
    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="goToAppointment"
    >
      Appointment
    </button>

    <!-- Document Tracking Card -->
    <button
      class="w-64 h-28 bg-blue-900 text-white rounded-xl shadow-md text-lg font-semibold hover:bg-blue-800 transition"
      @click="goToRequestDocument"
    >
      Document Tracking
    </button>
      
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToAppointment() {
  router.push('/secretary/appointment/appointment')
}

function goToRequestDocument() {
  router.push('/secretary/document/request')
}
</script>
