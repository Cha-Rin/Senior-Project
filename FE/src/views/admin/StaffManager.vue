<template>
  <div class="p-6">
    <!-- 🔷 Header -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">Staff Management</h1>
      <button @click="showAddForm = true" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
        Add
      </button>
    </div>

    <!-- 🔷 Staff Table -->
    <table class="min-w-full text-sm text-left border border-gray-300 rounded overflow-hidden">
      <thead class="bg-gray-200 text-gray-700">
        <tr>
          <th class="px-4 py-2 border text-center">No.</th>
          <th class="px-4 py-2 border">Avatar</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Email</th>
          <th class="px-4 py-2 border">Responsibilities</th>
          <th class="px-4 py-2 border">Status</th>
          <th class="px-4 py-2 border text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(staff, index) in staffList" :key="staff.id" class="bg-white hover:bg-gray-50">
          <td class="px-4 py-2 border text-center">{{ index + 1 }}</td>
          <td class="px-4 py-2 border text-center">
            <img v-if="staff.avatar" :src="staff.avatar" class="w-10 h-10 rounded-full object-cover mx-auto" />
            <span v-else class="text-gray-400 italic">No image</span>
          </td>
          <td class="px-4 py-2 border">{{ staff.firstName }} {{ staff.lastName }}</td>
          <td class="px-4 py-2 border">{{ staff.email }}</td>
          <td class="px-4 py-2 border">{{ staff.role || '-' }}</td>
          <td class="px-4 py-2 border text-center">
            <span :class="staff.status ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
              {{ staff.status ? 'Active' : 'Disabled' }}
            </span>
          </td>

          <!-- 🔸 Action -->
          <td class="px-4 py-2 border text-center space-x-2">
            <button
              @click="toggleStatus(staff)"
              :class="staff.status ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
              class="text-white px-3 py-1 rounded text-xs"
            >
              {{ staff.status ? 'Disable' : 'Enable' }}
            </button>

            <!-- ✏️ ปุ่ม Edit -->
            <button
              @click="editStaff(staff)"
              class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs"
            >
              Edit
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🟩 Add Modal (คงเดิม) -->
    <!-- ... -->

    <!-- 🟨 Edit Modal -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-gray-100 p-6 rounded shadow-lg w-full max-w-md relative">
        <button @click="showEditForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <h2 class="font-semibold mb-3 text-lg">Edit Staff</h2>

        <div class="space-y-2">
          <input v-model="editStaffData.firstName" placeholder="First Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="editStaffData.lastName" placeholder="Last Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="editStaffData.email" placeholder="Email" class="border px-3 py-1 w-full rounded" />

          <select v-model="editStaffData.role" class="border px-3 py-1 w-full rounded">
            <option disabled value="">Select Responsibilities</option>
            <option v-for="r in roles" :key="r">{{ r }}</option>
          </select>

          <input type="file" accept="image/*" @change="handleEditAvatar" class="w-full" />
          <div v-if="editPreviewAvatar" class="mt-2 text-center">
            <img :src="editPreviewAvatar" class="w-16 h-16 rounded-full object-cover mx-auto" />
          </div>

          <div class="flex gap-2 mt-3 justify-end">
            <button @click="saveEdit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded">Save</button>
            <button @click="showEditForm = false" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const staffList = ref([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const roles = ['Reception', 'Document', 'Appointment', 'Support']

const newStaff = ref({ firstName: '', lastName: '', email: '', role: '', avatar: null })
const previewAvatar = ref(null)

// 🧩 สำหรับ Edit
const editStaffData = ref({ id: null, firstName: '', lastName: '', email: '', role: '', avatar: null })
const editPreviewAvatar = ref(null)

// โหลด staff
async function fetchStaff() {
  const res = await axios.get('http://localhost:3000/admin/staffs')
  if (res.data.success) staffList.value = res.data.data
}

// 🧩 เปิด modal edit
function editStaff(staff) {
  editStaffData.value = { ...staff }
  editPreviewAvatar.value = staff.avatar
  showEditForm.value = true
}

// 🧩 เปลี่ยนรูปใหม่ตอนแก้ไข
function handleEditAvatar(e) {
  const file = e.target.files[0]
  if (file) {
    editStaffData.value.avatar = file
    editPreviewAvatar.value = URL.createObjectURL(file)
  }
}

// 🧩 บันทึกการแก้ไข
async function saveEdit() {
  const { id, firstName, lastName, email, role, avatar } = editStaffData.value
  const formData = new FormData()
  formData.append('firstName', firstName)
  formData.append('lastName', lastName)
  formData.append('email', email)
  formData.append('role', role)
  if (avatar instanceof File) formData.append('avatar', avatar)

  try {
    const res = await axios.patch(`http://localhost:3000/admin/staffs/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.success) {
      showEditForm.value = false
      fetchStaff()
    }
  } catch (err) {
    console.error('Edit staff failed:', err)
  }
}

// เปิดปิดสถานะ
async function toggleStatus(staff) {
  const newStatus = staff.status ? 0 : 1
  await axios.patch(`http://localhost:3000/admin/staffs/${staff.id}/status`, { status: newStatus })
  staff.status = newStatus
}

onMounted(fetchStaff)
</script>
