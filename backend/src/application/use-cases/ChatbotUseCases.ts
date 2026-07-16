import { ChatbotRepository } from '../../domain/repositories/ChatbotRepository';
import { ChatbotLogRepository } from '../../domain/repositories/ChatbotLogRepository';
import { ChatbotSessionRepository } from '../../domain/repositories/ChatbotSessionRepository';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { TouristicAttractionRepository } from '../../domain/repositories/TouristicAttractionRepository';
import { NewsRepository } from '../../domain/repositories/NewsRepository';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';
import { IChatbotEmbeddingRepository } from '../../domain/repositories/ChatbotEmbeddingRepository';
import { ChatbotQuestion } from '../../domain/entities/ChatbotQuestion';
import { ChatbotStats } from '../../domain/entities/ChatbotLog';
import { ChatMessage, ChatbotSession } from '../../domain/entities/ChatbotSession';
import { TouristicService } from '../../domain/entities/TouristicService';
import { TouristicAttraction } from '../../domain/entities/TouristicAttraction';
import { News } from '../../domain/entities/News';
import { IAiService, FunctionDeclaration, FunctionCall, ChatMessage as AiChatMessage } from '../../domain/ports/IAiService';
import { IEmbeddingService } from '../../domain/ports/IEmbeddingService';
import { ILogger } from '../../domain/ports/ILogger';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';
import { CreateChatbotQuestionData, UpdateChatbotQuestionData } from '../../domain/entities/ChatbotQuestion';

const MAX_HISTORY = 10;
const CONTEXT_TTL = 5 * 60 * 1000;
const MIN_SEMANTIC_SIMILARITY = 0.45;

export interface ChatSource {
  type: 'service' | 'faq' | 'attraction' | 'news' | 'organization';
  name: string;
  similarity: number;
}

export interface ChatResult {
  answer: string;
  aiGenerated: boolean;
  logId?: string;
  relatedQuestions?: { question: string; answer: string }[];
  sources?: ChatSource[];
}

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'get_services',
    description: 'Busca servicios turísticos por categoría o palabra clave. Devuelve lista con nombres, precios, descripciones.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Categoría: hospedaje, gastronomia, aventura, cultura, piscinas, paquete, transporte, otro' },
        keyword: { type: 'string', description: 'Palabra clave para buscar en nombre/descripción' },
      },
    },
  },
  {
    name: 'get_contact_info',
    description: 'Obtiene la información de contacto de la asociación (teléfono, email, dirección, horario).',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_faq_answer',
    description: 'Busca una respuesta en las preguntas frecuentes para preguntas comunes.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'La pregunta del usuario' },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_availability',
    description: 'Consulta la disponibilidad de reservas para una fecha y cantidad de personas determinada. Úsala cuando el usuario pregunte si hay cupo, espacio, disponibilidad o lugar disponible.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Fecha solicitada. Puede ser: "mañana", "hoy", nombre de día ("domingo", "lunes"), fecha con mes ("10 de agosto"), o formato ISO (2026-08-10).' },
        people: { type: 'number', description: 'Número aproximado de visitantes. Valor por defecto: 2.' },
      },
      required: ['date'],
    },
  },
];

export class ChatbotUseCases {
  private sessions = new Map<string, ChatbotSession>();
  private contextCache: { org: string; faqs: string; services: string; timestamp: number } | null = null;
  private pendingFunctionCall: FunctionCall | null = null;

  constructor(
    private chatbotRepository: ChatbotRepository,
    private serviceRepository: ServiceRepository,
    private organizationRepository: OrganizationRepository,
    private logger: ILogger,
    private aiService?: IAiService,
    private logRepository?: ChatbotLogRepository,
    private sessionRepository?: ChatbotSessionRepository,
    private embeddingService?: IEmbeddingService,
    private embeddingRepo?: IChatbotEmbeddingRepository,
    private attractionRepository?: TouristicAttractionRepository,
    private newsRepository?: NewsRepository,
    private reservationRepository?: ReservationRepository,
  ) { }

  async getAllQuestions(activeOnly: boolean = false): Promise<ChatbotQuestion[]> {
    return this.chatbotRepository.findAll(activeOnly);
  }

  async getQuestionById(id: string): Promise<ChatbotQuestion> {
    const q = await this.chatbotRepository.findById(id);
    if (!q) throw new NotFoundError('Pregunta no encontrada');
    return q;
  }

  async getQuestionsByCategory(category: string): Promise<ChatbotQuestion[]> {
    return this.chatbotRepository.findByCategory(category);
  }

  async addFeedback(logId: string, feedback: 'like' | 'dislike'): Promise<void> {
    if (!this.logRepository) return;
    await this.logRepository.updateFeedback(logId, feedback);
  }

