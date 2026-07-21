import { getPrisma, disconnectPrisma } from './PrismaService';
import { log } from '../../../shared/logger/logger';

const newFaqs = [
  {
    keywords: ['piscinas', 'termales', 'aguas termales', 'nadar', 'piscina', 'termal', 'relajarse', 'bañarse'],
    question: '¿Cómo funcionan las Piscinas de Aguas Termales?',
    answer: 'Nuestras piscinas de aguas termales son alimentadas por fuentes naturales de agua caliente. Están abiertas de 8:00 AM a 6:00 PM, todos los días. El costo de entrada es de $5.00 por persona e incluye el acceso durante todo el día. Contamos con áreas para adultos y niños, vestidores y áreas de descanso alrededor de las piscinas. Te recomendamos llevar traje de baño, toalla y bloqueador solar.',
    category: 'servicios',
    priority: 9,
  },
  {
    keywords: ['senderos', 'ecologicos', 'caminata', 'naturaleza', 'sendero', 'flora', 'fauna'],
    question: '¿Qué son los Senderos Ecológicos y cómo funcionan?',
    answer: 'Los Senderos Ecológicos son caminos señalizados dentro de nuestra comunidad que te permiten recorrer la naturaleza a tu propio ritmo. El acceso cuesta $3.00 por persona y puedes permanecer el tiempo que desees dentro de nuestro horario (7:00 AM - 5:00 PM). Durante el recorrido podrás observar flora y fauna nativa, y disfrutar de miradores naturales. Te sugerimos llevar calzado cómodo, agua y repelente de insectos.',
    category: 'servicios',
    priority: 8,
  },
  {
    keywords: ['descuento', 'descuentos', 'grupo', 'grupos', 'promocion', 'promociones', 'oferta', 'ofertas'],
    question: '¿Hay descuentos para grupos grandes?',
    answer: 'Sí, ofrecemos descuentos especiales para grupos de 10 personas o más. El descuento varía según los servicios contratados y la temporada. Para grupos escolares, empresariales o familiares grandes, contáctanos directamente a través de nuestro formulario de Contacto o WhatsApp para recibir una cotización personalizada. También tenemos paquetes especiales para excursiones de instituciones educativas.',
    category: 'servicios',
    priority: 7,
  },
  {
    keywords: ['guia', 'guias', 'idioma', 'idiomas', 'ingles', 'inglés', 'tour', 'guia', 'guia turistico'],
    question: '¿Los guías hablan otros idiomas?',
    answer: 'Actualmente nuestros guías locales brindan recorridos en español. Si necesitas atención en inglés, te recomendamos solicitarlo con anticipación al momento de hacer tu reserva, para que podamos coordinar un guía con conocimientos básicos de inglés. Estamos trabajando para ofrecer servicios en más idiomas pronto.',
    category: 'servicios',
    priority: 6,
  },
  {
    keywords: ['accesibilidad', 'discapacidad', 'silla de ruedas', 'movilidad', 'rampa', 'acceso'],
    question: '¿Las instalaciones son accesibles para personas con discapacidad?',
    answer: 'Contamos con accesibilidad parcial en nuestras instalaciones principales, incluyendo el restaurante comunitario y áreas comunes. Algunos senderos y áreas naturales tienen terreno irregular que puede dificultar el acceso en silla de ruedas. Te recomendamos contactarnos antes de tu visita para coordinar y brindarte la mejor experiencia posible según tus necesidades específicas.',
    category: 'general',
    priority: 5,
  },
  {
    keywords: ['vegetariano', 'vegetariana', 'vegano', 'vegana', 'dieta', 'alergia', 'alergias', 'intolerancia'],
    question: '¿Ofrecen opciones vegetarianas, veganas o para alergias alimentarias?',
    answer: 'Sí, en nuestro Restaurante Comunitario ofrecemos opciones vegetarianas y podemos preparar platos especiales si nos informas con anticipación. Contamos con ingredientes frescos y locales. Si tienes alergias alimentarias (lácteos, gluten, mariscos, etc.), por favor indícalo al momento de hacer tu reserva para que podamos ajustar el menú a tus necesidades.',
    category: 'gastronomia',
    priority: 7,
  },
  {
    keywords: ['checkin', 'check out', 'check-in', 'check-out', 'hospedaje', 'llegada', 'salida', 'entrada', 'hora'],
    question: '¿Cuál es el horario de check-in y check-out para el hospedaje?',
    answer: 'El check-in para nuestros hospedajes (Cabaña Familiar y Hospedaje Ecológico) es a partir de las 2:00 PM y el check-out es hasta las 12:00 PM del mediodía. Si necesitas llegar más temprano o salir más tarde, contáctanos para ver disponibilidad. Podemos guardar tu equipaje si tu salida es por la tarde y deseas seguir disfrutando de las instalaciones.',
    category: 'servicios',
    priority: 8,
  },
  {
    keywords: ['toalla', 'toallas', 'ropa de cama', 'sabanas', 'frazada', 'hospedaje', 'alojamiento'],
    question: '¿El hospedaje incluye toallas y ropa de cama?',
    answer: 'Sí, tanto la Cabaña Familiar como el Hospedaje Ecológico incluyen ropa de cama, toallas y artículos básicos de baño. También contamos con área de cocina equipada en la Cabaña Familiar. Te recomendamos llevar tu propio repelente de insectos y bloqueador solar para mayor comodidad durante tus actividades al aire libre.',
    category: 'servicios',
    priority: 6,
  },
  {
    keywords: ['foto', 'fotos', 'fotografia', 'fotografía', 'camara', 'drone', 'dron', 'video'],
    question: '¿Puedo tomar fotos o usar drone en Las Rocas?',
    answer: 'Sí, puedes tomar fotos y videos para uso personal en todas nuestras instalaciones. Para uso de drones, es necesario solicitar permiso previo a la administración. Si eres fotógrafo profesional o creador de contenido y deseas realizar una sesión fotográfica o de video, contáctanos con anticipación para coordinar y conocer nuestras tarifas especiales.',
    category: 'general',
    priority: 5,
  },
  {
    keywords: ['picnic', 'comida', 'llevar', 'propia', 'comida', 'merendar', 'area de picnic'],
    question: '¿Puedo llevar mi propia comida y hacer un picnic?',
    answer: 'Sí, puedes traer tu propia comida y disfrutar de nuestras áreas de descanso y zonas verdes para hacer un picnic. Contamos con mesas y bancas al aire libre. Te pedimos mantener limpio el área y depositar los desechos en los contenedores habilitados. Si prefieres, también ofrecemos opciones gastronómicas en nuestro Restaurante Comunitario con platos tradicionales a precios accesibles.',
    category: 'general',
    priority: 6,
  },
  {
    keywords: ['noche', 'nocturna', 'actividades nocturnas', 'fogata', 'fogatas', 'estrellas', 'observacion'],
    question: '¿Hay actividades nocturnas o fogatas?',
    answer: 'Sí, ofrecemos actividades nocturnas especialmente durante los fines de semana y eventos especiales. La Noche de Folclore incluye música en vivo y danzas tradicionales. También organizamos fogatas para grupos con reserva previa. Para observación de estrellas, las noches en Las Rocas son ideales por la baja contaminación lumínica. Consulta la programación en nuestra sección de Eventos.',
    category: 'eventos',
    priority: 7,
  },
  {
    keywords: ['bebida', 'bebidas', 'licor', 'alcohol', 'cerveza', 'tragos'],
    question: '¿Venden bebidas o hay consumo de alcohol permitido?',
    answer: 'En nuestro Restaurante Comunitario ofrecemos bebidas naturales, gaseosas y agua. El consumo de bebidas alcohólicas está permitido con moderación en las áreas comunes. No está permitido ingresar con bebidas alcohólicas externas. Durante eventos especiales como la Noche de Folclore o el Festival Cultural, suele haber venta de bebidas típicas.',
    category: 'general',
    priority: 5,
  },
  {
    keywords: ['artesania', 'artesanias', 'souvenir', 'recuerdo', 'comprar', 'tienda', 'local'],
    question: '¿Dónde puedo comprar artesanías o recuerdos?',
    answer: 'Durante eventos como el Festival Cultural y la Feria Gastronómica, se instalan puestos de artesanía local donde puedes comprar recuerdos hechos por los miembros de la comunidad. También ofrecemos talleres de artesanía donde puedes crear tu propio recuerdo (tejido y cerámica). Consulta nuestra sección de Eventos para conocer las próximas fechas.',
    category: 'general',
    priority: 6,
  },
  {
    keywords: ['fumador', 'fumar', 'cigarro', 'cigarrillo', 'prohibido'],
    question: '¿Se puede fumar en las instalaciones?',
    answer: 'El consumo de tabaco está permitido únicamente en las áreas designadas al aire libre. No está permitido fumar en espacios cerrados como el restaurante, hospedajes o áreas de juegos infantiles. Te pedimos depositar las colillas en los ceniceros habilitados y ayudar a mantener nuestras instalaciones limpias y seguras.',
    category: 'general',
    priority: 5,
  },
  {
    keywords: ['bano', 'banos', 'vestidor', 'vestidores', 'casilleros', 'ducha', 'duchas'],
    question: '¿Hay baños, vestidores y casilleros disponibles?',
    answer: 'Sí, contamos con baños públicos limpios y vestidores cerca de las piscinas de aguas termales y áreas principales. Hay duchas para enjuagarse después de usar las piscinas. No contamos con casilleros con llave, por lo que te recomendamos no dejar objetos de valor sin supervisión. Puedes dejar tus pertenencias en tu vehículo o coordinarlo con el personal.',
    category: 'general',
    priority: 7,
  },
  {
    keywords: ['lluvia', 'invierno', 'temporada', 'mejor epoca', 'meses', 'epoca del año'],
    question: '¿Cuál es la mejor época del año para visitar Las Rocas?',
    answer: 'Las Rocas se puede visitar durante todo el año gracias a su clima cálido tropical. La temporada seca va de junio a diciembre, con días soleados ideales para actividades al aire libre. La temporada de lluvias es de enero a mayo, pero las lluvias suelen ser cortas y por las tardes. Durante la temporada seca hay más eventos culturales y festivales. Los fines de semana y feriados suelen tener mayor afluencia de visitantes.',
    category: 'general',
    priority: 7,
  },
  {
    keywords: ['reserva', 'cancelar', 'modificar', 'cambio', 'fecha', 'reprogramar'],
    question: '¿Puedo modificar o reprogramar mi reserva?',
    answer: 'Sí, puedes modificar o reprogramar tu reserva sin costo adicional si nos avisas con al menos 48 horas de anticipación. Para cambios dentro de las 48 horas previas a tu visita, está sujeto a disponibilidad. Para modificaciones, contáctanos a través de WhatsApp o nuestro formulario de Contacto indicando tu número de reserva y la nueva fecha deseada. Siempre haremos lo posible por acomodarte.',
    category: 'reservas',
    priority: 8,
  },
  {
    keywords: ['confirmacion', 'confirmar', 'reserva', 'confirmada', 'estado'],
    question: '¿Cómo sé si mi reserva está confirmada?',
    answer: 'Después de realizar tu reserva a través de nuestro formulario web, recibirás un correo electrónico de confirmación en un plazo máximo de 24 horas. Si no recibes la confirmación, revisa tu bandeja de spam o contáctanos directamente. También puedes consultar el estado de tu reserva en la sección "Mi Reserva" de nuestra página web ingresando tu correo electrónico.',
    category: 'reservas',
    priority: 9,
  },
  {
    keywords: ['tour', 'escuela', 'colegio', 'estudiantes', 'educativo', 'institucion', 'excursión'],
    question: '¿Ofrecen tours educativos para escuelas y colegios?',
    answer: 'Sí, tenemos programas educativos diseñados para instituciones escolares y universitarias. Incluyen recorridos guiados por los senderos ecológicos, talleres de educación ambiental, visita a las piscinas termales y actividades culturales. Ofrecemos tarifas especiales para grupos estudiantiles y docentes. Contáctanos con anticipación para diseñar un programa adaptado a los objetivos educativos de tu institución.',
    category: 'servicios',
    priority: 7,
  },
  {
    keywords: ['cumpleaños', 'celebracion', 'evento privado', 'fiesta', 'reunion', 'empresarial'],
    question: '¿Puedo celebrar un cumpleaños, reunión o evento empresarial en Las Rocas?',
    answer: 'Sí, ofrecemos espacios para celebraciones privadas como cumpleaños, reuniones familiares, eventos empresariales y team building. Contamos con áreas al aire libre, restaurante comunitario y zonas de descanso. Podemos armar paquetes personalizados que incluyen uso de instalaciones, alimentación y actividades guiadas. Contáctanos a través del formulario de Contacto o WhatsApp para cotizar tu evento.',
    category: 'servicios',
    priority: 6,
  },
];

async function run() {
  log.info('Agregando nuevas preguntas frecuentes...');
  const prisma = getPrisma();

  let added = 0;
  for (const faq of newFaqs) {
    const existing = await prisma.chatbotQuestion.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.chatbotQuestion.create({
        data: {
          keywords: faq.keywords,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          priority: faq.priority,
          isActive: true,
        },
      });
      added++;
      log.info(`  + ${faq.question}`);
    }
  }

  log.info(`Se agregaron ${added} preguntas nuevas.`);
  await disconnectPrisma();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
