// Import Firebase modules (make sure Firebase SDK is included in your project)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-storage.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js';

 // Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyDi-PnbqxyJnH6l8ePZeLCFt0wpfseq3ow",
    authDomain: "akums-website.firebaseapp.com",
    projectId: "akums-website",
    storageBucket: "akums-website.firebasestorage.app",
    messagingSenderId: "786101532621",
    appId: "1:786101532621:web:cc93facfad185a93a1b684",
    measurementId: "G-N10F537FMY"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to initialize event form logic
export function initializeEventForm() {
    const form = document.getElementById('eventForm');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevents the default form submission behavior
  
        // Get form field values
        const eventName = document.getElementById('eventName').value;
        const eventImage = document.getElementById('eventImage').files[0];
        const eventLocation = document.getElementById('eventLocation').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventDescription = document.getElementById('eventDescription').value;
  
        // Validate required fields
        if (!eventName || !eventImage || !eventLocation || !eventTime || !eventDescription) {
          alert('Please fill out all fields.');
          return;
        }
  
        // Debugging: Log the form values and event image
        console.log('Event Name:', eventName);
        console.log('Event Image:', eventImage);
        console.log('Event Location:', eventLocation);
        console.log('Event Time:', eventTime);
        console.log('Event Description:', eventDescription);
  
        try {
          console.log("Starting Firebase operations...");
  
          // Firebase Storage reference
          const storageRef = ref(storage, `events/${eventImage.name}`);
          console.log("Uploading to Firebase Storage...");
  
          // Upload image to Firebase Storage
          await uploadBytes(storageRef, eventImage);
          console.log("Image uploaded successfully!");
  
          // Get download URL for the uploaded image
          const downloadURL = await getDownloadURL(storageRef);
          console.log("Download URL:", downloadURL);
  
          // Save event data to Firestore
          const docRef = await addDoc(collection(db, 'events'), {
            name: eventName,
            location: eventLocation,
            time: eventTime,
            description: eventDescription,
            imageURL: downloadURL,
            timestamp: new Date(),
          });
          console.log("Event logged successfully with ID:", docRef.id);
  
          // Alert success
          alert('Event logged successfully!');
  
          // Reset the form
          form.reset();
  
          // Optionally, close the modal (if it's used)
          // const eventModal = bootstrap.Modal.getInstance(document.getElementById('eventFormModal'));
          // eventModal.hide();
  
          // Redirect to a section or page (adjust URL as needed)
          setTimeout(() => {
            window.history.back();  // Adjust URL to target specific section
          }, 500); // Optional delay to ensure modal close animation completes
        } catch (error) {
          console.error('Error logging event:', error);
          alert('An error occurred while logging the event: ' + error.message);
        }
      });
    } else {
      console.error('Form with ID "eventForm" not found.');
    }
  }