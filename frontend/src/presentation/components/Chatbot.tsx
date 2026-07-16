import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { container } from '../../di/container';
import type { TouristicService } from '../../domain/entities/TouristicService';
import type { Organization } from '../../domain/entities/Organization';

function useResizable(initialW: number, initialH: number, minW: number, minH: number, maxW: number, maxH: number) {
  const [size, setSize] = useState({ w: initialW, h: initialH });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }, [size]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setSize({
      w: Math.min(maxW, Math.max(minW, start.current.w - dx)),
      h: Math.min(maxH, Math.max(minH, start.current.h + dy)),
    });
  }, [minW, minH, maxW, maxH]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }, []);

  useEffect(() => () => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }, []);

  return { size, onPointerDown };
}

function getActionCards(t: (key: string) => string) {
  return [
    { id: 'attractions', label: t('chatbot.actionAttractions'), query: t('chatbot.actionAttractionsQuery'), desc: t('chatbot.actionAttractionsDesc') },
    { id: 'activities', label: t('chatbot.actionActivities'), query: t('chatbot.actionActivitiesQuery'), desc: t('chatbot.actionActivitiesDesc') },
    { id: 'lodging', label: t('chatbot.actionLodging'), query: t('chatbot.actionLodgingQuery'), desc: t('chatbot.actionLodgingDesc') },
    { id: 'products', label: t('chatbot.actionProducts'), query: t('chatbot.actionProductsQuery'), desc: t('chatbot.actionProductsDesc') },
    { id: 'events', label: t('chatbot.actionEvents'), query: t('chatbot.actionEventsQuery'), desc: t('chatbot.actionEventsDesc') },
    { id: 'faq', label: t('chatbot.actionFaq'), query: t('chatbot.actionFaqQuery'), desc: t('chatbot.actionFaqDesc') },
  ];
}

function getValueLabels(t: (key: string) => string) {
  return [
    t('chatbot.valueSostenible'),
    t('chatbot.valueComunidades'),
    t('chatbot.valueAutenticas'),
    t('chatbot.valueEntorno'),
  ];
}

function GuideAvatar() {
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full">
      <defs>
        <linearGradient id="hatGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A1887F" />
          <stop offset="100%" stopColor="#6D4C41" />
        </linearGradient>
        <linearGradient id="uniGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="55" r="46" fill="#4CAF50" className="opacity-[0.04]" />

      <ellipse cx="50" cy="35" rx="30" ry="8" fill="url(#hatGrad)" />
      <path d="M35 35 Q50 18 65 35 Z" fill="#8D6E63" />
      <rect x="35" y="33" width="30" height="3" rx="1.5" fill="#4CAF50" className="opacity-60" />

      <circle cx="50" cy="48" r="16" fill="#F5E6D3" />

      <circle cx="44" cy="45" r="2" fill="#37474F" />
      <circle cx="56" cy="45" r="2" fill="#37474F" />
      <circle cx="44" cy="45" r="3.5" fill="#4CAF50" className="opacity-[0.06]" />
      <circle cx="56" cy="45" r="3.5" fill="#4CAF50" className="opacity-[0.06]" />

      <path d="M46 53 Q50 56 54 53" fill="none" stroke="#37474F" strokeWidth="1.2" strokeLinecap="round" />

      <circle cx="40" cy="50" r="2.5" fill="#FFAB91" className="opacity-25" />
      <circle cx="60" cy="50" r="2.5" fill="#FFAB91" className="opacity-25" />

      <rect x="46" y="62" width="8" height="4" rx="2" fill="#F5E6D3" className="opacity-80" />

      <path d="M36 66 L35 95 L65 95 L64 66 Z" fill="url(#uniGrad)" />

      <path d="M36 66 L50 62 L64 66" fill="#1B5E20" />
      <line x1="50" y1="62" x2="50" y2="66" stroke="#1B5E20" strokeWidth="1" />

      <path d="M50 76 Q53 72 56 76 Q53 79 50 76 Z" fill="#4CAF50" className="opacity-80" />
      <path d="M50 76 Q52 73 54 76" fill="none" stroke="#2E7D32" strokeWidth="0.5" className="opacity-40" />
    </svg>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  const lines = text.split('\n');
  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) segments.push(<br key={`br-${lineIdx}`} />);
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        segments.push(<strong key={`b-${lineIdx}-${partIdx}`}>{part.slice(2, -2)}</strong>);
      } else {
        const urlParts = part.split(/(https?:\/\/[^\s]+)/g);
        urlParts.forEach((urlPart, urlIdx) => {
          if (/^https?:\/\//.test(urlPart)) {
            segments.push(
              <a key={`a-${lineIdx}-${partIdx}-${urlIdx}`} href={urlPart} target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white/80 transition-colors">
                {urlPart}
              </a>
            );
          } else {
            segments.push(<span key={`t-${lineIdx}-${partIdx}-${urlIdx}`}>{urlPart}</span>);
          }
        });
      }
    });
  });
  return segments;
}

