<template>
  <div class="container my-4 d-flex justify-content-center">
    <div class="card" style="width: 100%; max-width: 400px;">
      <div class="card-body">
        <h2 class="text-center mb-4">Donate Now</h2>
        <form @submit.prevent="openModal" aria-labelledby="donateForm">
          <div class="mb-3">
            <label for="donorName" class="form-label">Name</label>
            <input
              v-model="donor.name"
              type="text"
              id="donorName"
              class="form-control"
              required
              aria-label="Donor Name"
            />
          </div>
          <div class="mb-3">
            <label for="donorEmail" class="form-label">Email</label>
            <input
              v-model="donor.email"
              type="email"
              id="donorEmail"
              class="form-control"
              required
              aria-label="Donor Email"
            />
          </div>
          <div class="mb-3">
            <label for="donationAmount" class="form-label">Donation Amount</label>
            <input
              v-model.number="donor.amount" 
              type="number"
              id="donationAmount"
              class="form-control"
              required
              step="0.01"
              aria-label="Donation Amount"
            />
          </div>
          <div class="mb-3">
            <label for="paymentMethod" class="form-label">Payment Method</label>
            <select
              v-model="donor.paymentMethod"
              id="paymentMethod"
              class="form-select"
              required
              aria-label="Payment Method"
            >
              <option value="" disabled>Select payment method</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="!isPaymentMethodValid"
            aria-label="Donate"
          >
            Donate
          </button>
        </form>
        <div v-if="message" class="alert mt-3" :class="alertClass">{{ message }}</div>
      </div>
    </div>

    <div class="modal" tabindex="-1" v-if="showModal" role="dialog" aria-labelledby="modalTitle" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modalTitle" class="modal-title">Credit Card Details</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitDonation" aria-labelledby="modalTitle">
              <div class="mb-3">
                <label for="cardNumber" class="form-label">Card Number</label>
                <input
                  v-model="creditCard.number"
                  type="text"
                  id="cardNumber"
                  class="form-control"
                  required
                  aria-label="Card Number"
                  @blur="validateCardNumber"
                />
              </div>
              <div v-if="cardNumberError" class="alert alert-danger">{{ cardNumberError }}</div>
              <div class="mb-3">
                <label for="cardExpiry" class="form-label">Expiry Date (MM/YY)</label>
                <input
                  v-model="creditCard.expiry"
                  type="text"
                  id="cardExpiry"
                  class="form-control"
                  required
                  placeholder="MM/YY"
                  aria-label="Card Expiry Date"
                  @blur="validateExpiry"
                />
              </div>
              <div v-if="expiryError" class="alert alert-danger">{{ expiryError }}</div>
              <div class="mb-3">
                <label for="cardCVC" class="form-label">CVC</label>
                <input
                  v-model="creditCard.cvc"
                  type="text"
                  id="cardCVC"
                  class="form-control"
                  required
                  aria-label="Card CVC"
                  @blur="validateCVC"
                />
              </div>
              <div v-if="cvcError" class="alert alert-danger">{{ cvcError }}</div>
              <button type="submit" class="btn btn-primary w-100" aria-label="Submit Payment">Submit Payment</button>
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
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const db = getFirestore();

const donor = ref({ name: '', email: '', amount: '', paymentMethod: '' });
const creditCard = ref({ number: '', expiry: '', cvc: '' });
const message = ref('');
const alertClass = ref('');
const showModal = ref(false);
const router = useRouter();

const cardNumberError = ref('');
const expiryError = ref('');
const cvcError = ref('');

const isPaymentMethodValid = computed(() => {
  return donor.value.paymentMethod === 'credit_card';
});

// Validate credit card number using Luhn algorithm
const validateCardNumber = () => {
  const value = creditCard.value.number.replace(/\s/g, '');
  const regex = /^[0-9]{13,19}$/; // Validate length and digits
  if (!regex.test(value) || !luhnCheck(value)) {
    cardNumberError.value = 'Invalid card number.';
  } else {
    cardNumberError.value = '';
  }
};

// Luhn algorithm check
const luhnCheck = (cardNumber) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const validateExpiry = () => {
  const [month, year] = creditCard.value.expiry.split('/').map((el) => el.trim());
  const now = new Date();
  const expiryDate = new Date(`20${year}`, month - 1); // Convert to Date object
  if (!month || !year || expiryDate < now) {
    expiryError.value = 'Invalid expiry date.';
  } else {
    expiryError.value = '';
  }
};

const validateCVC = () => {
  const regex = /^[0-9]{3,4}$/; // Validate 3 or 4 digits
  if (!regex.test(creditCard.value.cvc)) {
    cvcError.value = 'Invalid CVC.';
  } else {
    cvcError.value = '';
  }
};

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
};

const submitDonation = async () => {
  if (cardNumberError.value || expiryError.value || cvcError.value) {
    message.value = 'Please fix the errors before submitting.';
    alertClass.value = 'alert-danger';
    return;
  }

  try {
    donor.value.amount = donor.value.amount * 100 
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
      const docRef = await addDoc(collection(db, 'donations'), {
        name: donor.value.name,
        email: donor.value.email,
        amount: donor.value.amount,
        paymentMethod: donor.value.paymentMethod,
        timestamp: Timestamp.now(),
      });

      donor.value = { name: '', email: '', amount: '', paymentMethod: '' };
      creditCard.value = { number: '', expiry: '', cvc: '' };
      reroute(docRef.id);
    } else {
      message.value = result.error || 'Something went wrong. Please try again.';
      alertClass.value = 'alert-danger';
    }
  } catch (error) {
    console.error('Error:', error);
    message.value = 'An error occurred while processing your donation.';
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

.btn-primary {
  background-color: #007bff; 
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3; 
  border-color: #0056b3;
}

.card-body {
  color: #212529; 
}
</style>
