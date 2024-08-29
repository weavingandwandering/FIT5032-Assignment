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
          <star-rating 
           @update:rating ="setRating"
          :increment=0.5
          star-size=24
          v-model="ratingValue">
        </star-rating>
          <router-link to="/forum" class="btn btn-primary">Back to Forum</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import StarRating from 'vue-star-rating'
  
  const route = useRoute();
  const post = ref({});

//   const ratingValue = ref(0);

  
  const getRole = (username) => {
    console.log("Username",username);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const findUser = users.find(user => user.username === username);
    
    if (findUser) {
        console.log("FIND:", findUser);
        return findUser.role;
    } else {
        console.log("User not found");
        return null;  // or some default value like 'Guest'
    }
};
  onMounted(() => {
 
    const postID = route.params.id;
    const posts = JSON.parse(localStorage.getItem('post')) || [];
    console.log("postiD", postID)
    console.log(posts)
    const findPost = posts.find((post) => post.id == postID);
    post.value = findPost;
    console.log("Post", findPost);
  });

  const setRating = (ratingValue) => {
    console.log("Rating received:");
    const ratings = JSON.parse(localStorage.getItem('rating')) || [];
    const postID = route.params.id;
    let findRating = ratings.find((rating) => rating.id == postID);
    console.log("Ratin", ratingValue);
    if (findRating) {
        findRating.rating.push(ratingValue);
    } else {
        findRating = { id: postID, rating: [ratingValue] };
        ratings.push(findRating);
    }
    localStorage.setItem('rating', JSON.stringify(ratings));
    console.log("Updated ratings:", ratings);
  
};


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
  