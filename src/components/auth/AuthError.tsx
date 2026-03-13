import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthError: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const message = urlParams.get('message') || 'Authentication failed';

        // Show error message
        alert(`❌ ${message}`);

        // Redirect to home after a short delay
        setTimeout(() => {
            navigate('/');
        }, 1000);
    }, [navigate, location.search]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="text-red-600 text-6xl mb-4">❌</div>
                <p className="text-gray-600">
                    Authentication failed. Redirecting...
                </p>
            </div>
        </div>
    );
};

export default AuthError;
