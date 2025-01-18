  // Import Firebase SDKs
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
  import { getFirestore, collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  import { arrayUnion } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  // Firebase Storage
  import { getStorage, ref, uploadBytes, getDownloadURL  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

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
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

 // Check Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User signed in:", user.email);

    // Update UI for signed-in state
    toggleAuthUI(true, user);

     // Additional actions for signed-in users (if needed)

  } else {
    
     // No user is signed in
     console.log("No user signed in");

     // Update UI for logged-out state
     toggleAuthUI(false);

  }
});

// Function to toggle UI based on login state
function toggleAuthUI(isLoggedIn, user = null) {
  document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('signupBtn').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('profileBtn').style.display = isLoggedIn ? 'block' : 'none';

}

// Define the showToast function
function showToast(message, type = 'info') {
  const toastEl = document.getElementById('mainToast');
  const toastMessage = document.getElementById('toastMessage');

  // Set the message and style based on type
  toastMessage.textContent = message;
  toastEl.className = `toast align-items-center text-bg-${type}`;

  // Initialize and show the toast
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// Handle Sign-Up Form Submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const countryCode = document.getElementById('countryCode').value;
  const group = "guest"; // Default group for all new sign-ups
 
  
    // Validate Name (can't be empty)
    if (email === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.");
      return;
    }

      // Validate Password (check if the two passwords match)
    if (password !== confirmPassword) {
      showToast("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.");
      return;
    }


      // Validate Phone Number (ensure it's at least 9 digits and contains only numbers)
    if (!/^\d{9,}$/.test(phoneNumber)) {
      showToast("Please enter a valid phone number with at least 9 digits.", "warning");
      return;
    }


  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      console.log("User UID: ", user.uid); // Check if the UID is being set correctly
        // If all validations pass, you can submit the form or process the data
  
        
          // Store additional user data in Firestore
      setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        timestamp: serverTimestamp(),
        userId: user.uid,
        password: password, // Make sure to securely hash/store password
        phoneNumber: countryCode + phoneNumber, // Combine country code with phone number
        group: group, // Assign group as "guest"
         
})

        .then(() => {
         
          // Show success message
          alert("Sign-up successful! Welcome to the official AKUMS website.");
          
          // Automatically update UI after signup as user is already logged in
          updateUI(user);

          // Close the modal
          const authModal = document.getElementById('authModal');
          const bootstrapModal = bootstrap.Modal.getInstance(authModal);
          bootstrapModal.hide();
          window.location.href = "/index.html";

        })

        .catch((error) => {
          console.error("Error storing user data:", error);

          // Show error message to the user
          showToast("Sign-up successful, but we encountered an issue storing your information. Please try again.");
        
        });

    })

    .catch((error) => {
      console.error("Sign-up error:", error.message);

      // Show error message to the user
      showToast("Sign-up unsuccessful: " + error.message);

    });

});


// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Fetch additional user data from Firestore
      const docRef = doc(db, 'users', user.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User data fetched from Firestore:", userData);

            // Update UI after successful login
            updateUI(user);

            // Show success message
            alert("Login successful");

            const authModal = document.getElementById('authModal');
            const bootstrapModal = bootstrap.Modal.getInstance(authModal);
            bootstrapModal.hide();
            window.location.href = "/index.html";
            
          } else {

            console.error("No document found for the user in Firestore.");
            showToast("Login successful, but user details could not be retrieved.");
          }

        })

        .catch((error) => {
          console.error("Error fetching user data:", error);
          showToast("Login successful, but there was an error fetching your details.");
        });

    })

    .catch((error) => {
      console.error("Login error:", error.message);
      showToast("Login failed. Please check your email and password.");
    });

});

// Function to update the UI based on user login state
function updateUI(user) {
  const profileEmailElement = document.getElementById("profileEmail");
  const admissionNumberElement = document.getElementById("admissionNumber");

  // Hide the login and signup sections if user is logged in
  if (user) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('profileBtn').style.display =  'block';

   
  } else {
    // Show the login and signup sections if no user is logged in
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('signupBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('profileBtn').style.display = 'none';
    if (profileEmailElement) profileEmailElement.textContent = "Email: N/A";
    if (admissionNumberElement) admissionNumberElement.textContent = "Admission Number: N/A";
    
  }
}

