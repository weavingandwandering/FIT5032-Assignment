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
        <div class="mb-3">
          <label for="eventLocation" class="form-label">Event Location</label>
          <input v-model="newEvent.location" id="eventLocation" type="text" class="form-control" placeholder="Search for a place..." required @input="handleInput" />
          <div v-if="predictions.length" class="suggestions">
            <ul>
              <li v-for="(prediction, index) in predictions" :key="index" @click="selectPlace(prediction)">{{ prediction.description }}</li>
            </ul>
          </div>
        </div>
        <div class="mb-3">
          <label for="eventOrganizer" class="form-label">Organizer Name</label>
          <input id="eventOrganizer" type="text" class="form-control" :value="userName" readonly />
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
            <p class="card-text">Location: {{ event.location }}</p>
            <p class="card-text">Organizer: {{ event.organizer }}</p>
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
import { Loader } from '@googlemaps/js-api-loader';

const db = getFirestore();
const auth = getAuth();

const events = ref([]);
const newEvent = ref({ name: '', date: '', description: '', location: '', organizer: '' });
const isVolunteer = ref(false);
const userName = ref(''); 
const predictions = ref([]); 
let autocompleteService = null;

const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  events.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date 
  }));
};

const createEvent = async () => {
  try {
    const eventDate = Timestamp.fromDate(new Date(newEvent.value.date));
    await addDoc(collection(db, 'events'), {
      name: newEvent.value.name,
      date: eventDate,
      description: newEvent.value.description,
      location: newEvent.value.location,
      organizer: userName.value
    });
    newEvent.value = { name: '', date: '', description: '', location: '', organizer: '' };
    predictions.value = []; 
    fetchEvents(); 
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userName.value = user.displayName || user.email;
      isVolunteer.value = true; 
      fetchEvents();
    }
  });

  const loader = new Loader({
    apiKey: import.meta.env.VITE_PLACES_API_KEY, 
    libraries: ['places']
  });
  loader.load().then(() => {
    autocompleteService = new google.maps.places.AutocompleteService();
  });
});

const handleInput = (event) => {
  const input = event.target.value;

  if (input.length < 3) {
    predictions.value = []; 
    return;
  }

  autocompleteService.getPlacePredictions({ input }, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      predictions.value = results; 
    } else {
      predictions.value = []; 
    }
  });
};

const selectPlace = (place) => {
  newEvent.value.location = place.description;
  predictions.value = [];
};
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

.suggestions {
  border: 1px solid #ddd;
  background: white;
  position: absolute;
  z-index: 1000;
  width: calc(100% - 2rem);
}

.suggestions ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  padding: 8px;
  cursor: pointer;
}

.suggestions li:hover {
  background-color: #f0f0f0;
}
</style>
