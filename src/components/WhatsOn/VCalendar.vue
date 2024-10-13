<template>
  <div class="container my-4">
    <h2 class="mb-4" role="heading" aria-level="2">Upcoming Events for Volunteers</h2>

    <nav class="view-toggle mb-4" aria-label="Event view options">
      <button 
        @click="viewMode = 'list'; handleViewChange()" 
        class="btn" 
        :class="{ active: viewMode === 'list' }" 
        role="button" 
        :aria-pressed="viewMode === 'list'">
        List View
      </button>
      <button 
        @click="viewMode = 'calendar'; handleViewChange()" 
        class="btn" 
        :class="{ active: viewMode === 'calendar' }" 
        role="button" 
        :aria-pressed="viewMode === 'calendar'">
        Calendar View
      </button>
    </nav>

    <div v-if="viewMode === 'calendar'">
      <FullCalendar 
        :options="calendarOptions" 
      />
    </div>

    <div v-if="viewMode === 'list'" class="row mt-4">
      <label for="search" class="visually-hidden">Search events:</label>
      <input 
        id="search" 
        type="text" 
        v-model="searchTerm" 
        placeholder="Search events..." 
        class="form-control mb-3" 
      />

      <div class="row mb-3">
        <div class="col-md-4">
          <label for="sortKey">Sort By:</label>
          <select id="sortKey" v-model="sortKey" class="form-select" @change="sortTable(sortKey)">
            <option value="">Select</option>
            <option value="name">Event Name</option>
            <option value="date">Date</option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="sortDirection">Order:</label>
          <select id="sortDirection" v-model="sortDirection" class="form-select" @change="sortTable(sortKey)">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="col" tabindex="0" @keydown.enter="sortTable('name')">
              Event Name 
              <span v-if="sortKey === 'name'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th scope="col" tabindex="0" @keydown.enter="sortTable('date')">
              Date 
              <span v-if="sortKey === 'date'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in paginatedEvents" :key="event.id" @click="goToEventDetails(event.id)" class="event-item" tabindex="0" @keydown.enter="goToEventDetails(event.id)">
            <td>{{ event.name }}</td>
            <td>{{ event.eventDate.toDate().toLocaleDateString() }}</td>
            <td>{{ event.description }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>


<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ref, computed, onMounted, nextTick } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const db = getFirestore();

export default {
  components: {
    FullCalendar,
  },
  setup() {
    const events = ref([]);
    const viewMode = ref('list');
    const router = useRouter();
    const searchTerm = ref('');
    const currentPage = ref(1);
    const rowsPerPage = 10;
    const sortKey = ref('');
    const sortDirection = ref('asc');

    const filteredEvents = computed(() => {
      return events.value.filter(event => 
        event.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
        event.description.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredEvents.value.length / rowsPerPage);
    });

    const paginatedEvents = computed(() => {
      const start = (currentPage.value - 1) * rowsPerPage;
      return filteredEvents.value.slice(start, start + rowsPerPage);
    });

    const sortTable = (key) => {
      if (key) {
        events.value.sort((a, b) => {
          if (key === 'date') {
            return sortDirection.value === 'asc' 
              ? a.eventDate.toDate() - b.eventDate.toDate() 
              : b.eventDate.toDate() - a.eventDate.toDate();
          } else {
            return sortDirection.value === 'asc' 
              ? a[key].localeCompare(b[key]) 
              : b[key].localeCompare(a[key]);
          }
        });
      }
    };

    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate,
        }));

        events.value = eventsData;

        calendarOptions.value.events = events.value.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.eventDate.toDate(),
        }));
      } catch (error) {
        console.error('Error fetching events from Firestore:', error);
      }
    };

    const handleEventClick = (info) => {
      if (info && info.event) {
        const eventId = info.event.id; 
        goToEventDetails(eventId);
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

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const handleViewChange = () => {
      nextTick(() => {
        const firstEvent = document.querySelector('.event-item');
        if (firstEvent) {
          firstEvent.focus();
        }
      });
    };

    onMounted(() => {
      fetchEvents();
    });

    return {
      viewMode,
      calendarOptions,
      filteredEvents,
      paginatedEvents,
      totalPages,
      searchTerm,
      currentPage,
      sortKey,
      sortDirection,
      sortTable,
      goToEventDetails,
      prevPage,
      nextPage,
      handleViewChange,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff; 
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1); 
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-toggle .btn {
  padding: 10px 20px;
  background-color: #0a7fe6; 
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s; 
}

.view-toggle .btn:hover,
.view-toggle .btn:focus {
  background-color: #5a6268;
  transform: scale(1.05); 
}

.view-toggle .btn.active {
  background-color: #5a6268;
}

.row {
  margin-top: 20px;
}

.event-item {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #dee2e6; 
  border-radius: 8px; 
  background-color: #a8d3ff; 
  transition: background-color 0.3s ease; 
}

.event-item:hover,
.event-item:focus {
  background-color: #e9ecef;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background-color: #17a2b8; 
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s; 
}

.pagination button:hover,
.pagination button:focus {
  background-color: #138496; 
  transform: scale(1.05); 
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th {
  background-color: #6c757d;
  color: white;
  padding: 12px;
  text-align: left;
}

td {
  padding: 12px;
  border: 1px solid #dee2e6; 
}

td:hover {
  background-color: #f1f1f1; 
}
</style>
