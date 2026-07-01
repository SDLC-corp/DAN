import React, { useEffect, useState } from 'react';
import { Button, Comment, Form, Header, Icon, Loader, TextArea } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { addDocumentNote, deleteDocumentNote, getDocumentNotes } from './documentNotesApi';

/**
 * DocumentNotes
 * -------------
 * A self-contained panel for viewing, adding and (soft-)deleting the notes
 * attached to a single document. It mirrors the dan-api documentnotes module:
 * list (GET) / add (POST) / soft-delete (DELETE).
 *
 * @param {Object}   props
 * @param {string}   props.documentId - The document whose notes are shown. When
 *                                       falsy, the panel renders nothing.
 * @param {Function} [props.onChange]  - Optional callback fired after any note is
 *                                       added or deleted, with the fresh list.
 * @returns {JSX.Element|null}
 */
const DocumentNotes = ({ documentId, onChange }) => {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Loads the active notes for the current document into state. Errors are
   * surfaced via SweetAlert; the loading flag drives the spinner.
   *
   * @returns {Promise<void>}
   */
  const fetchNotes = async () => {
    if (!documentId) return;
    try {
      setLoading(true);
      const res = await getDocumentNotes(documentId);
      if (res?.status === 200) {
        const list = res?.data?.data || [];
        setNotes(list);
        if (typeof onChange === 'function') onChange(list);
      } else {
        Swal.fire({ title: 'Error!', text: res?.data?.data || 'Unable to load notes', icon: 'error' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: error?.message || 'Something went wrong!', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  /**
   * Persists the note currently typed in the textarea. Guards against empty
   * input and double-submits, then refreshes the list on success.
   *
   * @returns {Promise<void>}
   */
  const handleAdd = async () => {
    const body = text.trim();
    if (!body || saving) return;
    try {
      setSaving(true);
      const res = await addDocumentNote({ notes: body, documentId });
      if (res?.status === 200) {
        setText('');
        await fetchNotes();
      } else {
        Swal.fire({ title: 'Error!', text: res?.data?.data || 'Unable to add note', icon: 'error' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: error?.message || 'Something went wrong!', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Confirms, then soft-deletes a note by id and refreshes the list.
   *
   * @param {string} noteId - The note to remove.
   * @returns {Promise<void>}
   */
  const handleDelete = async (noteId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This note will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await deleteDocumentNote(noteId);
      if (res?.status === 200) {
        await fetchNotes();
      } else {
        Swal.fire({ title: 'Error!', text: res?.data?.data || 'Unable to delete note', icon: 'error' });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: error?.message || 'Something went wrong!', icon: 'error' });
    }
  };

  if (!documentId) return null;

  return (
    <div style={{ padding: 10 }}>
      <Header as="h4" dividing>Document Notes</Header>

      {loading ? (
        <Loader active inline="centered" size="small" />
      ) : (
        <Comment.Group>
          {notes.length === 0 && <p style={{ color: '#888' }}>No notes yet.</p>}
          {notes.map((note) => (
            <Comment key={note._id}>
              <Comment.Content>
                <Comment.Author as="span">{note?.userdata?.name || 'Unknown'}</Comment.Author>
                {note.createdAt && (
                  <Comment.Metadata>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </Comment.Metadata>
                )}
                <Comment.Text>{note.notes}</Comment.Text>
                <Comment.Actions>
                  <Comment.Action onClick={() => handleDelete(note._id)}>
                    <Icon name="trash" /> Delete
                  </Comment.Action>
                </Comment.Actions>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      )}

      <Form reply onSubmit={handleAdd}>
        <TextArea
          rows={2}
          placeholder="Add a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="submit"
          content="Add Note"
          labelPosition="left"
          icon="edit"
          primary
          size="small"
          style={{ marginTop: 8 }}
          loading={saving}
          disabled={saving || !text.trim()}
        />
      </Form>
    </div>
  );
};

export default DocumentNotes;
