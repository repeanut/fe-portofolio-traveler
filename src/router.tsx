import { useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/guest/landingpage/landingpage";
import AIChatbotPage from "./pages/users/AIchatbot/AIchatbotPage";
import WorkPage from "./pages/work/workPage";
import ShopPage from "./pages/shop/shopPage";
import ShopDetailPage from './pages/shop/shopDetailPage';
import ShopPaymentPage from './pages/shop/shopPaymentPage';
import PaymentSuccessPage from './pages/shop/paymentSuccessPage';
import PaymentPendingPage from './pages/shop/paymentPendingPage';
import PaymentFailedPage from './pages/shop/paymentFailedPage';
import SuccessPayment from "./components/payments/SuccessPayment";
import UserProfilePage from "./pages/users/UserProfilePage";
import BlogPage from "./pages/blog/BlogPage";
import BlogDetailPage from "./pages/blog/BlogDetailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminChatPage from "./pages/admin/AdminChatPage";
import AdminHeroManagementPage from "./pages/admin/AdminHeroManagementPage";
import AdminTravelJournalPage from "./pages/admin/AdminTravelJournalPage";
import AdminAboutPage from "./pages/admin/AdminAboutPage";
import AdminPortfolioPage from "./pages/admin/AdminPortfolioPage";
import AdminCertServicesPage from "./pages/admin/AdminCertServicesPage";
import AdminExperiencePage from "./pages/admin/AdminExperiencePage";
import AdminFaqPage from "./pages/admin/AdminFaqPage";
import AdminUserListPage from "./pages/admin/userlist/AdminUserListPage";
import AdminBlogArticlesPage from "./pages/admin/blog-article/AdminBlogArticlesPage";
import AdminShopPage from "./pages/admin/shop/AdminShopPage";
import AdminTransactionsPage from "./pages/admin/transactions/AdminTransactionsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AiMotionLoadingPage from "./components/ui/AiMotionLoadingPage";
import AdminToastProvider from "./components/admin/AdminToastProvider";
import GoogleOAuthCallback from "./components/auth/GoogleOAuthCallback";
import AuthCallback from "./components/auth/AuthCallback";
import AuthError from "./components/auth/AuthError";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";

export const Router = () => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const loadingStartRef = useRef<number | null>(null);

    useEffect(() => {
        const fromPath = displayLocation.pathname;
        const toPath = location.pathname;
        const isTransition = fromPath !== toPath;
        const involvesAi = toPath.startsWith("/ai-chatbot");

        if (!isTransition || !involvesAi) return;

        if (loadingStartRef.current != null) {
            window.clearTimeout(loadingStartRef.current);
        }
        loadingStartRef.current = window.setTimeout(() => {
            setIsLoading(true);
            loadingStartRef.current = null;
        }, 0);
        if (timeoutRef.current != null) {
            window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            setDisplayLocation(location);
            setIsLoading(false);
            timeoutRef.current = null;
        }, 2000);
    }, [location, displayLocation.pathname]);

    useEffect(() => {
        return () => {
            if (loadingStartRef.current != null) {
                window.clearTimeout(loadingStartRef.current);
            }
            if (timeoutRef.current != null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const routesLocation = isLoading ? displayLocation : location;

    return (
        <AdminToastProvider>
            {isLoading ? (
                <AiMotionLoadingPage label="Preparing AI Workspace" />
            ) : (
                <Routes location={routesLocation}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/work/shop" element={<ShopPage />} />
                <Route path="/work/shop/:id" element={<ShopDetailPage />} />
                <Route path="/shop/payment" element={<ShopPaymentPage />} />
                <Route path="/shop/payment/payment-success" element={<PaymentSuccessPage />} />
                <Route path="/shop/payment/payment-pending" element={<PaymentPendingPage />} />
                <Route path="/shop/payment/payment-failed" element={<PaymentFailedPage />} />
                <Route path="/ai-chatbot" element={<AIChatbotPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogDetailPage />} />

                {/* Admin Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={
                    <AdminAuthGuard>
                        <AdminDashboardPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/chat" element={
                    <AdminAuthGuard>
                        <AdminChatPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/blog" element={
                    <AdminAuthGuard>
                        <AdminBlogArticlesPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/users" element={
                    <AdminAuthGuard>
                        <AdminUserListPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/shop" element={
                    <AdminAuthGuard>
                        <AdminShopPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/transactions" element={
                    <AdminAuthGuard>
                        <AdminTransactionsPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/hero" element={
                    <AdminAuthGuard>
                        <AdminHeroManagementPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/travel-journal" element={
                    <AdminAuthGuard>
                        <AdminTravelJournalPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/about" element={
                    <AdminAuthGuard>
                        <AdminAboutPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/portfolio" element={
                    <AdminAuthGuard>
                        <AdminPortfolioPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/cert-services" element={
                    <AdminAuthGuard>
                        <AdminCertServicesPage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/experience" element={
                    <AdminAuthGuard>
                        <AdminExperiencePage />
                    </AdminAuthGuard>
                } />
                <Route path="/admin/landing/faq" element={
                    <AdminAuthGuard>
                        <AdminFaqPage />
                    </AdminAuthGuard>
                } />
                <Route path="/auth/callback" element={<GoogleOAuthCallback />} />
                <Route path="/auth/success" element={<AuthCallback />} />
                <Route path="/auth/error" element={<AuthError />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                </Routes>
            )}
        </AdminToastProvider>
    );
};
