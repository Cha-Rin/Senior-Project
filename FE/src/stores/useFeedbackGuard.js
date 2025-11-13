// ในไฟล์ useFeedbackGuard.js

import { defineStore } from "pinia";
import axios from "axios";

export const useFeedbackGuard = defineStore("feedbackGuard", {
  state: () => ({
    loaded: false,
    // 🛑 แก้ไข State 
    pendingApptCount: 0,
    pendingDocCount: 0,
  }),

  getters: {
    // Getter เดิม (เผื่อยังใช้ที่อื่น)
    mustFeedback: (state) => (state.pendingApptCount + state.pendingDocCount) > 0,

    // ✅ Getter ใหม่ที่ฉลาดขึ้น
    mustFeedbackAppt: (state) => state.pendingApptCount > 0,
    mustFeedbackDoc: (state) => state.pendingDocCount > 0,
  },

  actions: {
    async loadPending() {
      const token = localStorage.getItem("authToken");

      if (!token) {
        this.pendingApptCount = 0; // 
        this.pendingDocCount = 0;  // 
        this.loaded = true;
        return;
      }

      try {
        const res = await axios.get("/api/student/feedback/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ อ่านค่าจาก API ที่แก้ไขแล้ว
        this.pendingApptCount = res?.data?.appointments ?? 0;
        this.pendingDocCount = res?.data?.documents ?? 0;

      } catch (err) {
        console.error("❌ Error loading pending feedback:", err);
        this.pendingApptCount = 0;
        this.pendingDocCount = 0;
      }

      this.loaded = true;
   }
  },
});