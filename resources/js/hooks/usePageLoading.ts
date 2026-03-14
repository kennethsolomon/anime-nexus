import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Tracks Inertia page navigation state.
 * Returns true while a page transition is in progress.
 */
export default function usePageLoading(): boolean {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startListener = router.on('start', () => setLoading(true));
        const finishListener = router.on('finish', () => setLoading(false));

        return () => {
            startListener();
            finishListener();
        };
    }, []);

    return loading;
}
