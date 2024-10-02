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
        <div v-if="errors.email" class="text-danger"> {{ errors.email }} </div>
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
        <div v-if="errors.username" class="text-danger"> {{ errors.username }} </div>
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
        <div v-if="errors.password" class="text-danger"> {{ errors.password }} </div>
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
            <label class="form-check-label" for="roleElderly">
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
    <div v-if="errors.error" class="text-danger"> {{ errors.error }} </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../../src/firebase/init'; // Import Firebase Auth and Firestore
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const auth = getAuth();

const formData = ref({
  username: '',
  password: '',
  email: '',
  role: 'Elderly',
});

const router = useRouter();

const errors = ref({
  error: null,
  username: null,
  password: null, 
  email: null,
});

const submitForm = async () => {
  validateUser(true);
  validatePassword(true);
  validateEmail(true);

  if (!errors.value.username && !errors.value.password && !errors.value.email && !errors.value.error) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.value.email, formData.value.password);
      const user = userCredential.user;

      // Store additional user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: formData.value.username,
        email: formData.value.email,
        role: formData.value.role
      });

      router.push("/about"); // Navigate to another page after successful signup
    } catch (error) {
      console.error("Sign up failed:", error.message);
      errors.value.error = `Sign up failed: ${error.message}`;
    }
  } else {
    errors.value.error = "Please fix the errors in the fields before signing up";
  }
};

const validateUser = (blur) => {
  if (formData.value.username.length < 4) {
    if (blur) errors.value.username = "Username must be at least 4 characters";
  } else {
    errors.value.username = null;
  }
};

const validateEmail = (blur) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.value.email)) {
    if (blur) errors.value.email = "Please enter a valid email address.";
  } else {
    errors.value.email = null;
  }
};

const validatePassword = (blur) => {
  const password = formData.value.password;
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
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
  }
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
}
</style>
