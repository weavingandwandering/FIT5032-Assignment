<template>
    <div class="container my-5 d-flex justify-content-center align-items-start" style="min-height: 100vh;">
      <div class="card text-center" style="width: 100%; max-width: 500px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
        <div class="card-body p-4">
          <h2 class="mb-4" style="color: #4a4a4a;">Donation Receipt</h2>
          <p class="mb-1"><strong>Name:</strong> {{ donor.name }}</p>
          <p class="mb-1"><strong>Email:</strong> {{ donor.email }}</p>
          <p class="mb-1"><strong>Donation Amount:</strong> ${{ (donor.amount / 100).toFixed(2) }}</p>
          <p class="mb-1"><strong>Payment Method:</strong> {{ donor.paymentMethod }}</p>
          <p class="mt-3" style="font-weight: bold; color: #28a745;">Thank you for your generous donation!</p>
          <div class="mt-4">
            <button class="btn btn-success me-2" @click="exportAsPDF">Export as PDF</button>
            <button class="btn btn-info" @click="exportAsCSV">Export as CSV</button>
          </div>
          <button class="btn btn-primary mt-4" @click="goBack">Back to Home</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import jsPDF from 'jspdf';
  
  const route = useRoute();
  const router = useRouter();
  const db = getFirestore();
  
  const donor = ref({
    name: '',
    email: '',
    amount: 0,
    paymentMethod: '',
  });
  
  // Fetch donor information from Firestore
  const fetchDonorInfo = async (id) => {
    const donorDoc = doc(db, 'donations', id);
    const docSnapshot = await getDoc(donorDoc);
    if (docSnapshot.exists()) {
      donor.value = { ...docSnapshot.data(), amount: docSnapshot.data().amount };
    } else {
      console.log('No such document!');
    }
  };
  
  onMounted(() => {
    const donorId = route.query.id;
    if (donorId) {
      fetchDonorInfo(donorId);
    }
  });
  
  const goBack = () => {
    router.push('/');
  };
  
  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Donation Receipt", 20, 20);
    doc.text(`Name: ${donor.value.name}`, 20, 30);
    doc.text(`Email: ${donor.value.email}`, 20, 40);
    doc.text(`Donation Amount: $${(donor.value.amount / 100).toFixed(2)}`, 20, 50);
    doc.text(`Payment Method: ${donor.value.paymentMethod}`, 20, 60);
    doc.text("Thank you for your generous donation!", 20, 80);
    doc.save('donation_receipt.pdf');
  };
  
  const exportAsCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,Name,Email,Donation Amount,Payment Method\n${donor.value.name},${donor.value.email},$${(donor.value.amount / 100).toFixed(2)},${donor.value.paymentMethod}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "donation_receipt.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  </script>
  
  <style scoped>
  .card {
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  }
  h2 {
    color: #4a4a4a;
  }
  </style>
  