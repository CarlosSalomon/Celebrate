import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAmzOawANDteeSmfcfCy61JNu9Cf0XIiJ8",
  authDomain: "eventplannerapp-cc3ac.firebaseapp.com",
   projectId: "eventplannerapp-cc3ac",
  storageBucket: "eventplannerapp-cc3ac.firebasestorage.app",
  messagingSenderId: "337733046898",
  appId: "1:337733046898:web:a316c6facc6dba0cc368eb",
  measurementId: "G-YGQPM8NMRR"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
