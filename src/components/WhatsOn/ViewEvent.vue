<template>
  <div class="container my-4">
    <div class="row">
      <div class="col-md-6">
        <div class="card bg-light mb-3" role="region" aria-labelledby="event-title">
          <div class="card-body">
            <h2 id="event-title" class="card-title text-primary">{{ event ? event.name : 'Loading...' }}</h2>
            <p class="card-text">
              <strong>Date:</strong> <span class="text-muted">{{ event && event.eventDate ? event.eventDate.toDate().toLocaleDateString() : 'Loading...' }}</span>
            </p>
            <p class="card-text">
              <strong>Description:</strong> <span class="text-muted">{{ event ? event.description : 'Loading...' }}</span>
            </p>
            <p class="card-text">
              <strong>Location:</strong> <span class="text-muted">{{ event ? event.location : 'Loading...' }}</span>
            </p>
            <div v-if="distance">
              <p class="mt-2">
                <strong>Distance to current location:</strong> <span class="text-muted">{{ distance }}</span>
              </p>
            </div>
            <input
              type="text"
              class="form-control mt-2"
              placeholder="Enter a new location or leave blank for current location"
              aria-label="Enter a new location to get directions"
              v-model="newLocation"
              ref="locationInput"
              @keyup.enter="updateRoute"
            />
            <div class="mt-4">
              <button class="btn btn-primary" v-if="!isUserRegistered(event)" @click="register">Register for Event</button>
              <button class="btn btn-danger" v-else @click="unregister">Unregister from Event</button>
            </div>
            <div v-if="registrationSuccess" class="alert alert-success mt-2" role="alert">
              Registration successful! Thank you for signing up.
            </div>
            <div v-if="registrationError" class="alert alert-danger mt-2" role="alert">
              An error occurred while registering. Please try again.
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div id="map" style="height: 400px; width: 100%; border: 2px solid #17a2b8;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import loader from './googleMapsLoader';

const db = getFirestore();
const event = ref(null);
const distance = ref(null);
const registrationSuccess = ref(false);
const registrationError = ref(false);
const newLocation = ref('');
const route = useRoute();
const eventId = route.params.id;
const userEmail = ref('');
const locationInput = ref(null);

const fetchEventDetails = async () => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      event.value = {
        id: eventId,
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

const fetchUserEmail = async () => {
  const userName = localStorage.getItem('currentUser');
  if (!userName) {
    alert('No username found in localStorage. Please log in.');
    return;
  }

  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', userName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      userEmail.value = userDoc.data().email;
    } else {
      console.error('No user found with the provided username.');
    }
  } catch (error) {
    console.error('Error fetching user email:', error);
  }
};

const initMap = () => {
  loader.load().then(() => {
    if (!event.value || !event.value.location) {
      console.error('Event location is not defined.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const eventLocation = event.value.location;

    geocoder.geocode({ address: eventLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: results[0].geometry.location,
        });

        new google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: event.value.name,
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

              new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Your Location',
              });

              // Get directions and calculate distance only if the user's location is available
              getDirections(userLocation, results[0].geometry.location, map);
              calculateDistance(results[0].geometry.location);
            },
            (error) => {
              console.error('Geolocation error:', error);
              // Geolocation failed, but still display the event location
            }
          );
        } else {
          console.log('Geolocation is not supported by this browser.');
        }
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  }).catch(e => {
    console.error('Error loading Google Maps:', e);
  });
};


const updateRoute = () => {
  loader.load().then(() => {
    const geocoder = new google.maps.Geocoder();

    const address = newLocation.value || event.value.location;
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const userLocation = results[0].geometry.location;
        displayRoute(userLocation);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
};

const displayRoute = (userLocation) => {
  loader.load().then(() => {
    const geocoder = new google.maps.Geocoder();
    const eventLocation = event.value.location;

    geocoder.geocode({ address: eventLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: userLocation,
        });

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
        });

        const destination = results[0].geometry.location;
        getDirections(userLocation, destination, map);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  });
};

const getDirections = (userLocation, eventLocation, map) => {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  const request = {
    origin: userLocation,
    destination: eventLocation,
    travelMode: 'DRIVING',
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(result);
    } else {
      console.error('Directions request failed due to ' + status);
    }
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
          if (status === 'OK' && response.rows[0].elements[0]) {
            const distanceText = response.rows[0].elements[0].distance.text;
            distance.value = distanceText; 
          } else {
            console.error('Distance Matrix request failed due to ' + status);
          }
        }
      );
    });
  }
};

const register = async () => {
  if (!userEmail.value) {
    alert('Please log in to register for an event.');
    return;
  }

  if (!event.value) {
    console.error('Event details are not loaded yet.');
    return;
  }

  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      attendees: [...(event.value.attendees || []), userEmail.value],
    });
    registrationSuccess.value = true;
    registrationError.value = false;
    fetchEventDetails(); // Refresh event details
  } catch (error) {
    console.error('Error registering for the event:', error);
    registrationError.value = true;
    registrationSuccess.value = false;
  }
};

const unregister = async () => {
  if (!userEmail.value) {
    alert('Please log in to unregister from an event.');
    return;
  }

  if (!event.value) {
    console.error('Event details are not loaded yet.');
    return;
  }

  try {
    const eventRef = doc(db, 'events', eventId);
    const updatedAttendees = (event.value.attendees || []).filter(email => email !== userEmail.value);
    await updateDoc(eventRef, {
      attendees: updatedAttendees,
    });
    registrationSuccess.value = true;
    registrationError.value = false;
    fetchEventDetails(); // Refresh event details
  } catch (error) {
    console.error('Error unregistering from the event:', error);
    registrationError.value = true;
    registrationSuccess.value = false;
  }
};

const isUserRegistered = (event) => {
  return event && (event.attendees || []).includes(userEmail.value);
};

onMounted(async () => {
  await fetchUserEmail();
  await fetchEventDetails();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
}
</style>