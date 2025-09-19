<template>
  <div class="min-h-screen bg-white p-6">
    <h1 class="text-2xl font-bold mb-6">Document Status</h1>

    <!-- Table -->
    <div class="bg-gray-100 rounded-xl overflow-hidden max-w-5xl shadow">
      <div class="grid grid-cols-6 bg-gray-300 font-semibold text-sm p-3">
        <div>No</div>
        <div>ID</div>
        <div>Date</div>
        <div>Topic</div>
        <div>Status</div>
        <div>Add file</div>
      </div>

      <div
        v-for="(item, i) in documents"
        :key="item.id || i"
        class="grid grid-cols-6 items-center p-3 border-t bg-white text-sm"
      >
        <div>{{ item.no }}</div>
        <div>{{ item.studentId }}</div>
        <div>{{ item.date }}</div>
        <div>{{ item.topic }}</div>

        <div class="flex flex-col gap-1">
          <label class="flex items-center gap-2">
            <input type="checkbox" :checked="item.status !== 'Complete'" disabled />
            <span>In progress</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" :checked="item.status === 'Complete'" disabled />
            <span>Complete</span>
          </label>

          <!-- ถ้ามีไฟล์แล้ว โชว์ลิงก์ดาวน์โหลด/ดู -->
          <a
            v-if="item.file_url"
            class="text-blue-600 underline text-xs mt-1"
            :href="apiBase + item.file_url" target="_blank" rel="noopener"
          >View file</a>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-full hover:bg-gray-200"
            @click="triggerFile(i)"
            title="Add file"
          >📎</button>

          <input
            class="hidden"
            type="file"
            :ref="el => setFileInputRef(el, i)"
            @change="onFileSelected($event, item, i)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const apiBase = '' // ใช้ proxy ของ Vite: '' (เช่น /api/uploads/xxx)

const documents = ref([])
const fileInputs = ref([]) // refs ต่อแถว

const setFileInputRef = (el, idx) => { fileInputs.value[idx] = el }

const triggerFile = (index) => {
  fileInputs.value[index]?.click()
}

const onFileSelected = async (event, item, index) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`/api/documents/${item.id}/file`, {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.statusText)
    }

    const data = await res.json()
    documents.value[index] = data
  } catch (e) {
    alert('Upload failed: ' + e.message)
  } finally {
    event.target.value = '' // reset input
  }
}

const fetchDocuments = async () => {
  try {
    const res = await fetch('/api/documents')
    if (!res.ok) throw new Error(res.statusText)
    documents.value = await res.json()
  } catch (e) {
    console.error('Failed to load documents:', e)
  }
}

onMounted(fetchDocuments)
</script>
