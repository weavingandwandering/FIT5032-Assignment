<template>
    <h1 class="text-center my-4">Welcome to the Forum</h1>
    <div>
        <button class="text-success align-centre" @click = "newPost"> New post </button>
    </div>
    <div class="container mt-5">
    <div class="d-flex flex-column">
    <div v-for="(card, index) in posts" :key="index" class="card mb-3">
      <div class="card-body">
    
        <div class="d-flex justify-content-between mt-2">
            <div>Post No: {{ card.id }}</div>
            <div class="fw-bold">Title: {{ card.title }}</div>
          <div>Author: {{ card.currentuser }}</div>
          <div>Role: {{ getRole(card.currentuser) }}</div>
          <div>Rating: 0 </div>
        </div>
      </div>
    </div>
</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const newPost = () => {
        router.push('/newpost')
    };

const posts =  JSON.parse(localStorage.getItem('post')) || [];


const getRole = (username) => {
    console.log("Username",username);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const findUser = users.find(user => user.username === username);

    return findUser.role;
};



</script>


<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(0, 0, 0, 0.075);
}

.card-body {
  padding: 1.25rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}
</style>
