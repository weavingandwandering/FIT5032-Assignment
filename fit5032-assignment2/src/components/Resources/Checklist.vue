<template>
  <div class="reminder container">
    <h1 class="text-center my-4">Set a Reminder</h1>
    <form @submit.prevent="submitReminder" class="p-4 border rounded">
      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="formData.email"
          readonly
        />
      </div>

      <div class="mb-3">
        <label for="reminderMessage" class="form-label">Reminder Message:</label>
        <textarea
          class="form-control"
          id="reminderMessage"
          placeholder="Enter your reminder message"
          v-model="formData.message"
          rows="3"
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="reminderDate" class="form-label">Reminder Date and Time:</label>
        <input
          type="datetime-local"
          class="form-control"
          id="reminderDate"
          v-model="formData.reminderDate"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100">Set Reminder</button>
    </form>

    <div v-if="successMessage" class="text-success">{{ successMessage }}</div>
    <div v-if="error" class="text-danger">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const db = getFirestore();
const formData = ref({
  email: '',
  message: '',
  reminderDate: '',
});
const error = ref(null);
const successMessage = ref(null);

// Fetch the current user's email from Firestore
const fetchEmail = async () => {
  try {
    const usernameFromLocalStorage = localStorage.getItem('currentUser'); // Get username from localStorage
    if (usernameFromLocalStorage) {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('username', '==', usernameFromLocalStorage));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        formData.value.email = userData.email; 
      } else {
        error.value = 'User not found in the database';
      }
    } else {
      error.value = 'No user logged in';
    }
  } catch (err) {
    error.value = 'Error fetching user data';
  }
};


// Submit reminder function
const submitReminder = async () => {
  try {
    const currentTime = new Date();
    const reminderTime = new Date(formData.value.reminderDate);

    // Check if the reminder is in the future
    if (reminderTime <= currentTime) {
      error.value = 'The reminder date must be in the future';
      return;
    }
    // Debugging: Log the local and UTC times
    console.log('Current Local Time:', currentTime);
    console.log('Input Reminder Local Time:', reminderTime);

    // Call the Firebase Cloud Function to schedule the email
    const response = await axios.post(
      'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/scheduleEmail', // Update to your Cloud Function URL
      {
        email: formData.value.email,
        message: formData.value.message,
        sendAt: reminderTime.toISOString(), // Send in ISO format
      }
    );

    if (response.status === 200) {
      successMessage.value = 'Reminder set and email will be sent at the specified time.';
      error.value = null;
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    error.value = 'Failed to set the reminder';
  }
};




// Fetch the email when the component mounts
fetchEmail();
</script>

<style scoped>
/* Styling */
.reminder {
  max-width: 600px;
  margin: auto;
}

.form-label {
  font-size: 16px;
}

@media (min-width: 768px) {
  .form-label {
    font-size: 18px;
  }
}

@media (min-width: 992px) {
  .form-label {
    font-size: 20px;
  }
}

@media (min-width: 1200px) {
  .form-label {
    font-size: 22px;
  }
}
</style>
