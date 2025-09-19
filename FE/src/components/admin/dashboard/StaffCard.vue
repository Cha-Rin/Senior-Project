<!-- ✅ StaffCard.vue -->
<template>
  <div class="flex items-center p-3 bg-gray-100 rounded shadow cursor-pointer hover:bg-gray-200" @click="goToDetail">
    <img :src="avatar" class="w-20 h-20 rounded-full mr-4" alt="avatar" />
    <div>
      <h3 class="font-bold">{{ name }}</h3>
      <p class="text-yellow-600">⭐ {{ rating }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  id: [String, Number],
  name: String,
  avatar: String,
  rating: Number,
  to: String
})
const router = useRouter()
const goToDetail = () => router.push(props.to || `/staff-rating/${props.id}?name=${encodeURIComponent(props.name)}&avatar=${props.avatar}`)
</script>
