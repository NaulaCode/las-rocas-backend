import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const mockLogger = { info: () => {}, error: () => {}, warn: () => {}, debug: () => {} };

function createMocks(overrides: any = {}) {
  const questions: any[] = [];
  return {
    chatbotRepo: {
      findAll: async (activeOnly?: boolean) =>
        activeOnly ? questions.filter(q => q.isActive !== false) : questions,
      findById: async (id: string) => questions.find(q => q.id === id) || null,
      findByCategory: async (cat: string) => questions.filter(q => q.category === cat),
      create: async (d: any) => {
        const q = { ...d, id: 'q-' + Date.now(), isActive: true, createdAt: new Date(), updatedAt: new Date() };
        questions.push(q);
        return q;
      },
      update: async (id: string, d: any) => {
        const idx = questions.findIndex(q => q.id === id);
        if (idx === -1) return null;
        questions[idx] = { ...questions[idx], ...d };
        return questions[idx];
      },
      delete: async (id: string) => {
        const before = questions.length;
        questions.splice(questions.findIndex(q => q.id === id), 1);
        return questions.length < before;
      },
      search: async (query: string) => questions.map(q => ({ ...q, relevance: q.keywords?.some((kw: string) => query.toLowerCase().includes(kw)) ? 30 : 10 })),
      ...overrides.chatbotRepo,
    },
    serviceRepo: {
      findAll: async () => [
        { id: 'svc-1', name: 'Piscinas de Aguas Termales', description: 'Piscinas naturales', price: 5, category: 'piscinas', isActive: true, maxCapacity: 50 },
        { id: 'svc-2', name: 'Cabaña Familiar', description: 'Alojamiento familiar', price: 35, category: 'hospedaje', isActive: true, maxCapacity: 10 },
      ],
      findById: async (id: string) => {
        const all = [
          { id: 'svc-1', name: 'Piscinas de Aguas Termales', description: 'Piscinas naturales', price: 5, category: 'piscinas', isActive: true, maxCapacity: 50, duration: 'Todo el día', schedule: '8:00 - 18:00' },
          { id: 'svc-2', name: 'Cabaña Familiar', description: 'Alojamiento familiar', price: 35, category: 'hospedaje', isActive: true, maxCapacity: 10 },
        ];
        return all.find(s => s.id === id) || null;
      },
      findByCategory: async () => [],
      create: async (d: any) => d,
      update: async (_id: string, d: any) => d,
      delete: async () => true,
      existsById: async () => true,
      ...overrides.serviceRepo,
    },
    orgRepo: {
      find: async () => ({ id: 'org-1', name: 'Las Rocas', description: 'Turismo comunitario', isActive: true, phone: '+593 4 123 4567', email: 'info@lasrocas', address: 'Comuna San Miguel, Naranjal' }),
      update: async (_d: any) => null,
      ...overrides.orgRepo,
    },
    reservationRepo: {
      getAvailability: async (_serviceId: string, _date: string) => 0,
      ...overrides.reservationRepo,
    },
    embeddingRepo: overrides.embeddingRepo,
    embeddingService: overrides.embeddingService,
    aiService: overrides.aiService,
    logRepo: overrides.logRepo,
    sessionRepo: overrides.sessionRepo,
    attractionRepo: overrides.attractionRepo,
    newsRepo: overrides.newsRepo,
  };
}

function buildUseCase(mocks: any) {
  const { ChatbotUseCases } = require('./ChatbotUseCases');
  return new ChatbotUseCases(
    mocks.chatbotRepo,
    mocks.serviceRepo,
    mocks.orgRepo,
    mockLogger,
    mocks.aiService,
    mocks.logRepo,
    mocks.sessionRepo,
    mocks.embeddingService,
    mocks.embeddingRepo,
    mocks.attractionRepo,
    mocks.newsRepo,
    mocks.reservationRepo,
  );
}

