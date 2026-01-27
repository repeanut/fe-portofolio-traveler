import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/guest/landingpage/landingpage";
import AIChatbotPage from "./pages/users/AIchatbot/AIchatbotPage";
import WorkPage from "./pages/work/workPage";
import ShopPage from "./pages/shop/shopPage";
import ShopDetailPage from './pages/shop/shopDetailPage';
import ShopPaymentPage from './pages/shop/shopPaymentPage';
import SuccessPayment from "./components/payments/SuccessPayment";
import UserProfilePage from "./pages/users/UserProfilePage";
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

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/work/shop" element={<ShopPage />} />
            <Route path="/work/shop/:id" element={<ShopDetailPage />} />
            <Route path="/shop/payment" element={<ShopPaymentPage />} />
            <Route path="/shop/payment/payment-success" element={<SuccessPayment />} />
            <Route path="/ai-chatbot" element={<AIChatbotPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/admin/chat" element={<AdminChatPage />} />
            <Route path="/admin/blog" element={<AdminBlogArticlesPage />} />
            <Route path="/admin/users" element={<AdminUserListPage />} />
            <Route path="/admin/landing/hero" element={<AdminHeroManagementPage />} />
            <Route
              path="/admin/landing/travel-journal"
              element={<AdminTravelJournalPage />}
            />
            <Route path="/admin/landing/about" element={<AdminAboutPage />} />
            <Route path="/admin/landing/portfolio" element={<AdminPortfolioPage />} />
            <Route path="/admin/landing/cert-services" element={<AdminCertServicesPage />} />
            <Route path="/admin/landing/experience" element={<AdminExperiencePage />} />
            <Route path="/admin/landing/faq" element={<AdminFaqPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
    );
};
