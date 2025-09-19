<template>
  <div class="min-h-screen bg-white p-6">
    <h1 class="text-2xl font-bold mb-4">History</h1>

    <!-- 🔸 Date Range Dropdown -->
    <div class="mb-4">
      <label class="flex items-center gap-2 text-sm font-semibold">
        <i class="far fa-calendar-alt"></i>
        <select class="border px-3 py-1 rounded text-sm shadow">
          <option>21 APR 2025 - 25 APR 2025</option>
        </select>
      </label>
    </div>

    <!-- 🔸 Table -->
    <div class="bg-gray-100 rounded-xl overflow-hidden max-w-5xl shadow">
      <div class="grid grid-cols-6 bg-gray-300 font-semibold text-sm p-3">
        <div>No</div>
        <div>ID</div>
        <div>Date</div>
        <div>Topic</div>
        <div>Status</div>
        <div>File</div>
      </div>

      <div
        v-for="(item, i) in history"
        :key="i"
        class="grid grid-cols-6 items-center p-3 border-t bg-white text-sm"
      >
        <div>{{ item.no }}</div>
        <div>{{ item.studentId }}</div>
        <div>{{ item.date }}</div>
        <div>{{ item.topic }}</div>
        <div>
          <span
            :class="item.status === 'Complete' ? 'text-green-500' : 'text-red-500'"
            class="font-semibold"
          >
            {{ item.status }}
          </span>
        </div>
        <div>
          <button
            class="p-2 rounded-full hover:bg-gray-200"
            @click="viewFile(item)"
            title="View File"
          >
            <img :src="viewFileIcon" alt="View File" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'


/*
  📂 วางไฟล์จริงไว้ที่:
  secretary-ui/public/files/

  ตัวอย่าง:
  - public/files/req-A001.pdf      → ใช้ "/files/req-A001.pdf"
  - public/files/receipt-A002.png  → ใช้ "/files/receipt-A002.png"
*/

const history = ref([
  {
    no: 'A001',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Complete',
    fileUrl: '/files/req-A001.pdf'      // ✅ PDF
  },
  {
    no: 'A002',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Reject',
    fileUrl: '/files/receipt-A002.png'  // ✅ รูปภาพ
  },
  {
    no: 'A003',
    studentId: '65xxxxxxxx',
    date: '21 Apr 2025',
    topic: 'Course registration;',
    status: 'Complete',
    fileUrl: '/files/req-A003.pdf'
  }
])

// เปิดไฟล์ในแท็บใหม่ (รองรับทั้งรูปและ PDF)
const viewFile = (item) => {
  if (!item?.fileUrl) return
  // เปิดแบบปลอดภัย (กันแท็บใหม่เข้าถึง window เดิม)
  const w = window.open(item.fileUrl, '_blank', 'noopener,noreferrer')
  if (!w) {
    // เผื่อโดนบล็อก popup: fallback เป็นดาวน์โหลด
    const a = document.createElement('a')
    a.href = item.fileUrl
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
</script>
