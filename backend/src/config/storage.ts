import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const s3 = new S3Client({
  endpoint:         env.DO_SPACES_ENDPOINT,
  region:           'us-east-1',   // DO Spaces uses this regardless of region
  credentials: {
    accessKeyId:     env.DO_SPACES_KEY,
    secretAccessKey: env.DO_SPACES_SECRET,
  },
  forcePathStyle:  false,
});

// ─── Allowed MIME types ───────────────────────────────────────────────────────
export const ALLOWED_CHAT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const ALLOWED_RAG_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const MAX_CHAT_FILE_SIZE = 25 * 1024 * 1024;  // 25 MB
export const MAX_RAG_FILE_SIZE  = 50 * 1024 * 1024;  // 50 MB

// ─── Upload a buffer / stream to Spaces ──────────────────────────────────────
export interface UploadResult {
  storageKey: string;
  cdnUrl:     string;
  mimeType:   string;
}

export async function uploadToSpaces(
  buffer:      Buffer,
  mimeType:    string,
  folder:      'chat-files' | 'rag-documents' | 'avatars',
  originalName: string,
): Promise<UploadResult> {
  const ext        = path.extname(originalName).toLowerCase();
  const storageKey = `${folder}/${uuidv4()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket:       env.DO_SPACES_BUCKET,
      Key:          storageKey,
      Body:         buffer,
      ContentType:  mimeType,
      ACL:          folder === 'rag-documents' ? 'private' : 'public-read',
      CacheControl: 'max-age=31536000',
    })
  );

  const cdnUrl = `${env.DO_SPACES_CDN_URL}/${storageKey}`;
  logger.info('File uploaded to Spaces', { storageKey, mimeType });

  return { storageKey, cdnUrl, mimeType };
}

// ─── Delete from Spaces ───────────────────────────────────────────────────────
export async function deleteFromSpaces(storageKey: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key:    storageKey,
    })
  );
  logger.info('File deleted from Spaces', { storageKey });
}

// ─── Generate presigned URL (for private RAG docs) ───────────────────────────
export async function getPresignedUrl(
  storageKey: string,
  expiresInSeconds = 900,  // 15 minutes
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.DO_SPACES_BUCKET,
    Key:    storageKey,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
