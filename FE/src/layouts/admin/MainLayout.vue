<script setup>
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'

const route = useRoute()
const isLoginPage = route.name === 'Login';
</script>

<template>
  <div class="min-h-screen bg-white">
    <Sidebar v-if="!isLoginPage" />
    <Navbar v-if="!isLoginPage" />
    <main class=" px-4">
      
      <slot />
      <router-view/>
    </main>
  </div>
</template>
