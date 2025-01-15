// Firebase logic here
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDi-PnbqxyJnH6l8ePZeLCFt0wpfseq3ow",
  authDomain: "akums-website.firebaseapp.com",
  projectId: "akums-website",
  storageBucket: "akums-website.appspot.com", // Corrected storageBucket
  messagingSenderId: "786101532621",
  appId: "1:786101532621:web:cc93facfad185a93a1b684",
  measurementId: "G-N10F537FMY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Set persistence to local storage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to browser local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Track the authenticated user
let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log("User logged in with UID:", currentUserId);
  } else {
    console.log("No user signed in.");

  }
});

// Function to re-authenticate the user
function reauthenticateUser(email, password) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(email, password);
  return reauthenticateWithCredential(user, credential);
}

// Function to handle profile update
document.getElementById('updateProfileForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent default form submission

  try {
    const email = auth.currentUser.email; // Get the user's email
    const password = document.getElementById('password').value; // Get password from input

    // Validate input fields
    if (!password) {
      alert('Please enter your password to confirm.');
      return;
    }

    // Re-authenticate the user
    await reauthenticateUser(email, password);
    console.log("Re-authentication successful!");

    // Get form data
    const firstName = document.getElementById('firstName').value;
    const secondName = document.getElementById('secondName').value;
    const admissionNumber = document.getElementById('admissionNumber').value;
    const yearOfStudy = document.getElementById('yearOfStudy').value;
  

    if (!firstName || !secondName || !admissionNumber || !yearOfStudy) {
      alert('Please fill in all required fields.');
      return;
    }

    // Save user profile data to Firestore
    const userDoc = doc(db, 'users', currentUserId);
    await updateDoc(userDoc, {
      firstName,
      secondName,
      admissionNumber,
      yearOfStudy,
      
    });

    alert('Profile updated successfully!');
    console.log("Profile data saved.");

    window.history.back(); // Navigate to the previous page
 
} catch (error) {
    console.error("Error updating profile:", error);
    alert('Failed to update profile. Please try again.');
  }
});


