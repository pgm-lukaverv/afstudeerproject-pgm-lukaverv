<template>
  <div class="bg-dark-800 rounded-xl p-8 shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <svg
          class="w-5 h-5 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Audience Retention
      </h2>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm text-gray-400">Avg. Duration:</span>
          <span class="text-sm text-white font-semibold">{{
            avgViewDuration
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Retention:</span>
          <span class="text-sm text-white font-semibold"
            >{{ avgPercentageViewed }}%</span
          >
        </div>
      </div>
    </div>
    <div class="h-px bg-dark-700 mb-5"></div>

    <!-- Legend -->
    <div class="flex items-center gap-5 mb-4 text-xs text-gray-400">
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-0.5 bg-primary-500 rounded-full"></div>
        <span>This beat</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-6 h-0.5 bg-gray-500 rounded-full opacity-60"></div>
        <span>Typical retention</span>
      </div>
    </div>

    <!-- Chart -->
    <div class="h-44">
      <ClientOnly>
        <Line :data="chartData" :options="chartOptions" />
        <template #fallback>
          <div class="h-44 bg-dark-900/30 rounded-lg animate-pulse"></div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const props = withDefaults(
  defineProps<{
    duration?: number;
    avgViewDuration?: string;
    avgPercentageViewed?: number;
  }>(),
  {
    duration: 180,
    avgViewDuration: "1:45",
    avgPercentageViewed: 58,
  },
);

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const retentionData = computed(() => {
  const points = 50;
  const data = [];

  for (let i = 0; i <= points; i++) {
    const progressRatio = i / points;

    let beatRetention = 100;
    beatRetention -= progressRatio * 25;

    if (progressRatio > 0.25 && progressRatio < 0.35) {
      beatRetention += 8 * Math.sin((progressRatio - 0.25) * Math.PI * 10);
    }
    if (progressRatio > 0.55 && progressRatio < 0.65) {
      beatRetention += 12 * Math.sin((progressRatio - 0.55) * Math.PI * 10);
    }

    beatRetention -= Math.pow(progressRatio, 1.5) * 30;
    beatRetention += Math.sin(progressRatio * 20) * 2;

    let typicalRetention =
      100 - progressRatio * 55 - Math.pow(progressRatio, 2) * 20;
    typicalRetention += Math.sin(progressRatio * 15) * 1.5;

    beatRetention = Math.max(25, Math.min(98, beatRetention));
    typicalRetention = Math.max(15, Math.min(93, typicalRetention));

    data.push({ progressRatio, beatRetention, typicalRetention });
  }

  return data;
});

const chartData = computed<ChartData<"line">>(() => {
  const data = retentionData.value;
  return {
    labels: data.map((p) => formatTime(p.progressRatio * props.duration)),
    datasets: [
      {
        label: "Typical retention",
        data: data.map((p) => p.typicalRetention),
        borderColor: "rgba(107, 114, 128, 0.4)",
        backgroundColor: "rgba(75, 85, 99, 0.15)",
        fill: true,
        borderWidth: 1,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: "This beat",
        data: data.map((p) => p.beatRetention),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        fill: true,
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<"line">>(
  (): ChartOptions<"line"> => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(15, 18, 25, 0.92)",
        titleColor: "#9CA3AF",
        bodyColor: "#F3F4F6",
        borderColor: "rgba(55, 65, 81, 0.5)",
        borderWidth: 1,
        padding: 8,
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y ?? 0)}%`,
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: "rgba(55, 65, 81, 0.25)" },
        ticks: {
          color: "#4B5563",
          maxTicksLimit: 3,
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        min: 0,
        max: 100,
        border: { display: false },
        grid: { color: "rgba(55, 65, 81, 0.25)" },
        ticks: {
          color: "#4B5563",
          stepSize: 50,
          callback: (value) => value + "%",
        },
      },
    },
  }),
);
</script>
