import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, Search, X } from 'lucide-react';
import { Button } from './button';
import AdminNotificationDropdown from '../admin/AdminNotificationDropdown';

const DEFAULT_AVATAR_URL = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300';

const readStorageValue = (key: string) => {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(key);
    if (!v) return null;
    const trimmed = v.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
    return trimmed;
};

type NavbarShopProps = {
    onSignUpClick?: () => void;
};

const NavbarShop: React.FC<NavbarShopProps> = ({ onSignUpClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window === 'undefined') return;
            setIsAuthenticated(readStorageValue('isAuthenticated') === 'true');
            setUserEmail(readStorageValue('userEmail'));
            setUserAvatarUrl(readStorageValue('userAvatarUrl'));
        };

        checkAuth();

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'isAuthenticated' || event.key === 'userEmail' || event.key === 'userAvatarUrl') {
                checkAuth();
            }
        };

        const handleAuthChanged = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('auth:changed', handleAuthChanged);
        window.addEventListener('focus', checkAuth);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('auth:changed', handleAuthChanged);
            window.removeEventListener('focus', checkAuth);
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white relative">
            <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>

                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="w-full h-11 rounded-full bg-gray-100 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-500 outline-none ring-1 ring-transparent focus:ring-gray-200"
                    />
                </div>

                <div className="hidden items-center gap-7 text-sm text-gray-700 md:flex">
                    <Link to="/work" className="hover:text-gray-900 transition-colors">Home</Link>
                    <Link
                        to="/blog?from=shop"
                        className={`hover:text-gray-900 transition-colors ${location.pathname === '/blog' ? 'text-gray-900' : ''}`}
                    >
                        Blog
                    </Link>
                    {!isAuthenticated ? (
                        <Button
                            variant="link"
                            className="px-0 text-gray-700 hover:text-gray-900"
                            onClick={() => {
                                if (onSignUpClick) {
                                    onSignUpClick();
                                } else {
                                    navigate('/ai-chatbot');
                                }
                            }}
                        >
                            Sign Up
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <AdminNotificationDropdown
                                variant="user"
                                buttonClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
                            />
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-gray-200 hover:ring-gray-300 transition-colors"
                                aria-label="User profile"
                            >
                                {userAvatarUrl ? (
                                    <img
                                        src={userAvatarUrl}
                                        alt={userEmail ? `Avatar ${userEmail}` : 'User avatar'}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = DEFAULT_AVATAR_URL;
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-700 text-sm font-semibold">
                                        {(() => {
                                            const base = (userEmail || 'U').trim();
                                            return base.slice(0, 1).toUpperCase();
                                        })()}
                                    </div>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {isAuthenticated && (
                    <div className="md:hidden">
                        <AdminNotificationDropdown
                            variant="user"
                            buttonClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
                        />
                    </div>
                )}

                <button
                    type="button"
                    className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((v) => !v)}
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            <div
                className={
                    isMobileMenuOpen
                        ? 'md:hidden absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-lg rounded-b-2xl'
                        : 'hidden'
                }
            >
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        <Link
                            to="/work"
                            className="rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/blog?from=shop"
                            className={`rounded-lg px-3 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors ${location.pathname === '/blog' ? 'text-gray-900' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Blog
                        </Link>

                        {!isAuthenticated ? (
                            <button
                                type="button"
                                className="rounded-lg px-3 py-2 text-left hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (onSignUpClick) {
                                        onSignUpClick();
                                    } else {
                                        navigate('/ai-chatbot');
                                    }
                                }}
                            >
                                Sign Up
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="rounded-lg px-3 py-2 text-left hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    navigate('/profile');
                                }}
                            >
                                Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavbarShop;
