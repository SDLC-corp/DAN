import { apiGET, apiPOST, apiDELETE } from '../../../utils/apiHelper';

/**
 * documentNotesApi
 * ----------------
 * Thin wrappers around the Document Notes REST endpoints. Keeping the URLs in
 * one place means the UI components don't hard-code paths and the API surface
 * can change in a single spot.
 *
 * Backend routes (see dan-api documentnotes module):
 *   GET    /v1/documentnotes/:documentId  -> list active notes for a document
 *   POST   /v1/documentnotes/             -> add a note
 *   DELETE /v1/documentnotes/:noteId      -> soft-delete a note (active = false)
 */

/**
 * Fetch all active notes for a document (author name joined in by the API).
 *
 * @param {string} documentId - The parent document's id.
 * @returns {Promise<import('axios').AxiosResponse>} Axios-style response.
 */
export async function getDocumentNotes(documentId) {
  return apiGET(`/v1/documentnotes/${documentId}`);
}

/**
 * Create a new note against a document.
 *
 * @param {Object} payload
 * @param {string} payload.notes      - The note body (required by the API).
 * @param {string} payload.documentId - The document to attach the note to.
 * @returns {Promise<import('axios').AxiosResponse>} Axios-style response.
 */
export async function addDocumentNote({ notes, documentId }) {
  return apiPOST('/v1/documentnotes/', { notes, documentId });
}

/**
 * Soft-delete a single note by id (the record is kept, `active` is set false).
 *
 * @param {string} noteId - The note's id.
 * @returns {Promise<import('axios').AxiosResponse>} Axios-style response.
 */
export async function deleteDocumentNote(noteId) {
  return apiDELETE(`/v1/documentnotes/${noteId}`);
}