  async chat(query: string, sessionId?: string): Promise<ChatResult> {
    const startTime = Date.now();
    if (!query || query.trim().length === 0) throw new ValidationError('La consulta no puede estar vacía');
    query = query.trim();
    if (query.length < 2) return { answer: 'Por favor, escribe una consulta más específica.', aiGenerated: false };

    const session = await this.getOrCreateSession(sessionId);
    session.history.push({ role: 'user', content: query });
    await this.persistSession(session);

    const faqMatch = await this.findFaqMatch(query);
    if (faqMatch) {
      session.history.push({ role: 'assistant', content: faqMatch.answer });
      this.trimHistory(session);
      await this.persistSession(session);
      const logId = await this.logInteraction(query, faqMatch.answer, 'faq', faqMatch.question, sessionId);
      return {
        answer: faqMatch.answer,
        aiGenerated: false,
        logId,
        relatedQuestions: await this.getRelatedQuestions(query),
      };
    }

    if (!this.aiService) {
      const fallback = session.language === 'en'
        ? 'The assistant is currently under maintenance. Please contact us through our Contact form or WhatsApp.'
        : 'Actualmente el asistente está en mantenimiento. Puedes contactarnos a través del formulario de Contacto o por WhatsApp.';
      return this.buildResponse(query, fallback, 'fallback', sessionId);
    }

    try {
      const ragResult = await this.buildRagContext(query);
      const lang = this.detectLanguage(query);
      session.language = lang;
      const systemPrompt = this.buildSystemPrompt(ragResult.context, lang);

      const aiMessages = this.buildChatHistory(session);

      let result = await this.aiService.chat({
        systemPrompt,
        messages: aiMessages,
        tools: TOOLS,
      });

      let finalAnswer = '';
      let usedFunction: string | undefined;

      if (result.functionCalls && result.functionCalls.length > 0) {
        const fnCall = result.functionCalls[0];
        usedFunction = fnCall.name;
        this.logger.info(`Function call: ${fnCall.name}`, { args: fnCall.args });
        const fnResult = await this.executeFunction(fnCall);

        const followUp = await this.aiService.chat({
          systemPrompt,
          messages: [
            ...aiMessages,
            { role: 'model', content: JSON.stringify({ functionCall: fnCall }) },
            { role: 'user', content: JSON.stringify({ functionResponse: fnResult }) },
          ],
          tools: TOOLS,
        });
        finalAnswer = followUp.text || '';
      } else {
        finalAnswer = result.text || '';
      }

      finalAnswer = finalAnswer.trim();
      session.history.push({ role: 'assistant', content: finalAnswer });
      this.trimHistory(session);
      await this.persistSession(session);

      const elapsed = Date.now() - startTime;
      this.logger.info('Chat completado', {
        query,
        elapsedMs: elapsed,
        usedRag: ragResult.usedRag,
        usedFunction,
        sourcesCount: ragResult.sources.length,
        answerLength: finalAnswer.length,
      });

      const logId = await this.logInteraction(query, finalAnswer, 'ai', undefined, sessionId);
      const related = await this.getRelatedQuestions(query);

      return { answer: finalAnswer, aiGenerated: true, logId, relatedQuestions: related, sources: ragResult.sources };
    } catch (error) {
      this.logger.error('Error en chat con IA', error);
      const friendly = session.language === 'en'
        ? 'I apologize, but I encountered a technical issue while processing your request. Please try again in a moment, or contact us via WhatsApp for immediate assistance.'
        : 'Lo siento, tuve un inconveniente técnico al procesar tu consulta. Por favor, intenta de nuevo en un momento o contáctanos por WhatsApp para atención inmediata.';
      return this.buildResponse(query, friendly, 'fallback', sessionId);
    }
  }

  async chatStream(
    query: string,
    sessionId: string | undefined,
    onToken: (token: string) => void,
    onDone: (result: { answer: string; aiGenerated: boolean; logId?: string; sources?: ChatSource[] }) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    const startTime = Date.now();
    if (!query || query.trim().length === 0) { onError('La consulta no puede estar vacía'); return; }

    const session = await this.getOrCreateSession(sessionId);
    session.history.push({ role: 'user', content: query.trim() });
    await this.persistSession(session);

    const faqMatch = await this.findFaqMatch(query);
    if (faqMatch) {
      session.history.push({ role: 'assistant', content: faqMatch.answer });
      this.trimHistory(session);
      await this.persistSession(session);
      onToken(faqMatch.answer);
      const logId = await this.logInteraction(query, faqMatch.answer, 'faq', faqMatch.question, sessionId);
      onDone({ answer: faqMatch.answer, aiGenerated: false, logId });
      return;
    }

    if (!this.aiService) {
      const fallback = 'Actualmente el asistente está en mantenimiento.';
      onToken(fallback);
      onDone({ answer: fallback, aiGenerated: false });
      return;
    }

    try {
      const ragResult = await this.buildRagContext(query);
      const lang = this.detectLanguage(query);
      session.language = lang;
      const systemPrompt = this.buildSystemPrompt(ragResult.context, lang);
      const aiMessages = this.buildChatHistory(session);
      const ai = this.aiService!;

      let accumulatedText = '';
      let functionCallName: string | undefined;

      await ai.chatStream({
        systemPrompt,
        messages: aiMessages,
        tools: TOOLS,
        onToken: (token) => {
          accumulatedText += token;
          onToken(token);
        },
        onFunctionCall: async (call) => {
          functionCallName = call.name;
          const fnResult = await this.executeFunction(call);
          accumulatedText = '';

          await ai.chatStream({
            systemPrompt,
            messages: [
              ...aiMessages,
              { role: 'model', content: JSON.stringify({ functionCall: call }) },
              { role: 'user', content: JSON.stringify({ functionResponse: fnResult }) },
            ],
            tools: TOOLS,
            onToken: (token) => {
              accumulatedText += token;
              onToken(token);
            },
          });
        },
      });

      const finalAnswer = accumulatedText.trim();
      session.history.push({ role: 'assistant', content: finalAnswer });
      this.trimHistory(session);
      await this.persistSession(session);

      const elapsed = Date.now() - startTime;
      this.logger.info('ChatStream completado', {
        query,
        elapsedMs: elapsed,
        usedRag: ragResult.usedRag,
        usedFunction: functionCallName,
        sourcesCount: ragResult.sources.length,
        answerLength: finalAnswer.length,
      });

      const logId = await this.logInteraction(query, finalAnswer, 'ai', undefined, sessionId);
      onDone({ answer: finalAnswer, aiGenerated: true, logId, sources: ragResult.sources });
    } catch (error) {
      this.logger.error('Error en chatStream', error);
      const friendly = 'Lo siento, tuve un inconveniente técnico al procesar tu consulta. Por favor, intenta de nuevo o contáctanos por WhatsApp.';
      onToken(friendly);
      onDone({ answer: friendly, aiGenerated: false });
    }
  }

