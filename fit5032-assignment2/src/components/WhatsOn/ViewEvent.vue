<template>
    <div class="container my-4">
        <h2>{{ event ? event.name : 'Loading...' }}</h2>
        <p>Date: {{ event && event.date ? event.date.toDate().toLocaleDateString() : 'Loading...' }}</p>
        <p>{{ event ? event.description : 'Loading...' }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

// Reactive state for event data
const event = ref(null);

// Get the event ID from the route
const route = useRoute();
const eventId = route.params.id;

// Fetch the event details from Firestore
// Fetch the event details from Firestore
const fetchEventDetails = async () => {
    try {
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
            event.value = {
                id: eventSnap.id,
                ...eventSnap.data(),
            };
        } else {
            console.error('Event not found');
        }
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
};


onMounted(() => {
    fetchEventDetails();
});
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
}
</style>
