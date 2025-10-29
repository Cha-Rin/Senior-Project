<!-- src/components/secretary/weekpicker.vue -->
<template>
  <div class="ml-4 inline-flex gap-2">
    <button
      @click="selectWeek('prev')"
      class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-black"
    >
      ← Prev
    </button>
    <button
      @click="selectWeek('current')"
      class="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded-lg font-medium text-black"
    >
      This Week
    </button>
    <button
      @click="selectWeek('next')"
      class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-black"
    >
      Next →
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['weekSelected'])

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // จันทร์ = 1
  return new Date(d.setDate(diff))
}

const getWeekRange = (offsetWeeks = 0) => {
  const today = new Date()
  const monday = getMonday(today)
  monday.setDate(monday.getDate() + offsetWeeks * 7)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4) // จันทร์ → ศุกร์

  const formatDate = (d) => d.toISOString().slice(0, 10)
  return [formatDate(monday), formatDate(friday)]
}

const selectWeek = (type) => {
  let offset = 0
  if (type === 'prev') offset = -1
  if (type === 'next') offset = 1
  emit('weekSelected', getWeekRange(offset))
}
</script>