// Handle Log-Out
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully.");
      alert("Logged out successful");
      
      // Update the UI after log out
      updateUI(null);  // Pass null as user is no longer logged in
      window.location.href = "/index.html";
    
    })

    .catch((error) => {
      console.error("Log out error:", error);
      showToast("An error occurred while logging out.");
    });
    
});

// Keep track of active nav-link globally
let currentActiveLink = document.querySelector('.nav-link.active');

document.querySelectorAll('.nav-link[data-target]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default behavior of the link

        // Get the target section id from the data-target attribute
        const target = this.getAttribute('data-target');
        if (!target) {
            console.error("data-target attribute not found on the clicked link.");
            return;
        }

        // Hide all sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });

        // Show the clicked section
        const targetSection = document.getElementById(target);
        if (!targetSection) {
            console.error("Element with ID '" + target + "' not found.");
            return;
        }
        targetSection.classList.add('active');

        // Update the active link in the navbar
        if (currentActiveLink) {
            currentActiveLink.classList.remove('active');
        }
        this.classList.add('active');
        currentActiveLink = this; // Update the reference
    });
});

// Open the modal when the Login or Sign-Up buttons are clicked
document.getElementById('loginBtn').addEventListener('click', () => {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
    document.getElementById('authModalLabel').textContent = "AUTHENTICATION"; // Set modal title to Login
    showLoginForm();
});

document.getElementById('signupBtn').addEventListener('click', () => {
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
    document.getElementById('authModalLabel').textContent = "AUTHENTICATION"; // Set modal title to Sign Up
    showSignUpForm();
});


// Toggle between Login and Sign-Up forms
function showLoginForm() {
  document.getElementById('loginFormSection').style.display = 'block';
  document.getElementById('signupFormSection').style.display = 'none';
  document.getElementById('forgotPasswordSection').style.display = 'none';
}

function showSignUpForm() {
  document.getElementById('loginFormSection').style.display = 'none';
  document.getElementById('signupFormSection').style.display = 'block';
  document.getElementById('forgotPasswordSection').style.display = 'none';
}

function showForgotPasswordForm() {
  document.getElementById('loginFormSection').style.display = 'none';
  document.getElementById('signupFormSection').style.display = 'none';
  document.getElementById('forgotPasswordSection').style.display = 'block';
}

// Switch to the Sign Up form when "Sign Up" is clicked from Login form
document.getElementById('showSignUp').addEventListener('click', (e) => {
    e.preventDefault();
    showSignUpForm();
});

// Switch to the Login form when "Login" is clicked from Sign Up form
document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Switch to the Forgot Password form when "Forgot Password" is clicked
document.getElementById('showForgotPassword').addEventListener('click', (e) => {
  e.preventDefault();
  showForgotPasswordForm();
});

// Switch to the Login form from the Forgot Password form
document.getElementById('showLoginFromForgot').addEventListener('click', (e) => {
  e.preventDefault();
  showLoginForm();
});

// Handle Forgot Password Form Submission
document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('forgotPasswordEmail').value;

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  // Send password reset email
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent! Please check your inbox.");
      // Optionally, close the modal
      const authModal = document.getElementById('authModal');
      const bootstrapModal = bootstrap.Modal.getInstance(authModal);
      bootstrapModal.hide();
    })

    .catch((error) => {
      showToast("Error sending reset email: " + error.message);
    });

});

document.getElementById('messageForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  const status = "unread";
  // Validate Name (can't be empty)
  if (name === "") {
    alert("Please enter your name.");
    return;
  }

  // Validate Email (using regex for basic email validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(emailRegex)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Validate Message (can't be empty)
  if (message === "") {
    alert("Please enter your message.");
    return;
  }

  console.log(eventImage);
if (!eventImage) {
  alert('No image selected');
  return;
}

  // If all validations pass, you can submit the form or process the data
  alert("Form successfully submitted!");

  const contactRef = collection(db, "contactMessages");

  addDoc(contactRef, {
    name: name,
    email: email,
    message: message,
    status: status,
    timestamp: serverTimestamp(),
  })

    .then(() => {


      alert("Message sent successfully!");
      console.log(`Uploading to: events/${eventImage.name}`);

      // Reload the page to clear the form and reset
      //  location.reload();
    })

    .catch((error) => {
      alert("Error sending message: " + error.message);
    });

});

