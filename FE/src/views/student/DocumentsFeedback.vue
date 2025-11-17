<script setup>
import { ref, computed, onMounted } from 'vue'
import Feedback from "@/components/student/Feedback.vue"
import axios from 'axios'
import jwt_decode from "jwt-decode"


// -------------------- State --------------------
const documents = ref([])
const topics = ref([])
const selectedTopic = ref('')
const token = localStorage.getItem('authToken')
let userId = localStorage.getItem('userId')
if (token) {
  try {
    const decoded = jwt_decode(token)
    if (decoded.userId) {
      userId = decoded.userId
      localStorage.setItem('userId', userId)
    }
  } catch (e) {
    console.warn('Token decode failed:', e)
  }
}

console.log('🔑 Effective userId:', userId)

// -------------------- onMounted --------------------
onMounted(async () => {
  console.log('🧩 DocumentsFeedback.vue mounted running')

  if (!token) {
    console.error('❌ No authToken found in localStorage')
    return
  }

  try {
    console.log("🔑 Fetching approved topics")
    const res = await fetch('/api/student/document-topics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    console.log('📥 Topics response:', data)

    if (data.success) {
      topics.value = Array.isArray(data.topics) ? data.topics : []
      console.log("✅ topics.value =", topics.value)
    } else {
      console.warn("⚠️ API returned no success flag:", data)
    }
  } catch (err) {
    console.error('❌ Error fetching topics:', err)
  }

  await loadDocuments()
})

// -------------------- Load Documents --------------------
async function loadDocuments() {
  try {
    console.log("🔑 Fetching documents for feedback")
console.log("🚀 Route /documents/for-feedback is running (status=2 filter)");

    const res = await fetch(`/api/student/documents/for-feedback`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()
    console.log("📥 Documents raw response:", JSON.stringify(data, null, 2))
    
    // ✅ รองรับทั้งกรณีส่งเป็น array หรือ object { items: [...] }
    const rawItems = Array.isArray(data) ? data : data.items
    documents.value = rawItems || []
    if (!rawItems) {
      console.warn("⚠️ No documents found")
      documents.value = []
      return
    }
console.log("📥 Documents raw response:", data);

    console.log("✅ Documents loaded:", documents.value)
  } catch (e) {
    console.error("❌ loadDocuments error:", e)
    documents.value = []
  }
}


// -------------------- Computed --------------------
const filteredTopics = computed(() => topics.value)
const filteredItems = computed(() => {
  if (!selectedTopic.value) return documents.value
  return documents.value.filter(d => d.topic === selectedTopic.value)
})

// -------------------- Submit Feedback --------------------
async function handleSubmit(payload) {
  try {
    console.log("🧩 handleSubmit payload:", payload)

    const res = await fetch('/api/student/feedback/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        document_id: payload.itemId,
        ratings: payload.ratings,
        comment: payload.note || ''
      })
    })

    const result = await res.json()
    console.log("📥 Feedback submit response:", result)

    if (result.success) {
      alert('ส่งความคิดเห็นเรียบร้อย ✅')

      // ✅ ลบ document ที่เพิ่ง feedback ออก
      documents.value = documents.value.filter(d => d.document_id !== payload.itemId)

      // ✅ อัปเดตหัวข้อใหม่
      const remainingTopics = [...new Set(documents.value.map(d => d.topic))]
      topics.value = topics.value.filter(t => remainingTopics.includes(t))

      if (!remainingTopics.includes(selectedTopic.value)) {
        selectedTopic.value = ''
      }
    } else {
      alert(result.message || 'เกิดข้อผิดพลาด')
    }
  } catch (e) {
    console.error('❌ handleSubmit error:', e)
    alert('เกิดข้อผิดพลาดในการส่ง feedback')
  }
}
</script>

<template>
  <Feedback
    :items="documents"
    :topics="topics"
    default-category="Document"
    @submit="handleSubmit"
  />
</template>
