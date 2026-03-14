import { useToast } from '@/Components/ToastContext';

interface ShareButtonProps {
    title: string;
    url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
    const toast = useToast();

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = async () => {
        // Use native share API on mobile if available
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, url: shareUrl });
                return;
            } catch {
                // User cancelled or share failed — fall through to clipboard
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-muted bg-input px-3 py-2 text-theme-secondary transition hover:border-accent hover:text-accent"
            title="Share"
        >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
            </svg>
        </button>
    );
}
