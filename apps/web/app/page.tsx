'use client';

import type {
  AnalyticsOverview,
  BusinessSummary,
  Review,
} from '@review-maintain/shared';
import {
  BarChart3,
  Bell,
  Bot,
  Check,
  Clock3,
  Download,
  Filter,
  KeyRound,
  MessageSquareReply,
  RefreshCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Star,
  Store,
  Users,
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const emptyOverview: AnalyticsOverview = {
  snapshot: null,
  trends: [],
  rules: [],
  topComplaints: [],
  suggestedImprovements: [],
};

const statusStyles: Record<Review['status'], string> = {
  new: 'bg-sky/10 text-sky',
  queued: 'bg-sun/15 text-[#86611d]',
  drafted: 'bg-leaf/10 text-leaf',
  approved: 'bg-leaf/10 text-leaf',
  posted: 'bg-ink/10 text-ink',
  flagged: 'bg-coral/10 text-coral',
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? 'fill-sun text-sun' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BarChart3;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-leaf" />
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-normal text-ink">{value}</div>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </section>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
      <Icon className="h-7 w-7 text-slate-400" />
      <h3 className="mt-3 font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <article className="grid gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 lg:grid-cols-[1.1fr_1.4fr_0.7fr]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-ink">{review.authorName}</h3>
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
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-leaf">
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
            <span key={keyword} className="rounded-full bg-mist px-2.5 py-1 text-xs text-slate-600">
              {keyword}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-leaf hover:text-leaf" title="Approve reply">
            <Check className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-leaf hover:text-leaf" title="Regenerate reply">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-coral hover:text-coral" title="Flag as spam">
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setError(null);
        const [businessResponse, reviewResponse, analyticsResponse] = await Promise.all([
          readJson<{ data: BusinessSummary[] }>('/api/businesses'),
          readJson<{ data: Review[] }>('/api/reviews'),
          readJson<AnalyticsOverview>('/api/analytics/overview'),
        ]);

        if (!ignore) {
          setBusinesses(businessResponse.data);
          setReviews(reviewResponse.data);
          setOverview(analyticsResponse);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard data.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const activeBusiness = businesses[0];
  const statCards = useMemo(
    () => [
      {
        label: 'Average rating',
        value: overview.snapshot ? overview.snapshot.averageRating.toFixed(1) : '-',
        detail: overview.snapshot ? 'Calculated from stored reviews' : 'No reviews synced',
        icon: Star,
      },
      {
        label: 'Reviews synced',
        value: overview.snapshot ? overview.snapshot.reviewCount.toLocaleString() : '-',
        detail: activeBusiness ? `${activeBusiness.locations.length} locations connected` : 'No business connected',
        icon: RefreshCcw,
      },
      {
        label: 'Response time',
        value: overview.snapshot ? `${overview.snapshot.responseTimeHours}h` : '-',
        detail: overview.snapshot ? 'Median first response' : 'No reply history',
        icon: Clock3,
      },
      {
        label: 'AI handled',
        value: overview.snapshot ? `${overview.snapshot.aiHandledPercent}%` : '-',
        detail: overview.snapshot ? 'Drafts or auto replies' : 'No AI activity',
        icon: Bot,
      },
    ],
    [activeBusiness, overview.snapshot],
  );

  return (
    <main className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-20 border-r border-slate-200 bg-white lg:flex lg:flex-col lg:items-center lg:py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
          <MessageSquareReply className="h-5 w-5" />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-3">
          {[BarChart3, MessageSquareReply, Bot, Store, Users, Settings2].map((Icon, index) => (
            <button
              key={index}
              className={`flex h-11 w-11 items-center justify-center rounded-md transition ${
                index === 0 ? 'bg-mist text-leaf' : 'text-slate-500 hover:bg-slate-100 hover:text-ink'
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-20">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/92 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Store className="h-4 w-4" />
                {activeBusiness?.displayName ?? 'No business connected'}
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink">
                Review Operations
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[220px] flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
                  placeholder="Search reviews"
                />
              </label>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:border-leaf hover:text-leaf" title="Filters">
                <Filter className="h-4 w-4" />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:border-leaf hover:text-leaf" title="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-semibold text-white hover:bg-[#276a57]">
                <RefreshCcw className="h-4 w-4" />
                Sync
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-5 py-6 lg:px-8">
          {error && (
            <div className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-ink">Review trend</h2>
                  <p className="text-sm text-slate-500">Rating, volume, and negative review movement</p>
                </div>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:text-leaf" title="Export report">
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                {overview.trends.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.trends}>
                        <defs>
                          <linearGradient id="rating" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2f7d66" stopOpacity={0.32} />
                            <stop offset="95%" stopColor="#2f7d66" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="rating" stroke="#2f7d66" fill="url(#rating)" strokeWidth={2} />
                        <Bar dataKey="negative" fill="#dc6b4d" radius={[4, 4, 0, 0]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title={isLoading ? 'Loading analytics' : 'No analytics yet'}
                    description="Analytics will appear after reviews are synced from Google Business Profile."
                  />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-panel">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-ink">Automation rules</h2>
                <p className="text-sm text-slate-500">Queue behavior before replies reach Google</p>
              </div>
              <div className="p-4">
                {overview.rules.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {overview.rules.map((rule) => (
                      <div key={rule.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-ink">{rule.name}</h3>
                            <p className="mt-1 text-sm text-slate-500">{rule.condition}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rule.enabled ? 'bg-leaf/10 text-leaf' : 'bg-slate-100 text-slate-500'}`}>
                            {rule.enabled ? 'on' : 'off'}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{rule.action}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Settings2}
                    title={isLoading ? 'Loading rules' : 'No automation rules'}
                    description="Create rules after businesses and review flows are connected."
                  />
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-panel">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-ink">Review inbox</h2>
                <p className="text-sm text-slate-500">Approve, regenerate, flag, or post AI replies</p>
              </div>
              {reviews.length > 0 ? (
                <div>
                  {reviews.map((review) => (
                    <ReviewRow key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    icon={MessageSquareReply}
                    title={isLoading ? 'Loading reviews' : 'No reviews synced'}
                    description="Connect Google Business Profile and run review sync to populate this inbox."
                  />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-coral" />
                  <h2 className="font-semibold text-ink">Spam watch</h2>
                </div>
                <div className="mt-5">
                  <EmptyState
                    icon={ShieldAlert}
                    title={isLoading ? 'Loading spam checks' : 'No spam checks'}
                    description="Spam signals will appear after AI analysis runs on synced reviews."
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-leaf" />
                  <h2 className="font-semibold text-ink">Integration health</h2>
                </div>
                <div className="mt-5">
                  <EmptyState
                    icon={KeyRound}
                    title={isLoading ? 'Checking connections' : 'No integrations connected'}
                    description="Google OAuth, database sync, worker status, and AI provider checks will show here when configured."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-ink">Competitor snapshot</h2>
                <p className="text-sm text-slate-500">AI summary from competitor reviews by topic</p>
              </div>
            </div>
            <EmptyState
              icon={BarChart3}
              title={isLoading ? 'Loading competitor data' : 'No competitor analysis'}
              description="Add competitor place IDs and run analysis before this chart is populated."
            />
          </section>
        </div>
      </div>
    </main>
  );
}