  private detectLanguage(query: string): 'es' | 'en' {
    const esWords = ['hola', 'buenos', 'dias', 'tardes', 'noches', 'gracias', 'por', 'favor', 'como', 'estas', 'queria', 'quisiera', 'necesito', 'puedo', 'hay', 'tiene', 'cual', 'cuanto', 'donde', 'como', 'que', 'para', 'quisieramos', 'podrian', 'podemos', 'deberiamos', 'este', 'esta', 'estos', 'estas', 'esa', 'eso', 'esas', 'esos', 'con', 'sin', 'entre', 'sobre', 'segun', 'durante', 'mediante', 'contra', 'hasta', 'desde', 'se', 'les', 'nos'];
    const enWords = ['hello', 'hi', 'good', 'morning', 'afternoon', 'evening', 'thanks', 'thank', 'please', 'how', 'much', 'many', 'where', 'what', 'when', 'which', 'who', 'why', 'can', 'could', 'would', 'should', 'will', 'want', 'need', 'is', 'are', 'do', 'does', 'did', 'have', 'has', 'had', 'for', 'the', 'this', 'that', 'these', 'those', 'with', 'without', 'about', 'from', 'and', 'but', 'or', 'some', 'any', 'tell', 'give', 'show', 'know', 'think', 'looking', 'looking', 'need', 'help'];
    const q = query.toLowerCase();
    let esScore = 0, enScore = 0;
    for (const w of esWords) { if (q.includes(w)) esScore++; }
    for (const w of enWords) { if (q.includes(w)) enScore++; }
    if (enScore > esScore) return 'en';
    return 'es';
  }

  private async findFaqMatch(query: string): Promise<{ question: string; answer: string } | null> {
    const results = await this.chatbotRepository.search(query);
    const best = results.find(q => (q.relevance ?? 0) >= 25);
    return best ? { question: best.question, answer: best.answer } : null;
  }

  private async buildContext(): Promise<{ org: string; faqs: string; services: string }> {
    const now = Date.now();
    if (this.contextCache && (now - this.contextCache.timestamp) < CONTEXT_TTL) {
      return this.contextCache;
    }

    const orgText: string[] = [];
    const org = await this.organizationRepository.find();
    if (org) {
      orgText.push(`Nombre: ${org.name || 'Las Rocas'}`);
      if (org.description) orgText.push(`Descripción: ${org.description}`);
      if (org.address) orgText.push(`Dirección: ${org.address}`);
      if (org.phone) orgText.push(`Teléfono: ${org.phone}`);
      if (org.email) orgText.push(`Email: ${org.email}`);
      if (org.website) orgText.push(`Web: ${org.website}`);
    }

    const allServices = await this.serviceRepository.findAll(true);
    const servicesText: string[] = [];
    for (const s of allServices) {
      const parts = [`Nombre: ${s.name}`];
      if (s.description) parts.push(`Descripción: ${s.description}`);
      if (s.price) parts.push(`Precio: $${s.price} ${s.currency || 'USD'}`);
      if (s.category) parts.push(`Categoría: ${s.category}`);
      if (s.duration) parts.push(`Duración: ${s.duration}`);
      if (s.schedule) parts.push(`Horario: ${s.schedule}`);
      servicesText.push(parts.join(' | '));
    }

    const faqs = await this.chatbotRepository.findAll(true);

    const result = {
      org: orgText.join('\n'),
      faqs: faqs.map(f => `P: ${f.question}\nR: ${f.answer}`).join('\n\n'),
      services: servicesText.join('\n'),
    };

    this.contextCache = { ...result, timestamp: now };
    return result;
  }

  private async buildRelevantContext(query: string, context: { org: string; faqs: string; services: string }): Promise<string> {
    const relevantFaqs = await this.chatbotRepository.search(query);
    const topFaqs = relevantFaqs.filter(q => (q.relevance ?? 0) >= 15).slice(0, 3);
    const faqSection = topFaqs.length > 0
      ? `PREGUNTAS FRECUENTES RELACIONADAS:\n${topFaqs.map(f => `P: ${f.question}\nR: ${f.answer}`).join('\n\n')}`
      : '';

    const q = query.toLowerCase();
    const allServices = await this.serviceRepository.findAll(true);
    const keywordCategories: Record<string, string[]> = {
      hospedaje: ['hospedaje', 'dormir', 'hotel', 'cabaña', 'alojamiento', 'habitacion', 'pernoctar'],
      gastronomia: ['comer', 'comida', 'gastronomia', 'almuerzo', 'desayuno', 'cena', 'restaurante', 'menu', 'plato'],
      aventura: ['aventura', 'caminata', 'senderismo', 'tour', 'explorar', 'actividad'],
      cultura: ['cultura', 'tradicion', 'musica', 'danza', 'artesania'],
      piscinas: ['piscina', 'agua', 'nadar', 'relajarse', 'bañarse'],
      paquete: ['paquete', 'full', 'day', 'completo'],
      transporte: ['transporte', 'taxi', 'bus', 'recorrido'],
    };

    const matchedCategories = new Set<string>();
    for (const [cat, keywords] of Object.entries(keywordCategories)) {
      for (const kw of keywords) {
        if (q.includes(kw)) { matchedCategories.add(cat); break; }
      }
    }

    const relevantServices = matchedCategories.size > 0
      ? allServices.filter(s => s.category && matchedCategories.has(s.category))
      : allServices.slice(0, 8);

    const serviceSection = relevantServices.length > 0
      ? `SERVICIOS DISPONIBLES:\n${relevantServices.map(s =>
          `- ${s.name}: $${s.price || 0} ${s.currency || 'USD'}${s.description ? ` - ${s.description}` : ''}${s.duration ? ` (${s.duration})` : ''}`
        ).join('\n')}`
      : `SERVICIOS DISPONIBLES:\n${context.services}`;

    return `${faqSection}\n\n${serviceSection}\n\nINFORMACION DE CONTACTO:\n${context.org}`;
  }

