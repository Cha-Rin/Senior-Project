<template>
  <div>
    <!-- ✅ Navbar -->
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" v-if="hasNavbar" />

    <div class="p-8 space-y-6 max-w-md mx-auto bg-white min-h-screen">
      <h1 class="text-xl font-semibold text-center mt-8">Feedback</h1>

      <!-- 🔽 Topic Dropdown -->
      <div class="mb-4">
        <select v-model="selectedTopic" class="border rounded p-2 w-full">
          <option value="">-- เลือกหัวข้อ --</option>
          <option v-for="(topic, index) in filteredTopics" :key="index" :value="topic">
            {{ topic }}
          </option>
        </select>
      </div>

      <!-- 📄 Filtered Items -->
      <div
        v-for="item in filteredItems"
        :key="item.id"
        @click="selectAppointment(item)"
        class="bg-white shadow-md rounded-xl p-4 text-sm relative space-y-2 mb-4 border cursor-pointer"
        :class="selectedAppointment?.id === item.id
            ? 'border-blue-600 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300'"
      >
        <div class="flex justify-between items-center font-semibold text-black">
          <span>#{{ item.id }}</span>
          <!-- <span class="text-green-600 text-xs px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
            Approve
          </span> -->
        </div>

        <div class="text-black">
          <p>
            Date: {{ item.date }}
            <span v-if="item.time && item.time !== 'N/A'" class="ml-2">Time: {{ item.time }}</span>
          </p>
          <p>Topic: {{ item.topic }}</p>
          <p>Note: {{ item.note }}</p>
        </div>
      </div>

      <!-- My Note -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">My Note</label>
        <div class="p-3 border rounded bg-gray-100 text-gray-700 min-h-12">
          {{ selectedAppointment?.note || 'No note available.' }}
        </div>
      </div>

      <!-- 🌟 Rating Section -->
      <div class="bg-white rounded-xl shadow-md p-4 space-y-6">
        <div v-for="(question, qIndex) in questions" :key="qIndex" class="space-y-2">
          <p class="text-base font-medium">{{ qIndex + 1 }}. {{ question }}</p>

          <div class="flex justify-around items-center">
            <div
              v-for="(option, index) in options"
              :key="`q${qIndex}-${index}`"
              @click="select(qIndex, index)"
              class="flex flex-col items-center cursor-pointer"
            >
              <div class="text-3xl transition-transform duration-200"
                :class="ratings[qIndex] === index ? 'scale-125' : 'opacity-60 hover:opacity-100'">
                {{ option.emoji }}
              </div>
              <p class="text-xs mt-1"
                :class="ratings[qIndex] === index ? 'font-semibold text-black' : 'text-gray-500'">
                {{ option.label }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 💬 Comment -->
      <div class="bg-white w-full p-4 shadow-md rounded-xl text-left mt-8 space-y-2">
        <p class="text-sm font-semibold">Additional Comments (optional):</p>
        <textarea
          v-model="note"
          placeholder="Comment..."
          class="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
          rows="3"
        ></textarea>
      </div>

      <!-- ✅ Submit -->
      <button
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition"
        :disabled="!canSubmit"
        @click="submitFeedback"
      >
        Submit
      </button>

      <div class="text-center text-gray-500 text-sm mt-4">
        ขอบคุณสำหรับการให้ความคิดเห็นของคุณ!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/student/NavbarFeedback.vue'

// Props
const props = defineProps({
  items: { type: Array, default: () => [] },
  topics: { type: Array, default: () => [] },
  defaultCategory: { type: String, default: 'Appointment' }
})
const emit = defineEmits(['submit'])

// State
const hasNavbar = true
const selectedCategory = ref(props.defaultCategory)
const selectedTopic = ref('')
const selectedAppointment = ref(null)
const note = ref('')
const ratings = ref([null, null, null])
const categories = ['Appointment', 'Document']

// Static data
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
];


// Computed
const filteredTopics = computed(() =>
  props.topics.map(t => (typeof t === 'string' ? t : t?.name ?? t?.title ?? '')).filter(Boolean)
)

// ✅ Filtered items: เฉพาะอันที่ยังไม่ทำ feedback
const filteredItems = computed(() =>
  props.items.filter(item =>
    (!item.category || item.category === selectedCategory.value) &&
    (selectedTopic.value === '' || item.topic === selectedTopic.value) &&
    !item.completed
  )
)

const canSubmit = computed(() =>
  selectedAppointment.value && ratings.value.every(v => v !== null)
)

// Methods
function selectAppointment(item) {
  selectedAppointment.value = item
}

function select(qIndex, optionIndex) {
  ratings.value[qIndex] = optionIndex
}

function submitFeedback() {
  if (!canSubmit.value) return

  const payload = {
    category: selectedCategory.value,
    itemId: selectedAppointment.value.id,
    topic: selectedTopic.value || selectedAppointment.value.topic,
    ratings: ratings.value,
    note: note.value
  }

  emit('submit', payload)

  // ✅ mark item ว่าเสร็จ
  const item = props.items.find(i => i.id === selectedAppointment.value.id)
  if (item) item.completed = true

  // ✅ รีเซ็ต form
  selectedAppointment.value = null
  note.value = ''
  ratings.value = [null, null, null]
}

// Lifecycle
onMounted(() => {
  console.log('✅ Feedback mounted. Topics:', props.topics)
})
</script>



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
    const res = await fetch(`http://localhost:3000/student/users/${userId}/appointments/for-feedback?approved_set=1`)
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
    const res = await fetch(`http://localhost:3000/student/users/${userId}/appointment-topics?scope=all`)
    const data = await res.json()
    topicOptions.value = Array.isArray(data?.topics) ? data.topics : []
  } catch (e) {
    console.error('loadTopicsByUser error:', e)
    topicOptions.value = []
  }
}

async function loadAllAppointments () {
  try {
    const res = await fetch('http://localhost:3000/student//appointments_ALL')
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
    const res = await fetch('http://localhost:3000/student/feedback/appointments', {
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
