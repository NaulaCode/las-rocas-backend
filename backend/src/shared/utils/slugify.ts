export function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

export function generateUniqueSlug(base: string, taken: Set<string>): string {
  let candidate = base || 'item';
  let i = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}
