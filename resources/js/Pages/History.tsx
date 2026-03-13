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

export default function History({ history }: HistoryProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Watch History
                </h2>
            }
        >
            <Head title="Watch History" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <Link
                                key={item.id}
                                href={route('anime.watch', {
                                    id: item.anime_id,
                                    episodeId: item.episode_id,
                                })}
                                className="flex items-center gap-4 rounded-lg bg-white p-4 shadow transition hover:shadow-md"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                                    <span className="text-sm font-bold text-purple-600">
                                        EP {item.episode_number}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        Episode {item.episode_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Anime: {item.anime_id}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {item.completed ? (
                                        <span className="text-sm font-medium text-green-600">
                                            Completed
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            {formatTime(item.progress_seconds)}{' '}
                                            watched
                                        </span>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {new Date(
                                            item.watched_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">
                        No watch history yet. Start watching some anime!
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
