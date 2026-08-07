'use client';

import {
  mockAnalytics,
  mockReviews,
  mockRules,
  mockTrends,
  type Review,
} from '@review-maintain/shared';
import {
  AlertTriangle,
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
          {review.aiReply ?? 'Queued for Gemini reply generation.'}
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

export default function DashboardPage() {
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
                Ceylon Fresh Mart
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Average rating" value={mockAnalytics.averageRating.toFixed(1)} detail="+0.2 from last month" icon={Star} />
            <StatCard label="Reviews synced" value={mockAnalytics.reviewCount.toLocaleString()} detail="Across 3 locations" icon={RefreshCcw} />
            <StatCard label="Response time" value={`${mockAnalytics.responseTimeHours}h`} detail="Median first response" icon={Clock3} />
            <StatCard label="AI handled" value={`${mockAnalytics.aiHandledPercent}%`} detail="Drafts or auto replies" icon={Bot} />
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
              <div className="h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrends}>
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
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-panel">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-ink">Automation rules</h2>
                <p className="text-sm text-slate-500">Queue behavior before replies reach Google</p>
              </div>
              <div className="divide-y divide-slate-200">
                {mockRules.map((rule) => (
                  <div key={rule.id} className="p-4">
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
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-panel">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-ink">Review inbox</h2>
                <p className="text-sm text-slate-500">Approve, regenerate, flag, or post AI replies</p>
              </div>
              <div>
                {mockReviews.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-coral" />
                  <h2 className="font-semibold text-ink">Spam watch</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {['Repeated content', 'Competitor attack', 'Unrelated review'].map((label, index) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-medium text-ink">{[12, 7, 4][index]}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-coral" style={{ width: `${[74, 42, 25][index]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-leaf" />
                  <h2 className="font-semibold text-ink">Integration health</h2>
                </div>
                <div className="mt-5 grid gap-3 text-sm">
                  {[
                    ['Google Business Profile', 'Connected'],
                    ['BullMQ worker', 'Idle'],
                    ['Gemini reply service', 'Ready'],
                    ['PostgreSQL sync', 'Waiting for env'],
                  ].map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                      <span className="text-slate-600">{name}</span>
                      <span className="font-medium text-ink">{status}</span>
                    </div>
                  ))}
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { topic: 'Service', us: 88, competitor: 74 },
                  { topic: 'Parking', us: 52, competitor: 69 },
                  { topic: 'Price', us: 81, competitor: 77 },
                  { topic: 'Delivery', us: 66, competitor: 72 },
                ]}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="topic" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="us" fill="#2f7d66" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="competitor" fill="#4f83cc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
