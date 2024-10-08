<template>
    <div class="container my-4">
      <h2>{{ event.name }}</h2>
      <p>Date: {{ event.date ? event.date.toDate().toLocaleDateString() : '' }}</p>
      <p>{{ event.description }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { getFirestore, doc, getDoc } from 'firebase/firestore'
  
  // Initialize Firestore
  const db = getFirestore()
  
  // Reactive state for event data
  const event = ref(null)
  
  // Get the event ID from the route
  const route = useRoute()
  const eventId = route.params.id
  
  // Fetch the event details from Firestore
  const fetchEventDetails = async () => {
    const eventRef = doc(db, 'events', eventId)
    const eventSnap = await getDoc(eventRef)
  
    if (eventSnap.exists()) {
      event.value = eventSnap.data()
    } else {
      console.error('Event not found')
    }
  }
  
  onMounted(() => {
    fetchEventDetails()
  })
  </script>
  