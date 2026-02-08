import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleOAuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const user = urlParams.get('user');
            const loginPage = urlParams.get('login_page');
            const error = urlParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                alert('Google OAuth failed. Please try again.');
                navigate('/');
                return;
            }

            if (token && user) {
                try {
                    const userData = JSON.parse(decodeURIComponent(user));
                    
                    // Store authentication data
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userEmail', userData.email);
                    localStorage.setItem('userName', userData.displayName || userData.username);
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('authProvider', 'google');
                    
                    // Store Google profile photo if available
                    if (userData.photoUrl || userData.picture) {
                        localStorage.setItem('userAvatarUrl', userData.photoUrl || userData.picture);
                    }
                    
                    // Dispatch auth change event
                    window.dispatchEvent(new Event('auth:changed'));
                    
                    // Success message removed - no more annoying popup
                    
                    // Redirect based on login_page parameter
                    if (loginPage === 'aichatbot') {
                        navigate('/ai-chatbot');
                    } else if (loginPage === 'shop') {
                        navigate('/shop');
                    } else if (loginPage === 'admin') {
                        navigate('/admin/users');
                    } else {
                        navigate('/ai-chatbot');
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    alert('Authentication failed. Please try again.');
                    navigate('/');
                }
            } else if (token) {
                // Handle case where only token is provided (parse from JWT)
                try {
                    const tokenParts = token.split('.');
                    if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        const userEmail = payload.email || 'user@gmail.com';
                        const userName = userEmail.split('@')[0];
                        
                        // Store authentication data
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userEmail', userEmail);
                        localStorage.setItem('userName', userName);
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('authProvider', 'google');
                        
                        // Dispatch auth change event
                        window.dispatchEvent(new Event('auth:changed'));
                        
                        // Redirect based on login_page parameter
                        if (loginPage === 'aichatbot') {
                            navigate('/ai-chatbot');
                        } else if (loginPage === 'shop') {
                            navigate('/shop');
                        } else if (loginPage === 'admin') {
                            navigate('/admin/users');
                        } else {
                            navigate('/ai-chatbot');
                        }
                    }
                } catch (error) {
                    console.error('Error parsing token:', error);
                    alert('Authentication failed. Please try again.');
                    navigate('/');
                }
            } else {
                console.error('Missing token or user data');
                navigate('/');
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                    {new URLSearchParams(window.location.search).get('action') === 'signup' 
                        ? '🚀 Creating your account with Google...' 
                        : '🔐 Signing you in with Google...'}
                </p>
            </div>
        </div>
    );
};

export default GoogleOAuthCallback;
