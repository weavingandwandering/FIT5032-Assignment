<template>
    <div class="login container">
      <h1 class="text-center my-4">Login Page</h1>
      <form @submit.prevent="submitForm" class="p-4 border rounded">
        <div class="mb-3">
          <label for="username" class="form-label">Username:</label>
          <input
            type="text"
            class="form-control"
            id="username"
            placeholder="Enter your username"
          v-model="formData.username"/>
         
        </div>
  
        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Enter your password"
          v-model="formData.password"/>
         
        </div>
  
        <button type="submit" class="btn btn-primary w-100">Login</button>
        
      </form>
        <a href="#/signup" id="signup" class="btn btn-link p-0" @click="signForm">Sign up Here</a>

        <div v-if="!isAuthenticated.result" class="text-danger"> {{error.error}} </div>
        
    </div>
  </template>
  
  <script setup>

    import { ref } from 'vue';
    import { useRouter } from 'vue-router'
    import bcrypt from 'bcryptjs';

    const formData = ref({
        username: '',
        password: '',
    });


    const router = useRouter()


    const error = ref({
        error: null
    })
    const signForm = () => {
        router.push('./signup')
    };

    const submitForm = () => {
        authenticateUser(formData.value.username, formData.value.password);
        if(isAuthenticated.value.result === true){
            router.push("/about")
        } else{
            error.value.error = "The username or password do not match our records."
        }

       
    };

    const isAuthenticated = ref({result: false});
 

   
    const authenticateUser = (username, password) => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      console.log("Users", users);
  

      const findUser = users.find(user => user.username === username && bcrypt.compareSync(password, user.password));
      if(findUser){
        isAuthenticated.value.result = true;
        localStorage.setItem('currentUser', username);
        console.log("current user", localStorage.getItem('currentUser'));
      } else{
        isAuthenticated.value.result = false;
        
      }

    }
    
  // No script needed for now
  </script>
  
  <style scoped>
  
  @media (min-width: 576px) {
    .form-label {
    font-size: 18px;
    padding: 20px;
  }
  .login{
    max-width: 400;
  }

}

@media (min-width: 768px) {
  .form-label {
    font-size: 20px;
  }

}

@media (min-width: 992px) {
  .form-label {
    font-size: 22px;
  }

}

@media (min-width: 1400px) {
  .form-label {
    font-size: 24px;
  }
  .login{
    width: 600;
  }
}
  </style>
  
  