fetch('templates/home.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('#home').innerHTML = data;
      })
      .catch(error => console.error('Error loading content:', error));

      fetch('templates/events.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('#events').innerHTML = data;
       
        // Now that the content is loaded, look for the #eventList container
      const eventList = document.getElementById("eventList");
      // Ensure the event list container exists
      if (!eventList) {
        console.error("Event list container not found.");
        return;
      }

       console.log("Event list container found.");
    eventList.innerHTML = ''; // Clear any existing content

        // Fetch events from Firestore
        fetchEvents(eventList);
      })
      .catch(error => console.error('Error loading content:', error));

      fetch('templates/about_us.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('#about').innerHTML = data;
      })
      .catch(error => console.error('Error loading content:', error));

      fetch('templates/resources.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('#resources').innerHTML = data;
      })
      .catch(error => console.error('Error loading content:', error));
      
      fetch('templates/account.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('#account').innerHTML = data;
      })
      .catch(error => console.error('Error loading content:', error));
      

      // JavaScript to close navbar on link click, except for dropdown
document.addEventListener('DOMContentLoaded', function () {
    const navbarNav = document.querySelector('#navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownToggle = document.querySelector('#profileDropdown'); // Dropdown toggle element

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // If the clicked link is not the dropdown toggle
            if (link !== dropdownToggle && window.getComputedStyle(navbarToggler).display !== 'none') {
                // Close the navbar (small screens only)
                const bootstrapCollapse = new bootstrap.Collapse(navbarNav, {
                    toggle: true
                });
                bootstrapCollapse.hide();
            }
        });
    });

    // Prevent dropdown menu from closing immediately on click inside
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

let lastScrollTop = 0; // Initial scroll position

// Get the navbar element
const navbar = document.querySelector('.navbar');

// Listen for the scroll event
window.addEventListener('scroll', function () {
  let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  // If we're scrolling down, hide the navbar
  if (currentScroll > lastScrollTop) {
    navbar.classList.add('hidden'); // Add 'hidden' class to hide navbar
  } else {
    // If we're scrolling up, show the navbar again
    navbar.classList.remove('hidden'); // Remove 'hidden' class to show navbar
  }

  // Update last scroll position
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll position
});

      // Listen for user authentication state
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const email = user.email;
    const userId = user.uid;

    // Display email in the profile section
    const profileEmailElement = document.getElementById('profileEmail');
    if (profileEmailElement) {
      profileEmailElement.textContent = `Email: ${email}`;
    }

    // Fetch and display admission numberS
    try {
      const userDocRef = doc(db, "users", userId); // Reference to Firestore document
      const userDoc = await getDoc(userDocRef); // Get document data

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const admissionNumber = userData.admissionNumber || "N/A"; // Fetch field
        const group = userData.group || "N/A";
        const firstName = userData.firstName || "N/A";
        const secondName = userData.secondName || "N/A";

        // Display the full name (first name + second name)
        const fullName = `${firstName} ${secondName}`;

        const profileNameElement = document.getElementById('username');
        if (profileNameElement) {
          profileNameElement.textContent = `Name: ${fullName}`;
        }
        
        const admissionNumberElement = document.getElementById("admissionNumber");
        if (admissionNumberElement) {
          admissionNumberElement.textContent = `Admission Number: ${admissionNumber}`;
        }

        // Save group to local storage (or session storage)
        localStorage.setItem("userGroup", group);
        console.log(`User Group: ${group}`);

      } else {

        console.warn("User document does not exist in Firestore.");
      }
    } catch (error) {

      console.error("Error fetching admission number:", error.message);
    }

  } else {

    console.log("Not logged in")
    updateUI(null); // Clear UI

     // Clear group from local storage
     localStorage.removeItem("userGroup");
  }
});

