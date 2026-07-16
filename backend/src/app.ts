import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './shared/config/config';
import { log } from './shared/logger/logger';
import { AppError, ValidationError } from './domain/errors/AppError';
import { generalLimiter } from './interfaces/http/middlewares/rateLimit';
import authRoutes from './interfaces/http/routes/authRoutes';
import serviceRoutes from './interfaces/http/routes/serviceRoutes';
import newsRoutes from './interfaces/http/routes/newsRoutes';
import reservationRoutes from './interfaces/http/routes/reservationRoutes';
import chatbotRoutes from './interfaces/http/routes/chatbotRoutes';
import organizationRoutes from './interfaces/http/routes/organizationRoutes';
import uploadRoutes from './interfaces/http/routes/uploadRoutes';
import touristicAttractionRoutes from './interfaces/http/routes/touristicAttractionRoutes';
import auditRoutes from './interfaces/http/routes/auditRoutes';
import contactRoutes from './interfaces/http/routes/contactRoutes';
import reviewRoutes from './interfaces/http/routes/reviewRoutes';
import roleRoutes from './interfaces/http/routes/roleRoutes';

const app: Application = express();

// Seguridad HTTP
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Rate limiting global
app.use(generalLimiter);

// Log de requests HTTP
app.use(morgan('dev'));

// Leer JSON del body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz de prueba (sin depender de variables)
app.get('/', (_req, res) => res.json({ status: 'ok', message: 'Las Rocas API' }));

// Ruta de verificación hardcoded (para diagnóstico)
app.get('/health', (_req, res) => res.json({ status: 'ok', message: 'Health hardcoded' }));

// Ruta de verificación
app.get(`/api/${config.server.apiVersion}/health`, (_req, res) => {
  res.json({
    status: 'ok',
    message: '🌿 API Las Rocas funcionando correctamente',
    version: config.server.apiVersion,
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Ruta de bienvenida
app.get(`/api/${config.server.apiVersion}`, (_req, res) => {
  res.json({
    message: '🌿 Bienvenido a la API de Las Rocas Turismo',
  });
});

// Archivos estáticos (imágenes subidas localmente)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Rate limiting por grupo de rutas
app.use(`/api/${config.server.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.server.apiVersion}/services`, serviceRoutes);
app.use(`/api/${config.server.apiVersion}/news`, newsRoutes);
app.use(`/api/${config.server.apiVersion}/reservations`, reservationRoutes);
app.use(`/api/${config.server.apiVersion}/chatbot`, chatbotRoutes);
app.use(`/api/${config.server.apiVersion}/organization`, organizationRoutes);
app.use(`/api/${config.server.apiVersion}/upload`, uploadRoutes);
app.use(`/api/${config.server.apiVersion}/attractions`, touristicAttractionRoutes);
app.use(`/api/${config.server.apiVersion}/audit`, auditRoutes);
app.use(`/api/${config.server.apiVersion}/contact`, contactRoutes);
app.use(`/api/${config.server.apiVersion}/reviews`, reviewRoutes);
app.use(`/api/${config.server.apiVersion}/roles`, roleRoutes);

// Manejo de rutas no encontradas
app.use((_req, _res, next) => {
  next(new AppError('Ruta no encontrada', 404, 'NOT_FOUND'));
});

// Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    log.error(`[${err.code}] ${err.message}`);
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
    });
    return;
  }

  const isSyntaxError = err instanceof SyntaxError && 'body' in err;
  if (isSyntaxError) {
    log.error(`SyntaxError: ${err.message}`);
    res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'JSON mal formado en el cuerpo de la solicitud',
    });
    return;
  }

  const pgError = err as any;
  if (pgError?.code?.startsWith && pgError.code.startsWith('23')) {
    log.error(`PostgreSQL constraint error: ${pgError.message}`);
    let status = 400;
    let code = 'CONSTRAINT_VIOLATION';
    let message = 'Violación de restricción en la base de datos';
    if (pgError.code === '23505') {
      status = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'El recurso ya existe (valor duplicado)';
    } else if (pgError.code === '23503') {
      status = 409;
      code = 'FOREIGN_KEY_VIOLATION';
      message = 'No se puede eliminar porque tiene registros asociados';
    }
    res.status(status).json({ status: 'error', code, message });
    return;
  }

  log.error(`Unexpected error: ${err.message}`, err);
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: config.server.nodeEnv === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
});
export default app;