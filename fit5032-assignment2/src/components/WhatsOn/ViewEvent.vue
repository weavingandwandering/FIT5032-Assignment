<template>
  <div class="container my-4">
    <h2>{{ event ? event.name : 'Loading...' }}</h2>
    <p>Date: {{ event && event.date ? event.date.toDate().toLocaleDateString() : 'Loading...' }}</p>
    <p>{{ event ? event.description : 'Loading...' }}</p>
    <p>Location: {{ event ? event.location : 'Loading...' }}</p>
    
    <div id="map" style="height: 400px; width: 80%;"></div>
    <div v-if="distance">
      <p>Distance to current location: {{ distance }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Loader } from '@googlemaps/js-api-loader';

const PLACES_API_KEY = import.meta.env.VITE_PLACES_API_KEY;
const db = getFirestore();
const event = ref(null);
const distance = ref(null);
const route = useRoute();
const eventId = route.params.id;

const fetchEventDetails = async () => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      event.value = {
        id: eventSnap.id,
        ...eventSnap.data(),
      };
      initMap();
    } else {
      console.error('Event not found');
    }
  } catch (error) {
    console.error('Error fetching event details:', error);
  }
};

const initMap = () => {
  if (!event.value || !event.value.location) return;

  const loader = new Loader({
    apiKey: PLACES_API_KEY,
    libraries: ['places'],
  });

  loader.load().then(() => {
    const geocoder = new google.maps.Geocoder();
    const eventLocation = event.value.location;

    geocoder.geocode({ address: eventLocation }, (results, status) => {
      if (status === 'OK') {
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: results[0].geometry.location,
        });

        const marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: event.value.name,
        });

        calculateDistance(results[0].geometry.location);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }).catch(e => {
    console.error('Error loading Google Maps:', e);
  });
};

const calculateDistance = (eventLocation) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      const service = new google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [userLocation],
          destinations: [eventLocation],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          if (status === 'OK') {
            const distanceText = response.rows[0].elements[0].distance.text;
            distance.value = distanceText; 
          } else {
            console.error('Distance Matrix request failed due to ' + status);
          }
        }
      );
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
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
#map {
  height: 400px;
  width: 100%;
}
</style>