  private async buildRagContext(query: string): Promise<{
    context: string;
    sources: ChatSource[];
    usedRag: boolean;
  }> {
    const canDoRag = this.embeddingService && this.embeddingRepo;
    if (!canDoRag) {
      const ctx = await this.buildContext();
      const relevant = await this.buildRelevantContext(query, ctx);
      return { context: relevant, sources: [], usedRag: false };
    }

    try {
      await this.ensureEmbeddingsPopulated(query);
      const queryEmbedding = await this.embeddingService!.embed(query);
      const semanticResults = await this.embeddingRepo!.searchSimilar(queryEmbedding, 12);

      const goodResults = semanticResults.filter(r => r.similarity >= MIN_SEMANTIC_SIMILARITY);

      if (goodResults.length === 0) {
        this.logger.info('RAG: sin resultados semánticos relevantes, usando fallback keyword', { query, topSimilarity: semanticResults[0]?.similarity ?? 0 });
        const ctx = await this.buildContext();
        const relevant = await this.buildRelevantContext(query, ctx);
        return { context: relevant, sources: [], usedRag: false };
      }

      this.logger.info('RAG: resultados semánticos obtenidos', {
        query,
        totalResults: semanticResults.length,
        goodResults: goodResults.length,
        sources: goodResults.map(r => `${r.type}:${r.entityId}(${r.similarity})`),
      });

      const sources: ChatSource[] = [];
      const contextParts: string[] = [];

      for (const result of goodResults) {
        switch (result.type) {
          case 'service': {
            const service = await this.serviceRepository.findById(result.entityId);
            if (service && service.isActive) {
              contextParts.push(`SERVICIO: ${service.name}
Descripción: ${service.description}
Precio: $${service.price || 0} ${service.currency || 'USD'}
Categoría: ${service.category}${service.duration ? `\nDuración: ${service.duration}` : ''}${service.schedule ? `\nHorario: ${service.schedule}` : ''}`);
              sources.push({ type: 'service', name: service.name, similarity: result.similarity });
            }
            break;
          }
          case 'faq': {
            const faq = await this.chatbotRepository.findById(result.entityId);
            if (faq && faq.isActive) {
              contextParts.push(`PREGUNTA FRECUENTE:
P: ${faq.question}
R: ${faq.answer}`);
              sources.push({ type: 'faq', name: faq.question, similarity: result.similarity });
            }
            break;
          }
          case 'attraction': {
            if (this.attractionRepository) {
              const attraction = await this.attractionRepository.findById(result.entityId);
              if (attraction && attraction.isActive) {
                contextParts.push(`ATRACCIÓN TURÍSTICA: ${attraction.name}
Descripción: ${attraction.description}
Categoría: ${attraction.category}${attraction.location ? `\nUbicación: ${attraction.location}` : ''}${attraction.schedule ? `\nHorario: ${attraction.schedule}` : ''}`);
                sources.push({ type: 'attraction', name: attraction.name, similarity: result.similarity });
              }
            }
            break;
          }
          case 'news': {
            if (this.newsRepository) {
              const newsItem = await this.newsRepository.findById(result.entityId);
              if (newsItem && newsItem.isPublished) {
                contextParts.push(`NOTICIA/EVENTO: ${newsItem.title}
${newsItem.summary ? `Resumen: ${newsItem.summary}` : `Contenido: ${newsItem.content.substring(0, 300)}`}
Tipo: ${newsItem.type}${newsItem.eventDate ? `\nFecha: ${newsItem.eventDate.toLocaleDateString()}` : ''}${newsItem.location ? `\nUbicación: ${newsItem.location}` : ''}`);
                sources.push({ type: 'news', name: newsItem.title, similarity: result.similarity });
              }
            }
            break;
          }
          case 'organization': {
            const org = await this.organizationRepository.find();
            if (org) {
              contextParts.push(`INFORMACIÓN DE LA ORGANIZACIÓN:
Nombre: ${org.name}
${org.description ? `Descripción: ${org.description}` : ''}
${org.mission ? `Misión: ${org.mission}` : ''}
${org.history ? `Historia: ${org.history}` : ''}
Dirección: ${org.address || ''}
Teléfono: ${org.phone || ''}
Email: ${org.email || ''}`);
              sources.push({ type: 'organization', name: org.name, similarity: result.similarity });
            }
            break;
          }
        }
      }

      if (contextParts.length === 0) {
        this.logger.info('RAG: resultados semánticos no pudieron cargarse como entidades, fallback a keyword', { query });
        const ctx = await this.buildContext();
        const relevant = await this.buildRelevantContext(query, ctx);
        return { context: relevant, sources: [], usedRag: false };
      }

      const org = await this.organizationRepository.find();
      if (org) {
        contextParts.push(`INFORMACION DE CONTACTO:\nNombre: ${org.name || 'Las Rocas'}\nDirección: ${org.address || ''}\nTeléfono: ${org.phone || ''}\nEmail: ${org.email || ''}`);
      }

      return { context: contextParts.join('\n\n'), sources, usedRag: true };
    } catch (error) {
      this.logger.error('RAG: error, usando fallback keyword', error);
      const ctx = await this.buildContext();
      const relevant = await this.buildRelevantContext(query, ctx);
      return { context: relevant, sources: [], usedRag: false };
    }
  }

