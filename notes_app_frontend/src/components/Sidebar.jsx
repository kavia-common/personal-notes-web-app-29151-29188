import React, { useMemo } from 'react';

/**
 * Sidebar component listing tags with basic selection interactions.
 *
 * Props:
 * - notes: Array<Note>
 * - selectedTag: string|null
 * - onSelectTag: (tag: string) => void
 * - onClearTag: () => void
 */
export function Sidebar({ notes = [], selectedTag = null, onSelectTag, onClearTag }) {
  // Gather unique tags from notes
  const tags = useMemo(() => {
    const s = new Set();
    notes.forEach(n => Array.isArray(n.tags) && n.tags.forEach(t => s.add(String(t))));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  return (
    <nav>
      <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 14, color: 'var(--muted)' }}>Tags</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="input"
          style={{ textAlign: 'left', background: selectedTag === null ? 'rgba(37,99,235,0.08)' : undefined }}
          onClick={onClearTag}
          aria-current={selectedTag === null ? 'true' : 'false'}
        >
          All
        </button>
        {tags.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>No tags yet</div>
        )}
        {tags.map(tag => (
          <button
            key={tag}
            className="input"
            style={{ textAlign: 'left', background: selectedTag === tag ? 'rgba(37,99,235,0.08)' : undefined }}
            onClick={() => onSelectTag?.(tag)}
            aria-current={selectedTag === tag ? 'true' : 'false'}
          >
            #{tag}
          </button>
        ))}
      </div>
    </nav>
  );
}
