<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <div class="w-full max-w-sm px-6 text-center">
      <!-- 🔵 หัว Welcome -->
      <h1 class="text-7xl font-extrabold mb-10 tracking-tight leading-tight">
        <span style="color: #211C84;">W</span>
        <span style="color: #4D55CC;">e</span>
        <span style="color: #7A73D1;">l</span>
        <span style="color: #B5A8D5;">c</span>
        <span style="color: #7A73D1;">o</span>
        <span style="color: #4D55CC;">m</span>
        <span style="color: #211C84;">e</span>
      </h1>

      <!-- 🟣 ฟอร์มล็อกอิน -->
      <LoginForm />
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue'
</script>
