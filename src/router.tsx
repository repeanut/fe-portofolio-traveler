import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/guest/landingpage/landingpage";

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        </Routes>
    );
};
