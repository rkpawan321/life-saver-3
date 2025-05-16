import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up real-time listener for notes
    const q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const notesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotes(notesList);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addDoc(collection(db, 'notes'), {
        content: newNote,
        timestamp: new Date()
      });
      setNewNote('');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="app-container">Loading notes...</div>;
  }
  if (error) {
    return <div className="app-container">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      {/* <h1>Slide Notes</h1> */}
      <div className="notes-list">
        {notes.map((note) => (
          <div className="note-card" key={note.id}>
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        ))}
      </div>
      <form className="note-form" onSubmit={handleSubmit}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note (markdown supported)"
        />
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
}

export default App;