function getCardIcon(id: string) {
  const p = { className: 'w-4 h-4 text-green-700', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' };
  switch (id) {
    case 'attractions':
      return <svg {...p}><path d="M2 20L9 8l4 6 3-4 6 10H2z" /></svg>;
    case 'activities':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'lodging':
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case 'products':
      return <svg {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    case 'events':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
    case 'faq':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    default:
      return null;
  }
}

type BotMessage = { role: 'user' | 'bot'; content: string; time: string; logId?: string; aiGenerated?: boolean; relatedQuestions?: { question: string; answer: string }[] };
type GroupedMessage = BotMessage & { showAvatar: boolean };
type CardItem = { id: string; label: string; query: string; desc: string };

function groupMessages(msgs: BotMessage[]): GroupedMessage[] {
  return msgs.reduce((acc: GroupedMessage[], msg, i) => {
    const prev = msgs[i - 1];
    const showAvatar = msg.role === 'bot' && prev?.role !== 'bot';
    acc.push({ ...msg, showAvatar });
    return acc;
  }, []);
}

export default function Chatbot() {
  const { t } = useTranslation();
  const location = useLocation();
  const actionCards = getActionCards(t);
  const valueLabels = getValueLabels(t);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('chatbot_session_id');
    if (stored) return stored;
    const newId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('chatbot_session_id', newId);
    return newId;
  });
  const [messages, setMessages] = useState<BotMessage[]>([
    { role: 'bot', content: t('chatbot.greeting'), time: formatTime(new Date()) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showCards, setShowCards] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState<{ text: string }[]>([]);
  const [services, setServices] = useState<TouristicService[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const lastTopicRef = useRef<string>('');
  const lastMentionedServiceRef = useRef<string>('');
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const [showResetBanner, setShowResetBanner] = useState(false);

  useEffect(() => {
    if (isOpen && services.length === 0) {
      Promise.all([
        container.services.getAllActive().catch(() => []),
        container.organization.get().catch(() => null),
      ]).then(([svc, orgData]) => {
        setServices(svc);
        setOrg(orgData);
      });
    }
  }, [isOpen, services.length]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    };
    const el = containerRef.current;
    if (el) el.addEventListener('scroll', onScroll, { passive: true });
    return () => el?.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
      setShowTooltip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      tooltipTimer.current = setTimeout(() => setShowTooltip(true), 12000);
    }
    return () => clearTimeout(tooltipTimer.current);
  }, [isOpen]);

  const isServicePage = location.pathname.startsWith('/servicios/');
  const currentServiceId = isServicePage ? location.pathname.split('/servicios/')[1] : '';
  const currentService = isServicePage ? services.find(s => s.id === currentServiceId || s.name.toLowerCase().replace(/\s+/g, '-') === currentServiceId.toLowerCase()) : null;
  useEffect(() => { if (isOpen && currentService) { lastMentionedServiceRef.current = currentService.name; } }, [isOpen, currentService]);
  const { size, onPointerDown } = useResizable(416, 640, 300, 480, 600, 900);

  const sendFeedback = async (logId: string, type: 'like' | 'dislike', msgIndex: number) => {
    if (feedbackGiven.has(msgIndex)) return;
    try {
      await container.chatbot.sendFeedback(logId, type);
      setFeedbackGiven(prev => new Set(prev).add(msgIndex));
    } catch { /* silent */ }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = useCallback(async (e?: React.FormEvent, suggestedText?: string) => {
    if (e) e.preventDefault();
    const text = suggestedText || input.trim();
    if (!text || loading) return;

    setShowSuggestions(false);
    setShowCards(false);
    setCurrentSuggestions([]);
    setShowResetBanner(false);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text, time: formatTime(new Date()) }]);
    setLoading(true);

    const lower = text.toLowerCase();

    if (/^gracias|^ayuda|^ok|^okey|^vale|^listo|^entendido/i.test(lower)) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
      setMessages((prev) => [...prev, { role: 'bot', content: '¡De nada! Si tienes más preguntas, aquí estoy. 🌿', time: formatTime(new Date()) }]);
      setCurrentSuggestions([{ text: 'Hablar con un asesor' }, { text: 'Volver al inicio' }]);
      setShowSuggestions(true);
      setShowResetBanner(false);
      setLoading(false);
      return;
    }

    try {
      const res = await container.chatbot.chat(text, sessionId);
      let responseText = res.answer;
      if (res.matchedQuestion && res.confidence === 'baja') {
        responseText = `*Entendí que preguntas sobre:* ${res.matchedQuestion}\n\n${res.answer}`;
      }
      if (res.matchedQuestion && res.confidence === 'media') {
        responseText = `📌 ${res.matchedQuestion}\n\n${res.answer}`;
      }
      lastTopicRef.current = res.matchedQuestion || 'general';
      setMessages((prev) => [...prev, { role: 'bot', content: responseText, time: formatTime(new Date()), logId: res.logId, aiGenerated: res.aiGenerated, relatedQuestions: res.relatedQuestions }]);
      const related = (res.relatedQuestions || []).map(q => ({ text: q.question }));
      setCurrentSuggestions([
        ...related,
        ...(res.aiGenerated ? [
          { text: 'Hablar con un asesor' },
          { text: 'Volver al inicio' },
        ] : [
          { text: 'Más información' },
          { text: 'Hablar con un asesor' },
          { text: 'Volver al inicio' },
        ]),
      ]);
      setShowSuggestions(true);
      setShowResetBanner(false);
      setLoading(false);
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: t('chatbot.errorMessage'),
        time: formatTime(new Date()),
      }]);
      setCurrentSuggestions([
        { text: 'Intentar de nuevo' },
        { text: 'Contactar asesor' },
      ]);
      setShowSuggestions(true);
      setShowResetBanner(false);
      setLoading(false);
    }
  }, [input, loading, services, org]);

  const resetChat = () => {
    setMessages([{
      role: 'bot',
      content: t('chatbot.greeting'),
      time: formatTime(new Date()),
    }]);
    setShowSuggestions(false);
    setShowCards(true);
    setCurrentSuggestions([]);
    setShowResetBanner(false);
  };

  const handleCardClick = (card: CardItem) => {
    setShowCards(false);
    handleSubmit(undefined, card.query);
  };

  const groupedMessages = groupMessages(messages);
  const latestBotMsgIndex = (() => {
    for (let i = groupedMessages.length - 1; i >= 0; i--) {
      if (groupedMessages[i].role === 'bot') return i;
    }
    return -1;
  })();

  return (
    <>
      <style>{`
        @keyframes typing-dot { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 999px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>

      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-28 right-6 z-40 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_-8px_rgba(22,163,74,0.15)] px-4 py-3 border border-green-100 relative">
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-green-100 rotate-45" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex-shrink-0">
                  <GuideAvatar />
                </div>
                <p className="text-sm text-gray-700 font-medium">{t('chatbot.tooltip')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ring-1 ring-white/20"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(22,163,74,0.3)' }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('chatbot.ariaLabel')}
          >
            <div className="w-8 h-8">
              <GuideAvatar />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-24 right-6 z-50 overflow-hidden rounded-2xl shadow-xl max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!bottom-0 max-sm:!right-0 max-sm:!rounded-none select-none flex flex-col bg-white border border-gray-200"
            style={{ width: size.w, height: size.h, maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-800 to-green-900 relative">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full ring-2 ring-white/30 overflow-hidden p-1 bg-green-200">
                      <GuideAvatar />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{t('chatbot.headerTitle')}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[11px] text-green-300">{t('chatbot.online')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={resetChat}
                      whileHover={{ rotate: 30 }}
                      className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                      title={t('chatbot.newChat')}
                    >
                      <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.button>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                      whileHover={{ rotate: 90 }}
                      title={t('chatbot.close')}
                    >
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
                {isServicePage && (
                  <div className="mt-2 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 border border-white/10">
                    {currentService ? (
                      <span>{t('chatbot.consultingService')} <strong className="text-white">{currentService.name}</strong></span>
                    ) : (
                      <span>{t('chatbot.askService')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto flex flex-col scrollbar-custom bg-gray-50/50"
              style={{ scrollbarWidth: 'thin' }}
            >
              {showCards && messages.length <= 1 ? (
                <div className="flex flex-col flex-1 px-4 pt-4 pb-2 overflow-hidden">
                  {/* Greeting bubble */}
                  <div className="flex items-end gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-1 ring-2 ring-green-200/60 shadow-sm">
                      <GuideAvatar />
                    </div>
                    <div className="max-w-[85%]">
                      <div className="p-4 rounded-2xl bg-white text-gray-800 border border-gray-200">
                        <div className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                          </svg>
                          <p className="text-sm leading-relaxed">{t('chatbot.greeting')}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">{formatTime(new Date())}</p>
                    </div>
                  </div>

                  {/* Action grid */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="flex-1"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      {actionCards.map((card, i) => (
                        <motion.button
                          key={card.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
                          whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleCardClick(card)}
                          className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all text-left group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                            {getCardIcon(card.id)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-800 leading-tight block">{card.label}</span>
                            <span className="text-[10px] text-gray-500 leading-relaxed mt-0.5 block">{card.desc}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  key="conversation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pt-3"
                >
                  {groupedMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex items-end gap-2.5 mb-3 last:mb-0 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'bot' && (
                        <div className={`flex-shrink-0 transition-all duration-200 ${msg.showAvatar ? 'opacity-100 w-7 h-7' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                          {msg.showAvatar && (
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden p-1 ring-2 ring-green-200/50 shadow-sm">
                              <GuideAvatar />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="max-w-[88%]">
                        <motion.div
                          layout
                          className={`p-4 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          {msg.role === 'bot' && (msg as any).aiGenerated && (
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded">{t('chatbot.aiLabel')}</span>
                              <span className="text-[10px] text-gray-400">{t('chatbot.aiResponse')}</span>
                            </div>
                          )}
                          {msg.role === 'bot' ? (
                            <div className="flex items-start gap-2.5">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                              </svg>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{renderMarkdown(msg.content)}</p>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{renderMarkdown(msg.content)}</p>
                          )}
                        </motion.div>
                        <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end mr-1' : 'justify-between ml-1'}`}>
                          <p className="text-[10px] text-gray-400">{msg.time}</p>
                          {msg.role === 'bot' && i > 0 && i === latestBotMsgIndex && !feedbackGiven.has(i) && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => msg.logId && sendFeedback(msg.logId, 'like', i)}
                                className="text-gray-300 hover:text-green-500 transition-colors p-0.5"
                                title={t('chatbot.feedbackLike')}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => msg.logId && sendFeedback(msg.logId, 'dislike', i)}
                                className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                                title={t('chatbot.feedbackDislike')}
                              >
                                <svg className="w-3.5 h-3.5 scale-y-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {msg.role === 'bot' && feedbackGiven.has(i) && (
                            <span className="text-[10px] text-green-500 font-medium">✓ {t('chatbot.feedbackThanks')}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-end gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden p-1 ring-2 ring-green-200/50 shadow-sm">
                        <GuideAvatar />
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-typing-dot" />
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">{t('chatbot.typing')}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 border border-gray-100 z-10 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.button>
            )}

            {/* Suggestions */}
            {showSuggestions && currentSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 pb-2.5 pt-2.5 border-t border-gray-100 bg-white"
              >
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.map((s) => (
                    <motion.button
                      key={s.text}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit(undefined, s.text)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
                    >
                      {s.text}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reset banner */}
            {showResetBanner && messages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1.5 bg-gray-50 border-t border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-500">{t('chatbot.resetQuestion')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleSubmit(undefined, 'gracias')} className="text-[11px] text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('chatbot.resetFinish')}</button>
                    <button onClick={resetChat} className="text-[11px] text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('chatbot.resetNewQuery')}</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 bg-white">
              <form onSubmit={(e) => handleSubmit(e)} className="px-4 py-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chatbot.inputPlaceholder')}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading || !input.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Value bar */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-800 to-green-900 py-3 px-4">
              <div className="flex items-center justify-around gap-4">
                {valueLabels.map((label) => (
                  <span key={label} className="text-[10px] text-white/90 font-medium text-center leading-snug">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Resize handle */}
            <div
              onPointerDown={onPointerDown}
              className="absolute bottom-0 left-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity"
              style={{ touchAction: 'none' }}
            >
              <svg className="w-full h-full text-green-300" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 14H10V12H12V10H14V14ZM10 10H6V8H8V6H10V10Z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
