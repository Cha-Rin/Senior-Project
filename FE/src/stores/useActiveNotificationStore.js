import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import jwt_decode from "jwt-decode";

export const useActiveNotificationStore = defineStore("activeNotifications", {
  state: () => ({
    activeList: [],     // รายการนัดหมายที่ถึงเวลาแล้ว
    isLoading: false,
    userId: null,
  }),

  getters: {
    activeCount: (state) => state.activeList.length,
  },

  actions: {

    // ⭐ ดึง userId จาก token
    loadUserIdFromToken() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return null;

        const decoded = jwt_decode(token);
        this.userId = decoded.user_id || null;

        return this.userId;
      } catch (err) {
        console.error("Decode token failed:", err);
        return null;
      }
    },

   async fetchActiveAppointments(secretaryId) {
  if (!secretaryId || this.isLoading) return;

  this.isLoading = true;

  try {
    const res = await fetch(`/api/noti/active-now/${secretaryId}`);
    const data = await res.json();

    const list = Array.isArray(data) ? data : [];

    const newItems = list.filter(
      (item) => !this.activeList.some((old) => old.id === item.id)
    );

    newItems.forEach((item) => {
      toast.info(
        `⏰ It's time for the appointment. ${item.name} (${item.topic}) แล้ว!`,
        { position: "bottom-right", autoClose: 5000 }
      );
    });

    this.activeList = list;
  } catch (err) {
    console.error("โหลด active-now ล้มเหลว:", err);
  } finally {
    this.isLoading = false;
  }
},


    async markDone(id) {
      try {
        await fetch(`/api/noti/active/${id}/done`, { method: "POST" });
        this.activeList = this.activeList.filter((item) => item.id !== id);
        toast.success("✅ Complete!");
      } catch (err) {
        console.error("Mark done failed:", err);
      }
    },

    async cancel(id) {
      try {
        await fetch(`/api/noti/active/${id}/cancel`, { method: "POST" });
        this.activeList = this.activeList.filter((item) => item.id !== id);
        toast.error("❌ Cancal!");
      } catch (err) {
        console.error("Cancel failed:", err);
      }
    },
  },
});
