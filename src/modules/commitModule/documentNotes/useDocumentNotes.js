import { useCallback, useEffect, useState } from 'react';
import {
  addDocumentNote,
  deleteDocumentNote,
  getDocumentNotes,
  updateDocumentNote,
} from './documentNotesApi';

/**
 * useDocumentNotes
 * ----------------
 * Owns all list/add/edit/delete state for one document's notes so components
 * only deal with rendering. Mirrors the dan-api commitModule endpoints.
 *
 * The hook is intentionally presentation-agnostic: it never shows a SweetAlert
 * or a toast. Each mutation resolves to `{ ok, error, data }` and the caller
 * decides how to surface failures, which keeps the hook reusable in places that
 * want inline errors instead of modals.
 *
 * @param {string} documentId - Parent document id. When falsy, no request is
 *                              made and `notes` stays an empty array.
 * @returns {{
 *   notes: Array<Object>,
 *   loading: boolean,
 *   saving: boolean,
 *   error: string|null,
 *   refresh: () => Promise<{ok: boolean, error: string|null, data: Array<Object>}>,
 *   addNote: (notes: string) => Promise<{ok: boolean, error: string|null, data: Object|null}>,
 *   editNote: (noteId: string, notes: string) => Promise<{ok: boolean, error: string|null, data: Object|null}>,
 *   removeNote: (noteId: string) => Promise<{ok: boolean, error: string|null, data: Object|null}>,
 * }}
 */
const useDocumentNotes = (documentId) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Normalises an axios-style response (including the `error.response`
   * shape apiHelper resolves with on failure) into the hook's result object.
   *
   * @param {Object} res - Response returned by an apiHelper call.
   * @param {string} fallback - Message used when the API sends none.
   */
  const toResult = (res, fallback) => {
    if (res?.status === 200) return { ok: true, error: null, data: res?.data?.data ?? null };
    const message = res?.data?.data || res?.data?.message || fallback;
    return { ok: false, error: message, data: null };
  };

  const refresh = useCallback(async () => {
    if (!documentId) return { ok: true, error: null, data: [] };
    setLoading(true);
    setError(null);
    try {
      const res = await getDocumentNotes(documentId);
      const result = toResult(res, 'Unable to load notes');
      if (result.ok) setNotes(result.data || []);
      else setError(result.error);
      return { ...result, data: result.data || [] };
    } catch (err) {
      const message = err?.message || 'Something went wrong!';
      setError(message);
      return { ok: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Runs a mutation, then refreshes the list on success. `saving` is held for
   * the whole cycle so a submit button stays disabled until the list is fresh.
   *
   * @param {() => Promise<Object>} call - The apiHelper call to run.
   * @param {string} fallback - Error message used when the API sends none.
   */
  const mutate = async (call, fallback) => {
    if (saving) return { ok: false, error: 'A save is already in progress', data: null };
    setSaving(true);
    setError(null);
    try {
      const result = toResult(await call(), fallback);
      if (result.ok) await refresh();
      else setError(result.error);
      return result;
    } catch (err) {
      const message = err?.message || 'Something went wrong!';
      setError(message);
      return { ok: false, error: message, data: null };
    } finally {
      setSaving(false);
    }
  };

  const addNote = async (body) => {
    const text = (body || '').trim();
    if (!text) return { ok: false, error: 'Note cannot be empty', data: null };
    return mutate(() => addDocumentNote({ notes: text, documentId }), 'Unable to add note');
  };

  const editNote = async (noteId, body) => {
    const text = (body || '').trim();
    if (!noteId) return { ok: false, error: 'Missing note id', data: null };
    if (!text) return { ok: false, error: 'Note cannot be empty', data: null };
    return mutate(() => updateDocumentNote(noteId, { notes: text }), 'Unable to update note');
  };

  const removeNote = async (noteId) => {
    if (!noteId) return { ok: false, error: 'Missing note id', data: null };
    return mutate(() => deleteDocumentNote(noteId), 'Unable to delete note');
  };

  return { notes, loading, saving, error, refresh, addNote, editNote, removeNote };
};

export default useDocumentNotes;
