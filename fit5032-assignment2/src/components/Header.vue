<template>
  <header class="navbar navbar-expand-lg navbar-light bg-light w-100">
    <div class="container-fluid">
      <div class="navbar-logo d-flex align-items-center">
        <span>Golden Years Hub</span>
      </div>


      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto me-auto">
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">About Us</router-link>
          </li>

          <li class="nav-item dropdown" @click="toggleDropdown('resourcesDropdown')">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="isOpen.resourcesDropdown">Resources</a>
            <ul v-if="isOpen.resourcesDropdown" class="dropdown-menu">
              <li><router-link to="/videos" class="dropdown-item">Videos</router-link></li>
              <li><router-link to="/articles" class="dropdown-item">Articles</router-link></li>
              <li><router-link to="/health-checklist" class="dropdown-item">Health Checklist/Reminders</router-link></li>
            </ul>
          </li>

          <li class="nav-item dropdown" @click="toggleDropdown('communityDropdown')">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="isOpen.communityDropdown">Community Space</a>
            <ul v-if="isOpen.communityDropdown" class="dropdown-menu">
              <li><router-link to="/forum" class="dropdown-item">Community Forum</router-link></li>
              <li><router-link to="/chatbot" class="dropdown-item">Chatbot</router-link></li>
            </ul>
          </li>

          <li class="nav-item dropdown" @click="toggleDropdown('whatsOnDropdown')">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="isOpen.whatsOnDropdown">What's On</a>
            <ul v-if="isOpen.whatsOnDropdown" class="dropdown-menu">
              <li><router-link to="/ecalendar" class="dropdown-item">Calendar for Elderly</router-link></li>
              <li><router-link to="/registration" class="dropdown-item">Registration</router-link></li>
              <li><router-link to="/vcalendar" class="dropdown-item">Calendar for Volunteers</router-link></li>
              <li><router-link to="/eventcreate" class="dropdown-item">Host an Event</router-link></li>
            </ul>
          </li>

          <!-- Get Involved Dropdown -->
          <li class="nav-item dropdown" @click="toggleDropdown('getInvolvedDropdown')">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="isOpen.getInvolvedDropdown">Get Involved</a>
            <ul v-if="isOpen.getInvolvedDropdown" class="dropdown-menu">
              <li><router-link to="/donation" class="dropdown-item">Donation</router-link></li>
              <li><router-link to="/volunteering" class="dropdown-item">Volunteering</router-link></li>
            </ul>
          </li>

          <!-- Login / Logout Logic -->
          <li class="nav-item" v-if="currentUser === null">
            <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
          </li>
          <li v-else class="nav-item">
            <div class="d-flex align-items-center">
              <div>
                <p class="text-success mb-0">Logged in as</p>
                <h6 class="fw-bold text-dark mb-0">{{ currentUser }}</h6>
              </div>
              <button class="btn btn-outline-success ms-3" @click="logout">Log Out</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const currentUser = ref(localStorage.getItem('currentUser') || null);
const router = useRouter();
const isOpen = ref({}); 

watch(
  () => localStorage.getItem('currentUser'),
  (newVal) => {
    currentUser.value = newVal;
  }
);


const toggleDropdown = (dropdown) => {
  Object.keys(isOpen.value).forEach((key) => {
    if (key !== dropdown) isOpen.value[key] = false; 
  });
  isOpen.value[dropdown] = !isOpen.value[dropdown]; 
};

// Logout function
const logout = () => {
  localStorage.removeItem('currentUser');
  currentUser.value = null;
  router.push('/about'); 
};
</script>


<style scoped>
.navbar-logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-nav .nav-link {
  color: #333;
  font-weight: 500;
}

.navbar-nav .nav-link:hover {
  color: #007bff;
}

.navbar-item {
  margin: 0 10px;
}

.dropdown-menu {
  background-color: #f8f9fa;
  display: block;
}

.user-profile {
  display: flex;
  align-items: center;
}
</style>
