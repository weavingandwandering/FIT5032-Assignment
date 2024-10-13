<template>
  <div class="container my-4" role="region" aria-labelledby="upcoming-events">
    <h2 id="upcoming-events" class="mb-4">Upcoming Events for Volunteers</h2>
    <h6 class="mb-4">Content Generated using ChatGPT</h6>

    <div v-if="isVolunteer" class="mb-4">
      <h4>Create a New Event</h4>
      <form @submit.prevent="createEvent" aria-labelledby="event-form">
        <div class="mb-3">
          <label for="eventName" class="form-label">Event Name</label>
          <input v-model="newEvent.name" id="eventName" type="text" class="form-control" required aria-required="true" />
        </div>

        <div class="mb-3">
          <label for="eventDate" class="form-label">Event Date</label>
          <input v-model="newEvent.eventDate" id="eventDate" type="date" class="form-control" required aria-required="true" />
        </div>

        <div class="mb-3">
          <label for="startTime" class="form-label">Start Time</label>
          <input v-model="newEvent.startTime" id="startTime" type="time" class="form-control" required aria-required="true" />
        </div>

        <div class="mb-3">
          <label for="endTime" class="form-label">End Time</label>
          <input v-model="newEvent.endTime" id="endTime" type="time" class="form-control" required aria-required="true" @change="calculateDuration" />
        </div>

        <div class="mb-3">
          <label for="eventDuration" class="form-label">Duration (hours)</label>
          <input v-model="newEvent.duration" id="eventDuration" type="text" class="form-control" readonly />
        </div>

        <div class="mb-3">
          <label for="eventDescription" class="form-label">Event Description</label>
          <textarea v-model="newEvent.description" id="eventDescription" class="form-control" required aria-required="true"></textarea>
        </div>

        <div class="mb-3">
          <label for="eventLocation" class="form-label">Event Location</label>
          <input v-model="newEvent.location" id="eventLocation" type="text" class="form-control" placeholder="Search for a place..." required @input="handleInput" aria-required="true" />
          <div v-if="predictions.length" class="suggestions" role="listbox" aria-label="Place suggestions">
            <ul>
              <li v-for="(prediction, index) in predictions" :key="index" @click="selectPlace(prediction)" role="option" tabindex="0" @keydown.enter="selectPlace(prediction)">
                {{ prediction.description }}
              </li>
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

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">All Events</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'myEvents' }" @click="activeTab = 'myEvents'">My Events</a>
      </li>
    </ul>

    <div class="row">
      <div v-for="event in filteredEvents" :key="event.id" class="col-md-4 mb-3" @click="goToAttendance(event.id)" role="button" tabindex="0">
        <div class="card h-100" tabindex="0">
          <div class="card-body" :style="{ backgroundColor: '#e7f3fe', borderColor: '#b3d4fc' }">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.eventDate.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">Time: {{ event.startTime }} - {{ event.endTime }}</p>
            <p class="card-text">Duration: {{ event.duration }} hours</p>
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
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import loader from './googleMapsLoader';
import { useRouter } from 'vue-router';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const events = ref([]);
const newEvent = ref({ name: '', eventDate: '', startTime: '', endTime: '', duration: '', description: '', location: '', organizer: '' });
const isVolunteer = ref(false);
const userName = ref(''); 
const predictions = ref([]); 
let autocompleteService = null;
const activeTab = ref('all'); // Track the active tab

const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  events.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    eventDate: doc.data().eventDate 
  }));
};

const createEvent = async () => {
  try {
    const eventDate = Timestamp.fromDate(new Date(newEvent.value.eventDate));
    await addDoc(collection(db, 'events'), {
      name: newEvent.value.name,
      eventDate: eventDate,
      startTime: newEvent.value.startTime,
      endTime: newEvent.value.endTime,
      duration: newEvent.value.duration,
      description: newEvent.value.description,
      location: newEvent.value.location,
      organizer: userName.value,
      attendees: [],
    });
    newEvent.value = { name: '', eventDate: '', startTime: '', endTime: '', duration: '', description: '', location: '', organizer: '' };
    predictions.value = []; 
    fetchEvents(); 
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

const calculateDuration = () => {
  if (newEvent.value.startTime && newEvent.value.endTime) {
    const start = new Date(`1970-01-01T${newEvent.value.startTime}:00Z`);
    const end = new Date(`1970-01-01T${newEvent.value.endTime}:00Z`);
    const diff = (end - start) / 1000 / 60 / 60; 
    newEvent.value.duration = diff > 0 ? diff : 0;
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

// Computed property to filter events based on active tab
const filteredEvents = computed(() => {
  if (activeTab.value === 'myEvents') {
    return events.value.filter(event => event.organizer === userName.value);
  }
  return events.value;
});

// Navigate to the attendance page for the selected event
const goToAttendance = (eventId) => {
  router.push({ name: 'ViewAttendance', params: { id: eventId } });
};
</script>

<style>
.suggestions {
  border: 1px solid #ddd;
  background-color: #fff;
  max-height: 150px;
  overflow-y: auto;
  position: absolute;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
}

.suggestions li:hover {
  background-color: #f0f0f0;
}
</style>
