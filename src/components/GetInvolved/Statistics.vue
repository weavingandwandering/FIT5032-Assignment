<template>
  <div class="container d-flex justify-content-center align-items-center chart-container" role="region" aria-labelledby="donation-summary">
    <div class="card text-center chart-card">
      <div class="card-body p-4">
        <h2 id="donation-summary" class="mb-4">Donation Summary</h2>
        
        <div class="mb-3">
          <select v-model="selectedPeriod" @change="updateChart" class="form-select">
            <option value="lastWeek">Last 7 Days</option>
            <option value="lastMonth">Last 30 Days</option>
            <option value="specificDay">Select a Day</option>
          </select>
        </div>
        
        <div v-if="selectedPeriod === 'specificDay'">
          <label for="specificDate">Choose a date:</label>
          <input type="date" id="specificDate" v-model="specificDate" @change="updateChart" />
        </div>

        <canvas id="donationChart" class="chart-canvas" aria-label="Bar chart showing total donations" role="img"></canvas>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Chart from 'chart.js/auto';
import moment from 'moment';

const db = getFirestore();
const donations = ref([]);
const errorMessage = ref('');
const selectedPeriod = ref('lastWeek');
const specificDate = ref(moment().format('YYYY-MM-DD'));
const chartInstance = ref(null);

const fetchDonations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'donations'));
    const donationData = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();

      if (data.timestamp) {
        donationData.push({
          date: data.timestamp.toDate(),
          amount: data.amount || 0,
        });
      } else {
        console.error('Missing date field in document:', doc.id);
      }
    });
    return donationData;
  } catch (error) {
    errorMessage.value = 'Error loading donation data. Please try again later.';
    return [];
  }
};

const updateChart = async () => {
  const donationData = await fetchDonations();

  let lastDays = [];
  const today = moment();

  if (selectedPeriod.value === 'lastWeek') {
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').startOf('day');
      const totalAmount = donationData
        .filter(donation => moment(donation.date).isSame(date, 'day'))
        .reduce((sum, donation) => sum + donation.amount, 0);
      lastDays.push({
        date: date.format('YYYY-MM-DD'),
        amount: totalAmount,
      });
    }
  } else if (selectedPeriod.value === 'lastMonth') {
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days').startOf('day');
      const totalAmount = donationData
        .filter(donation => moment(donation.date).isSame(date, 'day'))
        .reduce((sum, donation) => sum + donation.amount, 0);
      lastDays.push({
        date: date.format('YYYY-MM-DD'),
        amount: totalAmount,
      });
    }
  } else if (selectedPeriod.value === 'specificDay') {
    const totalAmount = donationData
      .filter(donation => moment(donation.date).isSame(specificDate.value, 'day'))
      .reduce((sum, donation) => sum + donation.amount, 0);
    lastDays.push({
      date: specificDate.value,
      amount: totalAmount,
    });
  }

  if (chartInstance.value) {
    chartInstance.value.destroy(); 
  }

  const ctx = document.getElementById('donationChart').getContext('2d');
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: lastDays.map(day => day.date),
      datasets: [
        {
          label: 'Total Donations',
          data: lastDays.map(day => day.amount),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#388E3C',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
       
        x: {
        type: 'category', 
      },
      },
    },
  });
};

onMounted(updateChart);
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 800px; 
  /* height: auto;  // Remove this line */
  overflow: hidden; 
  margin: 0 auto; 
  margin-top: 40px;
}

canvas {
  max-width: 100%; 
}

.chart-card {
  width: 100%;
  display: flex;
  max-width: 800px; 
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
  width: 100%;
  /* height: auto;  // This is also removed */
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  color: #333;
}
</style>