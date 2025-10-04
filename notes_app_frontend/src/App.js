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
          />

          {isEditorOpen && (
            <NoteEditor
              mode={editorMode}
              note={editorMode === 'edit' ? (selectedNote || DEFAULT_NOTE) : DEFAULT_NOTE}
              onClose={handleCloseEditor}
              onSave={handleSaveNote}
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
