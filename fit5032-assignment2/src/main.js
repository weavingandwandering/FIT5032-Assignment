import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap';  
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


// import PrimeVue from 'primevue/config'
// import Aura from '@primevue/themes/aura'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAN1BgrLDN7Z1d5DMUyw1VAVNJyIqXm5Rg",
  authDomain: "ishita-assignment3.firebaseapp.com",
  projectId: "ishita-assignment3",
  storageBucket: "ishita-assignment3.appspot.com",
  messagingSenderId: "408684054915",
  appId: "1:408684054915:web:79a0505ac5745472ce0eb6"
};

// Initialize Firebase
initializeApp(firebaseConfig);