<template>
  <div class="container my-5">
    <h1 class="text-center mb-4">Checklist & Reminder</h1>

    <!-- Checklist Section -->
    <div class="card p-4">
      <h3 class="mb-3">Checklist</h3>
      <ul class="list-group">
        <li
          v-for="(task, index) in tasks"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <input
              type="checkbox"
              v-model="task.completed"
              class="form-check-input me-2"
              @change="saveTasks"
            />
            <span :class="{ 'text-decoration-line-through': task.completed }">
              {{ task.name }}
            </span>
          </div>
          <button class="btn btn-danger btn-sm" @click="removeTask(index)">
            Remove
          </button>
        </li>
      </ul>

      <div class="input-group mt-3">
        <input
          type="text"
          v-model="newTask"
          placeholder="New task"
          class="form-control"
        />
        <button class="btn btn-primary" @click="addTask">Add Task</button>
      </div>
    </div>

    <!-- Reminder Section -->
    <div class="card p-4 mt-4">
      <h3 class="mb-3">Set Reminder</h3>
      <form @submit.prevent="sendReminder">
        <div class="mb-3">
          <label for="email" class="form-label">Email Address:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="Enter email"
            required
          />
        </div>

        <div class="mb-3">
          <label for="message" class="form-label">Reminder Message:</label>
          <textarea
            id="message"
            v-model="reminderMessage"
            class="form-control"
            rows="3"
            placeholder="Enter your reminder message"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="dateTime" class="form-label">Select Date and Time:</label>
          <input
            type="datetime-local"
            id="dateTime"
            v-model="dateTime"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label for="attachment" class="form-label">Attach a File:</label>
          <input
            type="file"
            id="attachment"
            @change="handleFileUpload"
            class="form-control"
          />
        </div>

        <button type="submit" class="btn btn-success w-100">Send Reminder</button>
      </form>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <!-- Success Message -->
    <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const tasks = ref([]);
const newTask = ref('');
const email = ref('');
const reminderMessage = ref('');
const dateTime = ref(''); // Added for date and time
const error = ref(null);
const success = ref(null);
const selectedFile = ref(null); // For storing the uploaded file

// Load saved tasks from localStorage
onMounted(() => {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks);
  }
});

// Save tasks to localStorage
const saveTasks = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value));
};

// Add a new task
const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({ name: newTask.value, completed: false });
    newTask.value = '';
    saveTasks();
  }
};

// Remove a task
const removeTask = (index) => {
  tasks.value.splice(index, 1);
  saveTasks();
};

// Handle file upload
const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]; // Store the selected file
};

// Send reminder using Firebase Cloud Function
const sendReminder = async () => {
  error.value = null;
  success.value = null;
  console.log({
  email: email.value,
  message: reminderMessage.value,
  dateTime: dateTime.value,
});

  const formData = new FormData(); // Create a FormData object to handle file upload
  formData.append('email', email.value);
  formData.append('message', reminderMessage.value);
  formData.append('dateTime', dateTime.value);
  if (selectedFile.value) {
    formData.append('attachment', selectedFile.value); // Append the file to FormData
  }

  try {
    const response = await axios.post('https://sendemail-z6ewzryaea-uc.a.run.app', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      success.value = "Reminder scheduled successfully!";
      // Clear the input fields after successful submission
      email.value = '';
      reminderMessage.value = '';
      dateTime.value = '';
      selectedFile.value = null; // Reset file input
    } else {
      error.value = "Failed to schedule reminder.";
    }
  } catch (err) {
    error.value = "Error sending reminder: " + err.message;
  }
};
</script>

<style scoped>
h1 {
  font-size: 2.5rem;
  font-weight: bold;
}

.card {
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

input[type="checkbox"] {
  cursor: pointer;
}

.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
