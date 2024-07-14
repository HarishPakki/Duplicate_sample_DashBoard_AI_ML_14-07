import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const isExecutionDetailPage = location.pathname.startsWith('/execution');

    return (
        <header className="App-header execution-header">
            <h1>{isExecutionDetailPage ? 'Execution Detail' : 'Automation Execution Dashboard'}</h1>
        </header>
    );
};

export default Header;
