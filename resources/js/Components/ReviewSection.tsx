import { useToast } from '@/Components/ToastContext';
import { ReviewItem } from '@/types/anime';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewSectionProps {
    animeId: string;
    contentType: 'anime' | 'drama';
    reviews: ReviewItem[];
    userReview?: ReviewItem | null;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function ReviewSection({
    animeId,
    contentType,
    reviews,
    userReview,
}: ReviewSectionProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const toast = useToast();
    const [rating, setRating] = useState(userReview?.rating || 0);
    const [body, setBody] = useState(userReview?.body || '');
    const [submitting, setSubmitting] = useState(false);

    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        router.post(
            route('reviews.store'),
            {
                anime_id: animeId,
                content_type: contentType,
                rating,
                body: body.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(userReview ? 'Review updated' : 'Review submitted');
                    setSubmitting(false);
                },
                onError: () => {
                    toast.error('Failed to submit review');
                    setSubmitting(false);
                },
            },
        );
    };

    const handleDelete = (reviewId: number) => {
        router.delete(route('reviews.destroy', { review: reviewId }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Review deleted');
                setRating(0);
                setBody('');
            },
            onError: () => toast.error('Failed to delete review'),
        });
    };

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
                <h2 className="font-display text-lg font-bold text-primary">
                    Reviews
                </h2>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <StarRating value={Math.round(avgRating)} readonly size="sm" />
                        <span className="font-mono text-sm text-theme-secondary">
                            {avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-theme-muted">
                            ({reviews.length})
                        </span>
                    </div>
                )}
            </div>

            {/* Submit form — auth only */}
            {auth?.user && (
                <form
                    onSubmit={handleSubmit}
                    className="mb-6 rounded-xl border border-subtle bg-surface p-4"
                >
                    <div className="mb-3 flex items-center gap-3">
                        <span className="text-sm text-theme-secondary">Your rating:</span>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write a review (optional)..."
                        maxLength={1000}
                        rows={3}
                        className="w-full resize-none rounded-lg border-subtle bg-input p-3 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-theme-muted">
                            {body.length}/1000
                        </span>
                        <button
                            type="submit"
                            disabled={rating === 0 || submitting}
                            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-base transition hover:bg-secondary-hover disabled:opacity-50"
                        >
                            {submitting
                                ? 'Saving...'
                                : userReview
                                  ? 'Update Review'
                                  : 'Submit Review'}
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews list */}
            {reviews.length > 0 ? (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-xl border border-subtle bg-surface p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-base">
                                        {review.user?.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-primary">
                                            {review.user?.name || 'User'}
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <StarRating
                                                value={review.rating}
                                                readonly
                                                size="sm"
                                            />
                                            <span className="text-xs text-theme-muted">
                                                {timeAgo(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {auth?.user?.id === review.user_id && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-xs text-danger hover:text-danger/80"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            {review.body && (
                                <p className="mt-2 text-sm leading-relaxed text-theme-secondary">
                                    {review.body}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                !auth?.user && (
                    <p className="text-sm text-theme-secondary">
                        No reviews yet. Log in to be the first!
                    </p>
                )
            )}
        </div>
    );
}
