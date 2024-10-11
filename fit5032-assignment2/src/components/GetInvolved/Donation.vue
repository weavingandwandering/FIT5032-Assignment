<template>
    <div class="container my-4 d-flex justify-content-center">
      <div class="card" style="width: 100%; max-width: 400px;">
        <div class="card-body">
          <h2 class="text-center mb-4">Donate Now</h2>
          <form @submit.prevent="submitDonation">
            <div class="mb-3">
              <label for="donorName" class="form-label">Name</label>
              <input v-model="donor.name" type="text" id="donorName" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="donorEmail" class="form-label">Email</label>
              <input v-model="donor.email" type="email" id="donorEmail" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="donationAmount" class="form-label">Donation Amount</label>
              <input v-model="donor.amount" type="number" id="donationAmount" class="form-control" required min="1" />
            </div>
            <div class="mb-3">
              <label for="paymentMethod" class="form-label">Payment Method</label>
              <select v-model="donor.paymentMethod" id="paymentMethod" class="form-select" required>
                <option value="" disabled>Select payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary w-100">Donate</button>
          </form>
          <div v-if="message" class="alert mt-3" :class="alertClass">{{ message }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const donor = ref({ name: '', email: '', amount: '', paymentMethod: '' });
  const message = ref('');
  const alertClass = ref('');
  
  const submitDonation = async () => {
    try {
      const response = await fetch('YOUR_CLOUD_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donor.value),
      });
  
      const result = await response.json();
      if (response.ok) {
        message.value = 'Thank you for your donation!';
        alertClass.value = 'alert-success';
        donor.value = { name: '', email: '', amount: '', paymentMethod: '' }; // Reset form
      } else {
        message.value = result.error || 'Something went wrong. Please try again.';
        alertClass.value = 'alert-danger';
      }
    } catch (error) {
      message.value = 'Error connecting to server. Please try again later.';
      alertClass.value = 'alert-danger';
    }
  };
  </script>
  
  <style scoped>
  .card {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #333;
  }
  
  .alert {
    transition: all 0.3s ease;
  }
  </style>
  