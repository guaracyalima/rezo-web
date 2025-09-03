import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAAZ890Xrq3NmcEzKqzP7pyVg9drCKxeR0",
  authDomain: "xeco-334f5.firebaseapp.com",
  projectId: "xeco-334f5",
  storageBucket: "xeco-334f5.firebasestorage.app",
  messagingSenderId: "300882600959",
  appId: "1:300882600959:web:77c3d34b026ff609c67dca",
  measurementId: "G-7NNWTLHPMD"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyCcWydCZLirMfYHfB6tUxiNmLyNN5DUHkA",
//   authDomain: "obras-949fb.firebaseapp.com",
//   projectId: "obras-949fb",
//   storageBucket: "obras-949fb.appspot.com",
//   messagingSenderId: "1026250062018",
//   appId: "1:1026250062018:web:becb2d58b2bd142eaee35b",
//   measurementId: "G-PNNDZ0BMD6"
// };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'rezos');
// Set the database to use "rezos" instead of default
export const rezosDb = getFirestore(app, 'rezos');
export const storage = getStorage(app);