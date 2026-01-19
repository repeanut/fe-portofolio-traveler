import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import LandingPage from "./pages/guest/landingpage/landingpage";
import AIChatbotPage from "./pages/users/AIchatbot/AIchatbotPage";
import SignUpPage from "./pages/auth/AIchatbot/SignUpPage";
import LoginPage from "./pages/auth/AIchatbot/LoginPage";

const RequireAuth = ({ children }: { children: ReactElement }) => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/sign-up" replace />;
    }
    return children;
};

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/ai-chatbot"
                element={(
                    <RequireAuth>
                        <AIChatbotPage />
                    </RequireAuth>
                )}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
    );
};
