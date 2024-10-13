<template>
  <div class="container my-4" role="region" aria-labelledby="create-event">
    <h2 id="create-event" class="mb-4">Create a New Event</h2>
    <h6 class="mb-4">Content Generated using ChatGPT</h6>

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
      <router-link to="/volunteerevents" class="btn btn-secondary ms-2">View Events</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import loader from './googleMapsLoader';

const db = getFirestore();
const auth = getAuth();

const newEvent = ref({ name: '', eventDate: '', startTime: '', endTime: '', duration: '', description: '', location: '', organizer: '' });
const userName = ref(''); 
const predictions = ref([]); 
let autocompleteService = null;
//creates an event 
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
  } catch (error) {
    console.error('Error adding event:', error);
  }
};
//calculates the duaration of the evnt 
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
