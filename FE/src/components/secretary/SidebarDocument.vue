<!-- 📁 src/components/secretary/SidebarDocument.vue -->
<template>
  <div class="flex flex-col min-h-screen w-64 bg-[#003366] text-white p-6 box-border">
    <!-- Homepage -->
    <router-link
      to="/homepage"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Homepage' }"
    >
      <span class="text-xl">🏠</span>
      Homepage
    </router-link>

    <!-- Request Document -->
    <router-link
      to="/request-document"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RequestDocument' }"
    >
      <span class="text-xl">📝</span>
      Request Document
    </router-link>

    <!-- Document Status -->
    <router-link
      to="/status"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'Status' }"
    >
      <span class="text-xl">✅</span>
      Document Status
    </router-link>

    <!-- History -->
    <router-link
      to="/history-document"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'HistoryDocument' }"
    >
      <span class="text-xl">🕒</span>
      History
    </router-link>

    <!-- Feedback -->
    <router-link
      to="/rating-document"
      class="flex items-center gap-3 p-4 mb-2 rounded-lg hover:bg-[#004080] transition relative"
      :class="{ 'border-b-4 border-blue-400 pb-3': $route.name === 'RatingDocument' }"
    >
      <span class="text-xl">💬</span>
      Feedback
    </router-link>

    <!-- Log out -->
    <div
      class="flex items-center gap-3 p-4 mt-auto rounded-lg hover:bg-[#004080] cursor-pointer transition"
      @click="logout"
    >
      <span class="text-xl">🚪</span>
      Log out
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('userRole')
  router.push({ name: 'Login' })
}
</script>
