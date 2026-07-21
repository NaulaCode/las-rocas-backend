import app from './app';
import { config } from './shared/config/config';
import { log } from './shared/logger/logger';
import { testPrismaConnection, disconnectPrisma } from './infrastructure/database/postgres/PrismaService';
import { wsManager } from './infrastructure/websocket/WebSocketManager';
import { reminderScheduler, sessionCleanupScheduler } from './di/container';
import { ensurePgvector } from './infrastructure/database/postgres/enablePgvector';

const startServer = async (): Promise<void> => {
  try {
    // 1. Verificar conexión a PostgreSQL (con timeout, no bloquea el server si falla)
    log.info('🔌 Conectando a PostgreSQL...');
    try {
      await testPrismaConnection();
    } catch (e) {
      log.warn('No se pudo conectar a PostgreSQL, iniciando server igual', e);
    }

    // 2. Iniciar el servidor HTTP (antes de pgvector para no bloquear el puerto)
    const server = app.listen(config.server.port, () => {
      // 3. Inicializar WebSocket sobre el mismo servidor HTTP
      wsManager.initialize(server);
      
      reminderScheduler.start();
      sessionCleanupScheduler.start();

      log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      log.info('🌿 Las Rocas - Servidor iniciado');
      log.info(`📍 Entorno:  ${config.server.nodeEnv}`);
      log.info(`🚀 Puerto:   ${config.server.port}`);
      log.info(`🔗 URL:      http://localhost:${config.server.port}/api/${config.server.apiVersion}`);
      log.info(`❤️  Health:  http://localhost:${config.server.port}/api/${config.server.apiVersion}/health`);
      log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // pgvector se inicializa async después del listen (falla silenciosamente si no hay soporte)
      ensurePgvector();
    });

    // 3. Cierre limpio al apagar el servidor
    const shutdown = async (signal: string) => {
      log.info(`\n📴 Señal ${signal} recibida. Cerrando...`);
      server.close(async () => {
        await disconnectPrisma();
        log.info('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    log.error('❌ Error al iniciar el servidor', error);
    process.exit(1);
  }
};

// Errores no controlados
process.on('unhandledRejection', (reason) => {
  log.error('Error no manejado:', reason);
});

process.on('uncaughtException', (error) => {
  log.error('Excepción no capturada:', error);
  process.exit(1);
});

startServer();
