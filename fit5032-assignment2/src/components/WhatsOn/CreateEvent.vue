<template>
  <div class="container my-4">
    <h2 class="mb-4">Upcoming Events for Volunteers</h2>
    <h6 class="mb-4">Content Generated using ChatGPT</h6>

    <div v-if="isVolunteer" class="mb-4">
      <h4>Create a New Event</h4>
      <form @submit.prevent="createEvent">
        <div class="mb-3">
          <label for="eventName" class="form-label">Event Name</label>
          <input v-model="newEvent.name" id="eventName" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="eventDate" class="form-label">Event Date</label>
          <input v-model="newEvent.date" id="eventDate" type="date" class="form-control" required />
        </div>
        <div class="mb-3">
          <label for="eventDescription" class="form-label">Event Description</label>
          <textarea v-model="newEvent.description" id="eventDescription" class="form-control" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Create Event</button>
      </form>
    </div>

    <!-- Event Display Section -->
    <div class="row">
      <div v-for="event in events" :key="event.id" class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.date.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Initialize Firestore and Auth
const db = getFirestore();
const auth = getAuth();

// Reactive state for event data
const events = ref([]);
const newEvent = ref({ name: '', date: '', description: '' });
const isVolunteer = ref(false);

// Fetch events from Firestore
const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  events.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date // Firestore Timestamp format
  }));
};

// Create a new event in Firestore
const createEvent = async () => {
  try {
    // Convert the date to Firestore Timestamp before saving
    const eventDate = Timestamp.fromDate(new Date(newEvent.value.date));
    await addDoc(collection(db, 'events'), {
      name: newEvent.value.name,
      date: eventDate, // Save the event date as a Firestore Timestamp
      description: newEvent.value.description
    });
    newEvent.value = { name: '', date: '', description: '' }; // Clear form
    fetchEvents(); // Refresh the event list
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

// Check user role to determine if the user is a volunteer
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // You can check user role here based on Firestore user document
      // Set isVolunteer to true if the user is a volunteer
      isVolunteer.value = true; // Mocked for now, implement actual check
      fetchEvents();
    }
  });
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