  private async ensureEmbeddingsPopulated(query: string): Promise<void> {
    if (!this.embeddingService || !this.embeddingRepo) return;
    try {
      const testEmb = await this.embeddingService.embed('test');
      const existing = await this.embeddingRepo.searchSimilar(testEmb, 1);
      if (existing.length > 0) return;

      this.logger.info('RAG: poblando embeddings para todas las entidades...');

      const allServices = await this.serviceRepository.findAll(true);
      for (const s of allServices) {
        const text = `Servicio: ${s.name}. ${s.description || ''}. Categoría: ${s.category || ''}. Precio: $${s.price || 0}. Duración: ${s.duration || ''}. Horario: ${s.schedule || ''}. Ubicación: ${s.location || ''}.`;
        const emb = await this.embeddingService.embed(text);
        await this.embeddingRepo.save(`service:${s.id}`, text, emb);
      }

      const allFaqs = await this.chatbotRepository.findAll(true);
      for (const f of allFaqs) {
        const text = `Pregunta: ${f.question}. Respuesta: ${f.answer}. Categoría: ${f.category}.`;
        const emb = await this.embeddingService.embed(text);
        await this.embeddingRepo.save(`faq:${f.id}`, text, emb);
      }

      if (this.attractionRepository) {
        const allAttractions = await this.attractionRepository.findAll(true);
        for (const a of allAttractions) {
          const text = `Atracción turística: ${a.name}. ${a.description || ''}. Categoría: ${a.category || ''}. Ubicación: ${a.location || ''}. Horario: ${a.schedule || ''}.`;
          const emb = await this.embeddingService.embed(text);
          await this.embeddingRepo.save(`attraction:${a.id}`, text, emb);
        }
      }

      if (this.newsRepository) {
        const allNews = await this.newsRepository.findAll(true);
        for (const n of allNews) {
          const text = `${n.type === 'evento' ? 'Evento' : 'Noticia'}: ${n.title}. ${n.summary || n.content.substring(0, 200)}. Tipo: ${n.type}.${n.location ? ` Ubicación: ${n.location}.` : ''}${n.eventDate ? ` Fecha: ${n.eventDate.toISOString().substring(0, 10)}.` : ''}`;
          const emb = await this.embeddingService.embed(text);
          await this.embeddingRepo.save(`news:${n.id}`, text, emb);
        }
      }

      const org = await this.organizationRepository.find();
      if (org) {
        const text = `Organización: ${org.name || ''}. ${org.description || ''}. ${org.mission || ''}. ${org.history || ''}. Dirección: ${org.address || ''}. Teléfono: ${org.phone || ''}. Email: ${org.email || ''}.`;
        const emb = await this.embeddingService.embed(text);
        await this.embeddingRepo.save('organization:main', text, emb);
      }

      this.logger.info('RAG: embeddings poblados exitosamente');
    } catch (error) {
      this.logger.warn('RAG: error al poblar embeddings (se usará fallback)', { error: String(error) });
    }
  }

  private buildSystemPrompt(context: string, lang: 'es' | 'en'): string {
    if (lang === 'en') {
      return `You are the official AI tourist assistant for "Asociación Turística Las Rocas" in Ecuador.

CRITICAL INSTRUCTION: The user wrote in ENGLISH. You MUST respond in ENGLISH. Never respond in Spanish even if data below is in Spanish.

ABSOLUTE RULE: NEVER invent services, prices, or contact info. Only use the data provided below.

CONTEXT DATA:
${context}

FUNCTION CALLING: You have tools available (get_services, get_contact_info, get_faq_answer, check_availability). USE THEM when users ask specific questions about services, prices, availability, or contact. This gives them REAL, up-to-date data.

RULES:
1. When asked about services/activities/prices → use get_services to fetch real data
2. When asked about contact/hours/location → use get_contact_info
3. When asked common questions → use get_faq_answer
4. When asked about availability/capacity → use check_availability
5. You may use your general knowledge about Ecuador tourism and nearby attractions
6. Answer warmly as a local tour guide, 3-5 paragraphs max
7. When mentioning a service or attraction ALWAYS include: name, short description, price (if available), and a suggested action (e.g., "check availability", "make a reservation", "visit our services page")
8. If a service doesn't exist, say so honestly and suggest similar alternatives
9. If the question is completely unrelated to tourism in Ecuador or Las Rocas (e.g., capital cities, math, politics), respond politely that you specialize in tourism information about Las Rocas and nearby attractions, and ask if they have questions about our services
10. LANGUAGE: You are answering in ENGLISH. Always respond in ENGLISH.`;
    }

    return `Eres el asistente turístico oficial de la "Asociación Turística Las Rocas" en Ecuador.

REGLAS ABSOLUTAS: NUNCA inventes servicios, precios ni información de contacto. Usa solo los datos a continuación.

DATOS DE CONTEXTO:
${context}

TOOL CALLING: Tienes herramientas disponibles (get_services, get_contact_info, get_faq_answer, check_availability). ÚSALAS cuando el usuario pregunte sobre servicios, precios, disponibilidad o contacto. Así le das datos REALES y actualizados.

REGLAS:
1. Cuando pregunten por servicios/precios/actividades → usa get_services para obtener datos reales
2. Cuando pregunten por contacto/horario/ubicación → usa get_contact_info
3. Cuando pregunten algo común → usa get_faq_answer
4. Cuando pregunten por disponibilidad/cupo → usa check_availability
5. Puedes usar tu conocimiento general sobre turismo en Ecuador y lugares cercanos
6. Responde cálido como guía local, 3-5 párrafos máximo
7. Al mencionar un servicio o atractivo SIEMPRE incluye: nombre, descripción breve, precio (si existe), y una acción sugerida (ej: "puedes consultar disponibilidad", "realizar una reserva", "visitar nuestra sección de servicios")
8. Si un servicio no existe, dilo honestamente y sugiere alternativas similares
9. Si la pregunta no tiene relación con turismo en Ecuador o Las Rocas (ej: capitales, matemáticas, política), responde amablemente que te especializas en información turística de Las Rocas y pregúntale si tiene dudas sobre nuestros servicios
10. IDIOMA: Estás respondiendo en ESPAÑOL. Siempre responde en ESPAÑOL.`;
  }

