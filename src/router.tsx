import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/guest/landingpage/landingpage";
import AIChatbotPage from "./pages/users/AIchatbot/AIchatbotPage";
import WorkPage from "./pages/work/workPage";
import ShopPage from "./pages/shop/shopPage";
import ShopDetailPage from './pages/shop/shopDetailPage';
import ShopPaymentPage from './pages/shop/shopPaymentPage';
import SuccessPayment from "./components/payments/SuccessPayment";

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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
    );
};
