<template>
  <div class="flex items-center justify-center min-h-screen bg-white px-4">
    <div class="w-full max-w-sm text-center">
      <!-- Welcome Gradient Text -->
      <h1 class="text-4xl sm:text-7xl font-extrabold mb-10 tracking-tight leading-tight">
        <span style="color: #211C84;">W</span>
        <span style="color: #4D55CC;">e</span>
        <span style="color: #7A73D1;">l</span>
        <span style="color: #B5A8D5;">c</span>
        <span style="color: #7A73D1;">o</span>
        <span style="color: #4D55CC;">m</span>
        <span style="color: #211C84;">e</span>
      </h1>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-4">
        <div class="text-left">
          <label class="block mb-1 text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            v-model="username"
            placeholder="Enter username"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="text-left">
          <label class="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="Enter password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="flex items-center text-left">
          <!-- <input type="checkbox" id="remember" v-model="rememberMe" class="mr-2" /> -->
          <!-- <label for="remember" class="text-sm">Remember me</label> -->
          เผื่อใครมาดู Username: anan.yod@example.com, รหัส:  123456
        </div>
         <!-- 🔺 Error message -->
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        
        <button type="submit"
          class="w-full py-2 bg-[#003366] text-white rounded-md hover:bg-[#5a4bdb] transition">Login
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
    if (!data.success || !data.token) {
      errorMessage.value = 'Incorrect username or password.'
      return
    }
console.log('Router is ready:', router.isReady)
console.log('Available routes:', router.getRoutes().map(r => r.name))

    // ✅ เก็บ token
    localStorage.setItem('authToken', data.token)

    const decoded = jwt_decode(data.token)
    const role = Number(decoded.role)
    console.log('Decoded role (login):', role)
    localStorage.setItem('userRole', role)

    // ✅ รอ router พร้อมและ nextTick
    await router.isReady()
    await nextTick()

    // Router ตาม role
    switch (role) {
      case 3:
        await router.push({ name: 'PathSelect' })// ชื่อ route ต้องตรงกับ router/index.js
        break
      case 2:
        await router.push({ name: 'Dashboard' })
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
    console.log('Decoded role (mounted):', role)
    console.log('Redirecting...')

    await router.isReady()
    await nextTick()

    switch (role) {
      case 3:
        await router.push({ name: 'PathSelect' })
        break
      case 2:
        await router.push({ name: 'Dashboard' })
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





