<template>
  <div class="container my-4">
    <h2 class="text-center text-primary">Nearby Events</h2>
    <div class="row">
      <div class="col-md-8">
        <div id="map" style="height: 400px;" aria-label="Map showing nearby events"></div>
      </div>
      <div class="col-md-4">
        <h4 class="text-center text-secondary">Events Nearby</h4>
        <div class="mb-3">
          <label for="distanceSlider" class="form-label">Select Distance (km): <strong>{{ distance }} km</strong></label>
          <input 
            type="range" 
            class="form-range" 
            id="distanceSlider" 
            v-model="distance" 
            min="1" 
            max="50" 
            step="1" 
            @input="updateNearbyEvents"
            aria-label="Distance slider"
          />
        </div>
        <ul class="list-group">
          <li 
            v-for="event in nearbyEvents" 
            :key="event.id" 
            class="list-group-item list-group-item-action"
            @click="goToEventDetails(event.id)" 
            style="cursor: pointer;"
            aria-label="Event name"
          >
            {{ event.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import loader from './googleMapsLoader';

const db = getFirestore();
const router = useRouter();

const events = ref([]);
const nearbyEvents = ref([]);
const userLocation = ref(null);
const markers = [];
let map = null;
const distance = ref(1); 

const goToEventDetails = (eventId) => {
  router.push({ name: 'ViewEvent', params: { id: eventId } });
};

const fetchEvents = async () => {
  const eventsCollection = collection(db, 'events');
  const eventsSnapshot = await getDocs(eventsCollection);
  events.value = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const fetchUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve();
      }, () => {
        alert('Error: The Geolocation service failed. Please enable location services.');
        reject();
      });
    } else {
      alert('Error: Your browser doesn\'t support geolocation.');
      reject();
    }
  });
};

const initMap = () => {
  if (!userLocation.value || !events.value.length) return;

  loader.load().then(() => {
    map = new google.maps.Map(document.getElementById('map'), {
      center: userLocation.value,
      zoom: 12,
    });

    const userMarker = new google.maps.Marker({
      position: userLocation.value,
      map: map,
      title: "Your Location",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });

    const geocoder = new google.maps.Geocoder();
    markers.forEach(marker => marker.setMap(null)); 
    markers.length = 0; 
    nearbyEvents.value = []; 

    const distanceService = new google.maps.DistanceMatrixService();
    const geocodePromises = events.value.map(event => {
      return new Promise((resolve) => {
        geocoder.geocode({ address: event.location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const eventLocation = results[0].geometry.location;
            const eventMarker = new google.maps.Marker({
              position: eventLocation,
              map: map,
              title: event.name,
            });

            const infoWindow = new google.maps.InfoWindow();
            eventMarker.addListener('click', () => {
              infoWindow.setContent(`
                <div>
                  <h4>${event.name}</h4>
                  <button id="event-${event.id}" type="button" class="btn btn-primary">View Event</button>
                </div>
              `);
              infoWindow.open(map, eventMarker);

              google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
                const button = document.getElementById(`event-${event.id}`);
                button.addEventListener('click', () => {
                  goToEventDetails(event.id);
                });
              });
            });

            distanceService.getDistanceMatrix(
              {
                origins: [userLocation.value],
                destinations: [eventLocation],
                travelMode: 'DRIVING',
              },
              (response, status) => {
                if (status === 'OK' && response.rows[0].elements[0].distance) {
                  const element = response.rows[0].elements[0];
                  console.log(element.distance)
                  const distanceInKm = element.distance.value / 1000;
                  if (element.status === 'OK' && distanceInKm <= distance.value) {
                    nearbyEvents.value.push({
                      ...event,
                      distance: distanceInKm.toFixed(2),
                    });
                  }
                }
                resolve();
              }
            );
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(geocodePromises).then(() => {
    });
  });
};

onMounted(async () => {
  try {
    await Promise.all([fetchEvents(), fetchUserLocation()]);
    updateNearbyEvents(); 
  } catch (error) {
    console.error('Failed to fetch events or user location:', error);
  }
});

const updateNearbyEvents = () => {
  if (userLocation.value && events.value.length) {
    nearbyEvents.value = []; 
    initMap(); 
  }
};

watch([events, userLocation], () => {
  if (userLocation.value && events.value.length) {
    initMap();
  }
});
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#map {
  height: 400px;
  width: 100%;
  border-radius: 10px;
}

.list-group-item {
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ddd;
  transition: background-color 0.3s ease;
}

.list-group-item:hover {
  background-color: #e7f0ff; 
}

h2 {
  margin-bottom: 20px;
}

h4 {
  margin-top: 20px;
}
</style>
