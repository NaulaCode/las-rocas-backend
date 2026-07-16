import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET || JWT_SECRET === 'secreto_desarrollo') {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(
      'JWT_SECRET no configurado o usando valor por defecto en producción. ' +
      'Configura JWT_SECRET con un valor seguro (openssl rand -hex 32).'
    );
  }
}

export const config = {
  server: {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: parseInt(process.env['PORT'] ?? '4000', 10),
    apiVersion: process.env['API_VERSION'] ?? 'v1',
    isDevelopment: (process.env['NODE_ENV'] ?? 'development') === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
  },

  database: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    name: process.env['DB_NAME'] ?? 'plataforma_turisticas',
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? '',
    ssl: process.env['DB_SSL'] === 'true',
  },

  jwt: {
    secret: JWT_SECRET ?? 'secreto_desarrollo',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  },

  cors: {
    allowedOrigins: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173,http://localhost:3000,http://localhost:3001').split(','),
  },

  logger: {
    level: process.env['LOG_LEVEL'] ?? 'debug',
  },

  ai: {
    geminiApiKey: process.env['GEMINI_API_KEY'] ?? '',
  },

  mail: {
    host: process.env['MAIL_HOST'] ?? '',
    port: parseInt(process.env['MAIL_PORT'] ?? '587', 10),
    secure: process.env['MAIL_SECURE'] === 'true',
    user: process.env['MAIL_USER'] ?? '',
    pass: process.env['MAIL_PASS'] ?? '',
    from: process.env['MAIL_FROM'] ?? 'noreply@lasrocas',
  },

  app: {
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  },

  cloudinary: {
    cloudName: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
    apiKey: process.env['CLOUDINARY_API_KEY'] ?? '',
    apiSecret: process.env['CLOUDINARY_API_SECRET'] ?? '',
  },

  upload: {
    maxFileSize: 100 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/ogg'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.ogg'],
  },

  turnstile: {
    secretKey: process.env['TURNSTILE_SECRET_KEY'] ?? '',
    siteKey: process.env['VITE_TURNSTILE_SITE_KEY'] ?? '',
  },
};