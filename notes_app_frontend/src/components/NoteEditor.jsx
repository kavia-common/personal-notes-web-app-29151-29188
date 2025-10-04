import React from 'react';

/**
 * NoteEditor modal placeholder for creating/editing a note.
 *
 * Props:
 * - mode: 'create' | 'edit'
 * - note: Note
 * - onClose: () => void
 * - onSave: (noteData: any) => void
 */
export function NoteEditor({ mode = 'create', note, onClose, onSave }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'edit' ? 'Edit note' : 'Create note'}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 'min(720px, 100%)', padding: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{mode === 'edit' ? 'Edit Note' : 'New Note'}</h3>
          <button className="btn-primary" onClick={onClose} style={{ marginLeft: 'auto' }}>
            Close
          </button>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          This is a placeholder editor. Full functionality will be implemented in the next steps.
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn-primary" onClick={() => onSave?.(note)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
