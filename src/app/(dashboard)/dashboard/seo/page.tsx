'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  SearchCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Zap,
  Globe,
  BarChart2,
  Tag,
  FileText,
  ArrowRight,
  PackageSearch,
  Send,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditIssue = { type: 'error' | 'warning' | 'ok'; message: string };
type ProductAudit = { id: string | number; name: string; slug: string; score: number; issues: AuditIssue[] };
type AuditData = { totalScore: number; errorCount: number; warningCount: number; audits: ProductAudit[] };

type Keyword = { query: string; clicks: number; impressions: number; ctr: number; position: number; striking: boolean };
type Page = { page: string; clicks: number; impressions: number; ctr: number; position: number };
type ChartPoint = { date: string; clicks: number; impressions: number };
type GscData = { keywords: Keyword[]; pages: Page[]; chart: ChartPoint[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.9155" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${score} ${100 - score}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function IssueIcon({ type }: { type: AuditIssue['type'] }) {
  if (type === 'error') return <AlertCircle size={14} className="text-red-500 shrink-0" />;
  if (type === 'warning') return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
}

/** Given a search query, guess which product slug it likely refers to */
function guessProductSlug(query: string, pages: Page[]): string | null {
  const q = query.toLowerCase().replace(/\s+/g, '-');
  // Check if any indexed page slug contains words from the query
  for (const p of pages) {
    const path = p.page.replace(/^https?:\/\/[^/]+/, '');
    if (path.startsWith('/shop/') || path.startsWith('/product/')) {
      const slug = path.split('/').filter(Boolean).slice(1).join('/');
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const matches = queryWords.filter(w => slug.includes(w));
      if (matches.length >= Math.ceil(queryWords.length * 0.5)) {
        return slug;
      }
    }
  }
  return null;
}

/** CTR insight: if position is good but CTR is low, the title/meta is the problem */
function getCtrInsight(k: Keyword): string | null {
  if (k.position <= 5 && k.ctr < 15) {
    return `Position #${k.position} mais seulement ${k.ctr}% de CTR — votre titre ou meta description n'est pas assez attractif pour ce mot-clé.`;
  }
  if (k.position <= 10 && k.ctr < 8) {
    return `Vous êtes en page 1 (#${k.position}) mais le CTR est faible (${k.ctr}%) — améliorez le titre produit pour inclure "${k.query}".`;
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'audit' | 'keywords' | 'pages' | 'opportunities';

export default function SeoDashboardPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('audit');
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [gscData, setGscData] = useState<GscData | null>(null);
  const [gscConnected, setGscConnected] = useState<boolean | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingGsc, setLoadingGsc] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: number; total: number; quotaHit: boolean; needsReauth?: boolean } | null>(null);

  const connected = searchParams.get('connected');
  const error = searchParams.get('error');

  const fetchAudit = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/seo/audit');
      const data = await res.json();
      setAuditData(data);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  const fetchGsc = useCallback(async () => {
    setLoadingGsc(true);
    try {
      const res = await fetch('/api/seo/gsc/data');
      if (res.status === 401) {
        setGscConnected(false);
      } else {
        const data = await res.json();
        if (data.error === 'not_connected') {
          setGscConnected(false);
        } else {
          setGscConnected(true);
          setGscData(data);
        }
      }
    } finally {
      setLoadingGsc(false);
    }
  }, []);

  const pingGoogle = useCallback(async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/seo/gsc/ping-all', { method: 'POST' });
      const data = await res.json();
      if (!data.error) {
        setPingResult({ ok: data.ok, total: data.total, quotaHit: data.quotaHit, needsReauth: data.needsReauth });
      }
    } finally {
      setPinging(false);
    }
  }, []);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);
  useEffect(() => { fetchGsc(); }, [fetchGsc]);

  // Derived: keywords that have impressions but no page in the site (missing product)
  const missingProductKeywords = gscData
    ? gscData.keywords.filter(k => {
        if (k.clicks > 0) return false; // already getting traffic, not missing
        if (k.impressions < 2) return false; // too little signal
        const slug = guessProductSlug(k.query, gscData.pages);
        return !slug; // no matching page found
      })
    : [];

  // Derived: keywords with low CTR despite good position
  const lowCtrKeywords = gscData
    ? gscData.keywords.filter(k => getCtrInsight(k) !== null)
    : [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'audit', label: 'Audit Produits', icon: <SearchCheck size={16} /> },
    { id: 'keywords', label: 'Mots-clés', icon: <TrendingUp size={16} /> },
    { id: 'pages', label: 'Pages', icon: <BarChart2 size={16} /> },
    {
      id: 'opportunities',
      label: 'Opportunités',
      icon: <Zap size={16} />,
      badge: (gscData ? (gscData.keywords.filter(k => k.striking).length + missingProductKeywords.length + lowCtrKeywords.length) : 0) || undefined,
    },
  ];

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SearchCheck size={24} /> SEO Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Analysez et améliorez votre référencement Google</p>
          </div>
          <div className="flex items-center gap-2">
            {gscConnected && (
              <button
                onClick={pingGoogle}
                disabled={pinging}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black font-medium hover:opacity-80 transition-opacity text-sm disabled:opacity-50"
              >
                {pinging ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {pinging ? 'Envoi en cours…' : 'Ping Google'}
              </button>
            )}
            <button
              onClick={() => { fetchAudit(); fetchGsc(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
            >
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>

        {/* Ping result banner */}
        {pingResult && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            pingResult.needsReauth
              ? 'bg-red-50 border border-red-200 text-red-700'
              : pingResult.quotaHit
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {pingResult.needsReauth ? (
              <><AlertCircle size={16} /> Permission manquante — <a href="/api/seo/gsc/auth" className="underline font-medium">Reconnectez Google Search Console</a> pour activer le ping d&apos;indexation.</>
            ) : pingResult.quotaHit ? (
              <><AlertTriangle size={16} /> Quota journalier Google atteint — {pingResult.ok} / {pingResult.total} URLs envoyées. Les autres seront soumises demain.</>
            ) : (
              <><CheckCircle2 size={16} /> {pingResult.ok} / {pingResult.total} URLs soumises à Google avec succès. L&apos;indexation peut prendre quelques heures.</>
            )}
          </div>
        )}

      {/* Connection notifications */}
      {connected === '1' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> Google Search Console connecté avec succès !
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Erreur de connexion GSC : {error}
        </div>
      )}

      {/* Summary cards */}
      {auditData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-xl p-4 flex flex-col items-center gap-1 bg-card">
            <ScoreRing score={auditData.totalScore} />
            <span className="text-xs text-muted-foreground mt-1">Score SEO global</span>
          </div>
          <div className="border rounded-xl p-4 flex flex-col justify-center gap-1">
            <span className="text-3xl font-bold text-red-500">{auditData.errorCount}</span>
            <span className="text-sm text-muted-foreground">Erreurs critiques</span>
          </div>
          <div className="border rounded-xl p-4 flex flex-col justify-center gap-1">
            <span className="text-3xl font-bold text-amber-500">{auditData.warningCount}</span>
            <span className="text-sm text-muted-foreground">Avertissements</span>
          </div>
          <div className="border rounded-xl p-4 flex flex-col justify-center gap-1">
            <span className="text-3xl font-bold text-blue-500">{auditData.audits.length}</span>
            <span className="text-sm text-muted-foreground">Produits analysés</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
            {t.badge ? (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Tab: Audit ─────────────────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div>
          {loadingAudit ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <RefreshCw size={20} className="animate-spin mr-2" /> Analyse en cours…
            </div>
          ) : auditData ? (
            <div className="flex flex-col gap-3">
              {auditData.audits.map(product => (
                <div key={product.id} className="border rounded-xl p-4 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium truncate">{product.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          product.score >= 80 ? 'bg-green-100 text-green-700' :
                          product.score >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.score}/100
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.issues.map((issue, i) => (
                          <span key={i} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                            issue.type === 'error' ? 'bg-red-50 text-red-700' :
                            issue.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                            <IssueIcon type={issue.type} />
                            {issue.message}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/products/${product.slug}/edit`}
                      className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-black rounded-lg hover:opacity-80 transition-opacity"
                    >
                      <Zap size={12} /> Corriger
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* ── Tab: Keywords ──────────────────────────────────────────────────── */}
      {tab === 'keywords' && (
        <div>
          {!gscConnected ? (
            <GscConnectPrompt />
          ) : loadingGsc ? (
            <GscLoading />
          ) : gscData ? (
            <div className="flex flex-col gap-6">
              {gscData.keywords.length === 0 && gscData.chart.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 border rounded-xl bg-amber-50 border-amber-200">
                  <TrendingUp size={32} className="text-amber-500" />
                  <div className="text-center">
                    <h3 className="font-semibold text-amber-800">Pas encore de données</h3>
                    <p className="text-sm text-amber-700 max-w-sm mt-1">
                      Google Search Console est bien connecté. Les données apparaîtront une fois que Google aura commencé à indexer votre site.
                    </p>
                  </div>
                </div>
              )}

              {/* Chart */}
              {gscData.chart.length > 0 && (
                <div className="border rounded-xl p-4 bg-card">
                  <h3 className="font-medium mb-4 text-sm">Clics & Impressions — 28 derniers jours</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={gscData.chart}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="impressions" stroke="#a855f7" fill="url(#colorImpressions)" name="Impressions" />
                      <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="url(#colorClicks)" name="Clics" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Keywords table */}
              {gscData.keywords.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Requête</th>
                        <th className="text-right px-4 py-3 font-medium">Clics</th>
                        <th className="text-right px-4 py-3 font-medium">Impressions</th>
                        <th className="text-right px-4 py-3 font-medium">CTR</th>
                        <th className="text-right px-4 py-3 font-medium">Position</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {gscData.keywords.map((k, i) => {
                        const productSlug = guessProductSlug(k.query, gscData.pages);
                        const ctrInsight = getCtrInsight(k);
                        return (
                          <tr key={k.query} className={`border-t ${i % 2 === 0 ? '' : 'bg-muted/30'} ${k.striking ? 'bg-amber-50' : ''}`}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {k.striking && <Zap size={12} className="text-amber-500 shrink-0" />}
                                {ctrInsight && <Tag size={12} className="text-blue-500 shrink-0" />}
                                <span className="font-medium">{k.query}</span>
                              </div>
                              {ctrInsight && (
                                <p className="text-xs text-blue-600 mt-0.5 ml-4">{ctrInsight}</p>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right text-blue-600 font-semibold">{k.clicks}</td>
                            <td className="px-4 py-2.5 text-right">{k.impressions}</td>
                            <td className="px-4 py-2.5 text-right">{k.ctr}%</td>
                            <td className={`px-4 py-2.5 text-right font-semibold ${
                              k.position <= 3 ? 'text-green-600' :
                              k.position <= 10 ? 'text-blue-600' :
                              k.position <= 20 ? 'text-amber-600' : 'text-muted-foreground'
                            }`}>
                              #{k.position}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {productSlug && (
                                <Link
                                  href={`/dashboard/products/${productSlug}/edit`}
                                  className="text-xs px-2 py-1 bg-primary text-black rounded hover:opacity-80 transition-opacity whitespace-nowrap"
                                >
                                  Éditer
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ── Tab: Pages ─────────────────────────────────────────────────────── */}
      {tab === 'pages' && (
        <div>
          {!gscConnected ? (
            <GscConnectPrompt />
          ) : loadingGsc ? (
            <GscLoading />
          ) : gscData ? (
            <div className="border rounded-xl overflow-hidden">
              {gscData.pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 bg-amber-50">
                  <BarChart2 size={32} className="text-amber-500" />
                  <div className="text-center">
                    <h3 className="font-semibold text-amber-800">Pas encore de données</h3>
                    <p className="text-sm text-amber-700 max-w-sm mt-1">
                      Les pages les plus vues apparaîtront ici une fois que Google aura indexé votre site.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Page</th>
                      <th className="text-right px-4 py-3 font-medium">Clics</th>
                      <th className="text-right px-4 py-3 font-medium">Impressions</th>
                      <th className="text-right px-4 py-3 font-medium">CTR</th>
                      <th className="text-right px-4 py-3 font-medium">Position</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gscData.pages.map((p, i) => {
                      const path = p.page.replace(/^https?:\/\/[^/]+/, '');
                      const isProduct = path.startsWith('/shop/') || path.startsWith('/product/');
                      const slug = path.startsWith('/shop/')
                        ? path.replace('/shop/', '')
                        : path.startsWith('/product/')
                        ? path.replace('/product/', '').replace(/\/$/, '')
                        : null;
                      const ctr = p.ctr;
                      const lowCtr = p.position <= 10 && ctr < 8;
                      return (
                        <tr key={p.page} className={`border-t ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                          <td className="px-4 py-2.5 max-w-xs">
                            <span className="truncate block text-xs text-muted-foreground">{path || '/'}</span>
                            {lowCtr && (
                              <span className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                <Tag size={10} /> CTR faible — améliorez le titre/meta de cette page
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-blue-600 font-semibold">{p.clicks}</td>
                          <td className="px-4 py-2.5 text-right">{p.impressions}</td>
                          <td className={`px-4 py-2.5 text-right font-semibold ${lowCtr ? 'text-blue-600' : ''}`}>{p.ctr}%</td>
                          <td className={`px-4 py-2.5 text-right font-semibold ${
                            p.position <= 3 ? 'text-green-600' :
                            p.position <= 10 ? 'text-blue-600' :
                            p.position <= 20 ? 'text-amber-600' : 'text-muted-foreground'
                          }`}>
                            #{p.position}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              {isProduct && slug && (
                                <Link
                                  href={`/dashboard/products/${slug}/edit`}
                                  className="text-xs px-2 py-1 bg-primary text-black rounded hover:opacity-80 transition-opacity"
                                >
                                  Éditer
                                </Link>
                              )}
                              <a
                                href={p.page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:text-blue-600 text-muted-foreground transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ── Tab: Opportunities ─────────────────────────────────────────────── */}
      {tab === 'opportunities' && (
        <div>
          {!gscConnected ? (
            <GscConnectPrompt />
          ) : loadingGsc ? (
            <GscLoading />
          ) : gscData ? (
            <div className="flex flex-col gap-6">

              {/* 1. Striking distance */}
              {gscData.keywords.filter(k => k.striking).length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="p-4 bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center gap-2 font-semibold text-amber-800">
                      <Zap size={16} /> Mots-clés à portée de la page 1 (positions 8–20)
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Améliorer le titre et la description des produits correspondants peut les faire passer en page 1.
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Requête</th>
                        <th className="text-right px-4 py-3 font-medium">Impressions</th>
                        <th className="text-right px-4 py-3 font-medium">Position</th>
                        <th className="text-left px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gscData.keywords.filter(k => k.striking).map((k, i) => {
                        const slug = guessProductSlug(k.query, gscData.pages);
                        return (
                          <tr key={k.query} className={`border-t ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                            <td className="px-4 py-3 font-medium">{k.query}</td>
                            <td className="px-4 py-3 text-right">{k.impressions}</td>
                            <td className="px-4 py-3 text-right font-semibold text-amber-600">#{k.position}</td>
                            <td className="px-4 py-3">
                              {slug ? (
                                <Link
                                  href={`/dashboard/products/${slug}/edit`}
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-primary text-black rounded-lg hover:opacity-80 transition-opacity"
                                >
                                  <Zap size={12} /> Optimiser le produit <ArrowRight size={12} />
                                </Link>
                              ) : (
                                <Link
                                  href="/dashboard/products/add-product"
                                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                                >
                                  <PackageSearch size={12} /> Ajouter ce produit
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 2. Low CTR despite good position */}
              {lowCtrKeywords.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center gap-2 font-semibold text-blue-800">
                      <Tag size={16} /> Titre / meta description à améliorer
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Ces pages sont bien positionnées mais peu cliquées — le titre ou la description n&apos;est pas assez attractif.
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Requête</th>
                        <th className="text-right px-4 py-3 font-medium">Position</th>
                        <th className="text-right px-4 py-3 font-medium">CTR</th>
                        <th className="text-left px-4 py-3 font-medium">Conseil</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowCtrKeywords.map((k, i) => {
                        const slug = guessProductSlug(k.query, gscData.pages);
                        const insight = getCtrInsight(k)!;
                        return (
                          <tr key={k.query} className={`border-t ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                            <td className="px-4 py-3 font-medium">{k.query}</td>
                            <td className="px-4 py-3 text-right font-semibold text-green-600">#{k.position}</td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-600">{k.ctr}%</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
                              <div className="flex items-start gap-1">
                                <FileText size={12} className="shrink-0 mt-0.5 text-blue-500" />
                                {insight}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {slug && (
                                <Link
                                  href={`/dashboard/products/${slug}/edit`}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary text-black rounded hover:opacity-80"
                                >
                                  Éditer
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. Missing products */}
              {missingProductKeywords.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <div className="p-4 bg-purple-50 border-b border-purple-200">
                    <div className="flex items-center gap-2 font-semibold text-purple-800">
                      <PackageSearch size={16} /> Produits manquants détectés
                    </div>
                    <p className="text-xs text-purple-700 mt-1">
                      Des gens cherchent ces produits sur Google mais vous n&apos;en avez pas (ou la page n&apos;est pas bien optimisée).
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Requête</th>
                        <th className="text-right px-4 py-3 font-medium">Impressions</th>
                        <th className="text-right px-4 py-3 font-medium">Position</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingProductKeywords.map((k, i) => (
                        <tr key={k.query} className={`border-t ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                          <td className="px-4 py-3 font-medium">{k.query}</td>
                          <td className="px-4 py-3 text-right">{k.impressions}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">#{k.position}</td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href="/dashboard/products/add-product"
                              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-purple-400 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <PackageSearch size={12} /> Ajouter ce produit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty state */}
              {gscData.keywords.filter(k => k.striking).length === 0 &&
               lowCtrKeywords.length === 0 &&
               missingProductKeywords.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 border rounded-xl bg-green-50 border-green-200">
                  <CheckCircle2 size={32} className="text-green-500" />
                  <div className="text-center">
                    <h3 className="font-semibold text-green-800">Aucune opportunité détectée</h3>
                    <p className="text-sm text-green-700 max-w-sm mt-1">
                      Vos mots-clés semblent bien optimisés. Revenez vérifier régulièrement.
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GscConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 border rounded-xl bg-card">
      <Globe size={40} className="text-muted-foreground" />
      <div className="text-center">
        <h3 className="font-semibold mb-1">Connectez Google Search Console</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Autorisez l&apos;accès pour voir vos mots-clés, impressions, clics et positions Google.
        </p>
      </div>
      <a
        href="/api/seo/gsc/auth"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-medium rounded-lg hover:opacity-80 transition-opacity"
      >
        <SearchCheck size={16} /> Connecter Google Search Console
      </a>
    </div>
  );
}

function GscLoading() {
  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground">
      <RefreshCw size={20} className="animate-spin mr-2" /> Chargement des données GSC…
    </div>
  );
}
