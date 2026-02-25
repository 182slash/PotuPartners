import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { checkDbConnection } from './config/database';
import { logger, httpLogStream } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './utils/errors';

import authRoutes         from './modules/auth/auth.routes';
import usersRoutes        from './modules/users/users.routes';
import conversationsRoutes from './modules/conversations/conversations.routes';
import messagesRoutes     from './modules/messages/messages.routes';
import { convMessagesRouter } from './modules/messages/messages.routes';
import filesRoutes        from './modules/files/files.routes';
import adminRoutes        from './modules/admin/admin.routes';
import aiRoutes           from './modules/admin/ai.routes';

import { registerChatHandlers } from './socket/chatHandler';

// ─── App setup ────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      env.CORS_ORIGIN.split(',').map(s => s.trim()),
    credentials: true,
    methods:     ['GET', 'POST'],
  },
  transports:           ['websocket', 'polling'],
  pingTimeout:          30_000,
  pingInterval:         25_000,
  maxHttpBufferSize:    5e6,   // 5MB for file metadata
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,  // 2 minutes
    skipMiddlewares: true,
  },
});

registerChatHandlers(io);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy:     false,  // Let Nginx handle CSP headers
}));

// CORS
app.use(cors({
  origin:      (origin, cb) => {
    const allowed = env.CORS_ORIGIN.split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: Origin '${origin}' not permitted`));
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Secret'],
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      300,
  message:  { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,   // Stricter for auth endpoints
  message:  { success: false, error: 'Too many authentication attempts' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      50,
  message:  { success: false, error: 'Upload limit reached' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/files/', uploadLimiter);
app.use('/api/admin/rag-documents', uploadLimiter);

// ─── Parsing middleware ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ─── HTTP logging ─────────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: httpLogStream,
  skip:   (req) => req.url === '/health',
}));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    env:     env.NODE_ENV,
    uptime:  process.uptime(),
    ts:      new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/users',            usersRoutes);
app.use('/api/conversations',    conversationsRoutes);
app.use('/api/conversations/:id/messages', convMessagesRouter);
app.use('/api/messages',         messagesRoutes);
app.use('/api/files',            filesRoutes);
app.use('/api/admin',            adminRoutes);
app.use('/api/ai',               aiRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Graceful shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

// ─── Start server ─────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await checkDbConnection();

    server.listen(env.PORT, () => {
      logger.info(`🚀  PotuPartners API running on port ${env.PORT}`, {
        env:     env.NODE_ENV,
        port:    env.PORT,
        pid:     process.pid,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
}

bootstrap();

export { app, server, io };
