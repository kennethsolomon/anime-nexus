import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { WatchHistoryItem } from '@/types/anime';
import { Head, Link } from '@inertiajs/react';

interface HistoryProps {
    history: WatchHistoryItem[];
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDisplayTitle(item: WatchHistoryItem): string {
    return (
        item.anime_title ||
        item.anime_id
            .replace(/-[a-z0-9]{3,5}$/, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function History({ history }: HistoryProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Watch History" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold text-primary">
                        Watch History
                    </h1>
                    {history.length > 0 && (
                        <span className="text-sm text-theme-secondary">
                            {history.length} {history.length === 1 ? 'entry' : 'entries'}
                        </span>
                    )}
                </div>

                {history.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => {
                            const displayTitle = formatDisplayTitle(item);
                            const progressPercent = Math.min(
                                (item.progress_seconds / 1440) * 100,
                                95,
                            );

                            return (
                                <Link
                                    key={item.id}
                                    href={route('anime.watch', {
                                        id: item.anime_id,
                                        episodeId: item.episode_id,
                                    })}
                                    className="group relative overflow-hidden rounded-xl border border-subtle bg-surface transition hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-input">
                                        {item.anime_image ? (
                                            <img
                                                src={item.anime_image}
                                                alt={displayTitle}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-input to-subtle">
                                                <svg
                                                    className="h-12 w-12 text-muted"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                                        {/* Play icon on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/90 shadow-lg">
                                                <svg
                                                    className="ml-0.5 h-5 w-5 text-base"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Episode badge */}
                                        <span className="absolute right-2 top-2 rounded-md bg-base/80 px-2 py-0.5 font-mono text-xs font-semibold text-accent backdrop-blur-sm">
                                            EP {item.episode_number}
                                        </span>
                                        {/* Status badge */}
                                        {item.completed && (
                                            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-success/90 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Done
                                            </span>
                                        )}
                                        {/* Progress bar at bottom of image */}
                                        {!item.completed && item.progress_seconds > 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-subtle/50">
                                                <div
                                                    className="h-full bg-accent"
                                                    style={{
                                                        width: `${progressPercent}%`,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="px-3 pb-3 pt-2">
                                        <p className="truncate text-sm font-semibold text-primary">
                                            {displayTitle}
                                        </p>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-xs text-theme-secondary">
                                                Episode {item.episode_number}
                                                {!item.completed && item.progress_seconds > 0 && (
                                                    <> · {formatTime(item.progress_seconds)}</>
                                                )}
                                            </span>
                                            <span className="text-xs text-theme-muted">
                                                {timeAgo(item.watched_at)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center rounded-xl border border-subtle bg-surface px-6 py-16 text-center">
                        <svg
                            className="mb-4 h-16 w-16 text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-lg font-medium text-primary">
                            No watch history yet
                        </p>
                        <p className="mt-1 text-sm text-theme-secondary">
                            Start watching anime and your progress will appear here.
                        </p>
                        <Link
                            href={route('home')}
                            className="mt-4 rounded-lg bg-secondary px-5 py-2 text-sm font-medium text-base hover:bg-secondary-hover"
                        >
                            Browse anime
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
