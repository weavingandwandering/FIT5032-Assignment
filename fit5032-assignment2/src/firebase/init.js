import {initialiseApp} from 'firebase/app';

import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAN1BgrLDN7Z1d5DMUyw1VAVNJyIqXm5Rg",
    authDomain: "ishita-assignment3.firebaseapp.com",
    projectId: "ishita-assignment3",
    storageBucket: "ishita-assignment3.appspot.com",
    messagingSenderId: "408684054915",
    appId: "1:408684054915:web:79a0505ac5745472ce0eb6"
  };

  initialiseApp(firebaseConfig);
  const db = getFirestore();
  export default db

  
