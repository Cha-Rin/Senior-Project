<template>
  <div class="min-h-screen  p-4">
    <!-- ✅ Header พร้อมปุ่ม Logout -->
    <!-- <div class="max-w-md mx-auto mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Feedback Required</h1>
      <button
        @click="handleLogout"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
      >
        ออกจากระบบ
      </button>
    </div> -->
    

    <!-- ⏳ Loading State -->
    <div v-if="!guard.loaded || guard.loading" class="text-center py-8">
      <p class="text-gray-600">กำลังโหลด...</p>
    </div>

    <!-- ✅ แสดง Feedback Component -->
    <Feedback
      v-else-if="guard.loaded && pendingItems.length > 0"
      :items="pendingItems"
      :topics="pendingTopics"
      @submit="handleSubmit"
    />

    <!-- ⚠️ ไม่มีข้อมูล -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">ไม่มีรายการที่ต้องทำ feedback</p>
      <button
        @click="router.push({ name: 'PathSelect' })"
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
      >
        กลับหน้าหลัก
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useFeedbackGuard } from "@/stores/useFeedbackGuard";
import { useRouter } from "vue-router";
import Feedback from "@/components/student/Feedback.vue";

const guard = useFeedbackGuard();
const router = useRouter();

const pendingItems = ref([])
const pendingTopics = ref([])

function updatePendingData() {
  const appointments = (guard.pendingAppointments || []).map(a => ({
    ...a,
    category: 'Appointment',
    type: 'appointment'
  }))

  const documents = (guard.pendingDocuments || []).map(d => ({
    ...d,
    category: 'Document',
    type: 'document'
  }))

  pendingItems.value = [...appointments, ...documents]

  const topicsSet = new Set()
  appointments.forEach(a => {
    if (a.topic) topicsSet.add(a.topic)
  })
  documents.forEach(d => {
    if (d.topic) topicsSet.add(d.topic)
  })
  pendingTopics.value = Array.from(topicsSet)
}

onMounted(async () => {
  if (!guard.loaded) {
    await guard.loadPending()
  }

  updatePendingData()

  if (!guard.mustFeedback) {
    router.push({ name: 'PathSelect' })
  }
});

watch(
  () => [guard.pendingAppointments, guard.pendingDocuments],
  () => {
    updatePendingData()
  },
  { deep: true, immediate: true }
)

async function handleSubmit(payload) {
  const token = localStorage.getItem('authToken')
  if (!token) {
    alert('❌ ไม่พบ token กรุณา login ใหม่')
    return
  }

  try {
    const item = pendingItems.value.find(i => i.id === payload.itemId)
    if (!item) {
      alert('❌ ไม่พบรายการ')
      return
    }

    const endpoint = item.type === 'appointment'
      ? '/api/student/feedback/appointments'
      : '/api/student/feedback/documents'

    const bodyKey = item.type === 'appointment' ? 'appointment_id' : 'document_id'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        [bodyKey]: payload.itemId,
        ratings: payload.ratings,
        comment: payload.note || ''
      })
    });

    const result = await res.json();

    if (result.success) {
      alert('ส่งความคิดเห็นเรียบร้อย ✅');

      if (item.type === 'appointment') {
        guard.removeAppointment(payload.itemId)
      } else {
        guard.removeDocument(payload.itemId)
      }

      updatePendingData()

      if (!guard.mustFeedback) {
        alert('ทำ feedback ครบแล้ว! 🎉')
        router.push({ name: 'PathSelect' })
      }
    } else {
      alert(result.message || 'เกิดข้อผิดพลาด');
    }
  } catch (e) {
    console.error('❌ handleSubmit error:', e);
    alert('เกิดข้อผิดพลาดในการส่ง feedback');
  }
}

function handleLogout() {
  if (confirm('คุณต้องการออกจากระบบ?')) {
    guard.logout()
    router.push({ name: 'Login' })
  }
}
</script>