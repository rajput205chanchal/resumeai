
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAazTU3sUcUMuyLVqLOAWczOdXB8HIetq4",
  authDomain: "mernai-b1525.firebaseapp.com",
  projectId: "mernai-b1525",
  storageBucket: "mernai-b1525.firebasestorage.app",
  messagingSenderId: "235206334441",
  appId: "1:235206334441:web:7116ca0325274d99c01d78",
  measurementId: "G-W98V3XNVJX"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };