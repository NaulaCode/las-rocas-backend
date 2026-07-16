import { getPrisma, disconnectPrisma } from './PrismaService';
import { log } from '../../../shared/logger/logger';

async function runMigrations() {
  log.info('Prisma connected. Schema is managed by prisma schema.');
  const prisma = getPrisma();
  await prisma.$queryRaw`SELECT 1`;
  log.info('Database connection verified.');
  await disconnectPrisma();
}

runMigrations().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
