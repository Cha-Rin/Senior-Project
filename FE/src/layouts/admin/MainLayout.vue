<script setup>
import { useRoute } from 'vue-router'
import Sidebar from '@/components/admin/SidebarAdmin.vue'
import Navbar from '@/components/together/Navbar.vue'

const route = useRoute()
const isLoginPage = route.name === 'Login';
</script>

<template>
  <div class="layout">
    <Navbar />
    
    <div class="main-content">
      <Sidebar />
      <div class="page-wrapper ml-64">
        <router-view />
      </div>
    </div>
  </div>
</template>


<!-- <Sidebar v-if="!isLoginPage" />
    <Navbar v-if="!isLoginPage" /> -->
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