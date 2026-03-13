<template>
  <div class="bg-dark-800 rounded-xl p-8 shadow-2xl">
    <!-- Header with total plays and change -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">Analytics</h2>
        <div class="flex items-center gap-3 mt-3">
          <span class="text-4xl font-bold text-white">{{ currentTotal }}</span>
          <span v-if="pending" class="text-xs text-gray-500 animate-pulse"
            >Loading...</span
          >
        </div>
        <p class="text-sm text-gray-400 mt-1">{{ periodLabel }}</p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedPeriod"
          class="bg-dark-700 text-white border border-dark-600 rounded-lg px-3 py-2 text-sm outline-none select-none cursor-pointer hover:bg-dark-600 transition-all"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 border-b border-dark-700 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'pb-3 text-sm font-medium transition-all duration-300 relative outline-none select-none',
          activeTab === tab.id ? '' : 'text-gray-400 hover:text-gray-300',
        ]"
        :style="activeTab === tab.id ? { color: 'rgb(59, 130, 246)' } : {}"
      >
        {{ tab.label }}
        <div
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 animate-slideIn"
        ></div>
      </button>
    </div>

    <!-- Chart -->
    <div class="relative h-80">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { ChartOptions } from "chart.js";

// Register ChartJS components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const activeTab = ref("plays");
const selectedPeriod = ref("week");

const tabs = [
  { id: "plays", label: "Plays" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "follows", label: "Follows" },
];

// Fetch real chart data from the API, re-fetches when period changes
const { data: apiData, pending } = await useFetch(
  () => `/api/dashboard/chart?period=${selectedPeriod.value}`,
);

const periodLabel = computed(() => {
  const labels: Record<string, string> = {
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };
  return labels[selectedPeriod.value] || "This Week";
});

const currentTotal = computed(() => {
  if (!apiData.value) return 0;
  const data = (apiData.value as any)[activeTab.value] as number[] | undefined;
  return data?.reduce((sum, val) => sum + val, 0) ?? 0;
});

const chartData = computed(() => {
  const labels = apiData.value?.labels ?? [];
  const data = apiData.value
    ? (((apiData.value as any)[activeTab.value] as number[]) ?? [])
    : [];
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 4,
        barThickness: selectedPeriod.value === "all" ? 40 : 60,
      },
    ],
  };
});

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#374151",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (context) => context[0]?.label || "",
        label: (context) => `${activeTab.value}: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(75, 85, 99, 0.2)",
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 11,
        },
        stepSize: 1,
      },
    },
  },
};
</script>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
  transform-origin: left;
}
</style>
