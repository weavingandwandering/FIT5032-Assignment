<template>
    <div class="container my-5">
        <div v-if="loading">Loading event details...</div>
        <div v-else-if="eventId && event">
            <h2 class="text-center">{{ event.name }}</h2>
            <p class="text-center text-muted">{{ event.date }}</p>

            <h4 class="mt-4">Attendees:</h4>
            <div v-if="attendees.length > 0">
                <ul class="list-group">
                    <li
                        v-for="attendee in attendees"
                        :key="attendee.userId"
                        class="list-group-item"
                    >
                        {{ attendee.name }} ({{ attendee.email }})
                    </li>
                </ul>
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
            console.log("Fetched attendees:", attendees.value);
        } else {
            console.error('Event not found');
            error.value = 'Event not found';
        }
    } catch (err) {
        error.value = 'Error fetching event details or attendees';
        console.error('Error:', err);
    } finally {
        loading.value = false;
    }
};
  
onMounted(() => {
    fetchEventDetails();
});
</script>
  
<style scoped>
h2 {
    font-size: 2rem;
    font-weight: bold;
}
  
.list-group-item {
    font-size: 1.2rem;
}
  
p.text-muted {
    font-size: 1.1rem;
    margin-bottom: 2rem;
}
</style>
