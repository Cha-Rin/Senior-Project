<!-- 📁 src/components/secretary/SidebarDocument.vue -->
<template>
  <div class="sidebar-document">
    <!-- Homepage -->
    <router-link to="/homepage" class="menu-item" :class="{ active: $route.name === 'Homepage' }">
      <span class="icon">🏠</span>
      Homepage
    </router-link>

    <!-- Request Document -->
    <router-link to="/request-document" class="menu-item" :class="{ active: $route.name === 'RequestDocument' }">
      <span class="icon">📝</span>
      Request Document
    </router-link>

    <!-- Document Status -->
    <router-link to="/status" class="menu-item" :class="{ active: $route.name === 'Status' }">
      <span class="icon">✅</span>
      Document Status
    </router-link>

    <!-- History -->
    <router-link to="/history-document" class="menu-item" :class="{ active: $route.name === 'HistoryDocument' }">
      <span class="icon">🕒</span>
      History
    </router-link>

    <!-- Feedback -->
    <router-link to="/rating-document" class="menu-item" :class="{ active: $route.name === 'RatingDocument' }">
      <span class="icon">💬</span>
      Feedback
    </router-link>

    <!-- Log out -->
    <div class="menu-item" @click="logout">
      <span class="icon">🚪</span>
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

<style scoped>
.sidebar-document {
  background: #003366;
  color: white;
  width: 250px;
  height: 100vh;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.menu-item {
  padding: 1rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background 0.2s;
  position: relative;
}

.menu-item:hover {
  background: #004080;
}

.menu-item.active {
  background: #003366;
  position: relative;
}

.menu-item.active::before {
  content: "✓";
  position: absolute;
  left: 8px;
  font-weight: bold;
  color: white;
}

.icon {
  font-size: 1.2rem;
}
</style>