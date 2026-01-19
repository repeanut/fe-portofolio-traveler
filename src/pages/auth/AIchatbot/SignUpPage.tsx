import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Dummy auth: simpan status login
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        navigate('/ai-chatbot');
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
            <div className="relative overflow-hidden">
                <img
                    src="/bg-login-ai-chatbot.jpg"
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                <button
                    type="button"
                    onClick={handleBack}
                    className="absolute left-6 top-6 z-20 w-10 h-10 rounded-full bg-white/0 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>

                <div className="relative h-full flex items-center justify-center px-6 py-14">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.25)] px-10 py-10">
                        <h2 className="text-2xl font-semibold text-gray-900 text-center">Sign up for free</h2>
                        <p className="mt-2 text-sm text-gray-400 text-center">Please sign up in using featured!</p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300"
                                placeholder="Enter your email address"
                            />

                            <button
                                type="submit"
                                className="w-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-sm font-semibold text-white py-3 shadow-[0_14px_30px_rgba(56,189,248,0.35)] transition-colors"
                            >
                                Continue
                            </button>

                            <div className="flex items-center gap-3 pt-1">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs text-gray-400">OR</span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <button
                                type="button"
                                className="w-full rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 py-3 flex items-center justify-center gap-3 transition-colors"
                                onClick={() => {
                                    localStorage.setItem('isAuthenticated', 'true');
                                    localStorage.setItem('userEmail', email);
                                    navigate('/ai-chatbot');
                                }}
                            >
                                <span className="inline-flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.695 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.003 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.186 35.091 26.715 36 24 36c-5.202 0-9.665-3.317-11.277-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.781 2.195-2.195 4.069-4.085 5.565l.003-.002 6.191 5.238C36.973 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                                    </svg>
                                </span>
                                Continue with Google
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-gray-500">
                            Already have an account?
                            <button type="button" onClick={handleGoToLogin} className="ml-1 text-gray-800 underline">
                                Log in
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white hidden md:flex items-center justify-center px-10">
                <img
                    src="/illustration login.png"
                    alt="Illustration"
                    className="w-full max-w-sm object-contain"
                />
            </div>
        </div>
    );
};

export default SignUpPage;
