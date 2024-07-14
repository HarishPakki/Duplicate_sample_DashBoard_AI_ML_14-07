// src/pages/LogoutConfirmation.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutConfirmation = ({ setAuthenticated }) => {
    const navigate = useNavigate();

    useEffect(() => {
        setAuthenticated(false); // Ensure the user is logged out
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2000); // Redirect to login page after 2 seconds

        return () => clearTimeout(timer);
    }, [navigate, setAuthenticated]);

    return (
        <div className="logout-confirmation">
            <h2>You have been successfully logged out.</h2>
        </div>
    );
};

export default LogoutConfirmation;
