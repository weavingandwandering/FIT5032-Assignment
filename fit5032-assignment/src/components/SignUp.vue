<template>
    <div class="login container">
      <h1 class="text-center my-4">Sign Up Page</h1>
      <form @submit.prevent="submitForm" class="p-4 border rounded">

        <div class="mb-3">
          <label for="email" class="form-label">Email Address:</label>
          <input
            type="text"
            class="form-control"
            id="email"
            placeholder="Enter your Email: "
            @blur="() => validateEmail(true)" 
            @input="() => validateEmail(false)"
            v-model="formData.email"/>
          <div v-if="errors.email" class="text-danger"> {{errors.email}} </div>

        </div>
        <div class="mb-3">
          <label for="username" class="form-label">Username:</label>
          <input
            type="text"
            class="form-control"
            id="username"
            placeholder="Enter your username"
            @blur="() => validateUser(true)" 
            @input="() => validateUser(false)"
            v-model="formData.username"/>
          <div v-if="errors.username" class="text-danger"> {{errors.username}} </div>

        </div>
  
        <div class="mb-3">
          <label for="password" class="form-label">Password:</label>
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Enter your password"
            @blur="() => validatePassword(true)" 
            @input="() => validatePassword(false)"
            v-model="formData.password"/>
          <div v-if="errors.password" class="text-danger"> {{errors.password}} </div>

        </div>

        <div class="mb-3">
  <label class="form-label">Select Role:</label>
  <div>
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="roleElderly"
        value="Elderly"
        v-model="formData.role"
        checked="checked"
      />
      <label class="form-check-label" for="roleElderly" >
        Elderly
      </label>
    </div>
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        id="roleVolunteer"
        value="Volunteer"
        v-model="formData.role"
      />
      <label class="form-check-label" for="roleVolunteer">
        Volunteer
      </label>
    </div>
  </div>
</div>
  
        <button type="submit" class="btn btn-primary w-100">Sign Up</button>
        

      </form>
        <div v-if="!isAuthenticated.result" class="text-danger"> {{errors.error}} </div>
    </div>
  </template>
  
  <script setup>

    import { ref } from 'vue';
    import { useRouter } from 'vue-router';


    const formData = ref({
        username: '',
        password: '',
        email: '',
        role: 'Elderly',
    });

   
    


    const router = useRouter()


    const errors = ref({
        error: null,
        username: null,
        password: null, 
        email: null,
    
    })
    const submitForm = () => {
        validateUser()
        validatePassword()
        validateEmail(false)
        if(errors.value.username == null && errors.value.password == null && errors.value.email == null){
            saveUser(formData.value.username, formData.value.password, formData.value.email, formData.value.role);
            router.push("/about")
        } else{
            errors.value.error = "Please fix the errors in the fields before signing up"
        }

       
    };

 
    const isAuthenticated = ref({
        result: false,
    });

    const validateUser = (blur) => {
        if (formData.value.username.length < 4){
            if (blur) errors.value.username = "Username must be atleast 4 characters";
        } else{
            errors.value.username = null;
            isAuthenticated.value.result = true; 
        }
    };

    const validateEmail = (blur) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.value.email)) {
        if (blur) errors.value.email = "Please enter a valid email address.";
    } else {
        errors.value.email = null;
        isAuthenticated.value.result = true;
    }
    };

 

    const validatePassword = (blur) => {
        const password = formData.value.password;
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (password.length < minLength) {
            if (blur) errors.value.password = 'Password must be at least 8 characters long.';
            } else if (!hasUppercase) {
            if (blur) errors.value.password = "Password must contain at least one uppercase letter.";
            } else if (!hasLowercase) {
            if (blur) errors.value.password = "Password must contain at least one lowercase letter.";
            } else if (!hasNumber) {
            if (blur) errors.value.password = "Password must contain at least one number.";
            } else if (!hasSpecialChar) {
            if (blur) errors.value.password = "Password must contain at least one special character.";
            } else {
            errors.value.password = null;
            isAuthenticated.value.result = true;

            };
    };


     const saveUser = (username, password, email, role) => {
      const users = JSON.parse(localSotorage.getItem('users')) || [];
      console.log(users);
      const findUser = users.find(user => user.username === username);
      const userEmail = users.find(user => user.email === email && user.password !== password);

      if(findUser != null){
        errors.value.error = "The username is taken"
      } else if(userEmail != null){
        errors.value.error = "An account already exists with these details "
      } else{
      users.push({username, password, email, role});
      localStorage.setItem('users', JSON.stringify(users));
      }
  };
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 0 auto;
  }
  </style>
  
  