import { getPrisma } from './PrismaService';
import { slugify, generateUniqueSlug } from '../../../shared/utils/slugify';
import { log } from '../../../shared/logger/logger';

type SlugModel = 'service' | 'news' | 'touristicAttraction';

const MODELS: { model: SlugModel; nameField: string; fallback: string }[] = [
  { model: 'service', nameField: 'name', fallback: 'servicio' },
  { model: 'news', nameField: 'title', fallback: 'noticia' },
  { model: 'touristicAttraction', nameField: 'name', fallback: 'atractivo' },
];

export async function backfillSlugs(): Promise<void> {
  const prisma = getPrisma();
  try {
    for (const { model, nameField, fallback } of MODELS) {
      const rows: any[] = await (prisma as any)[model].findMany({
        select: { id: true, [nameField]: true, slug: true },
      });
      const taken = new Set<string>();
      for (const r of rows) if (r.slug) taken.add(r.slug);

      let updated = 0;
      for (const r of rows) {
        if (r.slug) continue;
        const slug = generateUniqueSlug(slugify(r[nameField]) || fallback, taken);
        await (prisma as any)[model].update({ where: { id: r.id }, data: { slug } });
        taken.add(slug);
        updated++;
      }
      if (updated > 0) log.info(`🔤 Slugs generados: ${model} (${updated})`);
    }
  } catch (e) {
    log.warn('No se pudieron generar slugs (¿columna ausente?)', e);
  }
}
