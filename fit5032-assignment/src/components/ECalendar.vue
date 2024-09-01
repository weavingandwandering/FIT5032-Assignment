<template>
    <div class="container my-4">
    <h2 class="mb-4">Upcoming Events</h2>
    <h6 class="mb-4">Content Generated using ChatGPT</h6>
    <div class="row">
      <div v-for="event in calendar.events" :key="event.name" class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ event.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted">Date: {{ event.date }}</h6>
            <p class="card-text">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script  setup>
import calendar from "../Storage/events.json";
console.log(calendar)

</script>

<style scoped>
</style>
