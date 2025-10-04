import React, { useMemo } from 'react';

/**
 * Sidebar component listing tags and filter controls with accessible chip buttons.
 *
 * Props:
 * - notes: Array<Note>
 * - selectedTag: string|null
 * - onSelectTag: (tag: string) => void
 * - onClearTag: () => void
 * - showPinned?: boolean
 * - onTogglePinned?: (next: boolean) => void
 */
export function Sidebar({
  notes = [],
  selectedTag = null,
  onSelectTag,
  onClearTag,
  showPinned,
  onTogglePinned,
}) {
  // Compute tag counts from notes
  const { tagCounts, totalCount, pinnedCount } = useMemo(() => {
    const counts = new Map();
    let pinned = 0;
    for (const n of notes) {
      if (n?.pinned) pinned += 1;
      if (Array.isArray(n?.tags)) {
        for (const t of n.tags) {
          const key = String(t);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }
    // Sort tags alphabetically for stable order
    const sorted = Array.from(counts.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    return { tagCounts: sorted, totalCount: notes.length, pinnedCount: pinned };
  }, [notes]);

  const isPinnedEnabled = typeof showPinned === 'boolean' && typeof onTogglePinned === 'function';

  return (
    <nav aria-label="Sidebar filters and tags">
      {/* Filters section */}
      <div style={{ marginBottom: 12 }}>
        <div className="sidebar-section-title">Filters</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* Pinned toggle (optional) */}
          {isPinnedEnabled && (
            <button
              type="button"
              className={`chip ${showPinned ? 'chip-active chip-accent' : ''}`}
              aria-pressed={showPinned ? 'true' : 'false'}
              onClick={() => onTogglePinned?.(!showPinned)}
              title="Show only pinned notes"
            >
              <span style={{ marginRight: 6 }}>📌</span>
              Pinned
              <span className="chip-count" aria-label={`${pinnedCount} pinned`}>
                {pinnedCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tags section */}
      <div>
        <div className="sidebar-section-title">Tags</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* All chip */}
          <button
            type="button"
            className={`chip ${selectedTag === null ? 'chip-active' : ''}`}
            aria-pressed={selectedTag === null ? 'true' : 'false'}
            onClick={onClearTag}
            title="Show all notes"
          >
            All
            <span className="chip-count" aria-label={`${totalCount} total`}>
              {totalCount}
            </span>
          </button>

          {/* Empty state */}
          {tagCounts.length === 0 && (
            <span className="muted small">No tags yet</span>
          )}

          {/* Tag chips */}
          {tagCounts.map(([tag, count]) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                className={`chip ${active ? 'chip-active' : ''}`}
                aria-pressed={active ? 'true' : 'false'}
                onClick={() => onSelectTag?.(tag)}
                title={`Filter by #${tag}`}
              >
                <span className="chip-hash">#</span>
                {tag}
                <span className="chip-count" aria-label={`${count} notes with tag ${tag}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
