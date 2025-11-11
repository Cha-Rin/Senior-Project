<template>
  <div class="min-h-screen flex items-center justify-center min-h-screen w-screen bg-gradient-to-b from-[#f8f9ff] to-[#e0e4ff] dark:from-[#0b0f1f] dark:to-[#1a1f3c] transition-colors duration-500">
    <div class="w-full max-w-sm text-center bg-white/80 dark:bg-[#101327]/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mx-4">
      <!-- Welcome Gradient Text -->
      <h1 class="text-4xl sm:text-7xl font-extrabold mb-10 tracking-tight leading-tight">
        <span class="welcome-text">W</span>
        <span class="welcome-text">e</span>
        <span class="welcome-text">l</span>
        <span class="welcome-text">c</span>
        <span class="welcome-text">o</span>
        <span class="welcome-text">m</span>
        <span class="welcome-text">e</span>
      </h1>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-4">
        <div class="text-left">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            v-model="username"
            placeholder="Enter username"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="text-left">
          <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="Enter password"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="flex flex-col text-left text-sm text-gray-600 dark:text-gray-400">
          นักศึกษา Username: anan.yod@example.com, รหัส: 123456
          <br>แอดมิน Username: worasak.rue@mfu.ac.th, รหัส: 1234
          <br>เลขา Username: porntip.pan@mfu.ac.th, รหัส: 2222
        </div>

        <!-- 🔺 Error message -->
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        
        <button type="submit"
          class="w-full py-2 bg-[#003366] dark:bg-[#5a4bdb] text-white rounded-md hover:bg-[#5a4bdb] dark:hover:bg-[#211C84] transition">
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import jwt_decode from "jwt-decode"

const router = useRouter()
const errorMessage = ref('')
const username = ref('')
const password = ref('')

// ---------------- Login function ----------------
const login = async () => {
  const user = username.value.trim()
  const pass = password.value.trim()
  errorMessage.value = ''

  if (!user || !pass) {
    errorMessage.value = 'Please enter both username and password.'
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user, password: pass })
    })

    const data = await res.json()
    
    // 🛑 กรณีเลขา status = 0 → backend ส่ง 403 + message
   if (data.message && data.message.includes('No permission')) {
  errorMessage.value = 'This account has been disabled or has no permission.'
  return
}

    if (!data.success || !data.token) {
      errorMessage.value = 'Incorrect username or password.'
      return
    }

    localStorage.setItem('authToken', data.token)

    const decoded = jwt_decode(data.token)
    const role = Number(decoded.role)
    localStorage.setItem('userRole', role)
    localStorage.setItem('userId', decoded.user_id)
    localStorage.setItem('name', user.name)
    localStorage.setItem('surname', user.surname)
    localStorage.setItem('email', decoded.email)
    // ✅ ถ้าเป็นเลขา (role 2) — ดึง category_id ของพี่คนนั้นจาก backend
if (role === 2) {
  try {
    const catRes = await fetch(`http://localhost:3000/api/staff/category/${decoded.user_id}`, {
      headers: { Authorization: `Bearer ${data.token}` }
    })
    const catData = await catRes.json()
    if (catData.success && catData.category_id) {
      localStorage.setItem('categoryId', catData.category_id)
      console.log(`✅ Saved category_id = ${catData.category_id}`)
    } else {
      console.warn('⚠️ No category found for this staff.')
    }
  } catch (catErr) {
    console.error('❌ Failed to fetch category:', catErr)
  }
}


    await router.isReady()
    await nextTick()

    switch (role) {
      case 3:
        await router.push({ name: 'PathSelect' })
        break
      case 2:
        await router.push({ name: 'Homepage' })
        break
      case 1:
        await router.push({ name: 'Dashboard' })
        break
      default:
        await router.push({ name: 'Login' })
    }

  } catch (err) {
    errorMessage.value = 'Login failed. Please try again later.'
    console.error('Login error:', err)
  }
}

// ---------------- ตรวจ token ตอนเปิดหน้า / รีหน้า ----------------
onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return

  try {
    const decoded = jwt_decode(token)
    const role = Number(decoded.role)

    await router.isReady()
    await nextTick()

    switch (role) {
      case 3:
        await router.push({ name: 'PathSelect' })
        break
      case 2:
        await router.push({ name: 'Homepage' })
        break
      case 1:
        await router.push({ name: 'Dashboard' })
        break
      default:
        await router.push({ name: 'Login' })
    }
  } catch (err) {
    console.error('Invalid token:', err)
    localStorage.removeItem('authToken')
  }
})
</script>

<style scoped>
/* 🎨 สีตัวอักษรเปลี่ยนตามธีม */
.welcome-text {
  font-weight: 800;
  transition: color 0.3s ease;
}

@media (prefers-color-scheme: light) {
  .welcome-text:nth-child(1) { color: #211C84; }
  .welcome-text:nth-child(2) { color: #4D55CC; }
  .welcome-text:nth-child(3) { color: #7A73D1; }
  .welcome-text:nth-child(4) { color: #B5A8D5; }
  .welcome-text:nth-child(5) { color: #7A73D1; }
  .welcome-text:nth-child(6) { color: #4D55CC; }
  .welcome-text:nth-child(7) { color: #211C84; }
}

@media (prefers-color-scheme: dark) {
  .welcome-text:nth-child(1) { color: #C1B8FF; }
  .welcome-text:nth-child(2) { color: #9F9AF5; }
  .welcome-text:nth-child(3) { color: #857AEF; }
  .welcome-text:nth-child(4) { color: #5F5BCB; }
  .welcome-text:nth-child(5) { color: #857AEF; }
  .welcome-text:nth-child(6) { color: #9F9AF5; }
  .welcome-text:nth-child(7) { color: #C1B8FF; }
}
</style>
