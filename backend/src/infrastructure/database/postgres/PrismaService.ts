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
    await getPrisma().$queryRaw`SELECT NOW() as current_time`;
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
