<template>
    <div class="container my-4" role="region" aria-labelledby="upcoming-events">
      <h2 id="upcoming-events" class="mb-4">Upcoming Events for Volunteers</h2>
      <h6 class="mb-4">Content Generated using ChatGPT</h6>
  
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
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  import { useRouter } from 'vue-router';
  
  const db = getFirestore();
  const auth = getAuth();
  const router = useRouter();
  
  const events = ref([]);
  const userName = ref('');
  const activeTab = ref('all');
  
  onMounted(async () => {
    const snapshot = await getDocs(collection(db, 'events'));
    events.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userName.value = user.displayName || user.email;
      }
    });
  });
  
  const filteredEvents = computed(() => {
    if (activeTab.value === 'all') {
      return events.value;
    }
    return events.value.filter(event => event.organizer === userName.value);
  });
  
  const goToAttendance = (eventId) => {
    router.push({ name: 'ViewAttendance', params: { id: eventId } });
};
  </script>
  