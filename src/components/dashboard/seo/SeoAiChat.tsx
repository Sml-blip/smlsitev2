'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';
type SeoTask = 'title' | 'description' | 'keywords' | 'longtail' | 'alt' | 'schema' | 'full';

interface Message {
  id: string;
  role: Role;
  content: string;
  task?: SeoTask;
  confidence?: number;
  durationMs?: number;
  timestamp: number;
}

// ─── Quick-action chips ───────────────────────────────────────────────────────

const QUICK_ACTIONS: { label: string; task: SeoTask; prompt: string; emoji: string }[] = [
  { label: 'Meta Title',       task: 'title',       prompt: 'Write an optimized meta title for my store homepage', emoji: '📝' },
  { label: 'Meta Description', task: 'description', prompt: 'Write a meta description for my store homepage',      emoji: '📄' },
  { label: 'Keywords',         task: 'keywords',    prompt: 'Find the best keywords for my tech store in Tunisia', emoji: '🔑' },
  { label: 'Long-tail',        task: 'longtail',    prompt: 'Generate long-tail keywords for my laptop category',  emoji: '📈' },
  { label: 'Alt Text',         task: 'alt',         prompt: 'Write an alt text for my product main image',         emoji: '🖼️' },
  { label: 'Schema JSON-LD',   task: 'schema',      prompt: 'Generate a Schema.org Product JSON-LD for my store',  emoji: '⚙️' },
];

const STORAGE_KEY = 'seo_ai_chat_history';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SeoAiChatProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preloadMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeoAiChat({ open: controlledOpen, onOpenChange, preloadMessage }: SeoAiChatProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'unknown' | 'ready' | 'offline'>('unknown');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Check Ollama health on first open
  useEffect(() => {
    if (!open || ollamaStatus !== 'unknown') return;
    fetch('/api/seo/ai')
      .then((r) => r.json())
      .then((d) => setOllamaStatus(d.status === 'ready' ? 'ready' : 'offline'))
      .catch(() => setOllamaStatus('offline'));
  }, [open, ollamaStatus]);

  // Handle preloaded message from notification click
  useEffect(() => {
    if (open && preloadMessage) {
      setInput(preloadMessage);
    }
  }, [open, preloadMessage]);

  const sendMessage = useCallback(
    async (text: string, task: SeoTask = 'full') => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/seo/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text.trim(), task }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'API error');
        }

        const data = await res.json();

        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.result,
          task: data.task,
          confidence: data.confidence,
          durationMs: data.durationMs,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        const error = err as Error;
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Erreur: ${error.message}. Vérifiez qu'Ollama est lancé avec \`ollama serve\`.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
        toast.error('SEO AI hors ligne', { description: error.message });
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Historique effacé');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  return (
    <>
      {/* ── FAB Button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl',
          'bg-[#FFCC00] hover:bg-yellow-400 text-black',
          'flex items-center justify-center transition-all duration-200',
          'hover:scale-110 active:scale-95',
          open && 'hidden'
        )}
        aria-label="Open SEO AI Assistant"
      >
        <Bot size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* ── Drawer ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-[60] flex flex-col',
          'w-[380px] max-w-[95vw]',
          'bg-white',
          'border-l border-border shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#FFCC00]/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFCC00] flex items-center justify-center">
              <Bot size={18} className="text-black" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">SEO AI Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    ollamaStatus === 'ready'
                      ? 'bg-green-500'
                      : ollamaStatus === 'offline'
                      ? 'bg-red-500'
                      : 'bg-yellow-500 animate-pulse'
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {ollamaStatus === 'ready'
                    ? 'Qwen3 0.6b — En ligne'
                    : ollamaStatus === 'offline'
                    ? 'Hors ligne'
                    : 'Vérification…'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              title="Effacer l'historique"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-3 py-2 border-b shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.task}
                onClick={() => sendMessage(a.prompt, a.task)}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-full border hover:bg-[#FFCC00]/20 hover:border-[#FFCC00] transition-colors disabled:opacity-50"
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
              <Sparkles size={32} className="text-[#FFCC00]" />
              <div>
                <p className="font-medium text-sm text-foreground">SEO AI prêt à vous aider</p>
                <p className="text-xs mt-1">Posez une question ou utilisez les raccourcis ci-dessus</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-[#FFCC00] text-black rounded-br-sm font-medium'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                {/* AI response metadata */}
                {msg.role === 'assistant' && msg.task && (
                  <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-border/50">
                    <span className="text-xs font-semibold text-[#FFCC00] uppercase tracking-wide">
                      {msg.task}
                    </span>
                    {msg.confidence !== undefined && (
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          msg.confidence >= 80
                            ? 'bg-green-100 text-green-700'
                            : msg.confidence >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {msg.confidence}%
                      </span>
                    )}
                    {msg.durationMs !== undefined && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {(msg.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                )}

                <pre className="whitespace-pre-wrap font-sans leading-relaxed text-sm break-words">
                  {msg.content}
                </pre>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    📋 Copier
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-[#FFCC00]" />
                  <span className="text-xs text-muted-foreground">Génération en cours…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Demandez une aide SEO… (Entrée pour envoyer)"
              rows={2}
              disabled={loading}
              className={cn(
                'flex-1 resize-none rounded-xl border px-3 py-2 text-sm',
                'bg-background focus:outline-none focus:ring-2 focus:ring-[#FFCC00]',
                'disabled:opacity-50 min-h-[44px] max-h-[120px]'
              )}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl bg-[#FFCC00] text-black flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">
            Qwen3 0.6b · Local · Privé · Aucune donnée envoyée en cloud
          </p>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-[59] bg-black/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
