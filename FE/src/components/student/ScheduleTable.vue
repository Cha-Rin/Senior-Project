<!-- src/components/ScheduleTable.vue -->
<template>
  <div class="overflow-x-auto mb-4">
    <table class="border-collapse text-sm">
      <thead>
        <tr>
          <th class="border px-2 py-1 bg-white"></th>
          <th v-for="day in days" :key="day" class="border px-2 py-1">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, i) in timeSlots" :key="i">
          <td class="border px-2 py-1 bg-gray-50 text-left">{{ time }}</td>
          <td
            v-for="(col, j) in days.length"
            :key="j"
            :class="getCellClass(i, j)"
            class="border w-12 h-6"
          ></td>
        </tr>
      </tbody>
    </table>
    <!-- Legend -->
    <div class="flex items-center gap-2 text-sm mt-2">
      <div class="w-3 h-3 bg-red-500 rounded-full"></div>
      <span>ไม่ว่าง</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleTable',
  data() {
    return {
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      timeSlots: [
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00'
      ],
      unavailableSlots: [
        [1, 1], [2, 0], [4, 3], [6, 2], [7, 4]
      ],
      closedSlots: [
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]
      ]
    }
  },
  methods: {
    getCellClass(row, col) {
      if (this.unavailableSlots.some(([r, c]) => r === row && c === col)) {
        return 'bg-red-500'
      }
      if (this.closedSlots.some(([r, c]) => r === row && c === col)) {
        return 'bg-gray-400'
      }
      return ''
    }
  }
}
</script>
