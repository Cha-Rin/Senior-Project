<template>
  <div class="p-8 space-y-6 max-w-md mx-auto bg-white min-h-screen">
    <h1 class="text-xl font-semibold text-center mt-8">Feedback</h1>
<div class="flex justify-end">
  <button
    @click="router.push('/student/feedback/history')"
    class="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600"
  >
    📜 History
  </button>
</div>

    <!-- เลือกหัวข้อ -->
    <div class="mb-4">
      <select v-model="selectedTopic" class="border rounded p-2 w-full">
        <option value="">-- Choose Topic --</option>
        <option
          v-for="(topic, index) in topics"
          :key="index"
          :value="topic"
        >
          {{ topic }}
        </option>
      </select>
    </div>

    <!-- รายการที่ต้องประเมิน -->
    <div
      v-for="item in filteredItems"
      :key="item.id"
      @click="openModal(item)"
      class="bg-white shadow-md rounded-xl p-4 text-sm relative space-y-2 mb-4 border cursor-pointer hover:border-blue-500 transition"
    >
      <div class="flex justify-between items-center font-semibold text-black">
        <span>#{{ item.id }}</span>
        <span 
          class="text-xs px-2 py-1 rounded"
          :class="item.category === 'Documents' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-blue-100 text-blue-800'"
        >
          {{ item.category }}
        </span>
      </div>

      <div class="text-black">
        <p>Date: {{ item.date ? new Date(item.date).toLocaleDateString() : 'N/A' }}</p>
        <p v-if="item.time">Time: {{ item.time }}</p>
        <p>Topic: {{ item.topic }}</p>
        <p>Note: {{ item.note || '-' }}</p>
      </div>
    </div>

    <!-- ถ้าไม่มี -->
    <p v-if="filteredItems.length === 0" class="text-center text-gray-500 italic mt-8">
      You have no feedback tasks to complete.🎉
    </p>

    <!-- Popup Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
    >
      <div class="bg-white rounded-lg w-[90%] max-w-md p-6 shadow-xl relative animate-fadeIn">
        <button
          class="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl"
          @click="closeModal"
        >
          ×
        </button>

        <h2 class="text-lg font-semibold mb-2 text-center">
          Feedback
        </h2>
        <p class="text-sm text-gray-600 mb-4 text-center">
          Topic : {{ selectedAppointment?.topic }}
        </p>

        <!-- Rating -->
        <div v-for="(question, qIndex) in questions" :key="qIndex" class="mb-4">
          <p class="font-medium mb-1">{{ qIndex + 1 }}. {{ question }}</p>
          <div class="flex justify-around">
            <div
              v-for="(option, index) in options"
              :key="index"
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

        <!-- Comment -->
        <div class="mt-4">
          <label class="block text-sm font-semibold mb-1">Opinion :</label>
          <textarea
            v-model="note"
            rows="3"
            class="border rounded w-full p-2 text-sm"
            placeholder="Type your comment..."
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="flex justify-end mt-6">
          <button
            class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 mr-2"
            @click="closeModal"
          >
            Cancle
          </button>
          <button
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="!canSubmit"
            @click="submitFeedback"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const items = ref([])
const topics = ref([])

const selectedTopic = ref("")
const selectedAppointment = ref(null)
const ratings = ref([null, null, null])
const note = ref("")
const showModal = ref(false)

const token = localStorage.getItem("authToken")

// คำถาม
const questions = [
  "The service was fast, convenient, and accurate.",
  "The staff gave clear answers and helpful advice.",
  "Service was completed within the scheduled timeframe."
]

// อีโมจิ Rating
const options = [
  { emoji: "😡", label: "Bad" },
  { emoji: "🙁", label: "Poor" },
  { emoji: "😐", label: "Average" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😄", label: "Excellent" }
]

// โหลดข้อมูลเมื่อเข้าหน้า
onMounted(async () => {
  await loadItems()
  await loadTopics()
})

// โหลดรายการรอ feedback
async function loadItems() {
  try {
    const res = await fetch(`/api/student/feedback/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    console.log("🔎 feedback pending:", data)

    items.value = [
      ...(data.appointments || []).map(i => ({ ...i, category: "Appointments" })),
      ...(data.documents || []).map(i => ({ ...i, category: "Documents" }))
    ]
  } catch (err) {
    console.error("❌ loadItems error:", err)
  }
}

// โหลดหัวข้อ
async function loadTopics() {
  try {
    const a = await fetch(`/api/student/appointment-topics`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json())

    const d = await fetch(`/api/student/document-topics`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json())

    topics.value = [
      ...(a.topics || []),
      ...(d.topics || [])
    ]
  } catch (err) {
    console.error("❌ loadTopics error:", err)
  }
}

// กรองรายการตามหัวข้อ
const filteredItems = computed(() => {
  if (!selectedTopic.value) return items.value
  return items.value.filter(i => i.topic === selectedTopic.value)
})

// เปิด Modal
function openModal(item) {
  selectedAppointment.value = item
  ratings.value = [null, null, null]
  note.value = ""
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function select(qIndex, index) {
  ratings.value[qIndex] = index
}

const canSubmit = computed(() =>
  selectedAppointment.value && ratings.value.every(v => v !== null)
)

// ส่ง Feedback
async function submitFeedback() {
  const isAppointment = selectedAppointment.value.category === "Appointments"
  const url = isAppointment
    ? "/api/student/feedback/appointments"
    : "/api/student/feedback/documents"

  const payload = {
    appointment_id: isAppointment ? selectedAppointment.value.id : undefined,
    document_id: !isAppointment ? selectedAppointment.value.id : undefined,
    ratings: ratings.value,
    comment: note.value?.trim() || ""

  }

  console.log("📤 Sending feedback:", payload)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (data.success) {
      alert("Thank you for feedback!")
      items.value = items.value.filter(i => i.id !== selectedAppointment.value.id)
      closeModal()
    } else {
      alert("Error occurred: " + data.message)
    }
  } catch (err) {
    console.error("❌ submitFeedback error:", err)
    alert("Failed to submit feedback.")
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
