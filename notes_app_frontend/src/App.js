import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getInitialNotes } from './utils/storage';
import { DEFAULT_NOTE, KEYS } from './constants';

/**
 * Root application component that sets up the app layout and initializes core state.
 * Layout:
 * - header (top navigation, search, theme toggle)
 * - sidebar (filters, tags)
 * - main (notes list, editor modal)
 */
function App() {
  // Persistent settings with theme preference
  const [settings, setSettings] = useLocalStorage(KEYS.settings, {
    theme: 'light',
  });

  // Apply theme to document
  useEffect(() => {
    const theme = settings?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings?.theme]);

  // Persistent notes list
  const [notes, setNotes] = useLocalStorage(KEYS.notes, getInitialNotes);

  // Session/UI state
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'

  // Derived values
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme = (prev?.theme || 'light') === 'light' ? 'dark' : 'light';
      return { ...(prev || {}), theme: nextTheme };
    });
  };

  // PUBLIC_INTERFACE
  // Open editor in create mode
  const handleCreateNote = () => {
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  // PUBLIC_INTERFACE
  // Open editor in edit mode for a given note
  const handleEditNote = (noteId) => {
    setSelectedNoteId(noteId);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  // PUBLIC_INTERFACE
  // Close the editor modal
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  // PUBLIC_INTERFACE
  // Create new note
  const addNote = (payload) => {
    const id =
      typeof crypto !== 'undefined' && crypto?.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const now = Date.now();
    const newNote = {
      ...DEFAULT_NOTE,
      id,
      title: payload.title,
      content: payload.content || '',
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(id);
  };

  // PUBLIC_INTERFACE
  // Update existing note
  const updateNote = (payload) => {
    const targetId = payload.id || selectedNoteId;
    if (!targetId) return;
    const now = Date.now();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === targetId
          ? {
              ...n,
              title: payload.title,
              content: payload.content || '',
              tags: Array.isArray(payload.tags) ? payload.tags : [],
              updatedAt: now,
            }
          : n
      )
    );
  };

  // PUBLIC_INTERFACE
  // Delete note with confirmation handled by NotesList already; this is idempotent
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedNoteId((prevId) => (prevId === id ? null : prevId));
  };

  // PUBLIC_INTERFACE
  // Toggle pin on a note
  const togglePin = (id, next) => {
    const now = Date.now();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !!next, updatedAt: now } : n))
    );
  };

  // PUBLIC_INTERFACE
  const selectTag = (tag) => setSelectedTag(tag);

  // PUBLIC_INTERFACE
  const setSearch = (q) => setSearchQuery(q);

  return (
    <div className="App app-root">
      <header role="banner" className="app-header">
        <Header
          theme={settings?.theme || 'light'}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          // Support both prop names: onAddNote (requested) and onCreateNote (legacy)
          onAddNote={handleCreateNote}
          onCreateNote={handleCreateNote}
        />
      </header>

      <div className="app-layout" role="main">
        <aside className="app-sidebar" aria-label="Sidebar with filters and tags">
          <Sidebar
            notes={notes}
            selectedTag={selectedTag}
            onSelectTag={selectTag}
            onClearTag={() => selectTag(null)}
          />
        </aside>

        <section className="app-content" aria-label="Notes content">
          <NotesList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            onEditNote={handleEditNote}
            onDeleteNote={deleteNote}
            onTogglePin={togglePin}
          />

          {isEditorOpen && (
            <NoteEditor
              isOpen={isEditorOpen}
              mode={editorMode}
              // Ensure initialNote is correctly populated in edit mode
              initialNote={editorMode === 'edit' ? selectedNote || DEFAULT_NOTE : DEFAULT_NOTE}
              onCancel={handleCloseEditor}
              onSave={(payload) => {
                if (editorMode === 'create') {
                  addNote(payload);
                } else {
                  updateNote(payload);
                }
                setIsEditorOpen(false);
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