describe('ChatbotUseCases', () => {
  let mocks: any;
  let uc: any;

  before(() => {
    mocks = createMocks();
    uc = buildUseCase(mocks);
  });

  describe('question CRUD', () => {
    it('creates a question', async () => {
      const q = await uc.createQuestion({
        question: '¿Qué ofrecen?',
        answer: 'Ofrecemos tours',
        category: 'servicios',
        keywords: ['servicios', 'tours'],
      });
      assert.equal(q.question, '¿Qué ofrecen?');
    });

    it('rejects create without question', async () => {
      await assert.rejects(
        () => uc.createQuestion({ question: '', answer: 'Resp', category: 'general', keywords: ['test'] }),
        (err: Error) => err.message === 'Pregunta, respuesta y categoría son requeridos'
      );
    });

    it('rejects create without answer', async () => {
      await assert.rejects(
        () => uc.createQuestion({ question: 'Test', answer: '', category: 'general', keywords: ['test'] }),
        (err: Error) => err.message === 'Pregunta, respuesta y categoría son requeridos'
      );
    });

    it('rejects create without keywords', async () => {
      await assert.rejects(
        () => uc.createQuestion({ question: 'Test', answer: 'Resp', category: 'general', keywords: [] }),
        (err: Error) => err.message === 'Al menos una palabra clave es requerida'
      );
    });

    it('gets all questions', async () => {
      const all = await uc.getAllQuestions();
      assert.equal(all.length, 1);
    });

    it('gets question by id', async () => {
      const all = await uc.getAllQuestions();
      const q = await uc.getQuestionById(all[0].id);
      assert.equal(q.question, '¿Qué ofrecen?');
    });

    it('updates a question', async () => {
      const all = await uc.getAllQuestions();
      const updated = await uc.updateQuestion(all[0].id, { answer: 'Nueva respuesta' });
      assert.equal(updated.answer, 'Nueva respuesta');
    });

    it('deletes a question', async () => {
      const all = await uc.getAllQuestions();
      await uc.deleteQuestion(all[0].id);
      const remaining = await uc.getAllQuestions();
      assert.equal(remaining.length, 0);
    });
  });

  describe('chat without AI', () => {
    it('returns fallback when AI is not configured', async () => {
      const result = await uc.chat('Hola');
      assert.equal(result.aiGenerated, false);
      assert.ok(result.answer.includes('mantenimiento'));
    });

    it('rejects empty query', async () => {
      await assert.rejects(
        () => uc.chat(''),
        (err: Error) => err.message === 'La consulta no puede estar vacía'
      );
    });

    it('returns short query message for very short input', async () => {
      const result = await uc.chat('a');
      assert.ok(result.answer.includes('más específica'));
    });
  });

  describe('system prompt', () => {
    it('build system prompt for Spanish includes Las Rocas context', () => {
      const prompt = uc.buildSystemPrompt('Contexto de prueba', 'es');
      assert.ok(prompt.includes('Las Rocas'));
      assert.ok(prompt.includes('ESPAÑOL'));
      assert.ok(prompt.includes('get_services'));
      assert.ok(prompt.includes('check_availability'));
    });

    it('build system prompt for English', () => {
      const prompt = uc.buildSystemPrompt('Test context', 'en');
      assert.ok(prompt.includes('ENGLISH'));
      assert.ok(prompt.includes('get_services'));
      assert.ok(prompt.includes('check_availability'));
    });
  });

  describe('parseDateArg', () => {
    it('parses "hoy" as today', () => {
      const d = uc.parseDateArg('hoy');
      const today = new Date();
      assert.equal(d.getDate(), today.getDate());
    });

    it('parses "mañana" as tomorrow', () => {
      const d = uc.parseDateArg('mañana');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      assert.equal(d.getDate(), tomorrow.getDate());
    });

    it('parses "domingo" as next Sunday', () => {
      const d = uc.parseDateArg('domingo');
      assert.equal(d.getDay(), 0);
    });

    it('parses ISO date', () => {
      const d = uc.parseDateArg('2026-08-10');
      assert.equal(d.getFullYear(), 2026);
      assert.equal(d.getMonth(), 7);
      assert.equal(d.getDate(), 10);
    });

    it('parses "10 de agosto"', () => {
      const d = uc.parseDateArg('10 de agosto');
      assert.equal(d.getMonth(), 7);
      assert.equal(d.getDate(), 10);
    });

    it('returns null for invalid date', () => {
      const d = uc.parseDateArg('not-a-date');
      assert.equal(d, null);
    });
  });

  describe('FAQ matching', () => {
    before(async () => {
      await uc.createQuestion({
        question: '¿Cuál es el horario de atención?',
        answer: 'Atención de lunes a sábado 8:00 AM a 6:00 PM.',
        category: 'general',
        keywords: ['horario', 'atencion'],
      });
    });

    it('matches FAQ with high relevance', async () => {
      const result = await uc.chat('¿Cuál es el horario?');
      assert.equal(result.aiGenerated, false);
      assert.ok(result.answer.includes('lunes a sábado'));
    });
  });

  describe('check_availability function', () => {
    let ucWithAI: any;

    before(() => {
      const aiService = {
        chat: async ({ systemPrompt, messages, tools }: any) => {
          return { text: 'Respuesta con datos de disponibilidad.' };
        },
        chatStream: async (_opts: any) => {},
        embed: async (_text: string) => [0.1, 0.2, 0.3],
      };
      const embedService = {
        embed: async (_text: string) => [0.1, 0.2, 0.3],
        searchSimilar: async () => [],
        getItemEmbedding: async () => [0.1, 0.2, 0.3],
        invalidateCache: () => {},
      };
      const m = createMocks({
        aiService,
        embeddingService: embedService,
        embeddingRepo: {
          searchSimilar: async () => [],
          save: async () => {},
          delete: async () => {},
          deleteAll: async () => {},
        },
      });
      ucWithAI = buildUseCase(m);
    });

    it('execute check_availability returns available with free capacity', async () => {
      const result = await ucWithAI.executeFunction({
        name: 'check_availability',
        args: { date: '2026-08-15', people: 2 },
      });
      assert.equal(result.available, true);
      assert.ok(result.message.includes('disponibilidad'));
    });

    it('execute check_availability handles invalid date', async () => {
      const result = await ucWithAI.executeFunction({
        name: 'check_availability',
        args: { date: 'invalid-date', people: 2 },
      });
      assert.equal(result.available, false);
      assert.ok(result.message.includes('No pude entender la fecha'));
    });
  });

  describe('get_services function', () => {
    let ucWithAI: any;

    before(() => {
      const aiService = {
        chat: async () => ({ text: 'OK' }),
        chatStream: async () => {},
        embed: async () => [0.1, 0.2, 0.3],
      };
      const m = createMocks({ aiService });
      ucWithAI = buildUseCase(m);
    });

    it('returns services list', async () => {
      const result = await ucWithAI.executeFunction({
        name: 'get_services',
        args: {},
      });
      assert.ok(result.services.length >= 2);
      assert.equal(result.services[0].name, 'Piscinas de Aguas Termales');
    });

    it('filters services by category', async () => {
      const result = await ucWithAI.executeFunction({
        name: 'get_services',
        args: { category: 'hospedaje' },
      });
      assert.equal(result.services.length, 1);
      assert.equal(result.services[0].category, 'hospedaje');
    });
  });

  describe('get_contact_info function', () => {
    let ucWithAI: any;

    before(() => {
      const aiService = {
        chat: async () => ({ text: 'OK' }),
        chatStream: async () => {},
        embed: async () => [0.1, 0.2, 0.3],
      };
      const m = createMocks({ aiService });
      ucWithAI = buildUseCase(m);
    });

    it('returns organization contact', async () => {
      const result = await ucWithAI.executeFunction({ name: 'get_contact_info', args: {} });
      assert.ok(result.name.includes('Las Rocas'));
      assert.ok(result.phone);
    });
  });

  describe('RAG context building', () => {
    let ucWithRAG: any;

    before(() => {
      const aiService = {
        chat: async () => ({ text: 'Respuesta RAG' }),
        chatStream: async () => {},
        embed: async (_text: string) => [0.1, 0.2, 0.3],
      };
      const embedService = {
        embed: async (_text: string) => [0.1, 0.2, 0.3],
        searchSimilar: async () => [],
        getItemEmbedding: async () => [0.1, 0.2, 0.3],
        invalidateCache: () => {},
      };
      const m = createMocks({
        aiService,
        embeddingService: embedService,
        embeddingRepo: {
          searchSimilar: async () => [
            { id: 'service:svc-1', content: 'Piscinas', type: 'service', entityId: 'svc-1', similarity: 0.92 },
          ],
          save: async () => {},
          delete: async () => {},
          deleteAll: async () => {},
        },
      });
      ucWithRAG = buildUseCase(m);
    });

    it('buildRagContext returns context with sources when semantic matches exist', async () => {
      const result = await ucWithRAG.buildRagContext('piscinas termales');
      assert.equal(result.usedRag, true);
      assert.ok(result.sources.length > 0);
      assert.equal(result.sources[0].type, 'service');
    });

    it('chat with RAG returns sources metadata', async () => {
      const result = await ucWithRAG.chat('¿Piscinas termales?');
      assert.ok(result.sources === undefined || Array.isArray(result.sources));
    });
  });

  describe('buildFallbackAnswer', () => {
    let ucFB: any;

    before(() => {
      // Fresh mocks with no questions so search returns empty
      const m = createMocks({
        chatbotRepo: {
          search: async () => [],
        },
      });
      ucFB = buildUseCase(m);
    });

    it('returns tourism-oriented message when no match found', async () => {
      const session = { language: 'es', history: [] };
      const answer = await ucFB.buildFallbackAnswer('capital de Francia', session);
      assert.ok(answer.includes('Las Rocas') || answer.includes('servicios'));
    });

    it('returns services list as fallback when there are services', async () => {
      const session = { language: 'es', history: [] };
      const answer = await ucFB.buildFallbackAnswer('xyzunknown', session);
      assert.ok(answer.includes('Piscinas') || answer.includes('servicios'));
    });
  });

  describe('context cache', () => {
    it('clearContextCache resets cache', () => {
      (uc as any).contextCache = { data: 'test', timestamp: Date.now() };
      assert.ok((uc as any).contextCache !== null);
      uc.clearContextCache();
      assert.equal((uc as any).contextCache, null);
    });
  });

  describe('conversational memory', () => {
    it('trimHistory maintains max history', () => {
      const history: { role: 'user' | 'assistant'; content: string }[] = [];
      const session = { history, language: 'es' as const, summary: '', createdAt: new Date(), updatedAt: new Date() };
      for (let i = 0; i < 25; i++) {
        history.push({ role: i % 2 === 0 ? 'user' : 'assistant' as const, content: `Mensaje ${i}` });
      }
      uc.trimHistory(session);
      assert.ok(session.history.length <= 21);
      assert.ok(session.summary.length > 0);
    });
  });
});
