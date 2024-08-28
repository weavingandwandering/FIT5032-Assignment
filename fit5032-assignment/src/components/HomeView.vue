<template>
    <div class="home container">
      <div class="jumbotron text-center my-5">
        <h1 class="display-4">Welcome to Our Website!</h1>
        <p class="lead">This is the home page of our awesome Vue.js application.</p>
        <hr class="my-4">
        <p>Explore our features and learn more about what we offer.</p>
        <router-link to="/about" class="btn btn-primary btn-lg">Learn More</router-link>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Feature 1</h5>
              <p class="card-text">Description of the first feature.</p>
              <router-link to="/feature1" class="btn btn-outline-primary">Explore Feature 1</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Feature 2</h5>
              <p class="card-text">Description of the second feature.</p>
              <router-link to="/feature2" class="btn btn-outline-primary">Explore Feature 2</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Feature 3</h5>
              <p class="card-text">Description of the third feature.</p>
              <router-link to="/feature3" class="btn btn-outline-primary">Explore Feature 3</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No script needed for this basic template
  </script>
  
  <style scoped>
  .home {
    padding: 20px;
  }
  
  .jumbotron {
    background-color: #f8f9fa;
    padding: 2rem 1rem;
    border-radius: 8px;
  }
  </style>
  