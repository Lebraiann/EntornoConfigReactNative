import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAkAUahBE1n59l56JuxznDi6DGaR6yDnGM",
  authDomain: "clase1-4dcc0.firebaseapp.com",
  projectId: "clase1-4dcc0",
  storageBucket: "clase1-4dcc0.firebasestorage.app",
  messagingSenderId: "807473334410",
  appId: "1:807473334410:web:3ad71c822e8f4b34e80573"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };