import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * NoteEditor
 * Accessible modal dialog for creating or editing a note.
 * - Fields: title (required), content (textarea), tags (tokenized via comma/Enter)
 * - Behavior: Save/Cancel actions, ESC or outside click closes, focus trap
 * - Validation: Title required; inline error uses Ocean error color
 *
 * Props:
 * - isOpen: boolean
 * - mode: 'create' | 'edit'
 * - initialNote: { id?, title, content, tags[], createdAt?, updatedAt? }
 * - onSave: (notePayload) => void
 * - onCancel: () => void
 */
export function NoteEditor({
  isOpen = false,
  mode = 'create',
  initialNote = { title: '', content: '', tags: [] },
  onSave,
  onCancel,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const prevActiveElement = useRef(null);

  const isEdit = mode === 'edit';

  // Initialize or reset fields based on mode and initialNote when opened
  useEffect(() => {
    if (!isOpen) return;
    const base = initialNote || {};
    setTitle(isEdit ? (base.title || '') : '');
    setContent(isEdit ? (base.content || '') : '');
    setTags(Array.isArray(base.tags) ? base.tags : []);
    setTagInput('');
    setError('');
  }, [isOpen, isEdit, initialNote]);

  // Save previously focused element and focus first field when opened
  useEffect(() => {
    if (!isOpen) return;
    prevActiveElement.current = document.activeElement;
    // Defer focus to next tick to ensure elements are mounted
    const t = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 0);
    return () => {
      clearTimeout(t);
      // Restore focus to previously focused element
      if (prevActiveElement.current && typeof prevActiveElement.current.focus === 'function') {
        try { prevActiveElement.current.focus(); } catch { /* no-op */ }
      }
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel?.();
      }
      // Focus trap with Tab
      if (e.key === 'Tab') {
        const focusable = getFocusable(dialogRef.current);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [isOpen, onCancel]);

  const dialogTitle = useMemo(
    () => (isEdit ? 'Edit Note' : 'Create Note'),
    [isEdit]
  );

  // Helpers
  function normalizeTag(t) {
    return String(t || '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/,+/g, '')
      .toLowerCase();
  }

  function addTagFromInput() {
    const raw = tagInput;
    const split = raw.split(',').map(normalizeTag).filter(Boolean);
    if (split.length === 0) return;
    setTags(prev => {
      const set = new Set(prev.map(normalizeTag));
      for (const s of split) set.add(s);
      return Array.from(set);
    });
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => normalizeTag(t) !== normalizeTag(tag)));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === 'Backspace' && tagInput.length === 0 && tags.length > 0) {
      e.preventDefault();
      // Remove last tag
      setTags(prev => prev.slice(0, prev.length - 1));
    }
  }

  function handleSave() {
    const t = (title || '').trim();
    if (t.length === 0) {
      setError('Title is required.');
      firstFocusableRef.current?.focus();
      return;
    }
    const payload = {
      ...(isEdit && initialNote?.id ? { id: initialNote.id } : {}),
      title: t,
      content: content || '',
      tags: tags,
      ...(isEdit && initialNote?.createdAt ? { createdAt: initialNote.createdAt } : {}),
      ...(isEdit ? { updatedAt: Date.now() } : { createdAt: Date.now(), updatedAt: Date.now() }),
    };
    onSave?.(payload);
  }

  // Overlay click closes
  function onOverlayClick(e) {
    if (e.target === overlayRef.current) {
      onCancel?.();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-editor-title"
      aria-describedby="note-editor-desc"
      onClick={onOverlayClick}
    >
      <div ref={dialogRef} className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="note-editor-title" className="modal-title">{dialogTitle}</h3>
          <button
            ref={lastFocusableRef}
            type="button"
            className="btn-primary btn-ghost"
            aria-label="Close editor"
            onClick={onCancel}
          >
            ✖
          </button>
        </div>

        <p id="note-editor-desc" className="muted small" style={{ marginTop: 0 }}>
          {isEdit ? 'Update your note details.' : 'Fill in details for your new note.'}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Title */}
          <div className="form-field">
            <label htmlFor="note-title" className="form-label">
              Title <span className="required-asterisk" aria-hidden="true">*</span>
            </label>
            <input
              id="note-title"
              ref={firstFocusableRef}
              type="text"
              className={`input ${error ? 'input-error' : ''}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'title-error' : undefined}
              placeholder="Enter a title"
            />
            {error && (
              <div id="title-error" className="error-text" role="alert">
                {error}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="form-field">
            <label htmlFor="note-content" className="form-label">Content</label>
            <textarea
              id="note-content"
              className="input textarea"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
            />
          </div>

          {/* Tags */}
          <div className="form-field">
            <label htmlFor="note-tags" className="form-label">Tags</label>
            <div className="tags-input-wrapper" onClick={() => firstTaggable()?.focus()}>
              <div className="tags-chips">
                {tags.map((t) => (
                  <span key={t} className="chip chip-small" aria-label={`Tag ${t}`} title={`Tag: ${t}`}>
                    <span className="chip-hash">#</span>
                    {t}
                    <button
                      type="button"
                      className="chip-remove btn-ghost"
                      aria-label={`Remove tag ${t}`}
                      onClick={() => removeTag(t)}
                    >
                      ✖
                    </button>
                  </span>
                ))}
                <input
                  id="note-tags"
                  type="text"
                  className="tags-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTagFromInput}
                  placeholder="Add tags (comma or Enter)"
                  aria-label="Add tags"
                />
              </div>
            </div>
            <div className="muted small" aria-hidden="true">
              Press Enter or comma to add a tag. Backspace removes last tag when empty.
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-primary btn-ghost" onClick={onCancel} aria-label="Cancel">
              Cancel
            </button>
            <button type="submit" className="btn-primary" aria-label="Save note">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function firstTaggable() {
    return dialogRef.current?.querySelector('.tags-input');
  }
}

/** Get all focusable elements within a container (for focus trapping). */
function getFocusable(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(container.querySelectorAll(selectors.join(','))).filter(
    (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  );
}