  private buildChatHistory(session: ChatbotSession): AiChatMessage[] {
    const messages: AiChatMessage[] = [];
    if (session.summary) {
      const summaryLabel = session.language === 'en' ? `[Previous conversation summary: ${session.summary}]` : `[Resumen de conversación anterior: ${session.summary}]`;
      const ack = session.language === 'en' ? 'Understood, continuing the conversation.' : 'Entendido, continúo la conversación.';
      messages.push({ role: 'user' as const, content: summaryLabel });
      messages.push({ role: 'model' as const, content: ack });
    }
    for (const msg of session.history) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content,
      });
    }
    return messages;
  }

  private async executeFunction(call: FunctionCall): Promise<Record<string, any>> {
    switch (call.name) {
      case 'get_services': {
        const all = await this.serviceRepository.findAll(true);
        let filtered = all;
        if (call.args?.category) {
          filtered = filtered.filter(s => s.category === call.args.category);
        }
        if (call.args?.keyword) {
          const kw = call.args.keyword.toLowerCase();
          filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(kw) ||
            (s.description && s.description.toLowerCase().includes(kw))
          );
        }
        return {
          services: filtered.map(s => ({
            name: s.name,
            description: s.description,
            price: `$${s.price || 0} ${s.currency || 'USD'}`,
            category: s.category,
            duration: s.duration,
            schedule: s.schedule,
            location: s.location,
          })),
        };
      }

      case 'get_contact_info': {
        const org = await this.organizationRepository.find();
        return {
          name: org?.name || 'Asociación Turística Las Rocas',
          phone: org?.phone || 'Disponible en la página web',
          email: org?.email || 'Disponible en la página web',
          address: org?.address || 'Comuna San Miguel, Cantón Naranjal, Provincia del Guayas, Ecuador',
          website: org?.website || '',
        };
      }

      case 'get_faq_answer': {
        const results = await this.chatbotRepository.search(call.args?.query || '');
        const best = results.filter(q => (q.relevance ?? 0) >= 20).slice(0, 2);
        return {
          answers: best.map(f => ({ question: f.question, answer: f.answer })),
        };
      }

      case 'check_availability': {
        const targetDate = this.parseDateArg(call.args?.date);
        if (!targetDate) {
          return { available: false, message: 'No pude entender la fecha. Por favor, especifica una fecha como "mañana", "domingo" o "10 de agosto".' };
        }
        const people = call.args?.people || 2;
        this.logger.info('check_availability ejecutada', { date: targetDate.toISOString(), people });

        const allServices = await this.serviceRepository.findAll(true);
        const servicesWithCapacity = allServices.filter(s => (s.maxCapacity ?? 0) > 0);
        if (servicesWithCapacity.length === 0) {
          return {
            available: true,
            date: targetDate.toISOString().split('T')[0],
            people,
            suggestedAction: 'reservar',
            message: 'No hay servicios con límite de capacidad registrados. Puedes continuar con el formulario de reserva para registrar tu visita.',
          };
        }

        let anyAvailable = false;
        let totalCapacity = 0;
        const details: { name: string; spots: number }[] = [];

        for (const svc of servicesWithCapacity) {
          const capacity = svc.maxCapacity ?? 0;
          try {
            const used = this.reservationRepository
              ? await this.reservationRepository.getAvailability(svc.id, targetDate.toISOString().split('T')[0])
              : 0;
            const spots = capacity - used;
            totalCapacity += spots;
            details.push({ name: svc.name, spots });
            if (spots > 0) anyAvailable = true;
          } catch {
            details.push({ name: svc.name, spots: capacity });
            totalCapacity += capacity;
            if (capacity > 0) anyAvailable = true;
          }
        }

        const dateStr = targetDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        if (!anyAvailable || totalCapacity < people) {
          return {
            available: false,
            date: targetDate.toISOString().split('T')[0],
            people,
            details,
            message: `Para el ${dateStr} no hay disponibilidad suficiente para ${people} persona${people !== 1 ? 's' : ''}. Te recomiendo seleccionar otra fecha o consultar disponibilidad con menos personas.`,
          };
        }

        return {
          available: true,
          date: targetDate.toISOString().split('T')[0],
          people,
          details,
          message: `Sí, existe disponibilidad para el ${dateStr}${people > 1 ? ` para ${people} personas` : ''}. Puedes continuar con el formulario de reserva para registrar tu visita.`,
        };
      }

      default:
        return { error: `Función desconocida: ${call.name}` };
    }
  }

  private async getRelatedQuestions(query: string): Promise<{ question: string; answer: string }[] | undefined> {
    const related = await this.chatbotRepository.search(query);
    const filtered = related.filter(q => (q.relevance ?? 0) >= 10).slice(0, 3);
    return filtered.length > 0 ? filtered.map(q => ({ question: q.question, answer: q.answer })) : undefined;
  }

  private async getOrCreateSession(sessionId?: string): Promise<ChatbotSession> {
    if (!sessionId) {
      return { id: '', history: [], summary: '', language: 'es', createdAt: new Date(), updatedAt: new Date() } as ChatbotSession;
    }
    if (this.sessions.has(sessionId)) return this.sessions.get(sessionId)!;

    let session: ChatbotSession | null = null;
    if (this.sessionRepository) {
      session = await this.sessionRepository.findById(sessionId);
    }

    if (!session) {
      session = { id: sessionId, history: [], summary: '', language: 'es', createdAt: new Date(), updatedAt: new Date() };
    }

    this.sessions.set(sessionId, session);
    return session;
  }

  private async persistSession(session: ChatbotSession): Promise<void> {
    if (!session.id || !this.sessionRepository) return;
    try {
      await this.sessionRepository.save(session);
    } catch (e) {
      this.logger.error('Error al guardar sesión', e);
    }
  }

  private trimHistory(session: ChatbotSession): void {
    if (session.history.length <= MAX_HISTORY * 2) return;
    const keep = session.history.slice(-MAX_HISTORY * 2);
    const removed = session.history.slice(0, session.history.length - MAX_HISTORY * 2);
    session.history = keep;
    const isEn = session.language === 'en';
    for (const msg of removed) {
      const preview = msg.content.length > 100 ? msg.content.slice(0, 100) + '...' : msg.content;
      const prefix = isEn
        ? (msg.role === 'user' ? 'User asked' : 'Assistant replied')
        : (msg.role === 'user' ? 'Usuario preguntó' : 'Asistente respondió');
      session.summary += `[${prefix}: "${preview}"] `;
    }
    if (session.summary.length > 1000) {
      session.summary = '...' + session.summary.slice(-1000);
    }
  }

  private async intelligentFallback(query: string, session: ChatbotSession, sessionId?: string): Promise<ChatResult> {
    const answer = await this.buildFallbackAnswer(query, session);
    return this.buildResponse(query, answer, 'fallback', sessionId);
  }

  private async buildFallbackAnswer(query: string, session: ChatbotSession): Promise<string> {
    try {
      const results = await this.chatbotRepository.search(query);
      if (results.length > 0 && (results[0].relevance ?? 0) >= 5) {
        return results[0].answer;
      }
    } catch {
      // Ignore search errors in fallback
    }

    try {
      const services = await this.serviceRepository.findAll(true);
      if (services.length > 0) {
        const list = services.map(s => `- ${s.name}: $${s.price || 0} ${s.currency || 'USD'}`).join('\n');
        if (session.language === 'en') {
          return `I specialize in tourism information about "Las Rocas" in Ecuador. I couldn't find a specific answer to your question, but here are our available services:\n\n${list}\n\nWould you like more details about any of them?`;
        }
        return `Me especializo en información turística sobre "Las Rocas" en Ecuador. No encontré una respuesta específica a tu consulta, pero estos son nuestros servicios disponibles:\n\n${list}\n\n¿Te gustaría más detalles de alguno?`;
      }
    } catch {
      // Ignore service fetch errors in fallback
    }

    return session.language === 'en'
      ? 'I specialize in tourism information about "Las Rocas" in Ecuador. Feel free to ask me about our services, attractions, availability, or contact information!'
      : 'Me especializo en información turística sobre "Las Rocas" en Ecuador. ¡Pregúntame sobre nuestros servicios, atractivos, disponibilidad o información de contacto!';
  }

  private async buildResponse(query: string, answer: string, source: 'faq' | 'ai' | 'fallback', sessionId?: string): Promise<ChatResult> {
    const logId = await this.logInteraction(query, answer, source, undefined, sessionId);
    const related = await this.getRelatedQuestions(query);
    return { answer, aiGenerated: source === 'ai', logId, relatedQuestions: related };
  }

  private parseDateArg(raw: string | undefined): Date | null {
    if (!raw) return new Date();
    const input = raw.trim().toLowerCase();

    // "hoy"
    if (input === 'hoy' || input === 'today') return new Date();

    // "mañana" / "tomorrow"
    if (input === 'mañana' || input === 'manana' || input === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    }

    // "pasado mañana" / "day after tomorrow"
    if (input === 'pasado mañana' || input === 'pasado manana' || input === 'day after tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d;
    }

    // Días de la semana en español: "domingo", "lunes", etc.
    const dayNames: Record<string, number> = {
      domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3,
      jueves: 4, viernes: 5, sábado: 6, sabado: 6,
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6,
    };
    const dayNum = dayNames[input];
    if (dayNum !== undefined) {
      const d = new Date();
      const today = d.getDay();
      let diff = dayNum - today;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d;
    }

    // "este domingo", "este lunes", etc.
    for (const [name, num] of Object.entries(dayNames)) {
      if (input.includes(name)) {
        const d = new Date();
        const today = d.getDay();
        let diff = num - today;
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);
        return d;
      }
    }

    // Fecha ISO (YYYY-MM-DD)
    const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      if (!isNaN(d.getTime())) return d;
    }

    // "10 de agosto" o "10 de agosto 2026"
    const esMatch = input.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/);
    if (esMatch) {
      const monthNames: Record<string, number> = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
        julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9,
        noviembre: 10, diciembre: 11,
      };
      const month = monthNames[esMatch[2]];
      if (month !== undefined) {
        const year = esMatch[3] ? parseInt(esMatch[3]) : new Date().getFullYear();
        const d = new Date(year, month, parseInt(esMatch[1]));
        if (!isNaN(d.getTime())) return d;
      }
    }

    // "agosto 10" (formato inglés)
    const enMatch = input.match(/([a-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/);
    if (enMatch) {
      const monthNames: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      };
      const month = monthNames[enMatch[1]];
      if (month !== undefined) {
        const year = enMatch[3] ? parseInt(enMatch[3]) : new Date().getFullYear();
        const d = new Date(year, month, parseInt(enMatch[2]));
        if (!isNaN(d.getTime())) return d;
      }
    }

    // Último recurso: intentar parse directo
    const fallback = new Date(input);
    if (!isNaN(fallback.getTime())) return fallback;

    return null;
  }

  private trimContext(context: string, maxChars: number = 8000): string {
    if (context.length <= maxChars) return context;
    return '...' + context.slice(-maxChars);
  }

  clearContextCache(): void {
    this.contextCache = null;
    this.embeddingService?.invalidateCache();
  }

  async createQuestion(data: CreateChatbotQuestionData): Promise<ChatbotQuestion> {
    if (!data.question || !data.answer || !data.category) throw new ValidationError('Pregunta, respuesta y categoría son requeridos');
    if (!data.keywords || data.keywords.length === 0) throw new ValidationError('Al menos una palabra clave es requerida');
    this.contextCache = null;
    return this.chatbotRepository.create(data);
  }

  async updateQuestion(id: string, data: UpdateChatbotQuestionData): Promise<ChatbotQuestion> {
    const q = await this.chatbotRepository.update(id, data);
    if (!q) throw new NotFoundError('Pregunta no encontrada');
    this.contextCache = null;
    return q;
  }

  async deleteQuestion(id: string): Promise<void> {
    const deleted = await this.chatbotRepository.delete(id);
    if (!deleted) throw new NotFoundError('Pregunta no encontrada');
    this.contextCache = null;
  }

  async initializeDefaultQuestions(): Promise<void> {
    const existing = await this.chatbotRepository.findAll(false);
    if (existing.length > 0) return;

    const defaults = [
      { keywords: ['horario', 'atencion', 'abren', 'abierto', 'horarios', 'atienden'], question: '¿Cuál es el horario de atención?', answer: 'Nuestro horario de atención es de lunes a sábado de 8:00 AM a 6:00 PM. Los domingos y feriados atendemos solo con reserva previa.', category: 'general', priority: 10 },
      { keywords: ['ubicacion', 'direccion', 'donde', 'mapa', 'ubicados', 'llegar'], question: '¿Dónde están ubicados?', answer: 'Estamos ubicados en la Comuna San Miguel, Cantón Naranjal, Provincia del Guayas, Ecuador.', category: 'general', priority: 10 },
      { keywords: ['contacto', 'contactar', 'whatsapp', 'telefono', 'llamar'], question: '¿Cómo puedo contactarlos?', answer: 'Puedes contactarnos a través del formulario web en nuestra sección de Contacto, por WhatsApp al número disponible en nuestra página, o visitándonos directamente.', category: 'contacto', priority: 9 },
      { keywords: ['servicios', 'ofrecen', 'tours', 'actividades', 'que hacer'], question: '¿Qué servicios ofrecen?', answer: 'Ofrecemos una variedad de servicios turísticos que incluyen hospedaje, gastronomía, actividades de aventura, experiencias culturales, transporte y paquetes completos.', category: 'servicios', priority: 10 },
      { keywords: ['reserva', 'reservar', 'agendar', 'apartar', 'reservacion'], question: '¿Cómo puedo hacer una reserva?', answer: 'Reservar es muy fácil: ve a nuestra sección de Servicios, selecciona el que más te guste y completa el formulario de reserva con tus datos.', category: 'reservas', priority: 10 },
      { keywords: ['pago', 'pagar', 'pagos', 'transferencia', 'efectivo'], question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos efectivo en dólares americanos (USD), transferencia bancaria y depósito en cuenta.', category: 'servicios', priority: 8 },
      { keywords: ['clima', 'temperatura', 'tiempo', 'llevar', 'ropa'], question: '¿Qué clima hace y qué debo llevar?', answer: 'El clima es cálido y tropical durante todo el año, entre 25°C y 32°C. Lleva ropa ligera, zapatos para caminar, bloqueador solar, sombrero, repelente y traje de baño.', category: 'general', priority: 7 },
      { keywords: ['llegar', 'como', 'transporte', 'bus', 'auto', 'ruta'], question: '¿Cómo puedo llegar a Las Rocas?', answer: 'Puedes llegar en bus desde Guayaquil o Naranjal, en auto por la vía Naranjal–Costa, o podemos coordinar un recojo desde Naranjal.', category: 'general', priority: 8 },
      { keywords: ['cultura', 'cultural', 'tradiciones', 'artesania', 'danza', 'musica'], question: '¿Qué experiencias culturales ofrecen?', answer: 'Ofrecemos presentaciones de música y danza tradicional, talleres de artesanía local, degustación de platos típicos y recorridos guiados por la comunidad.', category: 'servicios', priority: 7 },
      { keywords: ['asociacion', 'quienes', 'historia'], question: '¿Quiénes son?', answer: 'Las Rocas es una asociación comunitaria de turismo sostenible en Comuna San Miguel, Naranjal, Guayas, Ecuador.', category: 'general', priority: 8 },
    ];

    for (const q of defaults) { await this.chatbotRepository.create(q); }
  }

  async getStats(): Promise<ChatbotStats> {
    if (!this.logRepository) return { total: 0, faq: 0, ai: 0, fallback: 0, byConfidence: { alta: 0, media: 0, baja: 0 }, daily: [], recentLogs: [] };
    return this.logRepository.getStats();
  }

  private async logInteraction(query: string, answer: string, source: 'faq' | 'ai' | 'fallback', matchedQuestion?: string, sessionId?: string): Promise<string | undefined> {
    if (!this.logRepository) return undefined;
    try {
      return await this.logRepository.create({ query, answer, source, matchedQuestion, sessionId });
    } catch (e) {
      this.logger.error('Error al guardar log de chatbot', e);
      return undefined;
    }
  }
}
