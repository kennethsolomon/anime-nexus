export default function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-subtle bg-surface shadow-md">
            {/* Image placeholder — matches aspect-[3/4] */}
            <div className="aspect-[3/4] animate-pulse bg-input" />
            {/* Text area */}
            <div className="p-2.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-input" />
                <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-input" />
            </div>
        </div>
    );
}
