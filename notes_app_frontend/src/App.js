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
  const [notes, setNotes] = useLocalStorage(KEYS.notes, getInitialNotes());

  // Session/UI state
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'

  // Derived values
  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setSettings(prev => {
      const nextTheme = (prev?.theme || 'light') === 'light' ? 'dark' : 'light';
      return { ...(prev || {}), theme: nextTheme };
    });
  };

  // Placeholder handlers (no-ops for now; will be implemented in later steps)
  const handleCreateNote = () => {
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleEditNote = (noteId) => {
    setSelectedNoteId(noteId);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const handleSaveNote = (noteData) => {
    // No-op for scaffolding; just close editor
    setIsEditorOpen(false);
  };

  const handleSearch = (q) => setSearchQuery(q);
  const handleSelectTag = (tag) => setSelectedTag(tag);
  const handleClearTag = () => setSelectedTag(null);

  return (
    <div className="App app-root">
      <header role="banner" className="app-header">
        <Header
          theme={settings?.theme || 'light'}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
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
            onSelectTag={handleSelectTag}
            onClearTag={handleClearTag}
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
            onDeleteNote={(id) => {
              // Remove the note by id
              setNotes(prev => prev.filter(n => n.id !== id));
              // Clear selection if deleted
              setSelectedNoteId(prevId => (prevId === id ? null : prevId));
            }}
            onTogglePin={(id, next) => {
              // Toggle pinned for a note by id
              setNotes(prev => prev.map(n => (n.id === id ? { ...n, pinned: next, updatedAt: Date.now() } : n)));
            }}
          />

          {isEditorOpen && (
            <NoteEditor
              isOpen={isEditorOpen}
              mode={editorMode}
              initialNote={editorMode === 'edit' ? (selectedNote || DEFAULT_NOTE) : DEFAULT_NOTE}
              onCancel={handleCloseEditor}
              onSave={(payload) => {
                // Create or update note in parent; persistence via useLocalStorage
                if (editorMode === 'create') {
                  const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
                  const now = Date.now();
                  const newNote = {
                    id,
                    title: payload.title,
                    content: payload.content || '',
                    tags: Array.isArray(payload.tags) ? payload.tags : [],
                    createdAt: payload.createdAt || now,
                    updatedAt: payload.updatedAt || now,
                    pinned: false,
                  };
                  setNotes(prev => [newNote, ...prev]);
                  setSelectedNoteId(id);
                } else {
                  // edit mode
                  setNotes(prev => prev.map(n => {
                    if (n.id !== (payload.id || selectedNoteId)) return n;
                    return {
                      ...n,
                      title: payload.title,
                      content: payload.content || '',
                      tags: Array.isArray(payload.tags) ? payload.tags : [],
                      updatedAt: payload.updatedAt || Date.now(),
                    };
                  }));
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
