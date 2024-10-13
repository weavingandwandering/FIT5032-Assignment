<template>
    <div class="container my-5">
      <div v-if="loading" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading event details...</div>
      <div v-else-if="eventId && event">
        <h2 class="text-center">{{ event.name }}</h2>
        <p class="text-center text-muted">{{ event.date }}</p>
  
        <h4 class="mt-4">Attendees:</h4>
        <div v-if="attendees.length > 0">
          <ul class="list-group mb-4">
            <li
              v-for="attendee in attendees"
              :key="attendee.userId"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{{ attendee.name }} ({{ attendee.email }})</span>
              <button @click="sendEmail(attendee.email)" class="btn btn-outline-primary btn-sm">Send Email</button>
            </li>
          </ul>
          <button @click="bulkEmail" class="btn btn-success">Send Email to All Attendees</button>
        </div>
        <div v-else>
          <p>No attendees found for this event.</p>
        </div>
      </div>
      <div v-else-if="error">{{ error }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  import axios from 'axios';
  
  const db = getFirestore();
  const route = useRoute();
  
  const event = ref(null);
  const attendees = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const eventId = route.params.id;
  
  const fetchEventDetails = async () => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      event.value = eventSnap.data() || null;
  
      if (eventSnap.exists()) {
        attendees.value = eventSnap.data().attendees || [];
      } else {
        error.value = 'Event not found';
      }
    } catch (err) {
      error.value = 'Error fetching event details or attendees';
    } finally {
      loading.value = false;
    }
  };
  
  const bulkEmail = async () => {
  const emailList = attendees.value.map(attendee => attendee.email);
  const formDataForSubmission = { eventId, emails: emailList };
  
  try {
    const response = await axios.post(
      'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/sendBulkEmail',
      formDataForSubmission,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    alert(`Emails sent to all attendees!`);
  } catch (error) {
    console.error('Error sending bulk email:', error);
    alert('Failed to send emails');
  }
};

  onMounted(() => {
    fetchEventDetails();
  });
  </script>
  
  <style scoped>
  h2 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .list-group-item {
    font-size: 1.1rem;
    border: 1px solid #ddd;
  }
  
  .text-muted {
    font-size: 1.1rem;
  }
  
  .btn {
    transition: background-color 0.3s ease;
  }
  
  .btn:hover {
    background-color: #f8f9fa;
  }
  </style>
  