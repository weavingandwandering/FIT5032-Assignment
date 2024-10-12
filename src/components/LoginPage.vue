<template>
  <div class="login container">
    <h1 class="text-center my-4">Login Page</h1>
    <form @submit.prevent="submitForm" class="p-4 border rounded">
      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input
          type="email"
          class="form-control"
          id="email"
          placeholder="Enter your email"
          v-model="formData.email"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password:</label>
        <input
          type="password"
          class="form-control"
          id="password"
          placeholder="Enter your password"
          v-model="formData.password"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

    <a href="#/signup" id="signup" class="btn btn-link p-0" @click="signForm">Sign up Here</a>

    <div v-if="error" class="text-danger">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

const formData = ref({
  email: '',
  password: '',
});

const error = ref(null);
const router = useRouter();

const signForm = () => {
  router.push('/signup');
};

const submitForm = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, formData.value.email, formData.value.password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem('currentUser', userData.username);
    }

    router.push('/about');
  } catch (err) {
    error.value = 'Invalid email or password';
  }
};
</script>

<style scoped>
/* Media queries for form responsiveness */
@media (min-width: 576px) {
  .form-label {
    font-size: 18px;
    padding: 20px;
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
}
</style>
