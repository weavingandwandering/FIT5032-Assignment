<template>
  <div class="container my-4" role="region" aria-labelledby="events">
    <h2 id="upcoming-events" class="mb-4">Events</h2>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">All Events</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'myEvents' }" @click="activeTab = 'myEvents'">My Events</a>
      </li>
    </ul>

    <div class="mb-3">
      <label for="searchColumn" class="form-label">Search in:</label>
      <select v-model="searchColumn" id="searchColumn" class="form-select">
        <option value="name">Event Name</option>
        <option value="organizer">Organizer</option>
      </select>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="form-control mt-2"
      />
    </div>

    <div class="mb-3">
      <label for="sortBy" class="form-label">Sort by:</label>
      <select v-model="sortBy" id="sortBy" class="form-select">
        <option value="name">Name</option>
        <option value="eventDate">Date</option>
        <option value="organizer">Organizer</option>
      </select>
    </div>

    <div class="row">
      <div v-for="event in sortedAndFilteredEvents" :key="event.id" class="col-md-4 mb-3" @click="goToAttendance(event.id)" role="button" tabindex="0">
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
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();

const events = ref([]);
const userName = ref('');
const activeTab = ref('all');
const searchQuery = ref('');
const searchColumn = ref('name');
const sortBy = ref('name');

onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'events'));
  events.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log('Loaded Events:', events.value); // Log loaded events

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userName.value = user.displayName || user.email;
    }
  });
});

const filteredEvents = computed(() => {
  let result = events.value;

  // Filter by search query based on the selected column
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(event => {
      return event[searchColumn.value]?.toLowerCase().includes(query);
    });
  }

  // Further filter by active tab
  if (activeTab.value === 'myEvents') {
    result = result.filter(event => event.organizer === userName.value);
  }

  console.log('Filtered Events:', result); // Log filtered events
  return result;
});

const sortedAndFilteredEvents = computed(() => {
  const sortedEvents = filteredEvents.value.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'eventDate') {
      return a.eventDate.toDate() - b.eventDate.toDate(); 
    } else if (sortBy.value === 'organizer') {
      return a.organizer.localeCompare(b.organizer);
    }
    return 0;
  });

  console.log('Sorted and Filtered Events:', sortedEvents); 
  return sortedEvents;
});

const goToAttendance = (eventId) => {
  router.push({ name: 'ViewAttendance', params: { id: eventId } });
};
</script>
