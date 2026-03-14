interface LoadMoreButtonProps {
    loading: boolean;
    onClick: () => void;
    hasMore: boolean;
    shownCount?: number;
}

export default function LoadMoreButton({
    loading,
    onClick,
    hasMore,
    shownCount,
}: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <div className="mt-8 flex flex-col items-center gap-2">
            {shownCount !== undefined && (
                <p className="text-xs text-theme-secondary">
                    Showing {shownCount} results
                </p>
            )}
            <button
                onClick={onClick}
                disabled={loading}
                className="min-h-[48px] w-full rounded-lg border border-muted bg-input px-6 py-3 text-sm font-medium text-primary transition hover:border-accent hover:text-accent disabled:opacity-50 sm:w-auto"
            >
                {loading ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                    </span>
                ) : (
                    'Load More'
                )}
            </button>
        </div>
    );
}
