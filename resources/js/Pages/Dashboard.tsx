import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface MostWatched {
    anime_id: string;
    anime_title: string;
    anime_image: string | null;
    episode_count: number;
}

interface Stats {
    totalEpisodes: number;
    totalSeconds: number;
    completionRate: number;
    currentStreak: number;
    mostWatched: MostWatched[];
    animeCount: number;
    dramaCount: number;
}

interface DashboardProps {
    stats: Stats;
}

function StatCard({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
}) {
    return (
        <div className="rounded-xl border border-subtle bg-surface p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {icon}
                </div>
                <div>
                    <p className="font-mono text-2xl font-bold text-primary">{value}</p>
                    <p className="text-xs text-theme-secondary">{label}</p>
                </div>
            </div>
        </div>
    );
}

function formatHours(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function Dashboard({ stats }: DashboardProps) {
    const maxEpisodes = stats.mostWatched[0]?.episode_count || 1;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="mb-6 font-display text-2xl font-bold text-primary">
                    Dashboard
                </h1>

                {/* Stat cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard
                        icon={
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        value={stats.totalEpisodes}
                        label="Episodes Watched"
                    />
                    <StatCard
                        icon={
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        value={formatHours(stats.totalSeconds)}
                        label="Watch Time"
                    />
                    <StatCard
                        icon={
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        value={`${stats.completionRate}%`}
                        label="Completion Rate"
                    />
                    <StatCard
                        icon={
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                        }
                        value={`${stats.currentStreak}d`}
                        label="Current Streak"
                    />
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Content type split */}
                    <div className="rounded-xl border border-subtle bg-surface p-5">
                        <h2 className="mb-4 font-display text-sm font-bold text-primary">
                            Content Breakdown
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="text-theme-secondary">Anime</span>
                                    <span className="font-mono text-primary">{stats.animeCount}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-input">
                                    <div
                                        className="h-full rounded-full bg-accent transition-all"
                                        style={{
                                            width: `${
                                                stats.animeCount + stats.dramaCount > 0
                                                    ? (stats.animeCount / (stats.animeCount + stats.dramaCount)) * 100
                                                    : 0
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="text-theme-secondary">Drama</span>
                                    <span className="font-mono text-primary">{stats.dramaCount}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-input">
                                    <div
                                        className="h-full rounded-full bg-secondary transition-all"
                                        style={{
                                            width: `${
                                                stats.animeCount + stats.dramaCount > 0
                                                    ? (stats.dramaCount / (stats.animeCount + stats.dramaCount)) * 100
                                                    : 0
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Most watched */}
                    <div className="rounded-xl border border-subtle bg-surface p-5">
                        <h2 className="mb-4 font-display text-sm font-bold text-primary">
                            Most Watched
                        </h2>
                        {stats.mostWatched.length > 0 ? (
                            <div className="space-y-3">
                                {stats.mostWatched.map((item, i) => (
                                    <div key={item.anime_id} className="flex items-center gap-3">
                                        <span className="w-5 shrink-0 font-mono text-xs text-theme-muted">
                                            #{i + 1}
                                        </span>
                                        {item.anime_image && (
                                            <img
                                                src={item.anime_image}
                                                alt={item.anime_title}
                                                className="h-10 w-7 shrink-0 rounded object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-primary">
                                                {item.anime_title}
                                            </p>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-input">
                                                <div
                                                    className="h-full rounded-full bg-accent"
                                                    style={{
                                                        width: `${(item.episode_count / maxEpisodes) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="shrink-0 font-mono text-xs text-theme-secondary">
                                            {item.episode_count} ep
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-theme-secondary">
                                No watch history yet.{' '}
                                <Link href={route('home')} className="text-accent hover:text-accent-hover">
                                    Start watching
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
