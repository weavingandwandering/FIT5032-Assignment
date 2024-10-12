<template>
  <div class="container my-4">
    <h2>Nearby Events</h2>
    <div id="map" style="height: 400px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import loader from './googleMapsLoader';

const PLACES_API_KEY = import.meta.env.VITE_PLACES_API_KEY;
const db = getFirestore();
const router = useRouter();

const events = ref([]);
const nearbyEvents = ref([]);
const userLocation = ref(null);
const markers = [];



const goToEventDetails = (eventId) => {
  router.push({ name: 'ViewEvent', params: { id: eventId } });
};

const fetchEvents = async () => {
  const eventsCollection = collection(db, 'events');
  const eventsSnapshot = await getDocs(eventsCollection);
  events.value = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const fetchUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      initMap();
    }, () => {
      alert('Error: The Geolocation service failed. Please enable location services.');
    });
  } else {
    alert('Error: Your browser doesn\'t support geolocation.');
  }
};

const initMap = () => {
  if (!userLocation.value) return;

  loader.load().then(() => {
    const map = new google.maps.Map(document.getElementById('map'), {
      center: userLocation.value,
      zoom: 12,
    });

    const userMarker = new google.maps.Marker({
      position: userLocation.value,
      map: map,
      title: "Your Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });

    const geocoder = new google.maps.Geocoder();
    
    markers.forEach(marker => marker.setMap(null)); 
    markers.length = 0; 

    events.value.forEach(event => {
      geocoder.geocode({ address: event.location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const eventLocation = results[0].geometry.location;

          const eventMarker = new google.maps.Marker({
            position: eventLocation,
            map: map,
            title: event.name,
          });

          markers.push(eventMarker); 

          const infoWindow = new google.maps.InfoWindow();

          eventMarker.addListener('click', () => {
            infoWindow.setContent(`
              <div>
                <h4>${event.name}</h4>
                <p>${event.description}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <button id="event-${event.id}" type="button">View Event</button>
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

          const distanceService = new google.maps.DistanceMatrixService();
          distanceService.getDistanceMatrix(
            {
              origins: [userLocation.value],
              destinations: [eventLocation],
              travelMode: 'DRIVING',
            },
            (response, status) => {
              if (status === 'OK') {
                const element = response.rows[0].elements[0];
                if (element.status === 'OK' && element.distance.value / 1000 <= 50) {
                  const distanceInKm = (element.distance.value / 1000).toFixed(2);
                  nearbyEvents.value.push({
                    ...event,
                    distance: distanceInKm,
                  });
                }
              } else {
                console.error('Error calculating distances:', status);
              }
            }
          );
        } else {
          console.error('Geocode failed:', status);
        }
      });
    });
  });
};

onMounted(() => {
  fetchEvents();
  fetchUserLocation();
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
