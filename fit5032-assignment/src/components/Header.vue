<template>
    <!-- Using Bootstrap's Header template (starter code) -->
    <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
    <div class="container">
      <header class="d-flex justify-content-between py-3">
        <ul class="nav nav-pills">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active" aria-current="page">Home (Week 5)</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">About</router-link>
          </li>
        </ul>
        <ul class="nav nav-pills">
          <li class="nav-item" v-if="currentUser === null">
            <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
          </li>
          <li class="nav-item" v-else>
            <p class="nav-link text-end text-success  mb-0">Logged in as</p>
            <h6 class="nav-link text-dark fw-bold mb-0">{{currentUser }}</h6>
            <button variant="outline-success" type="button" @click="logout">Log Out</button>
          </li>
        </ul>
      </header>
    </div>
  </template>

<script>
import { ref, watch } from 'vue';

export default {
  setup() {
    const currentUser = ref(localStorage.getItem('currentUser'));
    console.log("Current User", currentUser);

    // Watch for changes in localStorage or if the user data changes
    watch(
      () => localStorage.getItem('currentUser'),
      (newVal) => {
        currentUser.value = newVal;
      }
    );

    const logout = () => {
      localStorage.removeItem('currentUser');
      currentUser.value = null; 
    };

    return {
      currentUser,
      logout,
    };
  },
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
    </style>