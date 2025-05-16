import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');

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
      // Prevent duplicate notes with the same content
      const q = query(collection(db, 'notes'), where('content', '==', newNote.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError('A note with the same content already exists.');
        return;
      }
      await addDoc(collection(db, 'notes'), {
        content: newNote,
        timestamp: new Date()
      });
      setNewNote('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (id, content) => {
    setEditId(id);
    setEditContent(content);
  };

  const handleEditSave = async (id) => {
    try {
      await updateDoc(doc(db, 'notes', id), { content: editContent });
      setEditId(null);
      setEditContent('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditContent('');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notes?')) return;
    try {
      const q = query(collection(db, 'notes'));
      const snapshot = await getDocs(q);
      const batchDeletes = snapshot.docs.map((d) => deleteDoc(doc(db, 'notes', d.id)));
      await Promise.all(batchDeletes);
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
            {editId === note.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  style={{width: '100%', minHeight: 60, marginBottom: 8}}
                />
                <div style={{display: 'flex', gap: 8}}>
                  <button onClick={() => handleEditSave(note.id)} style={{background: '#d1fae5', color: '#065f46'}}>Save</button>
                  <button onClick={handleEditCancel} style={{background: '#fee2e2', color: '#991b1b'}}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <ReactMarkdown
                  children={note.content}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <SyntaxHighlighter
                          style={oneLight}
                          language={match ? match[1] : 'text'}
                          PreTag="div"
                          customStyle={{
                            borderRadius: '8px',
                            fontSize: '1em',
                            background: '#f6f8fa',
                            padding: '1em',
                            overflowX: 'auto',
                            margin: '12px 0',
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} style={{background: '#f6f8fa', borderRadius: '4px', padding: '2px 6px'}} {...props}>{children}</code>
                      );
                    },
                    h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', margin: '0.5em 0'}} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{fontSize: '1.2em', margin: '0.5em 0'}} {...props} />,
                    ul: ({node, ...props}) => <ul style={{paddingLeft: '1.2em', margin: '0.5em 0'}} {...props} />,
                    ol: ({node, ...props}) => <ol style={{paddingLeft: '1.2em', margin: '0.5em 0'}} {...props} />,
                    blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid #e0e0e0', margin: '0.5em 0', padding: '0.5em 1em', color: '#555', background: '#f9f9fa'}} {...props} />,
                    p: ({node, ...props}) => <p style={{margin: '0.5em 0'}} {...props} />,
                  }}
                />
                <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                  <button onClick={() => handleEdit(note.id, note.content)} style={{background: '#e0e7ff', color: '#3730a3'}}>Edit</button>
                  <button onClick={() => handleDelete(note.id)} style={{background: '#fee2e2', color: '#991b1b'}}>Delete</button>
                </div>
              </>
            )}
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
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 32}}>
        <button onClick={handleClearAll} style={{background: '#f87171', color: '#fff', padding: '10px 32px', borderRadius: 8, fontWeight: 600, fontSize: '1.1em', border: 'none', cursor: 'pointer'}}>Clear All Notes</button>
      </div>
    </div>
  );
}

export default App;
