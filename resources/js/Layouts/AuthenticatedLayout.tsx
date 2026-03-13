import ApplicationLogo from '@/Components/ApplicationLogo';
import ContentTypeSwitcher from '@/Components/ContentTypeSwitcher';
import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

export default function Authenticated({ children }: PropsWithChildren) {
    const user = usePage().props.auth.user;
    const [showingMobileMenu, setShowingMobileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const isDrama = window.location.pathname.startsWith('/drama');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const searchRoute = isDrama ? route('drama.search') : route('anime.search');
            router.get(searchRoute, { q: searchQuery });
        }
    };

    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-base">
            <nav className="sticky top-0 z-50 border-b border-subtle bg-surface">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="shrink-0">
                            <Link href="/">
                                <ApplicationLogo />
                            </Link>
                        </div>

                        {/* Content Type Switcher */}
                        <div className="hidden sm:block">
                            <ContentTypeSwitcher />
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden flex-1 sm:mx-8 sm:block sm:max-w-md"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder={isDrama ? "Search dramas..." : "Search anime..."}
                                    className="w-full rounded-full border-subtle bg-input py-2 pl-4 pr-10 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-primary"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </form>

                        {/* Right nav */}
                        <div className="hidden items-center gap-1 sm:flex">
                            <Link
                                href={route('watchlist.index')}
                                className={`rounded-lg p-2 transition ${
                                    route().current('watchlist.*')
                                        ? 'text-accent'
                                        : 'text-theme-secondary hover:text-primary'
                                }`}
                                title="Watchlist"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                    />
                                </svg>
                            </Link>
                            <Link
                                href={route('history.index')}
                                className={`rounded-lg p-2 transition ${
                                    route().current('history.*')
                                        ? 'text-accent'
                                        : 'text-theme-secondary hover:text-primary'
                                }`}
                                title="History"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </Link>

                            <div className="relative ml-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-base transition hover:bg-accent-hover"
                                        >
                                            {initials}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="border-b border-subtle px-4 py-2">
                                            <p className="text-sm font-medium text-primary">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-theme-secondary">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile hamburger */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingMobileMenu(!showingMobileMenu)
                                }
                                className="rounded-lg p-2 text-theme-secondary hover:text-primary"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingMobileMenu
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingMobileMenu
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={`${showingMobileMenu ? 'block' : 'hidden'} border-t border-subtle sm:hidden`}
                >
                    {/* Mobile search */}
                    <div className="px-4 py-3">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder={isDrama ? "Search dramas..." : "Search anime..."}
                                className="w-full rounded-full border-subtle bg-input py-2 pl-4 pr-4 text-sm text-primary placeholder-theme-muted focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                        </form>
                    </div>

                    <div className="px-4 py-2">
                        <ContentTypeSwitcher />
                    </div>

                    <div className="space-y-1 pb-3">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-theme-secondary hover:bg-input hover:text-primary"
                        >
                            Home
                        </Link>
                        <Link
                            href={route('watchlist.index')}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-theme-secondary hover:bg-input hover:text-primary"
                        >
                            Watchlist
                        </Link>
                        <Link
                            href={route('history.index')}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-theme-secondary hover:bg-input hover:text-primary"
                        >
                            History
                        </Link>
                    </div>

                    <div className="border-t border-subtle pb-3 pt-4">
                        <div className="px-4">
                            <div className="text-sm font-medium text-primary">
                                {user.name}
                            </div>
                            <div className="text-xs text-theme-secondary">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <Link
                                href={route('profile.edit')}
                                className="flex px-4 py-2 text-sm text-theme-secondary hover:bg-input hover:text-primary"
                            >
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full px-4 py-2 text-sm text-theme-secondary hover:bg-input hover:text-primary"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
