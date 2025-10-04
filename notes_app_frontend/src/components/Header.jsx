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
 * - onAddNote: () => void
 * - onAddNote: () => void
 */
export function Header({
  theme = 'light',
  onToggleTheme,
  searchQuery = '',
  onSearchChange,
  onCreateNote,
  onAddNote,
}) {
  // Derived aria labels for better a11y
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        // Subtle top gradient and shadow for "Ocean Professional"
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,0.9))',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
      }}
      role="navigation"
      aria-label="Application header"
    >
      {/* Brand / App Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 160,
        }}
      >
        <div
          aria-label="App title"
          style={{
            fontWeight: 800,
            fontSize: 18,
            color: 'var(--color-primary)',
            letterSpacing: 0.2,
          }}
        >
          Ocean Notes
        </div>
      </div>

      {/* Search */}
      <div style={{ flex: 1, display: 'flex' }} aria-label="Search notes">
        <div
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.6,
              fontSize: 14,
            }}
          >
            🔍
          </span>
          <input
            className="input"
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label="Search notes"
            style={{
              paddingLeft: 34,
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
              e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          />
        </div>
      </div>

      {/* Primary Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          onClick={onAddNote || onCreateNote}
          aria-label="Create new note"
          title="Add Note"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
          }}
        >
          <span>➕</span>
          <span style={{ fontWeight: 700 }}>Add Note</span>
        </button>

        <button
          className="btn-primary"
          onClick={onToggleTheme}
          aria-label={`Switch to ${nextTheme} mode`}
          title="Toggle theme"
          style={{
            width: 44,
            height: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            borderRadius: 12,
            boxShadow: '0 8px 16px rgba(37,99,235,0.12)',
            background:
              theme === 'light'
                ? 'linear-gradient(180deg, rgba(59,130,246,0.15), rgba(59,130,246,0.35))'
                : 'linear-gradient(180deg, rgba(59,130,246,0.25), rgba(17,24,39,0.9))',
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
}
