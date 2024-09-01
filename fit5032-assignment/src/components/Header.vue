<template>
  <div class="container">
    <header class="d-flex justify-content-between py-3">
      <ul class="nav nav-pills">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">Home (Week 5)</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
       
        <li class="nav-item" v-if="currentUser === null">
          <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
        </li>
        <li class="nav-item d-flex align-items-center" v-else>
          <router-link to="/forum" class="nav-link" active-class="active">Forum</router-link>
          <router-link to="/ecalendar" class="nav-link" active-class="active">Elderly Calendar</router-link>
          <router-link to="/vcalendar" class="nav-link" active-class="active">Volunteer Calendar</router-link>
        
          <div class="d-flex flex-column align-items-end">
            <p class="text-success ms-3 mb-0">Logged in as</p>
            <h6 class="fw-bold text-dark ms-3">{{ currentUser }}</h6>
          </div>
          <button class="btn btn-outline-success ms-3" @click="logout">Log Out</button>
        </li>
      </ul>
    </header>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';


const currentUser = ref(localStorage.getItem('currentUser') || null);
const router = useRouter();

watch(
  () => localStorage.getItem('currentUser'),
  (newVal) => {
    currentUser.value = newVal;
  }
);

const logout = () => {
  
  localStorage.removeItem('currentUser');
  router.push('/about');
  currentUser.value = null;
  
};
</script>

<style scoped>
.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}

.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

@media (max-width: 576px) {
  .nav-pills .nav-link {
    font-size: 0.875rem;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .nav-pills .nav-link {
    font-size: 1rem;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .nav-pills .nav-link {
    font-size: 1.125rem;
  }
}

@media (min-width: 993px) {
  .nav-pills .nav-link {
    font-size: 1.25rem;
  }
}
</style>
