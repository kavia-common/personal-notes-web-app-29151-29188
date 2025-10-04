 // PUBLIC_INTERFACE
/** Default note shape used across the application. */
export const DEFAULT_NOTE = {
  id: '',
  title: '',
  content: '',
  tags: [],
  createdAt: 0,
  updatedAt: 0,
  pinned: false,
};

// PUBLIC_INTERFACE
/** Storage keys used for localStorage persistence. */
export const KEYS = {
  notes: 'notes_app.notes',
  settings: 'notes_app.settings',
};
