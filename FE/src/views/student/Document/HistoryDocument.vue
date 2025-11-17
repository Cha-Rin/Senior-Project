<template>
  <div>
    <div class="min-h-screen bg-white px-4 py-6">

      <!-- หัวเรื่อง -->
      <h1 class="text-xl font-semibold text-center mt-8">History</h1>

      <!-- Header -->
      <div class="max-w-md mx-auto flex justify-between items-center text-sm mb-3">
        <h2 class="font-semibold truncate">{{ currentMonthYear }}</h2>
        <button @click="isExpanded = !isExpanded" class="text-indigo-600 text-xs underline">
          {{ isExpanded ? "Weekly View" : "Full Calendar" }}
        </button>
      </div>

      <!-- Weekly Calendar -->
      <div v-if="!isExpanded" class="max-w-md mx-auto">
        <div class="grid grid-cols-7 gap-1 text-[12px] text-gray-400 mb-1 text-center">
          <div v-for="d in weekDays" :key="d.full">{{ d.short }}</div>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center text-sm">
          <div
            v-for="d in weekDays"
            :key="d.full"
            @click="selectDate(d)"
            class="cursor-pointer"
          >
            <div
              :class="[
                'w-8 h-8 mx-auto flex items-center justify-center rounded-full',
                selectedDate.full === d.full
                  ? 'bg-indigo-500 text-white'
                  : isToday(d)
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-800'
              ]"
            >
              {{ d.date }}
            </div>

            <div
              v-if="hasEvent(d)"
              class="w-1 h-1 bg-indigo-500 rounded-full mx-auto mt-1"
            ></div>
          </div>
        </div>
      </div>

      <!-- Full Calendar -->
      <div v-else class="max-w-md mx-auto mt-2 bg-white rounded shadow text-xs">
        <v-calendar
          is-expanded
          :first-day-of-week="0"
          :attributes="calendarAttrs"
          @dayclick="selectDateFromCalendar"
          @update:page="updateMonthYear"
        />
      </div>

      <!-- Document History -->
      <div class="max-w-md mx-auto mt-6 bg-white shadow rounded p-4 text-xs">
        <p class="text-gray-500 mb-1">Selected: {{ selectedDate.full }}</p>

        <div v-if="selectedDocFull">
          <!-- ชื่อเอกสาร -->
          <p class="font-semibold text-sm mb-2">{{ selectedDocFull.title }}</p>

          <!-- รูปเอกสาร -->
          <div v-if="selectedDocFull.image_path" class="mb-3">
            <p class="font-semibold mb-1">📷 Uploaded Image</p>
            <img
              :src="fullImageUrl(selectedDocFull.image_path)"
              alt="Document Image"
              class="w-full h-auto rounded shadow"
            />
          </div>

          <!-- เหตุผลการปฏิเสธ -->
          <div
            v-if="selectedDocFull.staff_note"
            class="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded"
          >
            <p class="text-red-600 font-semibold text-xs">Reject Reason:</p>
            <p class="text-red-500 text-xs">{{ selectedDocFull.staff_note }}</p>
          </div>
        </div>

        <p v-else class="text-gray-400">No document.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

// -------------------- STATE --------------------
const isExpanded = ref(false);
const today = new Date();
const currentPageDate = ref(today);
const historyDocs = ref([]);
const events = ref([]);
const selectedDate = ref({ full: "", date: "" });
const router = useRouter();

// -------------------- FETCH DOCUMENT HISTORY --------------------
onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("⚠️ No token found");
    return;
  }

  try {
    const res = await fetch("/api/student/document/history", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Document history response:", data);

    if (data.success && Array.isArray(data.historyDocs)) {
      historyDocs.value = data.historyDocs.map((item) => ({
        date: formatYMDFromSQLString(item.submit_date),
        title: item.doc_title || "Untitled",
        status: item.status,
        image_path: item.image_path || null,
        staff_note: item.staff_note || null,
      }));

      events.value = historyDocs.value.map((i) => ({
        date: i.date,
        color: i.status === 1 ? "green" : "blue",
      }));
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
  }

  selectedDate.value = {
    full: formatLocalYMD(today),
    date: today.getDate(),
  };
});

// -------------------- UTILITIES --------------------
function formatYMDFromSQLString(s) {
  if (!s) return "";
  return s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
}

function formatLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseLocalYMD(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function fullImageUrl(path) {
  if (!path) return "";
  return `http://localhost:3000/${path.replace(/\\/g, "/")}`;
}

function hasEvent(day) {
  return events.value.some((e) => e.date === day.full);
}

// -------------------- CALENDAR --------------------
const currentMonthYear = computed(() =>
  currentPageDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
);

function updateMonthYear({ year, month }) {
  currentPageDate.value = new Date(year, month - 1, 1);
}

const sunday = new Date(today);
sunday.setDate(today.getDate() - sunday.getDay());

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(sunday);
  d.setDate(sunday.getDate() + i);
  return {
    short: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2),
    date: d.getDate(),
    full: formatLocalYMD(d),
    raw: d,
  };
});

function selectDate(day) {
  selectedDate.value = day;
}

function selectDateFromCalendar(day) {
  const d = day.date;
  selectedDate.value = {
    date: d.getDate(),
    full: formatLocalYMD(d),
    raw: d,
  };
}

// -------------------- SELECTED DOCUMENT --------------------
const selectedDocFull = computed(() => {
  return historyDocs.value.find((item) => item.date === selectedDate.value.full);
});

// -------------------- CALENDAR COLORS --------------------
const calendarAttrs = ref([]);

watch(
  events,
  () => {
    calendarAttrs.value = [
      { key: "today", highlight: true, dates: new Date() },
      {
        key: "pending",
        dot: true,
        highlight: { color: "blue" },
        dates: events.value
          .filter((e) => e.color === "blue")
          .map((e) => parseLocalYMD(e.date)),
      },
      {
        key: "approved",
        dot: true,
        highlight: { color: "green" },
        dates: events.value
          .filter((e) => e.color === "green")
          .map((e) => parseLocalYMD(e.date)),
      },
    ];
  },
  { immediate: true }
);

function isToday(day) {
  return day.full === formatLocalYMD(new Date());
}
</script>
