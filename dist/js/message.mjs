import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDi-PnbqxyJnH6l8ePZeLCFt0wpfseq3ow",
    authDomain: "akums-website.firebaseapp.com",
    projectId: "akums-website",
    storageBucket: "akums-website.appspot.com",
    messagingSenderId: "786101532621",
    appId: "1:786101532621:web:cc93facfad185a93a1b684",
    measurementId: "G-N10F537FMY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const messageList = document.getElementById('message-list');
const messagesContainer = document.getElementById('messages-container');

async function fetchMessages() {
    try {
        const querySnapshot = await getDocs(collection(db, "contactMessages"));
        if (querySnapshot.empty) {
            messageList.innerHTML = "<li>No messages available.</li>";
        } else {
            querySnapshot.forEach((docSnapshot) => {
                const messageData = docSnapshot.data();
                const messageId = docSnapshot.id; // Get the document ID for updating
                const messageItem = document.createElement('li');

                // Display the unread icon if the message is not viewed
                messageItem.innerHTML = `
                    <i class="fa ${messageData.status === 'viewed' ? '' : 'fa-envelope'}"></i> 
                    ${messageData.name}
                `;

                messageItem.addEventListener('click', async () => {
                    displayMessage(messageData);

                    // Update the message status to "viewed" in Firestore
                    if (messageData.status !== "viewed") {
                        await updateMessageStatus(messageId);
                    }

                    // Update the UI to reflect the change
                    document.querySelectorAll('.message-list li').forEach(li => li.classList.remove('active', 'viewed'));
                    messageItem.classList.add('active', 'viewed');

                    // Remove the icon for viewed messages
                    messageItem.querySelector('i').classList.remove('fa-envelope');
                });

                messageList.appendChild(messageItem);
            });
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        messageList.innerHTML = "<li>Error fetching messages.</li>";
    }
}

async function updateMessageStatus(messageId) {
    try {
        const messageRef = doc(db, "contactMessages", messageId);
        await updateDoc(messageRef, { status: "viewed" });
        console.log(`Message ${messageId} marked as viewed.`);
    } catch (error) {
        console.error("Error updating message status:", error);
    }
}

function displayMessage(messageData) {
    messagesContainer.innerHTML = `
        <div class="message-card">
            <div class="header">${messageData.name}</div>
            <div class="email">${messageData.email}</div>
            <div class="message">${messageData.message}</div>
            <div class="footer">Received on: ${new Date().toLocaleDateString()}</div>
        </div>
    `;
}

// Fetch and display messages
fetchMessages();
