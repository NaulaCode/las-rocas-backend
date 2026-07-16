import { PrismaClient } from '@prisma/client';

declare const process: { exit(code?: number): never };

const prisma = new PrismaClient();

const permissions = [
  // Usuarios
  { name: 'users:list', module: 'users', action: 'list', label: 'Listar usuarios' },
  { name: 'users:create', module: 'users', action: 'create', label: 'Crear usuarios' },
  { name: 'users:update', module: 'users', action: 'update', label: 'Actualizar usuarios' },
  { name: 'users:delete', module: 'users', action: 'delete', label: 'Eliminar usuarios' },
  // Servicios
  { name: 'services:list', module: 'services', action: 'list', label: 'Listar servicios' },
  { name: 'services:create', module: 'services', action: 'create', label: 'Crear servicios' },
  { name: 'services:update', module: 'services', action: 'update', label: 'Actualizar servicios' },
  { name: 'services:delete', module: 'services', action: 'delete', label: 'Eliminar servicios' },
  // Noticias
  { name: 'news:list', module: 'news', action: 'list', label: 'Listar noticias' },
  { name: 'news:create', module: 'news', action: 'create', label: 'Crear noticias' },
  { name: 'news:update', module: 'news', action: 'update', label: 'Actualizar noticias' },
  { name: 'news:delete', module: 'news', action: 'delete', label: 'Eliminar noticias' },
  // Atracciones
  { name: 'attractions:list', module: 'attractions', action: 'list', label: 'Listar atracciones' },
  { name: 'attractions:create', module: 'attractions', action: 'create', label: 'Crear atracciones' },
  { name: 'attractions:update', module: 'attractions', action: 'update', label: 'Actualizar atracciones' },
  { name: 'attractions:delete', module: 'attractions', action: 'delete', label: 'Eliminar atracciones' },
  // Reservaciones
  { name: 'reservations:list', module: 'reservations', action: 'list', label: 'Listar reservaciones' },
  { name: 'reservations:create', module: 'reservations', action: 'create', label: 'Crear reservaciones' },
  { name: 'reservations:update', module: 'reservations', action: 'update', label: 'Actualizar reservaciones' },
  { name: 'reservations:delete', module: 'reservations', action: 'delete', label: 'Eliminar reservaciones' },
  { name: 'reservations:confirm', module: 'reservations', action: 'confirm', label: 'Confirmar reservaciones' },
  // Chatbot FAQ
  { name: 'chatbot:list', module: 'chatbot', action: 'list', label: 'Listar preguntas FAQ' },
  { name: 'chatbot:create', module: 'chatbot', action: 'create', label: 'Crear preguntas FAQ' },
  { name: 'chatbot:update', module: 'chatbot', action: 'update', label: 'Actualizar preguntas FAQ' },
  { name: 'chatbot:delete', module: 'chatbot', action: 'delete', label: 'Eliminar preguntas FAQ' },
  // Contacto
  { name: 'contact:list', module: 'contact', action: 'list', label: 'Listar mensajes' },
  { name: 'contact:update', module: 'contact', action: 'update', label: 'Gestionar mensajes' },
  // Reseñas
  { name: 'reviews:list', module: 'reviews', action: 'list', label: 'Listar reseñas' },
  { name: 'reviews:approve', module: 'reviews', action: 'approve', label: 'Aprobar reseñas' },
  { name: 'reviews:delete', module: 'reviews', action: 'delete', label: 'Eliminar reseñas' },
  // Miembros
  { name: 'members:list', module: 'members', action: 'list', label: 'Listar miembros' },
  { name: 'members:create', module: 'members', action: 'create', label: 'Crear miembros' },
  { name: 'members:update', module: 'members', action: 'update', label: 'Actualizar miembros' },
  { name: 'members:delete', module: 'members', action: 'delete', label: 'Eliminar miembros' },
  // Organización
  { name: 'organization:update', module: 'organization', action: 'update', label: 'Editar organización' },
  // Roles
  { name: 'roles:list', module: 'roles', action: 'list', label: 'Listar roles' },
  { name: 'roles:create', module: 'roles', action: 'create', label: 'Crear roles' },
  { name: 'roles:update', module: 'roles', action: 'update', label: 'Actualizar roles' },
  { name: 'roles:delete', module: 'roles', action: 'delete', label: 'Eliminar roles' },
  // Auditoría
  { name: 'audit:list', module: 'audit', action: 'list', label: 'Ver auditoría' },
  // Uploads
  { name: 'uploads:create', module: 'uploads', action: 'create', label: 'Subir archivos' },
];

const roleDefinitions = [
  {
    name: 'Administrador',
    description: 'Acceso completo al panel de administración',
    permissionNames: ['*'],
  },
  {
    name: 'Gestor de Contenido',
    description: 'Gestiona servicios, noticias, atracciones y contenido de la página',
    permissionNames: [
      'services:list', 'services:create', 'services:update', 'services:delete',
      'news:list', 'news:create', 'news:update', 'news:delete',
      'attractions:list', 'attractions:create', 'attractions:update', 'attractions:delete',
      'organization:update',
      'uploads:create',
    ],
  },
  {
    name: 'Atención al Cliente',
    description: 'Gestiona reservaciones, mensajes de contacto y reseñas',
    permissionNames: [
      'reservations:list', 'reservations:create', 'reservations:update', 'reservations:confirm',
      'contact:list', 'contact:update',
      'reviews:list', 'reviews:approve',
    ],
  },
  {
    name: 'Consultor',
    description: 'Solo lectura de todas las secciones',
    permissionNames: [
      'users:list',
      'services:list',
      'news:list',
      'attractions:list',
      'reservations:list',
      'chatbot:list',
      'contact:list',
      'reviews:list',
      'members:list',
      'audit:list',
      'roles:list',
    ],
  },
];

async function main() {
  console.log('Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { module: perm.module, action: perm.action, label: perm.label },
      create: perm,
    });
  }

  console.log('Seeding roles...');
  for (const roleDef of roleDefinitions) {
    const existing = await prisma.role.findUnique({ where: { name: roleDef.name } });
    if (existing) continue;

    const role = await prisma.role.create({
      data: {
        name: roleDef.name,
        description: roleDef.description,
      },
    });

    if (roleDef.permissionNames[0] === '*') {
      const allPerms = await prisma.permission.findMany();
      await prisma.rolePermission.createMany({
        data: allPerms.map(p => ({ roleId: role.id, permissionId: p.id })),
      });
    } else {
      const perms = await prisma.permission.findMany({
        where: { name: { in: roleDef.permissionNames } },
      });
      await prisma.rolePermission.createMany({
        data: perms.map(p => ({ roleId: role.id, permissionId: p.id })),
      });
    }

    console.log(`  Created role: ${roleDef.name}`);
  }

  console.log('Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
