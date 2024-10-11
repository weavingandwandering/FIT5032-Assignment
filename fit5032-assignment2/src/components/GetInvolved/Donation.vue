Share


You said:
<template>
  <div class="container my-4 d-flex justify-content-center">
    <div class="card" style="width: 100%; max-width: 400px;">
      <div class="card-body">
        <h2 class="text-center mb-4">Donate Now</h2>
        <form @submit.prevent="openModal">
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
          <button type="submit" class="btn btn-primary w-100" :disabled="!isPaymentMethodValid">Donate</button>
        </form>
        <div v-if="message" class="alert mt-3" :class="alertClass">{{ message }}</div>
      </div>
    </div>

    <div class="modal" tabindex="-1" v-if="showModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Credit Card Details</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitDonation">
              <div class="mb-3">
                <label for="cardNumber" class="form-label">Card Number</label>
                <input v-model="creditCard.number" type="text" id="cardNumber" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="cardExpiry" class="form-label">Expiry Date (MM/YY)</label>
                <input v-model="creditCard.expiry" type="text" id="cardExpiry" class="form-control" required placeholder="MM/YY" />
              </div>
              <div class="mb-3">
                <label for="cardCVC" class="form-label">CVC</label>
                <input v-model="creditCard.cvc" type="text" id="cardCVC" class="form-control" required />
              </div>
              <button type="submit" class="btn btn-primary w-100">Submit Payment</button>
            </form>
            <div v-if="message" class="alert mt-3" :class="alertClass">{{ message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';


const db = getFirestore();

const donor = ref({ name: '', email: '', amount: '', paymentMethod: '' });
const creditCard = ref({ number: '', expiry: '', cvc: '' });
const message = ref('');
const alertClass = ref('');
const showModal = ref(false);
const router = useRouter();

const isPaymentMethodValid = computed(() => {
  return donor.value.paymentMethod === 'credit_card';
});

const openModal = () => {
  if (donor.value.paymentMethod === 'credit_card') {
    showModal.value = true;
  } else {
    submitDonation();
  }
};

const closeModal = () => {
  showModal.value = false;
  message.value = '';
};

const reroute = (id) => {
    router.push({
        path: '/volunteering',
        query: {
          id: id,
          name: donor.value.name,
          email: donor.value.email,
          amount: donor.value.amount * 100,
          paymentMethod: donor.value.paymentMethod,
        },
      });
}

const submitDonation = async () => {
  try {
    const response = await fetch('https://australia-southeast1-ishita-assignment3.cloudfunctions.net/processDonation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...donor.value,
        source: creditCard.value.number,  
      }),
    });

    const result = await response.json();
    if (response.ok) {
        message.value = 'Thank you for your donation!';
         alertClass.value = 'alert-success';
         console.log("HERE")
        const docRef = await addDoc(collection(db, 'donations'), {
        name: donor.value.name,
        email: donor.value.email,
        amount: donor.value.amount,
        paymentMethod: donor.value.paymentMethod,
        timestamp: new Date().toISOString(),
      });
      
      donor.value = { name: '', email: '', amount: '', paymentMethod: '' }; 
      creditCard.value = { number: '', expiry: '', cvc: '' }; 
      reroute(docRef.id);

      
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

.modal {
  display: block;
}
</style>
