import { useToast } from '@/Components/ToastContext';
import { CommentItem } from '@/types/anime';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface CommentSectionProps {
    animeId: string;
    episodeId: string;
    contentType: 'anime' | 'drama';
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function CommentCard({
    comment,
    onDelete,
    onReply,
    currentUserId,
    depth = 0,
}: {
    comment: CommentItem;
    onDelete: (id: number) => void;
    onReply: (parentId: number) => void;
    currentUserId?: number;
    depth?: number;
}) {
    const initials = comment.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

    return (
        <div className={depth > 0 ? 'ml-8 border-l border-subtle pl-4' : ''}>
            <div className="flex gap-3 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">
                            {comment.user?.name || 'User'}
                        </span>
                        <span className="text-xs text-theme-muted">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-theme-secondary">
                        {comment.body}
                    </p>
                    <div className="mt-1 flex gap-3">
                        {depth === 0 && (
                            <button
                                onClick={() => onReply(comment.id)}
                                className="text-xs text-theme-muted hover:text-accent"
                            >
                                Reply
                            </button>
                        )}
                        {currentUserId === comment.user_id && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-theme-muted hover:text-danger"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {comment.replies?.map((reply) => (
                <CommentCard
                    key={reply.id}
                    comment={reply}
                    onDelete={onDelete}
                    onReply={onReply}
                    currentUserId={currentUserId}
                    depth={1}
                />
            ))}
        </div>
    );
}

export default function CommentSection({ animeId, episodeId, contentType }: CommentSectionProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const toast = useToast();
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [body, setBody] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch comments
    useEffect(() => {
        if (!auth?.user) return;
        fetch(route('comments.index', { anime_id: animeId, episode_id: episodeId }), {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json())
            .then(setComments)
            .catch(() => {});
    }, [animeId, episodeId, auth?.user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;

        setSubmitting(true);
        router.post(
            route('comments.store'),
            {
                anime_id: animeId,
                episode_id: episodeId,
                content_type: contentType,
                body: body.trim(),
                parent_id: replyTo,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Comment posted');
                    setBody('');
                    setReplyTo(null);
                    setSubmitting(false);
                    // Refresh comments
                    fetch(route('comments.index', { anime_id: animeId, episode_id: episodeId }), {
                        headers: { Accept: 'application/json' },
                    })
                        .then((res) => res.json())
                        .then(setComments)
                        .catch(() => {});
                },
                onError: () => {
                    toast.error('Failed to post comment');
                    setSubmitting(false);
                },
            },
        );
    };

    const handleDelete = (commentId: number) => {
        router.delete(route('comments.destroy', { comment: commentId }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Comment deleted');
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            },
            onError: () => toast.error('Failed to delete comment'),
        });
    };

    if (!auth?.user) return null;

    return (
        <div className="mt-6">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm font-medium text-theme-secondary hover:text-primary"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Comments ({comments.length})
                <svg
                    className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="mt-3">
                    {/* Comment form */}
                    <form onSubmit={handleSubmit} className="mb-4">
                        {replyTo && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-theme-secondary">
                                Replying to comment
                                <button
                                    type="button"
                                    onClick={() => setReplyTo(null)}
                                    className="text-danger hover:text-danger/80"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write a comment..."
                                maxLength={2000}
                                className="min-h-[44px] flex-1 rounded-lg border-subtle bg-input px-3 py-2 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                            <button
                                type="submit"
                                disabled={!body.trim() || submitting}
                                className="min-h-[44px] rounded-lg bg-secondary px-4 text-sm font-medium text-base transition hover:bg-secondary-hover disabled:opacity-50"
                            >
                                Post
                            </button>
                        </div>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-1">
                        {comments.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                onDelete={handleDelete}
                                onReply={(parentId) => setReplyTo(parentId)}
                                currentUserId={auth.user?.id}
                            />
                        ))}
                    </div>

                    {comments.length === 0 && (
                        <p className="text-sm text-theme-muted">No comments yet. Be the first!</p>
                    )}
                </div>
            )}
        </div>
    );
}
