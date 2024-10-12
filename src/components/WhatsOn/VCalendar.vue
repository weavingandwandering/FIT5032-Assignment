<template>
  <div class="container my-4">
    <h2 class="mb-4">Upcoming Events for Volunteers</h2>

    <!-- View Toggle (List View or Calendar View) -->
    <div class="view-toggle mb-4">
      <button 
        @click="viewMode = 'list'" 
        class="btn" 
        :class="{ active: viewMode === 'list' }">
        List View
      </button>
      <button 
        @click="viewMode = 'calendar'" 
        class="btn" 
        :class="{ active: viewMode === 'calendar' }">
        Calendar View
      </button>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'">
      <FullCalendar 
        :options="calendarOptions" 
         />
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="row mt-4">
      <div 
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="col-md-4 mb-3" 
        @click="goToEventDetails(event.id)">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              Date: {{ event.date.toDate().toLocaleDateString() }}
            </h6>
            <p class="card-text">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const db = getFirestore();

export default {
  components: {
    FullCalendar,
  },
  setup() {
    const events = ref([]);
    const viewMode = ref('list'); // Set initial view mode to 'list'
    const router = useRouter();

    

    const filteredEvents = computed(() => {
      // Add sorting and filtering logic if necessary
      return events.value; // For simplicity, return all events
    });

    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date, // Assuming Firestore Timestamp format
        }));

        events.value = eventsData;

        // Populate calendar events
        calendarOptions.value.events = events.value.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.date.toDate(),
        }));
      } catch (error) {
        console.error('Error fetching events from Firestore:', error);
      }
    };

    const handleEventClick = (info) => {
      console.log("Clicked on event:", info); // This should log the info object
      if (info && info.event) {
        const eventId = info.event.id; 
        goToEventDetails(eventId);
      } else {
        console.log("Event info is missing");
      }
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: [],
      eventClick: handleEventClick,
    });

    const goToEventDetails = (eventId) => {
      router.push({ name: 'ViewEvent', params: { id: eventId } });
    };

    onMounted(() => {
      fetchEvents();
    });

    return {
      viewMode,
      calendarOptions,
      filteredEvents,
      handleEventClick,
      goToEventDetails,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-toggle .btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.view-toggle .btn.active {
  background-color: #0056b3; /* Darker blue for active state */
}

.row {
  margin-top: 20px;
}

.event-item {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