document.addEventListener('DOMContentLoaded', function () {

   // Handle Update Profile button
   const updateProfileButton = document.querySelector('.btn-item[data-target="update_profile.html"]');
   if (updateProfileButton) {
     updateProfileButton.addEventListener('click', function (event) {
       event.preventDefault(); // Prevent default link behavior
       console.log("Navigating to Update Profile page...");
       window.location.href = "update_profile.html"; // Redirect to update_profile.html
     });
   }
   
  // Event delegation for dynamic navigation
  const event = document.getElementById('#event'); // Correct selector
  if (event) {
    event.addEventListener('click', function (event) {
      if (event.target && event.target.matches('.btn-item')) {
        const target = event.target.getAttribute('data-target');
        event.preventDefault();
        console.log("Target clicked:", target); // Debugging log

          // Open the modal
      const eventModal = new bootstrap.Modal(document.getElementById('eventFormModal'));
      eventModal.show();

      // Initialize the event form logic
      console.log("Initializing Event Form...");
      initializeEventForm();
        
      }
    });
  }

// Function to initialize event form logic
function initializeEventForm() {
  const form = document.getElementById('eventForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

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

        // Close the modal
        const eventModal = bootstrap.Modal.getInstance(document.getElementById('eventFormModal'));
        eventModal.hide();

        // Redirect back to the target section (adjust as needed)
        setTimeout(() => {
          window.location.href = 'index.html#account'; // Adjust URL to target specific section
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
    });



// Assuming that Firestore has been initialized correctly, and the db is set up
async function fetchEvents(eventList) {
  try {
    console.log("Fetching events from Firestore...");
    
    // Fetch documents from Firestore collection "events"
    const querySnapshot = await getDocs(collection(db, "events"));
    console.log("Events fetched:", querySnapshot.size);

     // Get the current logged-in user
     const user = auth.currentUser;
     const uid = user ? user.uid : null;  // UID of logged-in user (or null if not logged in)

    if (querySnapshot.empty) {
      console.log("No events found.");

    } else {
      // Loop through each document in the collection and display event details
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        console.log("Event data:", event);

         // Create a card for each event
         const eventCard = document.createElement('div');
         eventCard.classList.add('col-12', 'mb-3'); // Full width and margin at the bottom for spacing
 
         eventCard.innerHTML = `
          <div class="card h-100 card-custom-shadow card-animated">
              <img src="${event.imageURL}" class="card-img-top" alt="Event Image" style="width: 100%; height: 200px; object-fit: cover;">
              <div class="card-body">
                  <h5 class="card-title">${event.name}</h5>
                  <p class="card-text"><strong>Date:</strong> ${event.time}</p>
                  <p class="card-text"><strong>Location:</strong> ${event.location}</p>
                  <p class="card-text">${event.description}</p>
                  <button class="btn btn-primary w-100 register-btn" data-event-id="${doc.id || 'missing-id'}">Register Now</button>
              </div>
          </div>
      `;


        // Append the event card to the event list container
        eventList.appendChild(eventCard);
        console.log("Event card added to the list.");


                // Check if the user is already registered
                const members = event.members || [];
                const isRegistered = members.some(member => member.uid === uid);

                // Update button state if already registered
                const registerButton = eventCard.querySelector('.register-btn');
                if (isRegistered) {
                    registerButton.textContent = "Registered";
                    registerButton.classList.remove('btn-primary');
                    registerButton.classList.add('btn-secondary');
                    registerButton.disabled = true;
                }
            });
        }
    } catch (error) {
        console.error("Error fetching events or checking registration status:", error);
    }
}
      


// Event listener for Register button
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('register-btn')) {
      const eventId = e.target.getAttribute('data-event-id');
      console.log(`Registering for event: ${eventId}`);
      try {
          const user = auth.currentUser;
          if (user) {
              const { uid, email } = user;

              // Update Firestore with the user registration
              const eventDocRef = doc(db, "events", eventId);
              await updateDoc(eventDocRef, {
                  members: arrayUnion({ uid, email })
              });

              // Update button appearance
              e.target.textContent = "Registered";
              e.target.classList.remove('btn-primary');
              e.target.classList.add('btn-secondary');
              e.target.disabled = true;

              alert("You have successfully registered for the event!");
          } else {
              alert("Please log in to register for events.");
          }
      } catch (error) {
          console.error("Error registering for event:", error);
          alert("An error occurred while registering. Please try again.");
      }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Get modal and blur background elements
  const authModal = document.getElementById('authModal');

  const blurBackground = document.getElementById('blur-background');

  if (authModal && blurBackground) {
    // Show the blur background when either modal is opened
    authModal.addEventListener('show.bs.modal', () => {
      blurBackground.classList.add('show');
    });

    // Hide the blur background when either modal is closed
    authModal.addEventListener('hidden.bs.modal', () => {
      blurBackground.classList.remove('show');
    });

   
  } else {
    console.error('Modal or Blur Background element not found!');
  }
});




