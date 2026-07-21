import { getPrisma } from './PrismaService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma2 = new PrismaClient();

const permissions = [
  { name: 'users:list', module: 'users', action: 'list', label: 'Listar usuarios' },
  { name: 'users:create', module: 'users', action: 'create', label: 'Crear usuarios' },
  { name: 'users:update', module: 'users', action: 'update', label: 'Actualizar usuarios' },
  { name: 'users:delete', module: 'users', action: 'delete', label: 'Eliminar usuarios' },
  { name: 'services:list', module: 'services', action: 'list', label: 'Listar servicios' },
  { name: 'services:create', module: 'services', action: 'create', label: 'Crear servicios' },
  { name: 'services:update', module: 'services', action: 'update', label: 'Actualizar servicios' },
  { name: 'services:delete', module: 'services', action: 'delete', label: 'Eliminar servicios' },
  { name: 'news:list', module: 'news', action: 'list', label: 'Listar noticias' },
  { name: 'news:create', module: 'news', action: 'create', label: 'Crear noticias' },
  { name: 'news:update', module: 'news', action: 'update', label: 'Actualizar noticias' },
  { name: 'news:delete', module: 'news', action: 'delete', label: 'Eliminar noticias' },
  { name: 'attractions:list', module: 'attractions', action: 'list', label: 'Listar atracciones' },
  { name: 'attractions:create', module: 'attractions', action: 'create', label: 'Crear atracciones' },
  { name: 'attractions:update', module: 'attractions', action: 'update', label: 'Actualizar atracciones' },
  { name: 'attractions:delete', module: 'attractions', action: 'delete', label: 'Eliminar atracciones' },
  { name: 'reservations:list', module: 'reservations', action: 'list', label: 'Listar reservaciones' },
  { name: 'reservations:create', module: 'reservations', action: 'create', label: 'Crear reservaciones' },
  { name: 'reservations:update', module: 'reservations', action: 'update', label: 'Actualizar reservaciones' },
  { name: 'reservations:delete', module: 'reservations', action: 'delete', label: 'Eliminar reservaciones' },
  { name: 'reservations:confirm', module: 'reservations', action: 'confirm', label: 'Confirmar reservaciones' },
  { name: 'chatbot:list', module: 'chatbot', action: 'list', label: 'Listar preguntas FAQ' },
  { name: 'chatbot:create', module: 'chatbot', action: 'create', label: 'Crear preguntas FAQ' },
  { name: 'chatbot:update', module: 'chatbot', action: 'update', label: 'Actualizar preguntas FAQ' },
  { name: 'chatbot:delete', module: 'chatbot', action: 'delete', label: 'Eliminar preguntas FAQ' },
  { name: 'contact:list', module: 'contact', action: 'list', label: 'Listar mensajes' },
  { name: 'contact:update', module: 'contact', action: 'update', label: 'Gestionar mensajes' },
  { name: 'reviews:list', module: 'reviews', action: 'list', label: 'Listar reseñas' },
  { name: 'reviews:approve', module: 'reviews', action: 'approve', label: 'Aprobar reseñas' },
  { name: 'reviews:delete', module: 'reviews', action: 'delete', label: 'Eliminar reseñas' },
  { name: 'organization:update', module: 'organization', action: 'update', label: 'Editar organización' },
  { name: 'roles:list', module: 'roles', action: 'list', label: 'Listar roles' },
  { name: 'roles:create', module: 'roles', action: 'create', label: 'Crear roles' },
  { name: 'roles:update', module: 'roles', action: 'update', label: 'Actualizar roles' },
  { name: 'roles:delete', module: 'roles', action: 'delete', label: 'Eliminar roles' },
  { name: 'audit:list', module: 'audit', action: 'list', label: 'Ver auditoría' },
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
      'organization:update', 'uploads:create',
    ],
  },
  {
    name: 'Atención al Cliente',
    description: 'Gestiona reservaciones, mensajes de contacto y reseñas',
    permissionNames: [
      'reservations:list', 'reservations:create', 'reservations:update', 'reservations:confirm',
      'contact:list', 'contact:update', 'reviews:list', 'reviews:approve',
    ],
  },
  {
    name: 'Consultor',
    description: 'Solo lectura de todas las secciones',
    permissionNames: [
      'users:list', 'services:list', 'news:list', 'attractions:list',
      'reservations:list', 'chatbot:list', 'contact:list', 'reviews:list',
      'roles:list',
    ],
  },
];

