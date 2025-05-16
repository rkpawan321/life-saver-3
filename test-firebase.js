const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirebase() {
  try {
    // Add a test document
    const docRef = await db.collection('notes').add({
      content: '# Test Note\nThis is a test note added via script',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Success! Note added with ID:', docRef.id);

    // Read all notes
    const snapshot = await db.collection('notes').get();
    console.log('\nAll notes in database:');
    snapshot.forEach(doc => {
      console.log('ID:', doc.id, 'Data:', doc.data());
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    admin.app().delete();
  }
}

testFirebase(); 