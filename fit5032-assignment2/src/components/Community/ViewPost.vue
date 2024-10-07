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
          <div>
            <div v-if="!hasRatedthePost.post" class="mb-3">
              <star-rating
                @update:rating="setRating"
                :increment="0.5"
                star-size="24"
                v-model="ratingValue"
              />
            </div>

            <!-- Display message if the user has already rated the post -->
            <div v-else class="text-danger">
              {{ hasRatedthePost.display }}
            </div>
          </div>
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

 const hasRatedthePost = ref({
  post: false,
  display: " ",
 }); 

  const getRole = (username) => {
    console.log("Username",username);
    console.log("CHECKiNG", hasRatedthePost.value.display);
    console.log("CHECKiNG", hasRatedthePost.value.post);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const findUser = users.find(user => user.username === username);
    
    if (findUser) {
        console.log("FIND:", findUser);
        return findUser.role;
    } else {
        console.log("User not found");
        return null;  
    }
};
//refreshes everytime the page is entered
  onMounted(() => {
 
    const postID = route.params.id;
    const posts = JSON.parse(localStorage.getItem('post')) || [];
    console.log("postiD", postID)
    console.log(posts)
    const findPost = posts.find((post) => post.id == postID);
    post.value = findPost;
    console.log("Post", findPost);
    
    hasRatedthePost.value.display = "";
    hasRatedthePost.value.post = false;
  

    checkRating();
  });

  const checkRating = () => {
    const postID = route.params.id;
    const currUser = localStorage.getItem('currentUser');
    if (currUser) {
        const userRated = JSON.parse(localStorage.getItem('userRating')) || [];
        const findUserRating = userRated.find((userRate) => userRate.username === currUser);
        console.log(findUserRating);
        if (findUserRating){
        if (findUserRating.posts.includes(postID)) {
          hasRatedthePost.value.post = true;
          hasRatedthePost.value.display = "The user has already rated this post";
        
        }
      }
      };

  }


  const setRating = (ratingValue) => {
    const currUser = localStorage.getItem('currentUser');
    
    const userRated = JSON.parse(localStorage.getItem('userRating')) || [];
    
    const findUserRating = userRated.find((userRate) => userRate.username === currUser);
    const postID = route.params.id;
    if (!findUserRating) {
        console.log("Rating received:");
        
        const ratings = JSON.parse(localStorage.getItem('rating')) || [];
        let findRating = ratings.find((rating) => rating.id === postID);
        
        if (findRating) {
            findRating.rating.push(ratingValue);
        } else {
            findRating = { id: postID, rating: [ratingValue] };
            ratings.push(findRating);
        }
        
        localStorage.setItem('rating', JSON.stringify(ratings));
        
        const findUser = { username: currUser, posts: [postID] };
        userRated.push(findUser);
        
        localStorage.setItem('userRating', JSON.stringify(userRated));
        console.log("Updated ratings:", ratings);
    } else {
        const hasRatedPost = findUserRating.posts.includes(postID);
        
        if (hasRatedPost) {
            console.log("User has already rated this post.");
            hasRatedthePost.value.post = true;
            hasRatedthePost.value.post = "The user has already rated this post";

        } else {
            console.log("Rating received:");
            
            const ratings = JSON.parse(localStorage.getItem('rating')) || [];
            
            let findRating = ratings.find((rating) => rating.id === postID);
            
            if (findRating) {
                findRating.rating.push(ratingValue);
            } else {
                findRating = { id: postID, rating: [ratingValue] };
                ratings.push(findRating);
            }
            
            localStorage.setItem('rating', JSON.stringify(ratings));
            
            findUserRating.posts.push(postID);
            localStorage.setItem('userRating', JSON.stringify(userRated));
            
            console.log("Updated ratings:", ratings);
        }
    }

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
  