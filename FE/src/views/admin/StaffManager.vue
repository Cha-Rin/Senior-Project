<template>
  <MainLayout>
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
            <th class="px-4 py-2 border">No.</th>
            <th class="px-4 py-2 border">Avatar</th>
            <th class="px-4 py-2 border">Name</th>
            <th class="px-4 py-2 border">Email</th>
            <th class="px-4 py-2 border">Responsibilities</th>
            <th class="px-4 py-2 border">Status</th>
            <th class="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(staff, index) in staffList" :key="staff.user_id" class="bg-white hover:bg-gray-50">
            <td class="px-4 py-2 border text-center">{{ index + 1 }}</td>
            <td class="px-4 py-2 border">
              <img v-if="staff.profile_pic" :src="`http://localhost:3000${staff.profile_pic}`" class="w-10 h-10 rounded-full object-cover" />

              <span v-else class="text-gray-400 italic">No image</span>
            </td>
            <td class="px-4 py-2 border">{{ staff.name }} {{ staff.surname }}</td>
            <td class="px-4 py-2 border">{{ staff.email }}</td>
            <td class="px-4 py-2 border">{{ staff.role }}</td>
            <td class="px-4 py-2 border">
              <span :class="staff.active ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
                {{ staff.status ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td class="px-4 py-2 border space-x-2">
              <button
                @click="toggleStatus(index)"
                :class="staff.active ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'"
                class="text-white px-2 py-1 rounded text-xs"
              >
                {{ staff.active ? 'Disable' : 'Enable' }}
              </button>
              <button
                @click="editStaffFunc(index)"
                class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 🟩 Add Modal -->
      <div v-if="showAddForm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-gray-100 p-6 rounded shadow-lg w-full max-w-md relative">
          <button @click="showAddForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
          <h2 class="font-semibold mb-3">Add New Staff</h2>

          <div class="space-y-2">
            <div class="flex gap-2">
              <select v-model="newStaff.prefix" class="w-1/3 border px-2 py-1 rounded">
                <option disabled value="">Prefix</option>
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
              </select>
              <input v-model="newStaff.firstName" placeholder="First Name" class="w-1/3 border px-2 py-1 rounded" />
              <input v-model="newStaff.lastName" placeholder="Last Name" class="w-1/3 border px-2 py-1 rounded" />
            </div>

            <input v-model="newStaff.email" placeholder="Email" class="border px-3 py-1 w-full rounded" />
            <select v-model="newStaff.role" class="border px-3 py-1 w-full rounded">
              <option disabled value="">Select Responsibilities</option>
              <option v-for="r in roles" :key="r">{{ r }}</option>
            </select>

            <input type="file" accept="image/*" @change="handleAvatarUpload" class="w-full" />
            <div v-if="newStaff.avatar" class="mt-2">
              <img :src="newStaff.avatar" class="w-16 h-16 rounded-full object-cover" />
            </div>

            <div class="flex gap-2 mt-2">
              <button @click="addStaff" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded">Add</button>
              <button @click="showAddForm = false" class="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 🟨 Edit Modal -->
      <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-gray-100 p-6 rounded shadow-lg w-full max-w-md relative">
          <button @click="showEditForm = false" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">×</button>
          <h2 class="font-semibold mb-3">Edit Staff</h2>

          <div class="space-y-2">
            <div class="flex gap-2">
              <select v-model="editStaff.prefix" class="w-1/3 border px-2 py-1 rounded">
                <option disabled value="">Prefix</option>
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
              </select>
              <input v-model="editStaff.firstName" placeholder="First Name" class="w-1/3 border px-2 py-1 rounded" />
              <input v-model="editStaff.lastName" placeholder="Last Name" class="w-1/3 border px-2 py-1 rounded" />
            </div>

            <input v-model="editStaff.email" placeholder="Email" class="border px-3 py-1 w-full rounded" />
            <select v-model="editStaff.role" class="border px-3 py-1 w-full rounded">
              <option disabled value="">Select Responsibilities</option>
              <option v-for="r in roles" :key="r">{{ r }}</option>
            </select>

            <input type="file" accept="image/*" @change="handleEditAvatarUpload" class="w-full" />
            <div v-if="editStaff.avatar" class="mt-2">
              <img :src="editStaff.avatar" class="w-16 h-16 rounded-full object-cover" />
            </div>

            <div class="flex gap-2 mt-2">
              <button @click="saveEdit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded">Save</button>
              <button @click="showEditForm = false" class="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔔 Alert Modal -->
      <div v-if="showAlert" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Missing Information</h3>
          <p class="text-sm text-gray-700 mb-4">{{ alertMessage }}</p>
          <button
            @click="showAlert = false"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../layout/MainLayout.vue'
import { useStaffStore } from '../stores/staffStore'
import axios from 'axios'

const staffStore = useStaffStore()
// const staffList = computed(() => staffStore.staffList)
const staffList = ref([]) // ดึงจาก API แทน
const showAddForm = ref(false)
const showEditForm = ref(false)
const showAlert = ref(false)
const alertMessage = ref('')
const roles = ['Reception', 'Document', 'Appointment', 'Support']

const newStaff = ref({ prefix: '', firstName: '', lastName: '', email: '', role: '', avatar: null })
const editStaff = ref({ prefix: '', firstName: '', lastName: '', email: '', role: '', avatar: null })
const editingIndex = ref(null)

function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      newStaff.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function handleEditAvatarUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      editStaff.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// เพิ่มพนักงานใหม่
async function addStaff() {
  const { prefix, firstName, lastName, email, role, avatar } = newStaff.value

  if (!prefix || !firstName || !lastName || !email || !role) {
    alertMessage.value = 'Please fill in all required fields.'
    showAlert.value = true
    return
  }

  try {
    // สร้าง FormData สำหรับส่งไฟล์
    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('email', email)
    formData.append('role', role)

    // ถ้ามีไฟล์ avatar ให้ append
    if (avatar instanceof File) {
      formData.append('avatar', avatar)
    }

    // ส่ง request ด้วย multipart/form-data
    const response = await axios.post(
      'http://localhost:3000/admin/staffs/add',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )

    // อัปเดต store/UI
    staffStore.addStaff(response.data)

    // รีเซ็ตฟอร์ม
    newStaff.value = { prefix: '', firstName: '', lastName: '', email: '', role: '', avatar: null }
    showAddForm.value = false

  } catch (error) {
    console.error('Failed to add staff:', error)
    alertMessage.value = 'Error adding staff. Please try again.'
    showAlert.value = true
  }
}

// โหลดหน้าพนักงานจาก API
async function fetchStaff() {
  try {
    const response = await axios.get('http://localhost:3000/admin/staffs')
    if (response.data.success) {
      staffList.value = response.data.data
    } else {
      console.error('Failed to fetch staff:', response.data)
    }
  } catch (err) {
    console.error('Axios error:', err)
  }
}

onMounted(() => {
  fetchStaff()
})

function toggleStatus(index) {
  staffStore.toggleStatus(index)
}

// แก้ไขพนักงาน
function editStaffFunc(index) {
  const staff = staffList.value[index]
  const [prefix, firstName, lastName] = staff.name.split(' ')
  editingIndex.value = index
  editStaff.value = {
    prefix,
    firstName,
    lastName,
    email: staff.email,
    role: staff.role,
    avatar: staff.avatar
  }
  showEditForm.value = true
}

function saveEdit() {
  const index = editingIndex.value
  const { prefix, firstName, lastName, email, role, avatar } = editStaff.value
  staffStore.editStaff(index, {
    name: `${prefix} ${firstName} ${lastName}`,
    email,
    role,
    avatar
  })
  showEditForm.value = false
}
</script>
