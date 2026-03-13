import { Link } from '@inertiajs/react';

interface Episode {
    id: string;
    number: number;
    title?: string;
}

interface EpisodeListProps {
    animeId: string;
    episodes: Episode[];
    currentEpisodeId?: string;
    watchedEpisodes?: string[];
}

export default function EpisodeList({
    animeId,
    episodes,
    currentEpisodeId,
    watchedEpisodes = [],
}: EpisodeListProps) {
    return (
        <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-800">
            <div className="sticky top-0 border-b border-gray-700 bg-gray-800 px-4 py-2">
                <h3 className="text-sm font-semibold text-white">
                    Episodes ({episodes.length})
                </h3>
            </div>
            <div className="divide-y divide-gray-700">
                {episodes.map((episode) => {
                    const isActive = episode.id === currentEpisodeId;
                    const isWatched = watchedEpisodes.includes(episode.id);

                    return (
                        <Link
                            key={episode.id}
                            href={route('anime.watch', {
                                id: animeId,
                                episodeId: episode.id,
                            })}
                            className={`flex items-center gap-3 px-4 py-3 transition hover:bg-gray-700 ${
                                isActive
                                    ? 'bg-purple-900/30 border-l-2 border-purple-500'
                                    : ''
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold ${
                                    isActive
                                        ? 'bg-purple-600 text-white'
                                        : isWatched
                                          ? 'bg-green-600/20 text-green-400'
                                          : 'bg-gray-700 text-gray-300'
                                }`}
                            >
                                {episode.number}
                            </span>
                            <span
                                className={`truncate text-sm ${
                                    isActive
                                        ? 'font-semibold text-white'
                                        : 'text-gray-300'
                                }`}
                            >
                                {episode.title || `Episode ${episode.number}`}
                            </span>
                            {isWatched && !isActive && (
                                <span className="ml-auto text-xs text-green-500">
                                    Watched
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
