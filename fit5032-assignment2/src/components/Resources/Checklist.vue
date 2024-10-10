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
        <label for="reminderTime" class="form-label">Select Reminder Time:</label>
        <select class="form-control" id="reminderTime" v-model="selectedTime">
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
const files = ref([]); 
const selectedTime = ref('');

// Fetch the current user's email from Firestore
const fetchEmail = async () => {
  try {
    const usernameFromLocalStorage = localStorage.getItem('currentUser');
    if (usernameFromLocalStorage) {
      const usersC = collection(db, 'users');
      const q = query(usersC, where('username','==',usernameFromLocalStorage));
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

// Handle file upload
const handleFileUpload = (event) => {
  files.value = Array.from(event.target.files);
};

// Submit reminder function
const submitReminder = async () => {
  try {
    const currentTime = new Date();
    let reminderTime;
    if (selectedTime.value === 'custom') {
      reminderTime = new Date(formData.value.reminderDate);
    } else {
      const currentTime = new Date();
      reminderTime = new Date(currentTime.getTime() + selectedTime.value * 60000);
    }


    // Check if the reminder is in the future
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

    // Append files to the formDataForSubmission
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
      // Wait for the file to be read before proceeding
      await new Promise((resolve) => {
        reader.onloadend = () => {
          resolve();
        };
      });
    }

    // Call the Firebase Cloud Function to schedule the email
    const response = await axios.post(
      'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/scheduleEmail',
      formDataForSubmission,
      {
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
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


// Fetch the email when the component mounts
fetchEmail();
</script>


<style scoped>

.reminder {
  max-width: 600px;
  margin: auto;
  font-size: 18px; 
}

.form-label {
  font-size: 20px; 
}

input, textarea {
  font-size: 18px;
  padding: 12px;
}

.btn {
  font-size: 20px;
  padding: 15px;
}

.form-control {
  background-color: #f0f0f0;
  border: 1px solid #d3d3d3;
  color: #333;
}


h1, label {
  color: #333;
}

.text-center {
  text-align: center;
}

.text-success, .text-danger {
  font-size: 18px; 
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


