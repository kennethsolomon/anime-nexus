import { useState } from 'react';

const GENRES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller',
];

const TYPES = ['All', 'TV', 'Movie', 'ONA', 'OVA', 'Special'];

interface SearchFiltersProps {
    /** Currently selected genre (from URL) */
    activeGenre?: string;
    /** Currently selected type filter */
    activeType?: string;
    /** Called when genre is clicked */
    onGenreSelect: (genre: string) => void;
    /** Called when type filter changes */
    onTypeSelect: (type: string) => void;
    /** Whether to show genre section */
    showGenres?: boolean;
}

export default function SearchFilters({
    activeGenre,
    activeType = 'All',
    onGenreSelect,
    onTypeSelect,
    showGenres = true,
}: SearchFiltersProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mb-6">
            {/* Mobile toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="mb-3 flex items-center gap-2 rounded-lg border border-muted bg-input px-3 py-2 text-sm text-primary transition hover:border-accent sm:hidden"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {(activeGenre || activeType !== 'All') && (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-base">
                        {[activeGenre, activeType !== 'All' ? activeType : null].filter(Boolean).length}
                    </span>
                )}
            </button>

            {/* Filter content — always visible on sm+, toggled on mobile */}
            <div className={`space-y-3 ${expanded ? 'block' : 'hidden'} sm:block`}>
                {/* Type filter */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="mr-1 self-center text-xs font-medium text-theme-secondary">Type:</span>
                    {TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => onTypeSelect(type)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                                activeType === type
                                    ? 'bg-accent text-base'
                                    : 'border border-muted bg-input text-theme-secondary hover:border-accent hover:text-primary'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Genre chips */}
                {showGenres && (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="mr-1 self-center text-xs font-medium text-theme-secondary">Genre:</span>
                        {GENRES.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => onGenreSelect(genre)}
                                className={`rounded-full px-3 py-1 text-xs transition ${
                                    activeGenre?.toLowerCase() === genre.toLowerCase()
                                        ? 'bg-accent text-base'
                                        : 'border border-muted text-theme-secondary hover:border-accent hover:text-primary'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                )}

                {/* Clear button */}
                {(activeGenre || activeType !== 'All') && (
                    <button
                        onClick={() => {
                            onTypeSelect('All');
                            onGenreSelect('');
                        }}
                        className="text-xs text-accent hover:text-accent-hover"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
