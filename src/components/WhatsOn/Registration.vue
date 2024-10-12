<template>
  <div class="container my-4">
    <h2 class="mb-4">Events</h2>

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">All Events</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">My Events</a>
      </li>
    </ul>

    <div v-if="activeTab === 'all'" class="mt-4">
      <div class="d-flex justify-content-between mb-3">
        <input v-model="searchQuery" class="form-control w-50" placeholder="Search events..." />
        <select v-model="sortOrder" class="form-select w-25">
          <option value="">Sort by</option>
          <option value="date">Date</option>
          <option value="name">Name</option>
        </select>
        <select v-model="filterOption" class="form-select w-25">
          <option value="all">All Events</option>
          <option value="registered">Registered Events</option>
          <option value="unregistered">Unregistered Events</option>
        </select>
      </div>

      <div v-if="filteredAndSortedEvents.length">
        <div v-for="event in filteredAndSortedEvents" :key="event.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.date.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">{{ event.description }}</p>
            <p class="card-text">Location: {{ event.location }}</p>
            <p class="card-text">Organizer: {{ event.organizer }}</p>
            <button
              class="btn btn-primary"
              @click="register(event)"
              :disabled="isUserRegistered(event)"
            >
              {{ isUserRegistered(event) ? 'Already Registered' : 'Register' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No events available.</p>
      </div>
    </div>

    <div v-if="activeTab === 'my'" class="mt-4">
      <div v-if="myRegisteredEvents.length">
        <div v-for="event in myRegisteredEvents" :key="event.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.date.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">{{ event.description }}</p>
            <p class="card-text">Location: {{ event.location }}</p>
            <p class="card-text">Organizer: {{ event.organizer }}</p>
            <button class="btn btn-danger" @click="unregister(event)">Unregister</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No registered events available.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

const db = getFirestore();
const events = ref([]);
const userEmail = ref('');
const searchQuery = ref('');
const sortOrder = ref('');
const filterOption = ref('all');
const activeTab = ref('all');

const fetchUserEmail = async () => {
  const userName = localStorage.getItem('currentUser');
  if (!userName) {
    alert('No username found in localStorage. Please log in.');
    return;
  }

  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', userName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      userEmail.value = userDoc.data().email;
    } else {
      console.error('No user found with the provided username.');
    }
  } catch (error) {
    console.error('Error fetching user email:', error);
  }
};

const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  events.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date,
  }));
};

const isUserRegistered = (event) => {
  return event.attendees && event.attendees.includes(userEmail.value);
};

const register = async (event) => {
  if (!userEmail.value) {
    alert('Please log in to register for an event.');
    return;
  }

  if (isUserRegistered(event)) {
    alert('You are already registered for this event.');
    return;
  }

  try {
    const eventRef = doc(db, 'events', event.id);
    const attendees = event.attendees || [];
    attendees.push(userEmail.value);

    await updateDoc(eventRef, {
      attendees: attendees,
    });

    event.attendees = attendees; // Update local state
    alert('Registration successful!');
  } catch (error) {
    console.error('Error registering for event:', error);
  }
};

const unregister = async (event) => {
  if (!userEmail.value) {
    alert('Please log in to unregister from an event.');
    return;
  }

  try {
    const eventRef = doc(db, 'events', event.id);
    const attendees = event.attendees || [];
    const index = attendees.indexOf(userEmail.value);
    
    if (index > -1) {
      attendees.splice(index, 1);
      await updateDoc(eventRef, {
        attendees: attendees,
      });

      event.attendees = attendees; // Update local state to reflect change
      alert('Unregistered successfully.');
    }
  } catch (error) {
    console.error('Error unregistering from event:', error);
  }
};

const filteredAndSortedEvents = computed(() => {
  let filteredEvents = events.value;

  if (searchQuery.value) {
    filteredEvents = filteredEvents.filter(event =>
      event.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filterOption.value === 'registered') {
    filteredEvents = filteredEvents.filter(isUserRegistered);
  } else if (filterOption.value === 'unregistered') {
    filteredEvents = filteredEvents.filter(event => !isUserRegistered(event));
  }

  if (sortOrder.value === 'date') {
    filteredEvents = filteredEvents.slice().sort((a, b) => a.date.toDate() - b.date.toDate());
  } else if (sortOrder.value === 'name') {
    filteredEvents = filteredEvents.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  return filteredEvents;
});

const myRegisteredEvents = computed(() => {
  return events.value.filter(isUserRegistered);
});

onMounted(() => {
  fetchUserEmail();
  fetchEvents();
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
