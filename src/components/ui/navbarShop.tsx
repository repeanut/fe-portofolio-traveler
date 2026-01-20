import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from './button';

const NavbarShop: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="w-full bg-white">
            <nav className="mx-auto flex max-w-7xl items-center gap-4 py-4">
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
                    <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                    <Link
                        to="/work/shop"
                        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                        Shop
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Button
                        variant="link"
                        className="px-0 text-gray-700 hover:text-gray-900"
                        onClick={() => navigate('/sign-up')}
                    >
                        Sign Up
                    </Button>
                </div>
            </nav>
        </header>
    );
};

export default NavbarShop;
