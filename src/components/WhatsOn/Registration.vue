<template>
  <div class="container my-4">
    <h2 class="mb-4">Events</h2>

    <ul class="nav nav-tabs" role="tablist" aria-label="Event tabs">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'my' }"
          @click="activeTab = 'my'"
          role="tab"
          aria-selected="activeTab === 'my'"
          tabindex="0"
        >
          My Events
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
          role="tab"
          aria-selected="activeTab === 'all'"
          tabindex="0"
        >
          All Events
        </a>
      </li>
    </ul>

    <!-- All Events -->
    <div v-if="activeTab === 'all'" class="mt-4">
      <div class="d-flex justify-content-between mb-3">
        <input v-model="searchQuery" class="form-control w-50" placeholder="Search events..." aria-label="Search events" />
        <select v-model="sortOrder" class="form-select w-25" aria-label="Sort events">
          <option value="">Sort by</option>
          <option value="date">Date</option>
          <option value="name">Name</option>
        </select>
        <select v-model="filterOption" class="form-select w-25" aria-label="Filter events">
          <option value="all">All Events</option>
          <option value="registered">Registered Events</option>
          <option value="unregistered">Unregistered Events</option>
        </select>
      </div>

      <div v-if="filteredAndSortedEvents.length">
        <div class="row">
          <div
            class="col-md-4"
            v-for="event in filteredAndSortedEvents"
            :key="event.id"
          >
            <div class="card mb-3 event-card" @click="goToEventDetails(event.id)" role="button" tabindex="0" aria-label="View event details for {{ event.name }}">
              <div class="card-body">
                <h5 class="card-title">{{ event.name }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">
                  Date: {{ event.date.toDate().toLocaleDateString() }}
                </h6>
                <p class="card-text">{{ event.description }}</p>
                <p class="card-text">Location: {{ event.location }}</p>
                <p class="card-text">Organizer: {{ event.organizer }}</p>

                <button
                  v-if="!isUserRegistered(event)"
                  class="btn btn-primary"
                  @click.stop="register(event)"
                  aria-label="Register for {{ event.name }}"
                >
                  Register
                </button>

                <button
                  v-if="isUserRegistered(event)"
                  class="btn btn-danger"
                  @click.stop="unregister(event)"
                  aria-label="Unregister from {{ event.name }}"
                >
                  Unregister
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No events available.</p>
      </div>
    </div>

    <!-- My Registered Events -->
    <div v-if="activeTab === 'my'" class="mt-4">
      <div v-if="myRegisteredEvents.length">
        <div class="row">
          <div class="col-md-12">
            <div class="calendar-container">
              <FullCalendar
                :options="calendarOptions"
              />
            </div>
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
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const db = getFirestore();
const events = ref([]);
const userEmail = ref('');
const searchQuery = ref('');
const sortOrder = ref('');
const filterOption = ref('all');
const activeTab = ref('my');
const router = useRouter();

const headerToolbar = {
  left: 'prev,next today',
  center: 'title',
  right: 'dayGridMonth,dayGridWeek,dayGridDay',
};

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: [],
  headerToolbar: headerToolbar,
  editable: true,
  eventClick: (info) => {
    console.log(info.ee)
    router.push({ name: 'ViewEvent', params: { id: info.event.id } });
  },
});

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

  updateCalendar();
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

    await updateDoc(eventRef, { attendees: attendees });
    event.attendees = attendees;
    alert('Registration successful!');
    updateCalendar();
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
      await updateDoc(eventRef, { attendees: attendees });
      event.attendees = attendees;
      alert('Unregistered successfully.');
      updateCalendar();
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

  filteredEvents.sort((a, b) => {
    const isARegistered = isUserRegistered(a);
    const isBRegistered = isUserRegistered(b);
    if (isARegistered && !isBRegistered) return 1;
    if (!isARegistered && isBRegistered) return -1;
    return 0;
  });

  if (sortOrder.value === 'date') {
    filteredEvents.sort((a, b) => a.date.toDate() - b.date.toDate());
  } else if (sortOrder.value === 'name') {
    filteredEvents.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filteredEvents;
});

const myRegisteredEvents = computed(() => {
  return events.value.filter(event => isUserRegistered(event));
});

const goToEventDetails = (eventId) => {
  router.push({ name: 'ViewEvent', params: { id: eventId } });
};

const updateCalendar = () => {
  const calendarEvents = myRegisteredEvents.value.map(event => ({
    id: event.id,
    title: event.name,
    start: event.date.toDate(),
  }));
  calendarOptions.value.events = calendarEvents;
};

onMounted(async () => {
  await fetchUserEmail();
  await fetchEvents();
});
</script>

<style scoped>
.event-card {
  cursor: pointer;
}
.event-card:focus,
.event-card:hover {
  background-color: #f9f9f9;
  outline: none;
}
</style>
