import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Helper to render the app with a clean localStorage between tests
function renderApp() {
  // Ensure a clean state so tests are deterministic
  window.localStorage.clear();
  return render(<App />);
}

describe('Notes App smoke and interaction tests', () => {
  test('renders header with Add Note button', () => {
    renderApp();

    // Header title
    expect(screen.getByLabelText(/Application header/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/App title/i)).toHaveTextContent(/Ocean Notes/i);

    // Add Note button (primary requirement)
    const addBtn = screen.getByRole('button', { name: /add note/i });
    expect(addBtn).toBeInTheDocument();

    // Search field also present
    expect(screen.getByRole('searchbox', { name: /search notes/i })).toBeInTheDocument();

    // Notes list region present
    expect(screen.getByRole('region', { name: /notes list/i })).toBeInTheDocument();
  });

  test('opens NoteEditor modal when clicking Add Note', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /add note/i }));

    // Modal shows up with correct role/labels
    const dialog = screen.getByRole('dialog', { name: /create note|edit note/i });
    expect(dialog).toBeInTheDocument();

    // Title input should receive focus and be present
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveFocus();
  });

  test('creates a note via modal save and it appears in NotesList', async () => {
    const user = userEvent.setup();
    renderApp();

    // Open the editor
    await user.click(screen.getByRole('button', { name: /add note/i }));

    // Fill in fields
    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const tagsInput = screen.getByLabelText(/add tags/i);

    await user.type(titleInput, 'Test Note');
    await user.type(contentInput, 'This is the content of the test note.');
    await user.type(tagsInput, 'work,urgent{Enter}');

    // Save
    await user.click(screen.getByRole('button', { name: /save note/i }));

    // Modal should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Note should appear in list
    const notesRegion = screen.getByRole('region', { name: /notes list/i });
    const list = within(notesRegion).getByRole('list', { name: /filtered notes/i });

    // Find the created note list item by its title text
    const createdNoteTitle = await within(list).findByText('Test Note');
    expect(createdNoteTitle).toBeInTheDocument();

    // Optional: Verify tag chips appear (hash chip shows #work and #urgent)
    expect(within(list).getAllByText(/work|urgent/i).length).toBeGreaterThan(0);
  });

  test('deletes a note and it is removed from the list', async () => {
    const user = userEvent.setup();
    renderApp();

    // Create one note first
    await user.click(screen.getByRole('button', { name: /add note/i }));
    await user.type(screen.getByLabelText(/title/i), 'To Delete');
    await user.click(screen.getByRole('button', { name: /save note/i }));
    const list = screen.getByRole('list', { name: /filtered notes/i });
    expect(await within(list).findByText('To Delete')).toBeInTheDocument();

    // Mock confirm to auto-accept deletion
    const originalConfirm = window.confirm;
    window.confirm = () => true;

    // Find the note card and its delete button
    // We search for the article (listitem) that contains the "To Delete" title.
    const items = within(list).getAllByRole('listitem');
    const targetItem = items.find((it) =>
      within(it).queryByText('To Delete')
    );
    expect(targetItem).toBeTruthy();

    const deleteBtn = within(targetItem).getByRole('button', { name: /delete note/i });
    await user.click(deleteBtn);

    // Restore confirm
    window.confirm = originalConfirm;

    // Ensure the note disappears
    expect(within(list).queryByText('To Delete')).not.toBeInTheDocument();
  });
});
