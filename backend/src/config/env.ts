import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV:  z.enum(['development', 'production', 'test']).default('development'),
  PORT:      z.string().default('4000').transform(Number),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // PostgreSQL
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_ACCESS_SECRET:   z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET:  z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // DigitalOcean Spaces
  DO_SPACES_KEY:      z.string().min(1, 'DO_SPACES_KEY is required'),
  DO_SPACES_SECRET:   z.string().min(1, 'DO_SPACES_SECRET is required'),
  DO_SPACES_ENDPOINT: z.string().url('DO_SPACES_ENDPOINT must be a valid URL'),
  DO_SPACES_BUCKET:   z.string().min(1, 'DO_SPACES_BUCKET is required'),
  DO_SPACES_CDN_URL:  z.string().url('DO_SPACES_CDN_URL must be a valid URL'),

  // RAG Service
  RAG_SERVICE_URL:    z.string().url().default('http://localhost:8000'),
  RAG_SERVICE_SECRET: z.string().min(16, 'RAG_SERVICE_SECRET must be at least 16 chars'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // BCRYPT
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n❌  Invalid environment variables:\n');
    result.error.issues.forEach(issue => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\nFix the above variables in your .env file and restart.\n');
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
export type Env  = typeof env;
