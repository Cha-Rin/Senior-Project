<template>
  <div class="relative w-full max-w-xs">
    <!-- ช่อง input -->
    <input
      type="text"
      class="border rounded px-3 py-2 w-full cursor-pointer"
      readonly
      :value="weekRange"
      @click="showCalendar = !showCalendar"
    />

    <!-- ปฏิทิน -->
    <div
      v-if="showCalendar"
      class="absolute z-50 mt-2 bg-white border rounded shadow-md p-2"
    >
      <VDatePicker
        v-model="selectedDate"
        is-inline
        :disabled-dates="disableWeekends"
        :attributes="highlightWeek"
        @dayclick="onDateSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { startOfWeek, addDays, format, isWeekend } from 'date-fns'

// ✅ Emit ไปกราฟ
const emit = defineEmits(['weekSelected'])

const showCalendar = ref(false)
const selectedDate = ref(new Date()) // ค่าเริ่มต้น: วันนี้
const selectedWeek = ref([])

// ✅ เมื่อ mount ให้คำนวณอาทิตย์ปัจจุบัน
onMounted(() => {
  const monday = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
  const friday = addDays(monday, 4)
  selectedWeek.value = [monday, friday]
  emit('weekSelected', [monday, friday])
})

// ✅ เมื่อคลิกวันใหม่
function onDateSelect(day) {
  if (!day || isWeekend(day.date)) return
  selectedDate.value = day.date
  const monday = startOfWeek(day.date, { weekStartsOn: 1 })
  const friday = addDays(monday, 4)
  selectedWeek.value = [monday, friday]
  emit('weekSelected', [monday, friday])
  showCalendar.value = false
}

// ✅ แสดงช่วงวันที่ใน input
const weekRange = computed(() => {
  if (!selectedWeek.value.length) return ''
  const [start, end] = selectedWeek.value
  return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`
})

// ✅ ปิดวันเสาร์–อาทิตย์
const disableWeekends = [
  {
    repeat: { weekdays: [1, 7] }
  }
]

// ✅ ไฮไลต์ช่วงจันทร์–ศุกร์
const highlightWeek = computed(() => {
  if (!selectedDate.value) return []
  const start = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
  const end = addDays(start, 4)
  return [
    {
      key: 'week-highlight',
      highlight: true,
      dates: { start, end },
      contentStyle: { backgroundColor: '#c7d2fe', color: 'black' },
    }
  ]
})
</script>
