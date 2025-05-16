const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBQ4Z6GZzrXJesqgRGKDZhbpE0xOV3RMHU",
  authDomain: "life-saver-3.firebaseapp.com",
  projectId: "life-saver-3",
  storageBucket: "life-saver-3.firebasestorage.app",
  messagingSenderId: "42109103150",
  appId: "1:42109103150:web:88006a2c171f97b6fd43bf",
  measurementId: "G-7065T2XN2R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    // Add a test document
    const docRef = await addDoc(collection(db, 'notes'), {
      content: '# Test Note\nThis is a test note added via script',
      timestamp: new Date()
    });
    console.log('Success! Note added with ID:', docRef.id);

    // Read all notes
    const querySnapshot = await getDocs(collection(db, 'notes'));
    console.log('\nAll notes in database:');
    querySnapshot.forEach(doc => {
      console.log('ID:', doc.id, 'Data:', doc.data());
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

testFirebase(); 