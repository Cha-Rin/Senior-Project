<template>
  <div class="p-8 space-y-6 max-w-md mx-auto bg-white min-h-screen">
    <h1 class="text-xl font-semibold text-center mt-8">Feedback</h1>

    <!-- 🔽 Topic Dropdown -->
    <div class="mb-4">
      <select v-model="selectedTopic" class="border rounded p-2 w-full">
        <option value="">-- เลือกหัวข้อ --</option>
        <option
          v-for="(topic, index) in filteredTopics"
          :key="index"
          :value="topic"
        >
          {{ topic }}
        </option>
      </select>
    </div>

    <!-- 📄 รายการที่ต้องประเมิน -->
    <div
      v-for="item in filteredItems"
      :key="item.id"
      @click="openModal(item)"
      class="bg-white shadow-md rounded-xl p-4 text-sm relative space-y-2 mb-4 border cursor-pointer hover:border-blue-500 transition"
    >
      <div class="flex justify-between items-center font-semibold text-black">
        <span>#{{ item.id }}</span>
      </div>

      <div class="text-black">
        <p>
          Date: {{ item.date }}
          <span
            v-if="item.time && item.time !== 'N/A'"
            class="ml-2"
            >Time: {{ item.time }}</span
          >
        </p>
        <p>Topic: {{ item.topic }}</p>
        <p>Note: {{ item.note }}</p>
      </div>
    </div>

    <p
      v-if="filteredItems.length === 0"
      class="text-center text-gray-500 italic mt-8"
    >
      ไม่มีรายการที่ต้องทำแบบประเมิน 🎉
    </p>

    <!-- 🔹 Popup Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
    >
      <div
        class="bg-white rounded-lg w-[90%] max-w-md p-6 shadow-xl relative animate-fadeIn"
      >
        <button
          class="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
          @click="closeModal"
        >
          ×
        </button>

        <h2 class="text-lg font-semibold mb-2 text-center">
          แบบประเมินความพึงพอใจ
        </h2>
        <p class="text-sm text-gray-600 mb-4 text-center">
          หัวข้อ: {{ selectedAppointment?.topic }}
        </p>

        <!-- 🌟 Rating Section -->
        <div
          v-for="(question, qIndex) in questions"
          :key="qIndex"
          class="mb-4"
        >
          <p class="font-medium mb-1">
            {{ qIndex + 1 }}. {{ question }}
          </p>
          <div class="flex justify-around">
            <div
              v-for="(option, index) in options"
              :key="`q${qIndex}-${index}`"
              class="flex flex-col items-center cursor-pointer"
              @click="select(qIndex, index)"
            >
              <div
                class="text-3xl transition-transform duration-200"
                :class="ratings[qIndex] === index ? 'scale-125' : 'opacity-60'"
              >
                {{ option.emoji }}
              </div>
              <p
                class="text-xs mt-1"
                :class="ratings[qIndex] === index ? 'font-semibold text-black' : 'text-gray-500'"
              >
                {{ option.label }}
              </p>
            </div>
          </div>
        </div>

        <!-- 💬 Comment -->
        <div class="mt-4">
          <label class="block text-sm font-semibold mb-1">ความคิดเห็นเพิ่มเติม:</label>
          <textarea
            v-model="note"
            rows="3"
            placeholder="พิมพ์ความคิดเห็นของคุณ..."
            class="border rounded w-full p-2 text-sm"
          ></textarea>
        </div>

        <!-- ✅ Submit Button -->
        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 mr-2"
            @click="closeModal"
          >
            ยกเลิก
          </button>
          <button
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="!canSubmit"
            @click="submitFeedback"
          >
            ส่งแบบประเมิน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props & Emit
const props = defineProps({
  items: { type: Array, default: () => [] },
  topics: { type: Array, default: () => [] }
})
const emit = defineEmits(['submit'])

