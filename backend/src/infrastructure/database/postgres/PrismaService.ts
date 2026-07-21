import { PrismaClient } from '@prisma/client';
import { log } from '../../../shared/logger/logger';

let prisma: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const testPrismaConnection = async (): Promise<void> => {
  try {
    await Promise.race([
      getPrisma().$queryRaw`SELECT NOW() as current_time`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout conectando a PostgreSQL (15s)')), 15000)),
    ]);
    log.info('Prisma connected to PostgreSQL');
  } catch (error) {
    log.error('Error connecting Prisma to PostgreSQL', error);
    throw error;
  }
};

export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    log.info('Prisma disconnected');
  }
};
