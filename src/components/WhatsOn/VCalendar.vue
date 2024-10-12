<template>
  <div class="container my-4">
    <h2 class="mb-4">Upcoming Events for Volunteers</h2>

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

    <div v-if="viewMode === 'calendar'">
      <FullCalendar 
        :options="calendarOptions" 
      />
    </div>

    <div v-if="viewMode === 'list'" class="row mt-4">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Search events..." 
        class="form-control mb-3" 
      />
      
      <table class="table table-bordered">
        <thead>
          <tr>
            <th @click="sortTable('name')" style="cursor: pointer;">
              Event Name 
              <span v-if="sortKey === 'name'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="sortTable('date')" style="cursor: pointer;">
              Date 
              <span v-if="sortKey === 'date'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in paginatedEvents" :key="event.id" @click="goToEventDetails(event.id)">
            <td>{{ event.name }}</td>
            <td>{{ event.date.toDate().toLocaleDateString() }}</td>
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
      sortDirection.value = (sortKey.value === key && sortDirection.value === 'asc') ? 'desc' : 'asc';
      sortKey.value = key;
      events.value.sort((a, b) => {
        if (key === 'date') {
          return sortDirection.value === 'asc' 
            ? a[key].toDate() - b[key].toDate() 
            : b[key].toDate() - a[key].toDate();
        } else {
          return sortDirection.value === 'asc' 
            ? a[key].localeCompare(b[key]) 
            : b[key].localeCompare(a[key]);
        }
      });
    };

    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date,
        }));

        events.value = eventsData;

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
  background-color: #0056b3;
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

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