// State
const selectedTopic = ref('')
const selectedAppointment = ref(null)
const ratings = ref([null, null, null])
const note = ref('')
const showModal = ref(false)
const localItems = ref([])
// Questions & Options
const questions = [
  'The service was fast, convenient, and accurate.',
  'The staff gave clear answers and helpful advice.',
  'Service was completed within the scheduled timeframe.'
]
const options = [
  { emoji: '😠', label: 'Bad' },
  { emoji: '🙁', label: 'Poor' },
  { emoji: '😐', label: 'Average' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😄', label: 'Excellent' }
]

// Computed
const filteredTopics = computed(() => props.topics)
watch(
  () => props.items,
  (newVal) => {
    localItems.value = JSON.parse(JSON.stringify(newVal)) // clone
  },
  { immediate: true }
)

const filteredItems = computed(() =>
  props.items.filter(
    (item) =>
      (selectedTopic.value === '' || item.topic === selectedTopic.value)
  )
)

const canSubmit = computed(() =>
  selectedAppointment.value && ratings.value.every((v) => v !== null)
)

// Methods
function openModal(item) {
  selectedAppointment.value = item
  ratings.value = [null, null, null]
  note.value = ''
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}

function select(qIndex, optionIndex) {
  ratings.value[qIndex] = optionIndex
}

function submitFeedback() {
  const target = localItems.value.find(i => i.id === selectedAppointment.value.id)
if (target) target.completed = true

  if (!canSubmit.value) return

  const payload = {
    itemId: selectedAppointment.value.id,
    topic: selectedAppointment.value.topic,
    ratings: ratings.value,
    note: note.value
  }

  emit('submit', payload)

  // ✅ ลบ item จาก list ทันที
  const item = props.items.find((i) => i.id === selectedAppointment.value.id)
  if (item) item.completed = true

  closeModal()
}

</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>




<!-- ใช้ template เดิมของคุณได้เลย -->
<!-- สำคัญ: เอา <Navbar ... /> ออก เพราะ layout มี Navbar อยู่แล้ว -->
<!-- ชื่อตัวแปรใน template ต้องตรงกับด้านบน: categories, selectedCategory, selectedTopic,
     filteredTopics, filteredItems, selectAppointment, questions, options, ratings, select, canSubmit, submitFeedback, note -->









<!-- <script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/NavbarFeedback.vue'

const route = useRoute()

const note = ref('')
const ratings = ref([null, null, null])

const questions = [
  'The service was fast, convenient, and accurate.',
  'The staff gave clear answers and helpful advice.',
  'Service was completed within the scheduled timeframe.'
]
const options = [
  { emoji: '😄', label: 'Excellent' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Average' },
  { emoji: '🙁', label: 'Poor' },
  { emoji: '😠', label: 'Bad' }
]

const selectedCategory = ref('Appointments')
const categories = ['Appointments', 'Document Tracking']
const selectedTopic = ref('')

const appointments = ref([])      // 👉 รายการที่ "พร้อมให้คะแนน"
const topicOptions = ref([])      // 👉 หัวข้อทั้งหมดของ user (ใช้เติม dropdown)
const selectedAppointment = ref(null)

const userIdFromRoute = route.params.userId || route.query.userId
const storedUserId = localStorage.getItem('userId') || localStorage.getItem('student_id')
const effectiveUserId = computed(() => userIdFromRoute || storedUserId || null)

// ------------------------------------------ Appoinment Feedback -------------------------------------------
onMounted(async () => {
  if (effectiveUserId.value) {
    await Promise.all([
      loadAppointmentsByUser(effectiveUserId.value),
      loadTopicsByUser(effectiveUserId.value) // 👈 โหลดหัวข้อทั้งหมด
    ])
  } else {
    // fallback: หากไม่มี userId ก็ยังดึงนัดที่พร้อมให้คะแนนแบบรวมได้
    await loadAllAppointments()
  }
})

async function loadAppointmentsByUser (userId) {
  try {
    const res = await fetch(`/student/users/${userId}/appointments/for-feedback?approved_set=1`)
    const data = await res.json()
    appointments.value = data?.items || []
    selectedAppointment.value = null
    ratings.value = [null, null, null]
    note.value = ''
  } catch (e) {
    console.error('loadAppointmentsByUser error:', e)
    appointments.value = []
  }
}

async function loadTopicsByUser (userId) {
  try {
    // ✅ ถ้าอยากให้หัวข้อจำกัดเฉพาะนัดที่พร้อมให้คะแนน: ใช้ scope=pending&approved_set=1
    const res = await fetch(`/student/users/${userId}/appointment-topics?scope=all`)
    const data = await res.json()
    topicOptions.value = Array.isArray(data?.topics) ? data.topics : []
  } catch (e) {
    console.error('loadTopicsByUser error:', e)
    topicOptions.value = []
  }
}

async function loadAllAppointments () {
  try {
    const res = await fetch('/student//appointments_ALL')
    const data = await res.json()
    appointments.value = Array.isArray(data) ? data : (data.items || [])
  } catch (e) {
    console.error('loadAllAppointments error:', e)
  }
}

// 👉 ใช้หัวข้อจาก topicOptions แทน
const filteredTopics = computed(() => topicOptions.value)

// รายการการ์ด ยังกรองตาม selectedTopic เหมือนเดิม
const filteredItems = computed(() => {
  return appointments.value.filter(item =>
    item.category === selectedCategory.value &&
    (selectedTopic.value === '' || item.topic === selectedTopic.value)
  )
})

function selectAppointment (item) {
  selectedAppointment.value = item
}
function select (qIndex, optionIndex) {
  ratings.value[qIndex] = optionIndex
}
const canSubmit = computed(() => selectedAppointment.value && ratings.value.every(v => v !== null))

async function submitFeedback () {
  if (!canSubmit.value) return
  try {
    const payload = {
      appointment_id: selectedAppointment.value.id,
      ratings: ratings.value,
      comment: note.value?.trim() || ''
    }
    const res = await fetch('/student/feedback/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.message || 'Failed to submit feedback')
      return
    }
    // ลบการ์ดออก
    appointments.value = appointments.value.filter(a => a.id !== selectedAppointment.value.id)
    selectedAppointment.value = null
    ratings.value = [null, null, null]
    note.value = ''
    alert('✅ ขอบคุณสำหรับคำติชม')
  } catch (e) {
    console.error('submitFeedback error:', e)
    alert('เกิดข้อผิดพลาดในการส่งฟีดแบ็ก')
  }
}

// ------------------------------------------ Document Feedback -------------------------------------------

</script> -->
