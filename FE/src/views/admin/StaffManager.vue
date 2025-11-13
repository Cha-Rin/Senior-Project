<!-- staff Manage page -->
<template>
  <div class="p-6">
    <!-- 🔷 Header -->
    <div class="flex justify-between items-center">
       <h1
        class="text-4xl md:text-5xl font-bold text-right mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
      >Staff Management</h1>
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
          <td class="px-4 py-2 border">{{ staff.categories || '-' }}</td>
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

    <!-- 🟩 Add Staff Modal -->
    <div v-if="showAddForm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-gray-100 p-6 rounded shadow-lg w-full max-w-md relative">
        <button @click="showAddForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <h2 class="font-semibold mb-3 text-lg">Add New Staff</h2>

        <div class="space-y-2">
          <input v-model="newStaff.firstName" placeholder="First Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="newStaff.lastName" placeholder="Last Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="newStaff.email" placeholder="Email" class="border px-3 py-1 w-full rounded" />

          <!-- ✅ Multiple Responsibilities -->
          <label class="block text-sm font-semibold text-gray-700">Responsibilities</label>
          <select v-model="newStaff.categoryIds" multiple class="border px-3 py-1 w-full rounded h-24">
            <option disabled value="">Select Responsibilities</option>
            <option v-for="c in categoriesList" :key="c.category_id" :value="c.category_id">
              {{ c.type }}
            </option>
          </select>

          <!-- 📸 Upload Avatar -->
          <input type="file" accept="image/*" @change="handleAddAvatar" class="w-full" />
          <div v-if="previewAvatar" class="mt-2 text-center">
            <img :src="previewAvatar" class="w-16 h-16 rounded-full object-cover mx-auto" />
          </div>

          <div class="flex gap-2 mt-3 justify-end">
            <button @click="saveNewStaff" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded">Save</button>
            <button @click="showAddForm = false" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 🟨 Edit Modal -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-gray-100 p-6 rounded shadow-lg w-full max-w-md relative">
        <button @click="showEditForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
        <h2 class="font-semibold mb-3 text-lg">Edit Staff</h2>

        <div class="space-y-2">
          <input v-model="editStaffData.firstName" placeholder="First Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="editStaffData.lastName" placeholder="Last Name" class="border px-3 py-1 w-full rounded" />
          <input v-model="editStaffData.email" placeholder="Email" class="border px-3 py-1 w-full rounded" />

          <label class="block text-sm font-semibold text-gray-700">Responsibilities</label>
          <select v-model="editStaffData.categoryIds" multiple class="border px-3 py-1 w-full rounded h-24">
            <option disabled value="">Select Responsibilities</option>
            <option v-for="c in categoriesList" :key="c.category_id" :value="c.category_id">
              {{ c.type }}
            </option>
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

const categoriesList = ref([]) 
const staffList = ref([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')

const newStaff = ref({ firstName: '', lastName: '', email: '', avatar: null, categoryIds: [] })
const previewAvatar = ref(null)

const editStaffData = ref({ id: null, firstName: '', lastName: '', email: '', avatar: null, categoryIds: [] })
const editPreviewAvatar = ref(null)

// โหลด staff
async function fetchStaff() {
  const res = await axios.get('/api/admin/staffs')
  if (res.data.success) {
    staffList.value = res.data.data
    console.log('📋 Staff data:', res.data.data)
  }
}

// โหลด categories
async function fetchCategories() {
  const res = await axios.get('/api/admin/categories')
  if (res.data.success) categoriesList.value = res.data.data
}

// 📸 เปลี่ยนรูปตอน Add
function handleAddAvatar(e) {
  const file = e.target.files[0]
  if (file) {
    newStaff.value.avatar = file
    previewAvatar.value = URL.createObjectURL(file)
  }
}

// 💾 Save Staff ใหม่
async function saveNewStaff() {
  const formData = new FormData()
  formData.append('firstName', newStaff.value.firstName)
  formData.append('lastName', newStaff.value.lastName)
  formData.append('email', newStaff.value.email)
  formData.append('categoryIds', JSON.stringify(newStaff.value.categoryIds))
  
  if (newStaff.value.avatar instanceof File) formData.append('avatar', newStaff.value.avatar)

  try {
    const res = await axios.post('/api/admin/staffs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.success) {
      alert('✅ Staff added successfully')
      showAddForm.value = false
      previewAvatar.value = null
      newStaff.value = { firstName: '', lastName: '', email: '', avatar: null, categoryIds: [] }
      fetchStaff()
    }
  } catch (err) {
    console.error('❌ Add staff failed:', err)
  }
}

// 🧩 เปิด modal edit
async function editStaff(staff) {
  try {
    const res = await axios.get(`/api/admin/staff/${staff.id}/categories`)
    const categoryIds = res.data.data.map(c => c.category_id)

    editStaffData.value = {
      ...staff,
      categoryIds: categoryIds
    }
    
    // ✅ ใช้ staff.avatar ตรงๆ เพราะ backend ส่ง URL เต็มมาแล้ว
    editPreviewAvatar.value = staff.avatar
    showEditForm.value = true

  } catch (err) {
    console.error('❌ Failed to fetch categories for edit:', err)
    alert('Error loading staff details.')
  }
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
  const { id, firstName, lastName, email, avatar } = editStaffData.value
  const formData = new FormData()
  formData.append('firstName', firstName)
  formData.append('lastName', lastName)
  formData.append('email', email)

  let cats = editStaffData.value.categoryIds
  if (!Array.isArray(cats)) cats = [cats]
  formData.append('categoryIds', JSON.stringify(cats))

  if (avatar instanceof File) formData.append('avatar', avatar)

  try {
    const res = await axios.patch(`/api/admin/staffs/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.success) {
      alert('✅ Staff updated successfully')
      showEditForm.value = false
      fetchStaff()
    }
  } catch (err) {
    console.error('❌ Edit staff failed:', err)
  }
}

// เปิดปิดสถานะ
async function toggleStatus(staff) {
  const newStatus = staff.status ? 0 : 1
  await axios.patch(`/api/admin/staffs/${staff.id}/status`, { status: newStatus })
  staff.status = newStatus
}

onMounted(() => {
  fetchStaff()
  fetchCategories()
})
</script>