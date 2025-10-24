<template>
  <div class="min-h-screen bg-white flex">
    <Sidebar />
    <div class="p-8 flex-1">
      <h1 class="text-2xl font-bold mb-4">History</h1>

      <div class="flex items-center gap-4 mb-4">
        <img :src="resolvedAvatar" alt="avatar" class="h-16 w-16 rounded-full border border-gray-300" />
        <div class="text-gray-600 text-lg">{{ staff?.name }}</div>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-4 border-b mb-4">
        <button
          @click="activeTab = 'appointment'"
          :class="activeTab === 'appointment' ? activeTabClass : inactiveTabClass"
        >
          Appointment
        </button>
        <button
          @click="activeTab = 'document'"
          :class="activeTab === 'document' ? activeTabClass : inactiveTabClass"
        >
          Document Tracking
        </button>
      </div>

      <div class="rounded border p-4 shadow bg-white">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b">
              <th>No.</th>
              <th>Student ID</th>
              <th>Date & Time</th>
              <th>Topic</th>
              <th>Note</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in activeData" :key="i" class="border-t">
              <td>{{ row.no }}</td>
              <td>{{ row.studentId }}</td>
              <td>{{ row.datetime }}</td>
              <td>{{ row.topic }}</td>
              <td>{{ row.note }}</td>
              <td>
                <span
                  :class="row.status === 'Approve' ? 'text-green-600' : 'text-red-500'"
                  class="font-semibold"
                >
                  {{ row.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()
const staffStore = useStaffStore()
const staffId = route.params.staffId
const staff = computed(() => staffStore.staffList.find(s => s.id === staffId))

const resolveAvatar = (path) => {
  if (!path) return new URL('/src/assets/default.png', import.meta.url).href
  if (path.startsWith('/src/assets/')) {
    return new URL(path, import.meta.url).href
  }
  return path
}
const resolvedAvatar = computed(() => resolveAvatar(staff.value?.avatar))

const activeTab = ref('appointment')

const appointmentData = computed(() =>
  staffStore.getHistoryByStaff(staffId, 'appointment')
)
const documentData = computed(() =>
  staffStore.getHistoryByStaff(staffId, 'document')
)

const activeData = computed(() =>
  activeTab.value === 'appointment' ? appointmentData.value : documentData.value
)

const activeTabClass = 'pb-2 px-4 font-semibold text-blue-600 border-b-2 border-blue-600'
const inactiveTabClass = 'pb-2 px-4 text-gray-500 hover:text-blue-500'
</script>