const IMAGES = {
  caminata: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  exploracion: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
  cabana: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop',
  ecologico: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  almuerzo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
  menu: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1566125882500-87e10f726cdc?w=800&h=600&fit=crop',
  artistica: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
  transporte: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
  fullday: 'https://images.unsplash.com/photo-1504457047772-27faf9c0f3e9?w=800&h=600&fit=crop',
  festival: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
  caminataEvent: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  gastronomia: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  hero: 'https://images.unsplash.com/photo-1504457047772-27faf9c0f3e9?w=1920&h=1080&fit=crop',
  piscinas: 'https://images.unsplash.com/photo-1575839076416-b6cd9e5c4b5d?w=800&h=600&fit=crop',
  senderos: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  descanso: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&h=600&fit=crop',
  familiar: 'https://images.unsplash.com/photo-1529543544282-ea14c7d18ad8?w=800&h=600&fit=crop',
};

async function runSeed() {
  console.log('Conectando a PostgreSQL via Prisma...');
  const prisma = getPrisma();

  // Services (upsert — no borra datos existentes)
  console.log('Insertando/actualizando servicios...');
  const services = [
    { id: '10000001-0000-0000-0000-000000000001', name: 'Caminata Ecológica Guiada', description: 'Recorrido por senderos naturales acompañado por guías locales especializados.', category: 'aventura', image: IMAGES.caminata, price: 10.00, currency: 'USD', duration: '2 horas', location: 'Senderos de Las Rocas, Comuna San Miguel, Naranjal', schedule: 'Salidas: 8:00 y 14:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000002', name: 'Ruta de Exploración Turística', description: 'Conoce los principales atractivos turísticos de la comunidad.', category: 'aventura', image: IMAGES.exploracion, price: 8.00, currency: 'USD', duration: '3 horas', location: 'Centro de Las Rocas, Comuna San Miguel, Naranjal', schedule: 'Salidas: 9:00 y 13:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000003', name: 'Cabaña Familiar', description: 'Espacio cómodo y seguro para familias y grupos.', category: 'hospedaje', image: IMAGES.cabana, price: 35.00, currency: 'USD', duration: '1 noche', location: 'Zona residencial Las Rocas, Comuna San Miguel, Naranjal', schedule: 'Check-in: 14:00 - Check-out: 12:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000004', name: 'Hospedaje Ecológico', description: 'Disfruta del contacto directo con la naturaleza.', category: 'hospedaje', image: IMAGES.ecologico, price: 25.00, currency: 'USD', duration: '1 noche', location: 'Zona ecológica Las Rocas, Comuna San Miguel, Naranjal', schedule: 'Check-in: 14:00 - Check-out: 12:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000005', name: 'Almuerzo Tradicional', description: 'Platos típicos preparados con ingredientes locales.', category: 'gastronomia', image: IMAGES.almuerzo, price: 7.00, currency: 'USD', duration: '1 hora', location: 'Restaurante comunitario Las Rocas', schedule: '12:00 - 15:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000006', name: 'Menú Turístico Completo', description: 'Entrada, plato fuerte, bebida y postre.', category: 'gastronomia', image: IMAGES.menu, price: 15.00, currency: 'USD', duration: '1.5 horas', location: 'Restaurante comunitario Las Rocas', schedule: '12:00 - 16:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000007', name: 'Experiencia Cultural', description: 'Conoce las tradiciones y costumbres de la comunidad.', category: 'cultura', image: IMAGES.cultural, price: 5.00, currency: 'USD', duration: '1 hora', location: 'Centro cultural Las Rocas', schedule: '10:00 - 17:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000008', name: 'Presentación Artística Local', description: 'Música, danza y expresiones culturales.', category: 'cultura', image: IMAGES.artistica, price: 3.00, currency: 'USD', duration: '1 hora', location: 'Plaza central Las Rocas', schedule: 'Sábados 16:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000009', name: 'Transporte Turístico', description: 'Servicio de movilización hacia los principales atractivos.', category: 'transporte', image: IMAGES.transporte, price: 10.00, currency: 'USD', duration: 'Por hora', location: 'Cobertura en toda la comunidad', schedule: 'Previa reserva: 6:00 - 20:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000010', name: 'Paquete Full Day', description: 'Recorrido guiado, almuerzo y actividades recreativas.', category: 'paquete', image: IMAGES.fullday, price: 45.00, currency: 'USD', duration: '8 horas', location: 'Comunidad Las Rocas', schedule: 'Salida: 8:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000011', name: 'Piscinas de Aguas Termales', description: 'Disfruta de nuestras piscinas alimentadas por aguas termales naturales, ideales para relajarte en familia o con amigos en un entorno natural único.', category: 'piscinas', image: IMAGES.piscinas, price: 5.00, currency: 'USD', duration: 'Todo el día', location: 'Zona termal Las Rocas, Comuna San Miguel, Naranjal', schedule: '8:00 - 18:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000012', name: 'Senderos Ecológicos', description: 'Recorre caminos rodeados de flora y fauna, ideales para admirar el paisaje y conectar con la naturaleza a tu propio ritmo.', category: 'aventura', image: IMAGES.senderos, price: 3.00, currency: 'USD', duration: 'Libre', location: 'Senderos de Las Rocas, Comuna San Miguel, Naranjal', schedule: '7:00 - 17:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000013', name: 'Área de Descanso', description: 'Espacios diseñados para compartir momentos de tranquilidad mientras disfrutas del entorno natural y el aire puro de la comuna San Miguel.', category: 'otro', image: IMAGES.descanso, price: 2.00, currency: 'USD', duration: 'Todo el día', location: 'Zona de descanso Las Rocas', schedule: '8:00 - 18:00', isActive: true },
    { id: '10000001-0000-0000-0000-000000000014', name: 'Turismo Familiar', description: 'Actividades pensadas para visitantes de todas las edades, promoviendo la convivencia, el disfrute al aire libre y la creación de recuerdos inolvidables.', category: 'otro', image: IMAGES.familiar, price: 8.00, currency: 'USD', duration: '4 horas', location: 'Comunidad Las Rocas', schedule: '9:00 - 13:00 y 14:00 - 18:00', isActive: true },
  ];
  for (const svc of services) {
    await prisma.service.upsert({ where: { id: svc.id }, update: svc, create: svc });
  }

  // News (upsert)
  console.log('Insertando/actualizando noticias/eventos...');
  const newsList = [
    { id: '20000001-0000-0000-0000-000000000001', title: 'Festival Cultural', content: 'Celebración de las tradiciones locales mediante música, danza y gastronomía. Un evento imperdible para toda la familia donde podrás disfrutar de presentaciones artísticas, platos típicos y muestras de artesanía local. Contaremos con la participación de grupos folclóricos de toda la región.', summary: 'Celebración de las tradiciones locales mediante música, danza y gastronomía.', type: 'evento', image: IMAGES.festival, eventDate: new Date('2026-07-20T10:00:00'), location: 'Plaza Central de Las Rocas', isPublished: true },
    { id: '20000001-0000-0000-0000-000000000002', title: 'Caminata Ecológica', content: 'Actividad recreativa para conocer los paisajes naturales de la comunidad. Recorrerás senderos rodeados de naturaleza mientras guías locales te comparten información sobre la flora y fauna de la zona. Incluye guiado y refrigerio.', summary: 'Actividad recreativa para conocer los paisajes naturales de la comunidad.', type: 'actividad', image: IMAGES.caminataEvent, eventDate: new Date('2026-07-10T07:00:00'), location: 'Senderos de Las Rocas', isPublished: true },
    { id: '20000001-0000-0000-0000-000000000003', title: 'Feria Gastronómica', content: 'Exhibición de platos típicos elaborados por los socios de la asociación. Degusta lo mejor de la cocina local y descubre los sabores tradicionales que hacen única a nuestra comunidad. Habrá música en vivo y concursos.', summary: 'Exhibición de platos típicos elaborados por los socios de la asociación.', type: 'evento', image: IMAGES.gastronomia, eventDate: new Date('2026-08-05T11:00:00'), location: 'Restaurante Comunitario Las Rocas', isPublished: true },
    { id: '20000001-0000-0000-0000-000000000004', title: 'Taller de Artesanía Local', content: 'Aprende técnicas tradicionales de tejido y cerámica con artesanos locales. Una experiencia práctica donde crearás tu propio recuerdo de Las Rocas. Materiales incluidos.', summary: 'Taller práctico de tejido y cerámica con artesanos locales.', type: 'actividad', image: IMAGES.gastronomia, eventDate: new Date('2026-07-15T14:00:00'), location: 'Centro Cultural Las Rocas', isPublished: true },
    { id: '20000001-0000-0000-0000-000000000005', title: 'Noche de Folclore', content: 'Velada musical con presentaciones de danzas típicas y música tradicional ecuatoriana. Disfruta de una noche mágica bajo las estrellas.', summary: 'Velada musical con danzas típicas y música tradicional.', type: 'evento', image: IMAGES.festival, eventDate: new Date('2026-07-27T18:00:00'), location: 'Plaza Central de Las Rocas', isPublished: true },
  ];
  for (const n of newsList) {
    await prisma.news.upsert({ where: { id: n.id }, update: n, create: n });
  }

  // Chatbot questions (upsert)
  console.log('Insertando/actualizando preguntas FAQ...');
  const faqs = [
      { id: '40000001-0000-0000-0000-000000000001', keywords: ['horario', 'atencion', 'abren', 'abierto', 'horarios', 'atienden'], question: '¿Cuál es el horario de atención?', answer: 'Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM y los sábados de 9:00 AM a 2:00 PM. Los domingos atendemos solo con cita previa. Te recomendamos reservar con anticipación para garantizar tu atención.', category: 'general', priority: 10, isActive: true },
      { id: '40000001-0000-0000-0000-000000000002', keywords: ['ubicacion', 'direccion', 'donde', 'mapa', 'ubicados', 'llegar'], question: '¿Dónde están ubicados?', answer: 'Nos encontramos en la Comuna San Miguel, Cantón Naranjal, Provincia del Guayas, Ecuador. Puedes ver nuestra ubicación exacta en la sección de Contacto de nuestra página web, donde encontrarás un mapa interactivo.', category: 'general', priority: 10, isActive: true },
      { id: '40000001-0000-0000-0000-000000000003', keywords: ['contacto', 'contactar', 'whatsapp', 'telefono', 'llamar', 'comunicarse'], question: '¿Cómo puedo contactarlos?', answer: 'Puedes contactarnos de las siguientes formas:\n1. Formulario web en nuestra sección de Contacto\n2. WhatsApp al número disponible en nuestra página\n3. Visítanos directamente en Las Rocas, Comuna San Miguel, Naranjal\n4. Email: info@lasrocas\n\nUsa la sección de Contacto para enviarnos un mensaje directo.', category: 'contacto', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000006', keywords: ['asociacion', 'asociacion', 'quienes', 'historia', 'sobre'], question: '¿Quiénes son y cuál es su historia?', answer: 'La Asociación Turística Las Rocas es una organización comunitaria creada para impulsar el desarrollo del turismo sostenible en la Provincia del Guayas. Trabajamos con familias locales para ofrecer experiencias auténticas, promoviendo la conservación del patrimonio natural y cultural. Nuestra misión es conectar visitantes con la riqueza de nuestra comunidad.', category: 'general', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000005', keywords: ['servicios', 'ofrecen', 'tours', 'actividades', 'que hacer', 'ofrece'], question: '¿Qué servicios ofrecen?', answer: 'Ofrecemos una variedad de servicios turísticos que incluyen hospedaje, gastronomía, actividades de aventura, experiencias culturales, transporte y paquetes completos. Todos nuestros servicios están disponibles en la sección de Servicios de nuestra página web con sus precios actualizados. También tenemos piscinas de aguas termales, senderos ecológicos y áreas de descanso para toda la familia.', category: 'servicios', priority: 10, isActive: true },
      { id: '40000001-0000-0000-0000-000000000004', keywords: ['precio', 'precios', 'costo', 'tarifa', 'cuanto', 'costos'], question: '¿Cuáles son los precios de los servicios?', answer: 'Nuestros precios varían según el servicio. En la sección de Servicios de nuestra página web encontrarás cada servicio con su precio actualizado en dólares americanos. Trabajamos con tarifas accesibles para que puedas disfrutar de una experiencia única en contacto con la naturaleza y la cultura local.', category: 'servicios', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000030', keywords: ['hospedaje', 'hotel', 'dormir', 'alojamiento', 'cabana', 'ecologico', 'hospedar'], question: '¿Dónde puedo hospedarme?', answer: 'Contamos con opciones de hospedaje en nuestra comunidad. Puedes ver los tipos de alojamiento disponibles, sus precios y disponibilidad en la sección de Servicios de nuestra página web. Ambos están ubicados en Las Rocas, Comuna San Miguel, Naranjal y puedes reservar desde nuestra página.', category: 'servicios', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000031', keywords: ['gastronomia', 'comida', 'almuerzo', 'menu', 'restaurante', 'comer', 'tipico'], question: '¿Qué opciones gastronómicas hay?', answer: 'Ofrecemos deliciosa gastronomía tradicional con platos típicos preparados con ingredientes locales frescos. Contamos con opciones de almuerzo tradicional y menús turísticos completos. Disponibles en nuestro Restaurante Comunitario en horario de atención al público. No olvides probar el arroz con pato y el ceviche de conchas negras, platos emblemáticos de la región. Los precios están disponibles en nuestra sección de Servicios.', category: 'servicios', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000032', keywords: ['aventura', 'caminata', 'exploracion', 'ruta', 'senderismo', 'naturaleza'], question: '¿Qué actividades de aventura ofrecen?', answer: 'Tenemos actividades de aventura como caminatas ecológicas guiadas por senderos naturales, rutas de exploración turística por los principales atractivos de la comunidad, y más. Todas incluyen guiado especializado y te permiten conectar con la naturaleza. Los precios y horarios están disponibles en nuestra sección de Servicios.', category: 'servicios', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000033', keywords: ['cultura', 'cultural', 'tradiciones', 'artesania', 'danza', 'musica'], question: '¿Qué experiencias culturales ofrecen?', answer: 'Sumérgete en nuestra cultura con experiencias que incluyen conocer las tradiciones y costumbres locales, presentaciones artísticas de música y danza, y talleres de artesanía donde puedes aprender tejido y cerámica tradicional. Los precios y horarios están disponibles en nuestra sección de Servicios.', category: 'servicios', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000034', keywords: ['transporte', 'movilidad', 'taxi', 'recorrido', 'tour'], question: '¿Ofrecen servicio de transporte turístico?', answer: 'Sí, contamos con servicio de transporte turístico para moverte por los principales atractivos de la comunidad y sus alrededores. El servicio funciona con reserva previa. Puedes consultar precios y disponibilidad en nuestra sección de Servicios o contactándonos directamente.', category: 'servicios', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000035', keywords: ['paquete', 'full', 'day', 'completo'], question: '¿Qué incluye el paquete Full Day?', answer: 'El Paquete Full Day incluye recorrido guiado por los atractivos principales, almuerzo tradicional, actividades recreativas y guía local especializado. Es la experiencia completa de Las Rocas en un solo día. Consulta el precio y disponibilidad en nuestra sección de Servicios.', category: 'servicios', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000008', keywords: ['eventos', 'festivales', 'actividades', 'calendario', 'proximos', 'agenda'], question: '¿Qué eventos tienen próximamente?', answer: 'Tenemos eventos programados regularmente, incluyendo festivales culturales, ferias gastronómicas, caminatas ecológicas, talleres de artesanía y noches de folclore con música y danza tradicional. Visita nuestra sección de Eventos para conocer las fechas actualizadas y los detalles de cada actividad.', category: 'eventos', priority: 10, isActive: true },
      { id: '40000001-0000-0000-0000-000000000036', keywords: ['festival', 'cultural', 'plaza'], question: 'Cuéntame sobre el Festival Cultural', answer: 'El Festival Cultural es uno de nuestros eventos principales donde disfrutarás de música tradicional en vivo, danzas folclóricas, gastronomía típica y muestras de artesanía local. Se realiza en la Plaza Central de Las Rocas. Consulta nuestra sección de Eventos para conocer la próxima fecha.', category: 'eventos', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000037', keywords: ['feria', 'gastronomica', 'comida', 'agosto', 'restaurante'], question: 'Cuéntame sobre la Feria Gastronómica', answer: 'La Feria Gastronómica es un evento donde podrás degustar platos típicos, probar el arroz con pato y ceviche de conchas negras, participar en concursos gastronómicos y disfrutar de música en vivo. Se realiza en el Restaurante Comunitario. Consulta nuestra sección de Eventos para conocer la próxima fecha.', category: 'eventos', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000038', keywords: ['caminata', 'ecologica', 'naturaleza'], question: 'Cuéntame sobre la Caminata Ecológica', answer: 'La Caminata Ecológica Guiada es una actividad donde recorremos senderos naturales acompañados de guías locales. Incluye información sobre flora y fauna, refrigerio y guiado especializado. Consulta nuestra sección de Eventos para conocer las próximas fechas y horarios.', category: 'eventos', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000039', keywords: ['taller', 'artesania', 'tejido', 'ceramica'], question: 'Cuéntame sobre el Taller de Artesanía', answer: 'El Taller de Artesanía Local es una experiencia práctica donde aprenderás técnicas tradicionales de tejido y elaboración de cerámica artesanal con artesanos locales. Materiales incluidos. Cupos limitados. Consulta nuestra sección de Eventos para conocer las próximas fechas.', category: 'eventos', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000040', keywords: ['noche', 'folclore', 'musica', 'danza'], question: 'Cuéntame sobre la Noche de Folclore', answer: 'La Noche de Folclore es una velada con música tradicional en vivo, presentaciones de danzas típicas y puestos de comida y bebidas. Se realiza en la Plaza Central de Las Rocas. Consulta nuestra sección de Eventos para conocer la próxima fecha.', category: 'eventos', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000041', keywords: ['evento', 'finde', 'semana', 'sabado', 'domingo'], question: '¿Hay eventos este fin de semana?', answer: 'Sí, regularmente tenemos actividades los fines de semana, incluyendo presentaciones artísticas en la Plaza Central, caminatas ecológicas y otras actividades. Consulta nuestra sección de Eventos para conocer la programación actualizada o contáctanos para confirmar disponibilidad.', category: 'eventos', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000011', keywords: ['reserva', 'reservar', 'agendar', 'apartar', 'reservacion'], question: '¿Cómo puedo hacer una reserva?', answer: 'Puedes hacer tu reserva fácilmente desde nuestra página web: ve a la sección de Servicios, selecciona el servicio que deseas y completa el formulario de reserva con tus datos y fecha preferida. Te responderemos en menos de 24 horas para confirmar tu reserva. También puedes consultar el estado de tu reserva en la sección "Mi Reserva".', category: 'reservas', priority: 10, isActive: true },
      { id: '40000001-0000-0000-0000-000000000009', keywords: ['pago', 'pagar', 'pagos', 'transferencia', 'tarjeta', 'efectivo'], question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos los siguientes métodos de pago:\n💰 Efectivo en dólares americanos (USD)\n🏦 Transferencia bancaria\n🏦 Depósito en cuenta\n\nNo aceptamos tarjetas de crédito/débito por el momento.', category: 'servicios', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000042', keywords: ['cancelar', 'cancelacion', 'politica', 'reembolso', 'cambio'], question: '¿Cuál es la política de cancelación?', answer: 'Puedes cancelar tu reserva sin costo hasta 48 horas antes de la fecha programada. Cancelaciones con menos de 48 horas pueden tener un cargo del 50%. Para cancelar, contáctanos por WhatsApp o mediante nuestro formulario web. Siempre haremos lo posible por ayudarte.', category: 'reservas', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000010', keywords: ['turismo', 'lambayeque', 'region', 'visitar', 'lugares', 'atractivos'], question: '¿Qué lugares turísticos hay cerca de Las Rocas?', answer: 'La Provincia del Guayas tiene una riqueza turística increíble. Cerca de Las Rocas puedes visitar:\n\n🏛️ Malecón 2000 y Las Peñas en Guayaquil\n🏖️ Playas de Villamil y Posorja\n🌳 Cerro Blanco y Bosque Protector\n🍛 Rutas gastronómicas - Prueba el ceviche ecuatoriano y el encebollado\n🛍️ Mercados artesanales - Compra recuerdos locales\n\nTe recomendamos contratar nuestro paquete Full Day para conocer lo mejor.', category: 'general', priority: 9, isActive: true },
      { id: '40000001-0000-0000-0000-000000000043', keywords: ['clima', 'temperatura', 'tiempo', 'llevar', 'ropa', 'recomendacion'], question: '¿Qué clima hace y qué debo llevar?', answer: 'En la Comuna San Miguel (Provincia del Guayas) el clima es cálido y tropical la mayor parte del año. Temperatura promedio: 25-32°C.\n\nTe recomendamos llevar:\n👕 Ropa ligera y fresca (algodón)\n👟 Zapatos cómodos para caminar\n🧴 Bloqueador solar\n🧢 Sombrero o gorra\n💧 Agua\n📱 Cámara\n🦟 Repelente de insectos\n\nSi vienes de mayo a octubre, lleva una casaca ligera por las noches.', category: 'general', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000044', keywords: ['llegar', 'como', 'transporte', 'bus', 'auto', 'viaje', 'ruta'], question: '¿Cómo puedo llegar a Las Rocas?', answer: 'Puedes llegar a Las Rocas de las siguientes formas:\n\n🚌 En bus: Desde Guayaquil o Naranjal hay buses que te dejan cerca de la comuna.\n🚗 En auto: Por la vía que conecta Naranjal con la costa, desvío hacia Comuna San Miguel.\n🚐 Transporte turístico: Podemos coordinar tu recojo si contratas nuestro servicio.\n\nLa distancia desde Naranjal es de aproximadamente 20 minutos en auto.', category: 'general', priority: 8, isActive: true },
      { id: '40000001-0000-0000-0000-000000000045', keywords: ['wifi', 'internet', 'conexion', 'señal'], question: '¿Hay conexión a internet/Wi-Fi?', answer: 'Sí, contamos con conexión a internet en nuestras instalaciones principales. En las zonas de hospedaje y el restaurante comunitario hay Wi-Fi disponible para nuestros visitantes. La señal puede ser limitada en las zonas más alejadas, ideales para desconectarte y disfrutar de la naturaleza.', category: 'general', priority: 6, isActive: true },
      { id: '40000001-0000-0000-0000-000000000046', keywords: ['seguro', 'seguridad', 'peligroso', 'tranquilo'], question: '¿Es seguro visitar Las Rocas?', answer: 'Las Rocas es una comunidad segura y acogedora. Trabajamos en conjunto con las autoridades locales para mantener un entorno tranquilo para nuestros visitantes. Como en cualquier destino turístico, te recomendamos tomar precauciones básicas: cuidar tus pertenencias y seguir las indicaciones de los guías locales.', category: 'general', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000047', keywords: ['mascota', 'mascotas', 'perro', 'animales'], question: '¿Puedo llevar a mi mascota?', answer: 'Sí, aceptamos mascotas en nuestras áreas comunes y en la Cabaña Familiar. Para el Hospedaje Ecológico, consulta disponibilidad. Solo pedimos que mantengas a tu mascota con correa y recojas sus desechos.', category: 'general', priority: 6, isActive: true },
      { id: '40000001-0000-0000-0000-000000000048', keywords: ['estacionamiento', 'parqueo', 'auto', 'vehiculo'], question: '¿Hay estacionamiento?', answer: 'Sí, contamos con estacionamiento gratuito para nuestros visitantes dentro de la comunidad. Hay espacio para autos y combis pequeñas. Si vienes en bus o vehículo grande, por favor avísanos con anticipación para coordinar el espacio.', category: 'general', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000049', keywords: ['familia', 'familia', 'niños', 'niñas', 'hijos'], question: '¿Hay actividades para niños y familias?', answer: '¡Claro que sí! Las Rocas es ideal para visitas familiares. Los niños disfrutarán especialmente de la Cabaña Familiar (espaciosa y segura), la Caminata Ecológica (actividad al aire libre), talleres de artesanía y festivales culturales. Todas nuestras actividades son aptas para niños acompañados de adultos.', category: 'general', priority: 7, isActive: true },
      { id: '40000001-0000-0000-0000-000000000007', keywords: ['miembros', 'socios', 'asociacion', 'asociados', 'unirse', 'ser parte'], question: '¿Cómo puedo ser parte de la asociación?', answer: 'Si estás interesado en ser miembro de la Asociación Turística Las Rocas, contáctanos a través de nuestra página web. Evaluamos tu perfil y te guiaremos en el proceso de afiliación. Buscamos personas comprometidas con el turismo sostenible y el desarrollo comunitario.', category: 'general', priority: 6, isActive: true },
      { id: '40000001-0000-0000-0000-000000000050', keywords: ['emergencia', 'urgencia', 'hospital', 'policia', 'bomberos'], question: '¿Qué hago en caso de emergencia?', answer: 'En caso de emergencia durante tu visita:\n\n🚑 Centro de Salud más cercano: Las Rocas (a 5 minutos)\n🚔 Policía Nacional: 105\n🚒 Bomberos: 116\n\nTodo nuestro personal está capacitado en primeros auxilios. Ante cualquier emergencia, acude al personal de la asociación.', category: 'general', priority: 9, isActive: true },
  ];
  for (const faq of faqs) {
    await prisma.chatbotQuestion.upsert({ where: { id: faq.id }, update: faq, create: faq });
  }

  // Organization (merge pageContent para no perder gallery ni blockedDates)
  console.log('Actualizando información institucional...');
  const existingOrg = await prisma.organization.findUnique({ where: { id: '00000000-0000-0000-0000-000000000001' } });
  const existingPageContent = existingOrg?.pageContent as Record<string, any> | null || {};
  const defaultPageContent = {
    home: {
      heroTitle: 'Descubre la magia natural de Las Rocas',
      heroSubtitle: 'Ubicada en la comuna San Miguel, cantón Naranjal, la Asociación Turística Las Rocas te invita a disfrutar de aguas termales, senderos ecológicos, paisajes únicos y la hospitalidad de una comunidad comprometida con el turismo sostenible.',
      heroCtaText: 'Reservar Ahora',
      heroCtaLink: '/contacto',
      heroCta2Text: 'Explorar Servicios',
      heroCta2Link: '/servicios',
      aboutTitle: 'Bienvenidos a la Asociación Turística Las Rocas',
      aboutText1: 'En el corazón de la comuna San Miguel, rodeada por la riqueza natural del cantón Naranjal, se encuentra la Asociación Turística Las Rocas, un destino ideal para quienes buscan relajación, aventura y contacto con la naturaleza.',
      aboutText2: 'Aquí podrás disfrutar de aguas termales naturales, recorrer senderos ecológicos, admirar paisajes montañosos y compartir experiencias inolvidables con familiares y amigos.',
    },
    conocenos: {
      title: 'Conócenos',
      heroSubtitle: 'Descubre quiénes somos y cómo nació la Asociación Turística Las Rocas, una iniciativa comunitaria que promueve el turismo sostenible, el bienestar y la conservación de la naturaleza en la comuna San Miguel, cantón Naranjal.',
      valuesTitle: 'Nuestros Valores',
      statsTitle: '¿Qué nos diferencia?',
    },
    contacto: {
      pageTitle: 'Contáctanos',
      pageSubtitle: 'Estamos para atenderte. Reserva tu próxima experiencia',
      formTitle: 'Solicitar Información',
    },
  };
  const merged: Record<string, any> = { ...defaultPageContent, ...existingPageContent };
  for (const key of Object.keys(defaultPageContent)) {
    if (typeof (defaultPageContent as any)[key] === 'object' && (defaultPageContent as any)[key] !== null) {
      merged[key] = { ...(defaultPageContent as any)[key], ...((existingPageContent as any)[key] || {}) };
    }
  }
  for (const key of Object.keys(existingPageContent)) {
    if (!(key in defaultPageContent)) {
      merged[key] = (existingPageContent as any)[key];
    }
  }

  await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Asociación Turística Las Rocas',
      legalName: 'Asociación Turística Las Rocas - Guayas',
      ruc: '0999999999001',
      description: 'Descubre quiénes somos y cómo nació la Asociación Turística Las Rocas, una iniciativa comunitaria que promueve el turismo sostenible, el bienestar y la conservación de la naturaleza en la comuna San Miguel, cantón Naranjal.',
      history: 'La Asociación Turística Las Rocas fue fundada en el año 2013 por diez socios de la comuna San Miguel, ubicada en el cantón Naranjal, provincia del Guayas. Su creación surgió como respuesta a las dificultades económicas que enfrentaba la comunidad debido a la disminución del apoyo de entidades gubernamentales.',
      mission: 'Brindar experiencias de bienestar y recreación en el cantón Naranjal mediante servicios turísticos de calidad, promoviendo el contacto responsable con la naturaleza, fortaleciendo el turismo local y contribuyendo a la conservación ambiental.',
      vision: 'Consolidarnos como un referente regional en turismo comunitario y actividades al aire libre en el cantón Naranjal, destacándonos por ofrecer experiencias únicas, fomentar el desarrollo sostenible y preservar el patrimonio natural para las futuras generaciones.',
      address: 'Comuna San Miguel, Cantón Naranjal, Provincia del Guayas, Ecuador',
      phone: '+593 4 123 4567',
      email: 'info@lasrocas',
      website: 'https://lasrocas',
      coverImage: IMAGES.hero,
      pageContent: merged,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Asociación Turística Las Rocas',
      legalName: 'Asociación Turística Las Rocas - Guayas',
      ruc: '0999999999001',
      description: 'Descubre quiénes somos y cómo nació la Asociación Turística Las Rocas, una iniciativa comunitaria que promueve el turismo sostenible, el bienestar y la conservación de la naturaleza en la comuna San Miguel, cantón Naranjal.',
      history: 'La Asociación Turística Las Rocas fue fundada en el año 2013 por diez socios de la comuna San Miguel, ubicada en el cantón Naranjal, provincia del Guayas. Su creación surgió como respuesta a las dificultades económicas que enfrentaba la comunidad debido a la disminución del apoyo de entidades gubernamentales.',
      mission: 'Brindar experiencias de bienestar y recreación en el cantón Naranjal mediante servicios turísticos de calidad, promoviendo el contacto responsable con la naturaleza, fortaleciendo el turismo local y contribuyendo a la conservación ambiental.',
      vision: 'Consolidarnos como un referente regional en turismo comunitario y actividades al aire libre en el cantón Naranjal, destacándonos por ofrecer experiencias únicas, fomentar el desarrollo sostenible y preservar el patrimonio natural para las futuras generaciones.',
      address: 'Comuna San Miguel, Cantón Naranjal, Provincia del Guayas, Ecuador',
      phone: '+593 4 123 4567',
      email: 'info@lasrocas',
      website: 'https://lasrocas',
      coverImage: IMAGES.hero,
      isActive: true,
      pageContent: merged,
    },
  });

  // RBAC - Permisos y Roles
  console.log('Sembrando permisos...');
  for (const perm of permissions) {
    await prisma2.permission.upsert({
      where: { name: perm.name },
      update: { module: perm.module, action: perm.action, label: perm.label },
      create: perm,
    });
  }

  console.log('Sembrando roles...');
  let adminRoleId: string | undefined;
  for (const roleDef of roleDefinitions) {
    const existing = await prisma2.role.findUnique({ where: { name: roleDef.name } });
    if (!existing) {
      const role = await prisma2.role.create({
        data: { name: roleDef.name, description: roleDef.description },
      });
      if (roleDef.name === 'Administrador') adminRoleId = role.id;
      if (roleDef.permissionNames[0] === '*') {
        const allPerms = await prisma2.permission.findMany();
        await prisma2.rolePermission.createMany({
          data: allPerms.map(p => ({ roleId: role.id, permissionId: p.id })),
        });
      } else {
        const perms = await prisma2.permission.findMany({
          where: { name: { in: roleDef.permissionNames } },
        });
        await prisma2.rolePermission.createMany({
          data: perms.map(p => ({ roleId: role.id, permissionId: p.id })),
        });
      }
      console.log(`  Creado rol: ${roleDef.name}`);
    } else {
      if (roleDef.name === 'Administrador') adminRoleId = existing.id;
    }
  }

  // Admin user
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lasrocas' },
    update: { passwordHash, role: 'super_admin', roleRef: adminRoleId ? { connect: { id: adminRoleId } } : undefined },
    create: { email: 'admin@lasrocas', passwordHash, firstName: 'Administrador', lastName: 'Las Rocas', role: 'super_admin', roleRef: adminRoleId ? { connect: { id: adminRoleId } } : undefined },
  });

  console.log('');
  console.log('¡Base de datos actualizada!');
  console.log('Admin: admin@lasrocas / Admin123!');
  console.log('');

  const [svc, nws, faq] = await Promise.all([
    prisma.service.count(),
    prisma.news.count(),
    prisma.chatbotQuestion.count(),
  ]);
  console.log(`Servicios: ${svc}`);
  console.log(`Noticias/Eventos: ${nws}`);
  console.log(`Preguntas FAQ: ${faq}`);

  await prisma.$disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
