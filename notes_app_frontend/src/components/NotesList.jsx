import React, { useMemo } from 'react';

/**
 * NotesList component to display filtered notes and allow selection/edit.
 *
 * Props:
 * - notes: Array<Note>
 * - selectedNoteId: string|null
 * - onSelectNote: (id: string) => void
 * - onEditNote: (id: string) => void
 * - searchQuery: string
 * - selectedTag: string|null
 */
export function NotesList({
  notes = [],
  selectedNoteId = null,
  onSelectNote,
  onEditNote,
  searchQuery = '',
  selectedTag = null,
}) {
  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return notes.filter(n => {
      const matchesQ =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (Array.isArray(n.tags) ? n.tags.some(t => String(t).toLowerCase().includes(q)) : false);
      const matchesTag = selectedTag == null || (Array.isArray(n.tags) && n.tags.includes(selectedTag));
      return matchesQ && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  return (
    <div className="card" role="region" aria-label="Notes list">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Notes</h2>
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>
          {filtered.length} item{filtered.length === 1 ? '' : 's'}
        </span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--muted)' }}>No notes yet</div>
        )}
        {filtered.map(n => (
          <div
            key={n.id}
            className="input"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              background: selectedNoteId === n.id ? 'rgba(37,99,235,0.08)' : undefined,
            }}
            role="button"
            tabIndex={0}
            onClick={() => onSelectNote?.(n.id)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectNote?.(n.id); }}
          >
            <div style={{ fontWeight: 600 }}>{n.title || '(Untitled)'}</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); onEditNote?.(n.id); }}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
