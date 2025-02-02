<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const loading = ref(true);
const error = ref<string | null>(null);

enum BillStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PAID = 'paid'
}

interface AppointmentStats {
  total: number;
  completed: number;
  pending: number;
}

interface BillStats {
  total: number;
  pending: number;
  accepted: number;
  paid: number;
}

const appointmentStats = ref<AppointmentStats | null>(null);
const billStats = ref<BillStats | null>(null);

const appointmentChartData = ref({
  labels: ['Completed', 'Pending'],
  datasets: [{
    data: [0, 0],
    backgroundColor: ['#4CAF50', '#FFA726'],
    borderColor: ['#388E3C', '#FB8C00'],
    borderWidth: 1,
  }]
});

const billChartData = ref({
  labels: [
    BillStatus.PENDING.charAt(0).toUpperCase() + BillStatus.PENDING.slice(1),
    BillStatus.ACCEPTED.charAt(0).toUpperCase() + BillStatus.ACCEPTED.slice(1),
    BillStatus.PAID.charAt(0).toUpperCase() + BillStatus.PAID.slice(1)
  ],
  datasets: [{
    data: [0, 0, 0],
    backgroundColor: ['#FFA726', '#42A5F5', '#4CAF50'],
    borderColor: ['#FB8C00', '#1E88E5', '#388E3C'],
    borderWidth: 1,
  }]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

const fetchStats = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch appointment stats
    const appResponse = await fetch('/api/appointment/appointments-stats', {
      credentials: 'include',
    });

    if (!appResponse.ok) {
      throw new Error(`HTTP error! status: ${appResponse.status}`);
    }

    const appStats = await appResponse.json();
    console.log('Appointment stats response:', appStats);

    appointmentStats.value = appStats;
    appointmentChartData.value.datasets[0].data = [
      appStats.completed || 0,
      appStats.pending || 0,
    ];

    // Fetch bill stats
    const billResponse = await fetch('/api/bill/bills-stats', {
      credentials: 'include',
    });

    if (!billResponse.ok) {
      throw new Error(`HTTP error! status: ${billResponse.status}`);
    }

    const billData = await billResponse.json();
    console.log('Bill stats response:', billData);

    billStats.value = billData;
    billChartData.value.datasets[0].data = [
      billData.pending || 0,
      billData.accepted || 0,
      billData.paid || 0,
    ];
  } catch (error) {
    console.error('Error fetching stats:', error);
    // error.value = error instanceof Error ? error.message : 'An error occurred while fetching data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Appointments Status</h2>
      <div class="flex-grow">
        <div v-if="loading" class="h-64 flex items-center justify-center">
          <div class="text-gray-500">Loading...</div>
        </div>
        <div v-else-if="error" class="h-64 flex items-center justify-center">
          <div class="text-red-500">{{ error }}</div>
        </div>
        <div v-else class="h-64">
          <Pie
            v-if="appointmentStats"
            :data="appointmentChartData"
            :options="chartOptions"
          />
        </div>
      </div>
      <div class="pt-4 text-sm text-gray-600 text-center border-t mt-4">
        Total appointments: {{ appointmentStats?.total || 0 }}
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Bills Status</h2>
      <div class="flex-grow">
        <div v-if="loading" class="h-64 flex items-center justify-center">
          <div class="text-gray-500">Loading...</div>
        </div>
        <div v-else-if="error" class="h-64 flex items-center justify-center">
          <div class="text-red-500">{{ error }}</div>
        </div>
        <div v-else class="h-64">
          <Pie
            v-if="billStats"
            :data="billChartData"
            :options="chartOptions"
          />
        </div>
      </div>
      <div class="pt-4 text-sm text-gray-600 text-center border-t mt-4">
        Total bills: {{ billStats?.total || 0 }}
      </div>
    </div>
  </div>
</template>
