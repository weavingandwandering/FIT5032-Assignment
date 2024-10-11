<template>
    <div class="reminder-tips container">
      <h1 class="text-center my-4">Daily Reminder Tips</h1>
      <div v-if="reminders.length === 0" class="text-center">No tips available.</div>
      <ul class="list-group">
        <li v-for="(tip, index) in reminders" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <span>{{ tip.message }}</span>
            <button class="btn btn-link text-primary" @click="toggleCompleted(index)">
              {{ tip.completed ? 'Yes' : 'No' }}
            </button>
          </div>
          <button class="btn btn-warning" @click="setReminder(tip.message)">🔔 Remind Me</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  
  const db = getFirestore();
  const reminders = ref([]); 
  
  const fetchReminders = async () => {
    const querySnapshot = await getDocs(collection(db, 'tips'));
    querySnapshot.forEach((doc) => {
      reminders.value.push({ message: doc.data().message, completed: false });
    });
  };
  
  const toggleCompleted = (index) => {
    reminders.value[index].completed = !reminders.value[index].completed;
  };
  
  const setReminder = (message) => {
    // Logic to set a reminder notification
    alert(`Reminder set for: ${message}`);
  };
  
  onMounted(() => {
    fetchReminders();
  });
  </script>
  
  <style scoped>
  .reminder-tips {
    max-width: 600px;
    margin: auto;
  }
  .list-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  