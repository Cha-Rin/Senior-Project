<template>
  <div class="space-y-4">
    <div v-for="(c, i) in comments" :key="i" class="border-b pb-2">
      <p class="font-semibold">{{ c.name }}</p>
      <p class="text-yellow-600">★ {{ c.stars }}</p>
      <p class="text-sm text-gray-700">{{ c.text }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['comments'])
</script>
