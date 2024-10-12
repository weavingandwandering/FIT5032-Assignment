<template>
    <div class="container my-4">
      <h2 class="mb-4">Register for an Event</h2>
  
      <div v-if="events.length">
        <div v-for="event in events" :key="event.id" class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.date.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">{{ event.description }}</p>
            <p class="card-text">Location: {{ event.location }}</p>
            <p class="card-text">Organizer: {{ event.organizer }}</p>
            <button class="btn btn-primary" @click="register(event)">Register</button>
          </div>
        </div>
      </div>
  
      <div v-else>
        <p>No events available.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  
  const db = getFirestore();
  const auth = getAuth();
  
  const events = ref([]);
  const userName = ref('');
  
  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events'));
    events.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date,
    }));
  };
  
  const register = async (event) => {
    if (!userName.value) {
      alert('Please log in to register for an event.');
      return;
    }
  
    try {
      const eventRef = doc(db, 'events', event.id);
      const attendees = event.attendees || []; 
  
      attendees.push(userName.value);
  
      await updateDoc(eventRef, {
        attendees: attendees,
      });
  
      alert('Registration successful!');
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };
  
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userName.value = user.displayName || user.email; 
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
  