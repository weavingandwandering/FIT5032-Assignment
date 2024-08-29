<template>
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h3>{{ post.title }}</h3>
        </div>
        <div class="card-body">
          <h5 class="card-title">Author: {{ post.currentuser }}</h5>
          <h6 class="card-subtitle mb-2 text-muted">Role: {{ getRole(post.currentuser) }}</h6>
          <p class="card-text">{{ post.content }}</p>
          <router-link to="/forum" class="btn btn-primary">Back to Forum</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const post = ref({});


  
  // Function to get the role of the user
  const getRole = (username) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const findUser = users.find((user) => user.username === username);
    return findUser ? findUser.role : 'Unknown';
  };
  
  // Fetch the post details based on the route parameter
  onMounted(() => {
 
    const postID = route.params.id;
    const posts = JSON.parse(localStorage.getItem('post')) || [];
    console.log("postiD", postID)
    console.log(posts)
    const findPost = posts.find((post) => post.id == postID);
    post.value = findPost;
    console.log("Post", findPost);
  });


  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }
  
  .card-body {
    padding: 20px;
  }
  </style>
  