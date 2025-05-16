const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addNote() {
  try {
    const docRef = await db.collection('notes').add({
      content: '# Test Note\nThis is a test note added via script',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Note added with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding note:', error);
  }
}

addNote(); 