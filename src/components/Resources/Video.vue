<template>
  <div class="reminder-list container">
    <h1 class="text-center my-4">Things to Remember</h1>

    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <ul class="list-group">
      <li
        v-for="(reminder, index) in sortedReminders"
        :key="reminder.id"
        class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3"
      >
        <div class="reminder-info">
          <h5 class="mb-1">{{ reminder.title }}</h5>
          <p class="mb-1">{{ reminder.message }}</p>
          <p class="mb-1 status">Status: <strong>{{ reminder.completed ? 'Completed' : 'Not Completed' }}</strong></p>
        </div>

        <div class="actions mt-3 mt-md-0">
          <button
            class="btn btn-success me-2"
            @click="markAsCompleted(reminder.id, true)"
            :disabled="reminder.completed"
          >
            Yes
          </button>
          <button
            class="btn btn-danger"
            @click="markAsCompleted(reminder.id, false)"
            :disabled="reminder.completed === false"
          >
            No
          </button>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
          <button 
            class="btn btn-warning ms-2" 
            @click="setReminder(reminder.message)"
          >
            <i class="bi bi-bell"></i>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
const router = useRouter();

const db = getFirestore();
const reminders = ref([]);
const error = ref(null);

const fetchReminders = async () => {
  try {
    const tipsCollection = collection(db, 'tips');
    const querySnapshot = await getDocs(tipsCollection);
    reminders.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    error.value = 'Failed to fetch reminders.';
  }
};

const markAsCompleted = async (reminderId, completed) => {
  try {
    const reminderDoc = doc(db, 'tips', reminderId);
    await updateDoc(reminderDoc, {
      completed,
    });
    reminders.value = reminders.value.map((reminder) =>
      reminder.id === reminderId ? { ...reminder, completed } : reminder
    );
  } catch (err) {
    error.value = 'Failed to update reminder status.';
  }
};

const sortedReminders = computed(() => {
  return reminders.value.slice().sort((a, b) => {
    return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
  });
});

const setReminder = (message) => {
  router.push({ name: 'Checklist', query: { message } });
};

onMounted(fetchReminders);
</script>

<style scoped>
.reminder-list {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.reminder-info h5 {
  font-weight: bold;
}

.reminder-info p {
  margin-bottom: 0.5rem;
}

.status {
  font-size: 0.9rem;
}

.actions button {
  min-width: 80px;
}

@media (max-width: 767.98px) {
  .list-group-item {
    flex-direction: column;
  }

  .actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
}
</style>
