import React, { useMemo } from 'react';

/**
 * NotesList component to display filtered notes and allow selection/edit.
 *
 * Props:
 * - notes: Array<Note>
 * - selectedNoteId: string|null
 * - onSelectNote: (id: string) => void
 * - onEditNote: (id: string) => void
 * - onDeleteNote?: (id: string) => void
 * - onTogglePin?: (id: string, next: boolean) => void
 * - searchQuery: string
 * - selectedTag: string|null
 *
 * Rendering rules:
 * - Filter by searchQuery (title, content, tags) and selectedTag
 * - Sort pinned desc, then updatedAt desc
 * - Each card shows title, content preview, tags, updated time, actions
 * - Keyboard accessibility: Enter selects/open edit; action buttons have aria-labels
 */
export function NotesList({
  notes = [],
  selectedNoteId = null,
  onSelectNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  searchQuery = '',
  selectedTag = null,
}) {
  // Compute filtered + sorted notes
  const filteredNotes = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    const filtered = notes.filter((n) => {
      const matchesQ =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (Array.isArray(n.tags) ? n.tags.some((t) => String(t).toLowerCase().includes(q)) : false);
      const matchesTag =
        selectedTag == null ||
        (Array.isArray(n.tags) && n.tags.includes(selectedTag));
      return matchesQ && matchesTag;
    });

    // Sort: pinned first desc, then by updatedAt desc
    return filtered.sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      const aTime = Number(a.updatedAt || 0);
      const bTime = Number(b.updatedAt || 0);
      return bTime - aTime;
    });
  }, [notes, searchQuery, selectedTag]);

  const formatUpdated = (ts) => {
    if (!ts) return 'Never';
    try {
      const d = new Date(ts);
      // e.g., "Updated 2025-01-31 14:05"
      return `Updated ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
        d.getMinutes()
      ).padStart(2, '0')}`;
    } catch {
      return 'Updated recently';
    }
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation();
    const name = title || 'this note';
    if (window.confirm(`Delete ${name}? This action cannot be undone.`)) {
      onDeleteNote?.(id);
    }
  };

  const handleTogglePin = (e, note) => {
    e.stopPropagation();
    const next = !Boolean(note.pinned);
    onTogglePin?.(note.id, next);
  };

  return (
    <div className="card" role="region" aria-label="Notes list">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Notes</h2>
        <span className="muted small" style={{ marginLeft: 'auto' }}>
          {filteredNotes.length} item{filteredNotes.length === 1 ? '' : 's'}
        </span>
      </div>

      <div role="list" aria-label="Filtered notes" style={{ display: 'grid', gap: 10 }}>
        {filteredNotes.length === 0 && (
          <div className="muted" role="note">
            No notes match your filters.
          </div>
        )}

        {filteredNotes.map((n) => {
          const isSelected = selectedNoteId === n.id;
          const preview = (n.content || '').trim().replace(/\s+/g, ' ').slice(0, 140);
          const pinLabel = n.pinned ? 'Unpin note' : 'Pin note';

          return (
            <article
              key={n.id}
              role="listitem"
              aria-selected={isSelected ? 'true' : 'false'}
              className={`note-card ${isSelected ? 'note-card-active' : ''}`}
              tabIndex={0}
              onClick={() => onSelectNote?.(n.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelectNote?.(n.id);
                if (e.key.toLowerCase() === 'e') onEditNote?.(n.id);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                padding: 12,
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow)',
                outline: 'none',
              }}
            >
              {/* Left content: title, preview, tags, meta */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {n.pinned && <span aria-label="Pinned" title="Pinned">📌</span>}
                  <h3
                    style={{ margin: 0, fontSize: 15, lineHeight: 1.3 }}
                    className="note-title"
                  >
                    {n.title?.trim() || '(Untitled)'}
                  </h3>
                </div>

                {preview && (
                  <p className="note-preview muted" style={{ margin: '6px 0 8px', fontSize: 13 }}>
                    {preview}
                    {n.content && n.content.length > preview.length ? '…' : ''}
                  </p>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(Array.isArray(n.tags) ? n.tags : []).map((t) => (
                    <span
                      key={String(t)}
                      className="chip chip-small"
                      aria-label={`Tag ${t}`}
                      title={`Tag: ${t}`}
                    >
                      <span className="chip-hash">#</span>
                      {String(t)}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="muted small" style={{ marginTop: 6 }}>
                  {formatUpdated(n.updatedAt)}
                </div>
              </div>

              {/* Actions */}
              <div
                className="note-actions"
                aria-label="Note actions"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  marginLeft: 8,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn-primary btn-ghost"
                  onClick={(e) => handleTogglePin(e, n)}
                  aria-label={pinLabel}
                  title={pinLabel}
                >
                  {n.pinned ? '📌' : '📍'}
                </button>

                <button
                  type="button"
                  className="btn-primary btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote?.(n.id);
                  }}
                  aria-label="Edit note"
                  title="Edit"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  className="btn-primary btn-danger"
                  onClick={(e) => handleDelete(e, n.id, n.title)}
                  aria-label="Delete note"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
