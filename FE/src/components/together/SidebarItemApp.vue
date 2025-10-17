<template>
  <div class="flex items-center space-x-3 cursor-pointer hover:text-gray-300">
    <router-link
  :to="to"
  class="flex items-center space-x-3 hover:text-gray-300"
>
  <component :is="iconComponent" class="w-5 h-5" />
  <span class="font-semibold">{{ label }}</span>
</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Home, User, CheckCircle, Clock, MessageSquare, LogOut
} from 'lucide-vue-next'

const props = defineProps({
  icon: String,
  label: String,
  to: {
    type: [String, Object],
    required: true
  }
})

const iconMap = {
  home: Home,
  user: User,
  'check-circle': CheckCircle,
  clock: Clock,
  'message-square': MessageSquare,
  'log-out': LogOut
}

const iconComponent = computed(() => iconMap[props.icon] || User)
</script>
