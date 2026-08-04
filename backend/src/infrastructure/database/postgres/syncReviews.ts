import { getPrisma, disconnectPrisma } from './PrismaService';
import { log } from '../../../shared/logger/logger';

async function run() {
  log.info('Sincronizando reseñas aprobadas a pageContent.reviews...');
  const prisma = getPrisma();

  const org = await prisma.organization.findFirst();
  if (!org) {
    log.warn('No se encontró la organización.');
    await disconnectPrisma();
    process.exit(0);
  }

  const approved = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
  });

  const reviews = approved.map((r) => ({
    id: r.id,
    name: r.name,
    text: r.text,
    rating: r.rating,
    date: r.createdAt.toISOString(),
    approved: true,
    serviceName: r.serviceName,
    role: r.role,
  }));

  const pageContent = org.pageContent as Record<string, any> | null || {};
  await prisma.organization.update({
    where: { id: org.id },
    data: { pageContent: { ...pageContent, reviews } as any },
  });

  log.info(`Sincronizadas ${reviews.length} reseñas aprobadas.`);
  await disconnectPrisma();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error sincronizando reseñas:', err);
  process.exit(1);
});
