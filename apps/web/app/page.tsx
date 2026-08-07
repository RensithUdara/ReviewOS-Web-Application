'use client';

import type {
  AnalyticsOverview,
  BusinessSummary,
  Review,
} from '@review-maintain/shared';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  KeyRound,
  Layers3,
  MessageSquareReply,
  RefreshCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  Users,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ViewId = 'overview' | 'reviews' | 'ai' | 'businesses' | 'team' | 'settings';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const emptyOverview: AnalyticsOverview = {
  snapshot: null,
  trends: [],
  rules: [],
  topComplaints: [],
  suggestedImprovements: [],
};

const navItems: Array<{
  id: ViewId;
  label: string;
  description: string;
  icon: typeof BarChart3;
}> = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Performance',
    icon: BarChart3,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Inbox',
    icon: MessageSquareReply,
  },
  {
    id: 'ai',
    label: 'AI Studio',
    description: 'Replies',
    icon: WandSparkles,
  },
  {
    id: 'businesses',
    label: 'Businesses',
    description: 'Locations',
    icon: Building2,
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Roles',
    icon: Users,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Security',
    icon: Settings2,
  },
];

const statusStyles: Record<Review['status'], string> = {
  new: 'bg-cyan-100 text-cyan-700',
  queued: 'bg-amber-100 text-amber-700',
  drafted: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-teal-100 text-teal-700',
  posted: 'bg-slate-100 text-slate-700',
  flagged: 'bg-rose-100 text-rose-700',
};

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BarChart3;
  tone: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/70 bg-white p-5 shadow-[0_20px_60px_rgba(26,45,71,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${tone}`} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tone} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </section>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  onAction,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-cyan-600 shadow-[0_10px_30px_rgba(8,145,178,0.16)]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-normal text-slate-950">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
  onExport,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
  onExport?: () => void;
}) {
  return (
    <section className="rounded-lg border border-white/70 bg-white shadow-[0_20px_60px_rgba(26,45,71,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold tracking-normal text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <button
          onClick={onExport}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600"
          title="Export"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ReviewRow({
  review,
  onApprove,
  onRegenerate,
  onFlag,
}: {
  review: Review;
  onApprove: (review: Review) => void;
  onRegenerate: (review: Review) => void;
  onFlag: (review: Review) => void;
}) {
  return (
    <article className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_1.35fr_0.7fr]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-950">{review.authorName}</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[review.status]}`}>
            {review.status}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Stars rating={review.rating} />
          <span className="text-sm text-slate-500">{review.locationName}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{review.content}</p>
      </div>
      <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI reply draft
        </div>
        <p className="text-sm leading-6 text-slate-700">
          {review.aiReply ?? 'No AI reply has been generated for this review yet.'}
        </p>
      </div>
      <div className="flex flex-col justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {review.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {keyword}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(review)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600"
            title="Approve reply"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRegenerate(review)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600"
            title="Regenerate reply"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onFlag(review)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-rose-500 hover:text-rose-600"
            title="Flag as spam"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(options?: { silent?: boolean }) {
    try {
      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);
      const [businessResponse, reviewResponse, analyticsResponse] = await Promise.all([
        readJson<{ data: BusinessSummary[] }>('/api/businesses'),
        readJson<{ data: Review[] }>('/api/reviews'),
        readJson<AnalyticsOverview>('/api/analytics/overview'),
      ]);

      setBusinesses(businessResponse.data);
      setReviews(reviewResponse.data);
      setOverview(analyticsResponse);
      if (options?.silent) {
        setToast('Dashboard refreshed.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const activeBusiness = businesses[0];
  const activeNav = navItems.find((item) => item.id === activeView) ?? navItems[0];
  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return reviews;

    return reviews.filter((review) =>
      [
        review.authorName,
        review.content,
        review.businessName,
        review.locationName,
        review.status,
        review.sentiment,
        ...review.keywords,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, reviews]);

  const statCards = useMemo(
    () => [
      {
        label: 'Average rating',
        value: overview.snapshot ? overview.snapshot.averageRating.toFixed(1) : '-',
        detail: overview.snapshot ? 'Calculated from stored reviews' : 'No reviews synced',
        icon: Star,
        tone: 'bg-gradient-to-r from-amber-400 to-orange-500',
      },
      {
        label: 'Reviews synced',
        value: overview.snapshot ? overview.snapshot.reviewCount.toLocaleString() : '-',
        detail: activeBusiness ? `${activeBusiness.locations.length} locations connected` : 'No business connected',
        icon: RefreshCcw,
        tone: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      },
      {
        label: 'Response time',
        value: overview.snapshot ? `${overview.snapshot.responseTimeHours}h` : '-',
        detail: overview.snapshot ? 'Median first response' : 'No reply history',
        icon: Clock3,
        tone: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      },
      {
        label: 'AI handled',
        value: overview.snapshot ? `${overview.snapshot.aiHandledPercent}%` : '-',
        detail: overview.snapshot ? 'Drafts or auto replies' : 'No AI activity',
        icon: Bot,
        tone: 'bg-gradient-to-r from-fuchsia-500 to-rose-500',
      },
    ],
    [activeBusiness, overview.snapshot],
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function downloadJson(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filename}.`);
  }

  async function connectGoogle() {
    try {
      const response = await readJson<{ url: string }>('/api/auth/google/url');
      if (response.url.includes('client_id=&')) {
        setActiveView('settings');
        setError('Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.');
        return;
      }
      window.location.href = response.url;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not start Google OAuth.');
    }
  }

  async function syncReviews() {
    if (!activeBusiness) {
      setActiveView('businesses');
      notify('Connect a business before running review sync.');
      return;
    }

    try {
      setIsSyncing(true);
      const response = await fetch(`${apiUrl}/api/reviews/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeBusiness.id }),
      });
      const body = (await response.json()) as { queued?: boolean; message?: string };
      if (!response.ok || !body.queued) {
        throw new Error(body.message ?? `Sync failed: ${response.status}`);
      }
      notify(body.message ?? 'Review sync queued.');
      await loadDashboard({ silent: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not queue review sync.');
    } finally {
      setIsSyncing(false);
    }
  }

  async function generateReply(review: Review) {
    try {
      const response = await fetch(`${apiUrl}/api/reviews/${review.id}/replies/generate`, {
        method: 'POST',
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message ?? `Reply generation failed: ${response.status}`);
      }
      notify(body.message ?? 'AI reply generation queued.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not generate reply.');
    }
  }

  function approveReply(review: Review) {
    if (!review.aiReply) {
      notify('Generate an AI reply before approving this review.');
      return;
    }
    notify('Approval workflow is ready for database wiring.');
  }

  function flagReview() {
    notify('Spam flag workflow is ready for database wiring.');
  }

  function handleEmptyAction(action: string) {
    if (action.includes('Connect')) {
      void connectGoogle();
      return;
    }
    if (action === 'Run Sync') {
      void syncReviews();
      return;
    }
    if (action === 'Configure AI' || action === 'Create Rule') {
      setActiveView('ai');
      notify('AI configuration needs Gemini credentials and database services.');
      return;
    }
    if (action === 'Invite Member') {
      setActiveView('team');
      notify('Team invites need authentication and organization storage.');
      return;
    }
    if (action === 'Open Setup' || action === 'Review Security') {
      setActiveView('settings');
      notify('Setup checklist opened.');
      return;
    }
    if (action === 'Add Competitor') {
      notify('Competitor analysis needs a place ID form and Google data source.');
    }
  }

  function renderContent() {
    if (activeView === 'reviews') {
      return (
        <Panel
          title="Review Inbox"
          description="Approve, regenerate, flag, or post AI replies"
          icon={MessageSquareReply}
          onExport={() => downloadJson('reviews.json', filteredReviews)}
        >
          {filteredReviews.length > 0 ? (
            <div className="-mx-5 -my-5">
              {filteredReviews.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  onApprove={approveReply}
                  onRegenerate={generateReply}
                  onFlag={flagReview}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquareReply}
              title={isLoading ? 'Loading reviews' : query ? 'No matching reviews' : 'No reviews synced'}
              description={
                query
                  ? 'Try a different search term or clear the search box.'
                  : 'Connect Google Business Profile and run review sync to populate this inbox.'
              }
              action="Connect Google"
              onAction={() => handleEmptyAction('Connect Google')}
            />
          )}
        </Panel>
      );
    }

    if (activeView === 'ai') {
      return (
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="AI Reply Studio"
            description="Generate replies after reviews are synced"
            icon={WandSparkles}
            onExport={() => downloadJson('ai-workspace.json', { reviews: filteredReviews, rules: overview.rules })}
          >
            <EmptyState
              icon={Sparkles}
              title={isLoading ? 'Loading AI workspace' : 'No AI drafts'}
              description="Reply drafts, sentiment labels, keyword extraction, and spam analysis will appear here after real reviews are available."
              action="Configure AI"
              onAction={() => handleEmptyAction('Configure AI')}
            />
          </Panel>
          <Panel
            title="Automation Rules"
            description="Queue behavior before replies reach Google"
            icon={Layers3}
            onExport={() => downloadJson('automation-rules.json', overview.rules)}
          >
            {overview.rules.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {overview.rules.map((rule) => (
                  <div key={rule.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-slate-950">{rule.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{rule.condition}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {rule.enabled ? 'on' : 'off'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{rule.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Layers3}
                title={isLoading ? 'Loading rules' : 'No automation rules'}
                description="Create rules after businesses and review flows are connected."
                action="Create Rule"
                onAction={() => handleEmptyAction('Create Rule')}
              />
            )}
          </Panel>
        </div>
      );
    }

    if (activeView === 'businesses') {
      return (
        <Panel
          title="Businesses & Locations"
          description="Google Business Profile connections"
          icon={Building2}
          onExport={() => downloadJson('businesses.json', businesses)}
        >
          {businesses.length > 0 ? (
            <div className="grid gap-3">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">{business.displayName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{business.googleAccountName}</p>
                  <p className="mt-3 text-sm text-slate-700">{business.locations.length} locations connected</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Store}
              title={isLoading ? 'Loading businesses' : 'No business connected'}
              description="Connect a Google Business Profile account to pull accounts, locations, and reviews."
              action="Connect Business"
              onAction={() => handleEmptyAction('Connect Business')}
            />
          )}
        </Panel>
      );
    }

    if (activeView === 'team') {
      return (
        <Panel
          title="Team Access"
          description="Members, roles, and approval workflow ownership"
          icon={Users}
          onExport={() => downloadJson('team.json', { members: [] })}
        >
          <EmptyState
            icon={Users}
            title="No team members"
            description="Invite owners, managers, and reviewers after authentication and organizations are connected to the database."
            action="Invite Member"
            onAction={() => handleEmptyAction('Invite Member')}
          />
        </Panel>
      );
    }

    if (activeView === 'settings') {
      return (
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="Integration Health"
            description="OAuth, worker, database, and AI provider status"
            icon={KeyRound}
            onExport={() => downloadJson('integration-health.json', { businesses, reviews: reviews.length })}
          >
            <EmptyState
              icon={KeyRound}
              title="No integrations connected"
              description="Google OAuth, database sync, worker status, and AI provider checks will show here when configured."
              action="Open Setup"
              onAction={() => handleEmptyAction('Open Setup')}
            />
          </Panel>
          <Panel
            title="Security Controls"
            description="Encryption, audit logs, and roles"
            icon={ShieldAlert}
            onExport={() => downloadJson('security-controls.json', { configured: false })}
          >
            <EmptyState
              icon={ShieldAlert}
              title="Security setup pending"
              description="Token encryption, audit logging, rate limits, and role policies should be enabled before production."
              action="Review Security"
              onAction={() => handleEmptyAction('Review Security')}
            />
          </Panel>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <MetricTile key={card.label} {...card} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <Panel
            title="Review Trend"
            description="Rating, volume, and negative review movement"
            icon={Activity}
            onExport={() => downloadJson('analytics-overview.json', overview)}
          >
            {overview.trends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview.trends}>
                    <defs>
                      <linearGradient id="rating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="rating" stroke="#0891b2" fill="url(#rating)" strokeWidth={2} />
                    <Bar dataKey="negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title={isLoading ? 'Loading analytics' : 'No analytics yet'}
                description="Analytics will appear after reviews are synced from Google Business Profile."
                action="Run Sync"
                onAction={() => handleEmptyAction('Run Sync')}
              />
            )}
          </Panel>

          <Panel
            title="Spam Watch"
            description="AI moderation and report suggestions"
            icon={ShieldAlert}
            onExport={() => downloadJson('spam-watch.json', { reviews: filteredReviews })}
          >
            <EmptyState
              icon={ShieldAlert}
              title={isLoading ? 'Loading spam checks' : 'No spam checks'}
              description="Spam signals will appear after AI analysis runs on synced reviews."
            />
          </Panel>
        </section>

        <Panel
          title="Competitor Snapshot"
          description="AI summary from competitor reviews by topic"
          icon={BarChart3}
          onExport={() => downloadJson('competitor-snapshot.json', { competitors: [] })}
        >
          <EmptyState
            icon={BarChart3}
            title={isLoading ? 'Loading competitor data' : 'No competitor analysis'}
            description="Add competitor place IDs and run analysis before this chart is populated."
            action="Add Competitor"
            onAction={() => handleEmptyAction('Add Competitor')}
          />
        </Panel>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef9ff_35%,#fff7ed_70%,#fdf2f8_100%)] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/30 bg-slate-950 text-white shadow-[20px_0_80px_rgba(15,23,42,0.24)] lg:block">
        <div className="flex h-full flex-col p-4">
          <div className="rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 p-[1px]">
            <div className="rounded-lg bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950">
                  <MessageSquareReply className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Review Maintain</p>
                  <p className="text-xs text-slate-400">SaaS Console</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeView;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_14px_40px_rgba(255,255,255,0.14)]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-md ${
                    isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-white/10 text-slate-300 group-hover:text-white'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`block text-xs ${isActive ? 'text-slate-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {item.description}
                    </span>
                  </span>
                  {isActive && <ChevronRight className="h-4 w-4 text-cyan-600" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Production setup
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Connect OAuth, PostgreSQL, Redis, and AI provider before real review operations.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/70 bg-white/80 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Store className="h-4 w-4 text-cyan-600" />
                {activeBusiness?.displayName ?? 'No business connected'}
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
                {activeNav.label}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[220px] flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 w-full rounded-md border border-white bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Search reviews"
                />
              </label>
              <button
                onClick={() => {
                  setShowFilters((current) => !current);
                  setShowNotifications(false);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-white bg-white text-slate-700 shadow-sm transition hover:text-cyan-600 ${
                  showFilters ? 'text-cyan-600 ring-2 ring-cyan-500/20' : ''
                }`}
                title="Filters"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setShowNotifications((current) => !current);
                  setShowFilters(false);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-white bg-white text-slate-700 shadow-sm transition hover:text-cyan-600 ${
                  showNotifications ? 'text-cyan-600 ring-2 ring-cyan-500/20' : ''
                }`}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={() => void syncReviews()}
                disabled={isSyncing}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing' : 'Sync'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto px-5 pb-4 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeView;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    isActive ? 'bg-slate-950 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="space-y-5 px-5 py-6 lg:px-8">
          {toast && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
              {toast}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {(showFilters || showNotifications) && (
            <section className="grid gap-4 md:grid-cols-2">
              {showFilters && (
                <div className="rounded-lg border border-white/70 bg-white p-4 shadow-[0_20px_60px_rgba(26,45,71,0.08)]">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Filter className="h-4 w-4 text-cyan-600" />
                    Filters
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['All', 'New', 'Queued', 'Drafted', 'Flagged'].map((label) => (
                      <button
                        key={label}
                        onClick={() => notify(`${label} filter selected. Database filtering is ready to wire.`)}
                        className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showNotifications && (
                <div className="rounded-lg border border-white/70 bg-white p-4 shadow-[0_20px_60px_rgba(26,45,71,0.08)]">
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Bell className="h-4 w-4 text-cyan-600" />
                    Notifications
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    No notifications yet. Alerts will appear after review sync, AI jobs, and approval events are persisted.
                  </p>
                </div>
              )}
            </section>
          )}

          <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.7fr] lg:p-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  <Activity className="h-3.5 w-3.5" />
                  Live operations workspace
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-normal lg:text-4xl">
                  Manage Google reviews, AI replies, automation, and analytics from one console.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  This screen stays empty until real Google Business Profile and database data are connected.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-lg bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">Connected businesses</p>
                  <p className="mt-2 text-3xl font-semibold">{businesses.length || '-'}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 p-4 text-slate-950">
                  <p className="text-xs font-semibold uppercase opacity-70">Synced reviews</p>
                  <p className="mt-2 text-3xl font-semibold">{reviews.length || '-'}</p>
                </div>
              </div>
            </div>
          </section>

          {renderContent()}
        </div>
      </div>
    </main>
  );
}
