<template>
  <div class="reminder container">
    <h2 class="text-center my-4">Set a Reminder</h2>
    <form @submit.prevent="submitReminder" class="p-4 border rounded" role="form" aria-label="Set a Reminder Form">
      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="formData.email"
          readonly
          aria-describedby="emailHelp"
          required
        />
        <div id="emailHelp" class="form-text">Your email address will be used to send the reminder.</div>
      </div>

      <div class="mb-3">
        <label for="reminderMessage" class="form-label">Reminder Message:</label>
        <textarea
          class="form-control"
          id="reminderMessage"
          placeholder="Enter your reminder message"
          v-model="formData.message"
          rows="3"
          required
          aria-required="true"
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="reminderTime" class="form-label">Select Reminder Time:</label>
        <select class="form-control" id="reminderTime" v-model="selectedTime" aria-required="true" required>
          <option value="">Choose Time</option>
          <option value="15">In 15 minutes</option>
          <option value="30">In 30 minutes</option>
          <option value="60">In 1 hour</option>
          <option value="custom">Pick a Custom Time</option>
        </select>
      </div>

      <div class="mb-3" v-if="selectedTime === 'custom'">
        <label for="reminderDate" class="form-label">Custom Date and Time:</label>
        <input
          type="datetime-local"
          class="form-control"
          id="reminderDate"
          v-model="formData.reminderDate"
          required
          aria-required="true"
        />
      </div>

      <div class="mb-3">
        <label for="attachment" class="form-label">Attachment:</label>
        <input
          type="file"
          class="form-control"
          id="attachment"
          @change="handleFileUpload"
          multiple
          aria-describedby="attachmentHelp"
        />
        <div id="attachmentHelp" class="form-text">Attach any relevant files for your reminder.</div>
      </div>

      <button type="submit" class="btn btn-primary w-100">Set Reminder</button>
    </form>

    <div v-if="successMessage" class="text-success">{{ successMessage }}</div>
    <div v-if="error" class="text-danger">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
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
const files = ref([]);
const selectedTime = ref('');
const route = useRoute();

const fetchEmail = async () => {
  try {
    const usernameFromLocalStorage = localStorage.getItem('currentUser');
    if (usernameFromLocalStorage) {
      const usersC = collection(db, 'users');
      const q = query(usersC, where('username', '==', usernameFromLocalStorage));
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

const handleFileUpload = (event) => {
  files.value = Array.from(event.target.files);
};

const submitReminder = async () => {
  try {
    const currentTime = new Date();
    let reminderTime;
    if (selectedTime.value === 'custom') {
      reminderTime = new Date(formData.value.reminderDate);
    } else {
      reminderTime = new Date(currentTime.getTime() + selectedTime.value * 60000);
    }

    if (reminderTime <= currentTime) {
      error.value = 'The reminder date must be in the future';
      return;
    }

    const formDataForSubmission = {
      email: formData.value.email,
      message: formData.value.message,
      sendAt: reminderTime.toISOString(),
      attachments: []
    };

    for (const file of files.value) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        formDataForSubmission.attachments.push({
          content: base64String,
          filename: file.name,
          type: file.type
        });
      };
      await new Promise((resolve) => {
        reader.onloadend = () => {
          resolve();
        };
      });
    }

    const response = await axios.post(
      'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/scheduleEmail',
      formDataForSubmission,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      successMessage.value = 'Reminder set and email will be sent at the specified time.';
      error.value = null;
    }
  } catch (err) {
    console.error(err);
    error.value = 'Failed to set the reminder';
  }
};

onMounted(() => {
  fetchEmail();
  if (route.query.message) {
    formData.value.message = route.query.message; 
  }
});
</script>

<style scoped>
.reminder {
  max-width: 500px;
  margin: auto;
  margin-top: 20px;
  font-size: 18px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-label {
  font-size: 20px;
  color: #333;
}

input, textarea {
  font-size: 18px;
  padding: 12px;
  border: 2px solid #007bff;
  border-radius: 4px;
  transition: border-color 0.3s;
}

input:focus, textarea:focus, select:focus {
  border-color: #0056b3;
  outline: none;
}

.btn {
  font-size: 18px;
  padding: 12px;
}

.form-control {
  background-color: #f9f9f9;
  border: 1px solid #d3d3d3;
  color: #333;
}

h2 {
  color: #0f7aed;
}

.text-center {
  text-align: center;
}

.text-success, .text-danger {
  font-size: 18px;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
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
