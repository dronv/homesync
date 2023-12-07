import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAW3NBx7T1hXhuiHvFKj5_99zF6oegV-n0",
  authDomain: "homesync-react.firebaseapp.com",
  projectId: "homesync-react",
  storageBucket: "homesync-react.appspot.com",
  messagingSenderId: "349714647779",
  appId: "1:349714647779:web:ca8dcfad50fedecf7c93d6",
  measurementId: "G-E3HN4FBBJC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export { db };

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);
    })
    .catch((error) => {
      console.log(error);
    });
};
