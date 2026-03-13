import { Link } from '@inertiajs/react';

export default function ContentTypeSwitcher() {
    const isDrama = window.location.pathname.startsWith('/drama');

    return (
        <div className="flex items-center rounded-lg bg-input p-0.5">
            <Link
                href="/"
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                    !isDrama
                        ? 'bg-accent text-base'
                        : 'text-theme-secondary hover:text-primary'
                }`}
            >
                Anime
            </Link>
            <Link
                href={route('drama.home')}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                    isDrama
                        ? 'bg-accent text-base'
                        : 'text-theme-secondary hover:text-primary'
                }`}
            >
                Drama
            </Link>
        </div>
    );
}
