<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Pie, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import type  {ChartData,
  ChartOptions,
  TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

interface CategoryRevenue {
  catName: string;
  revenue: number;
}

const appointmentStats = ref<AppointmentStats | null>(null);
const billStats = ref<BillStats | null>(null);
const categoryRevenue = ref<CategoryRevenue[]>([]);

const appointmentChartData = ref<ChartData<'pie'>>({
  labels: ['Completed', 'Pending'],
  datasets: [{
    data: [0, 0],
    backgroundColor: ['#4CAF50', '#FFA726'],
    borderColor: ['#388E3C', '#FB8C00'],
    borderWidth: 1,
  }]
});

const billChartData = ref<ChartData<'pie'>>({
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

const categoryChartData = ref<ChartData<'bar'>>({
  labels: [],
  datasets: [{
    label: 'Revenue par catégorie',
    data: [],
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    borderWidth: 1,
  }]
});

const pieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label(tooltipItem) {
          const { dataset } = tooltipItem;
          const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
          const value = dataset.data[tooltipItem.dataIndex] as number;
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${tooltipItem.label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label(tooltipItem) {
          return `${tooltipItem.formattedValue} €`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback(value) {
          if (typeof value === 'number') {
            return `${value.toLocaleString()} €`;
          }
          return value;
        }
      }
    }
  }
};

const fetchStats = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [appResponse, billResponse, categoryResponse] = await Promise.all([
      fetch('/api/appointment/appointments-stats', { credentials: 'include' }),
      fetch('/api/bill/bills-stats', { credentials: 'include' }),
      fetch('/api/bill/category-revenue', { credentials: 'include' })
    ]);

    if (!appResponse.ok || !billResponse.ok || !categoryResponse.ok) {
      throw new Error('Error fetching data');
    }

    const [appStats, billData, categoryData] = await Promise.all([
      appResponse.json(),
      billResponse.json(),
      categoryResponse.json()
    ]) as [AppointmentStats, BillStats, CategoryRevenue[]];

    appointmentStats.value = appStats;
    appointmentChartData.value.datasets[0].data = [
      appStats.completed || 0,
      appStats.pending || 0,
    ];

    billStats.value = billData;
    billChartData.value.datasets[0].data = [
      billData.pending || 0,
      billData.accepted || 0,
      billData.paid || 0,
    ];

    categoryRevenue.value = categoryData;
    categoryChartData.value.labels = categoryData.map((item: CategoryRevenue) => item.catName);
    categoryChartData.value.datasets[0].data = categoryData.map((item: CategoryRevenue) => item.revenue);

  } catch (error) {
    console.error('Error fetching stats:', error);
    // error.value = 'An error occurred while fetching data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            :options="pieChartOptions"
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
            :options="pieChartOptions"
          />
        </div>
      </div>
      <div class="pt-4 text-sm text-gray-600 text-center border-t mt-4">
        Total bills: {{ billStats?.total || 0 }}
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md flex flex-col">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Revenue par Catégorie</h2>
      <div class="flex-grow">
        <div v-if="loading" class="h-64 flex items-center justify-center">
          <div class="text-gray-500">Loading...</div>
        </div>
        <div v-else-if="error" class="h-64 flex items-center justify-center">
          <div class="text-red-500">{{ error }}</div>
        </div>
        <div v-else class="h-64">
          <Bar
            v-if="categoryRevenue.length > 0"
            :data="categoryChartData"
            :options="barChartOptions"
          />
          <div v-else class="h-full flex items-center justify-center text-gray-500">
            Aucune donnée disponible
          </div>
        </div>
      </div>
      <div class="pt-4 text-sm text-gray-600 text-center border-t mt-4">
        Total revenue: {{ categoryRevenue.reduce((sum: number, item: CategoryRevenue) => sum + item.revenue, 0).toLocaleString() }} €
      </div>
    </div>
  </div>
</template>
