import React from 'react';

/**
 * Header component with app title, search input, create button, and theme toggle.
 *
 * Props:
 * - theme: 'light' | 'dark'
 * - onToggleTheme: () => void
 * - searchQuery: string
 * - onSearchChange: (value: string) => void
 * - onCreateNote: () => void
 */
export function Header({ theme = 'light', onToggleTheme, searchQuery, onSearchChange, onCreateNote }) {
  return (
    <div className="container card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary)' }} aria-label="App title">
        Ocean Notes
      </div>
      <div style={{ flex: 1 }} aria-label="Search notes">
        <input
          className="input"
          type="search"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          aria-label="Search notes"
        />
      </div>
      <button className="btn-primary" onClick={onCreateNote} aria-label="Create new note">
        + New
      </button>
      <button
        className="btn-primary"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title="Toggle theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
