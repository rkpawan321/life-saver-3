import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const NotesList = memo(function NotesList({ notes, editId, editContent, editTextareaRef, handleEditSave, handleEditCancel, handleEdit, handleDelete, unreadCount, handleUnreadClick, notesListRef, atTop }) {
  return (
    <div
      className="notes-list"
      ref={notesListRef}
    >
      {/* Top unread dot */}
      {unreadCount > 0 && !atTop && (
        <div
          onClick={handleUnreadClick}
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 1px 4px rgba(34,197,94,0.15)',
            cursor: 'pointer',
            zIndex: 2000,
          }}
          title={`Show ${unreadCount} new note${unreadCount > 1 ? 's' : ''}`}
        />
      )}
      {notes.map((note) => (
        <div className="note-card" key={note.id}>
          {editId === note.id ? (
            <>
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={e => handleEdit(note.id, e.target.value)}
                style={{width: '100%', minHeight: 80, marginBottom: 8, fontSize: '1.08rem', padding: 10, borderRadius: 8, border: '1px solid #e0e0e0', resize: 'none', overflow: 'hidden'}}
              />
              <div style={{display: 'flex', gap: 8, marginTop: 8}}>
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
      {unreadCount > 0 && (
        <div
          onClick={handleUnreadClick}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 32,
            background: '#22c55e',
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 1000,
          }}
          title={`Show ${unreadCount} new note${unreadCount > 1 ? 's' : ''}`}
        >
          {unreadCount}
        </div>
      )}
    </div>
  );
});

function NoteInput({ newNote, setNewNote, handleSubmit }) {
  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <textarea
        value={newNote}
        onChange={e => setNewNote(e.target.value)}
        placeholder="Add a note (markdown supported)"
        style={{width: '100%', minHeight: 80, fontSize: '1.08rem', padding: 10, borderRadius: 8, border: '1px solid #e0e0e0'}}
      />
      <button type="submit">Add Note</button>
    </form>
  );
}

function TopUnreadDots({ unreadCount, onClick }) {
  if (unreadCount <= 0) return null;
  const dotsToShow = Math.min(unreadCount, 5);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 8,
        padding: '2px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
      }}
      title={`Show ${unreadCount} new note${unreadCount > 1 ? 's' : ''}`}
    >
      {Array.from({ length: dotsToShow }).map((_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#22c55e',
            margin: '0 2px',
            boxShadow: '0 1px 4px rgba(34,197,94,0.15)'
          }}
        />
      ))}
      {unreadCount > 5 && (
        <span style={{marginLeft: 6, color: '#22c55e', fontWeight: 700, fontSize: 16}}>+</span>
      )}
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newNote, setNewNote] = useState('');
  const editTextareaRef = useRef(null);
  const notesListRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const prevNotesLength = useRef(0);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesList);
      setLoading(false);
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editId && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
  }, [editContent, editId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isAtTop = scrollTop < 10;
      setAtTop(isAtTop);
      if (isAtTop) setUnreadCount(0);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const notesDiff = notes.length - prevNotesLength.current;
    if (notesDiff > 0 && !atTop) {
      setUnreadCount((c) => {
        const newCount = c + notesDiff;
        console.log('INCREMENT unreadCount:', c, '+', notesDiff, '=', newCount);
        return newCount;
      });
    }
    if (atTop) {
      if (unreadCount !== 0) console.log('RESET unreadCount to 0');
      setUnreadCount(0);
    }
    prevNotesLength.current = notes.length;
    console.log('Effect: notes.length', notes.length, 'unreadCount', unreadCount, 'atTop', atTop);
  }, [notes, atTop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
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
    if (!editContent.trim()) return;
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

  const handleUnreadClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setUnreadCount(0);
  };

  console.log('Render: unreadCount', unreadCount, 'atTop', atTop, 'indicator visible:', unreadCount > 0 && !atTop);

  if (loading) {
    return <div className="app-container">Loading notes...</div>;
  }
  if (error) {
    return <div className="app-container">Error: {error}</div>;
  }

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* Top unread dots indicator, fixed at top center of viewport */}
      {unreadCount > 0 && !atTop && (
        <TopUnreadDots unreadCount={unreadCount} onClick={handleUnreadClick} />
      )}
      <NotesList
        notes={notes}
        editId={editId}
        editContent={editContent}
        editTextareaRef={editTextareaRef}
        handleEditSave={handleEditSave}
        handleEditCancel={handleEditCancel}
        handleEdit={(id, value) => {
          setEditId(id);
          setEditContent(value);
        }}
        handleDelete={handleDelete}
        unreadCount={unreadCount}
        handleUnreadClick={handleUnreadClick}
        notesListRef={notesListRef}
        atTop={atTop}
      />
      <NoteInput newNote={newNote} setNewNote={setNewNote} handleSubmit={handleSubmit} />
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 32}}>
        <button onClick={handleClearAll} style={{background: '#f87171', color: '#fff', padding: '10px 32px', borderRadius: 8, fontWeight: 600, fontSize: '1.1em', border: 'none', cursor: 'pointer'}}>Clear All Notes</button>
      </div>
    </div>
  );
}

export default App;
