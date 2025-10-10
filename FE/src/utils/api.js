// utils/api.js
import Swal from 'sweetalert2';

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`http://localhost:3000${url}`, {
      ...options,
      headers,
    });

    // ✅ ถ้า token หมดอายุหรือไม่ถูกต้อง
    if (res.status === 401 || res.status === 403) {
      console.warn('⏰ Token expired or invalid. Redirecting to login...');

      // 🧠 ล้าง token เก่า
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');

      // 🩶 แสดง SweetAlert แจ้งเตือน
      await Swal.fire({
        icon: 'warning',
        title: 'Session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
      });

      // 🔁 กลับหน้า Login
      window.location.href = '/login';
      return;
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('❌ API Error:', err);
    throw err;
  }
}


