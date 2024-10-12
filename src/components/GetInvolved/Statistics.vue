<template>
    <div class="container d-flex justify-content-center align-items-center chart-container">
      <div class="card text-center chart-card">
        <div class="card-body p-4">
          <h2 class="mb-4">Donation Summary (Last 7 Days)</h2>
          <canvas id="donationChart" class="chart-canvas"></canvas> 
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import Chart from 'chart.js/auto';
  import 'chartjs-adapter-moment';
  import moment from 'moment';
  
  const db = getFirestore();
  const donations = ref([]);
  
  onMounted(async () => {
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

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = moment().subtract(i, 'days').startOf('day');
    const totalAmount = donationData
      .filter(donation => moment(donation.date).isSame(date, 'day'))
      .reduce((sum, donation) => sum + donation.amount, 0);
    last7Days.push({
      date: date.format('YYYY-MM-DD'),
      amount: totalAmount,
    });
  }

  const ctx = document.getElementById('donationChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: last7Days.map(day => day.date),
    datasets: [
      {
        label: 'Total Donations',
        data: last7Days.map(day => day.amount),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...last7Days.map(day => day.amount)) || 100,
      },
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
      },
    },
  },
});

  });
  </script>
  
  <style scoped>
.chart-container {
  position: relative;
  width: 100%;
  max-width: 600px; 
  height: 400px;
  overflow: hidden; 
  margin: 0 auto; 
}

canvas {
  max-width: 100%; 
  max-height: 100%; 
}
  
.chart-card {
width: 100%;
max-width: 800px; 
background-color: #f9f9f9;
border: 1px solid #e0e0e0;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-canvas {
width: 100%;
height: 100%;
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
  