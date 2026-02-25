import { query } from '../../config/database';
import {
  uploadToSpaces,
  deleteFromSpaces,
  getPresignedUrl,
  ALLOWED_CHAT_MIME_TYPES,
} from '../../config/storage';
import { validateFileMagicBytes } from '../../middleware/upload.middleware';
import { Errors } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import type { DBFile } from '../../types';

// ─── Upload chat attachment ───────────────────────────────────────────────────
export async function uploadChatFile(
  buffer:         Buffer,
  originalName:   string,
  declaredMime:   string,
  conversationId: string,
  uploaderId:     string,
): Promise<DBFile> {
  // Verify conversation exists and uploader is a participant
  const { rows: convRows } = await query<{ id: string }>(
    `SELECT id FROM conversations
     WHERE id = $1 AND (client_id = $2 OR participant_id = $2)`,
    [conversationId, uploaderId]
  );
  if (convRows.length === 0) throw Errors.forbidden('You are not part of this conversation');

  // Deep MIME validation — check magic bytes, not just header
  const trueMime = await validateFileMagicBytes(buffer, ALLOWED_CHAT_MIME_TYPES);

  const { storageKey, cdnUrl, mimeType } = await uploadToSpaces(
    buffer, trueMime, 'chat-files', originalName
  );

  const id = uuidv4();
  const { rows } = await query<DBFile>(
    `INSERT INTO files
       (id, conversation_id, uploader_id, original_name, storage_key, storage_url, mime_type, file_size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [id, conversationId, uploaderId, originalName, storageKey, cdnUrl, mimeType, buffer.length]
  );

  return rows[0];
}

// ─── Get presigned URL for private file ──────────────────────────────────────
export async function getFileDownloadUrl(
  fileId: string,
  userId: string,
): Promise<{ url: string; filename: string }> {
  const { rows } = await query<DBFile & { client_id: string; participant_id: string }>(
    `SELECT f.*, c.client_id, c.participant_id
     FROM files f
     JOIN conversations c ON c.id = f.conversation_id
     WHERE f.id = $1`,
    [fileId]
  );

  if (rows.length === 0) throw Errors.notFound('File');

  const file = rows[0];

  // Verify access
  if (file.client_id !== userId && file.participant_id !== userId) {
    throw Errors.forbidden('Access denied');
  }

  // If public CDN url — just return it (images, public files)
  if (file.mime_type.startsWith('image/')) {
    return { url: file.storage_url, filename: file.original_name };
  }

  // Generate presigned URL for private files
  const url = await getPresignedUrl(file.storage_key);
  return { url, filename: file.original_name };
}

// ─── Delete a file ────────────────────────────────────────────────────────────
export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const { rows } = await query<DBFile>(
    'SELECT * FROM files WHERE id = $1',
    [fileId]
  );

  if (rows.length === 0) throw Errors.notFound('File');

  const file = rows[0];

  if (file.uploader_id !== userId) {
    throw Errors.forbidden('You can only delete your own files');
  }

  await deleteFromSpaces(file.storage_key);
  await query('DELETE FROM files WHERE id = $1', [fileId]);
}
