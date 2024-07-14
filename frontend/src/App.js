// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import ExecutionTable from './components/ExecutionTable';
import ExecutionDetail from './pages/ExecutionDetail';
import TestCaseDetail from './pages/TestCaseDetail';
import Login from './pages/Login';
import LogoutModal from './components/LogoutModal';
import ModelTrainingComponent from './components/ModelTrainingComponent';
import './App.css';

const App = () => {
  const [reports, setReports] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/reports')
      .then(response => response.json())
      .then(data => setReports(data))
      .catch(error => console.error('Error fetching reports:', error));
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setAuthenticated(false);
    setLoggedOut(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogin = () => {
    setAuthenticated(true);
    setLoggedOut(false);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Automation Execution Dashboard</h1>
          {authenticated && (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          )}
        </header>
        <main>
          {loggedOut ? (
            <div className="logout-message">
              <h2>You have been successfully logged out.</h2>
              <Link to="/login" className="back-to-login-link">Back to Login</Link>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Login setAuthenticated={handleLogin} />} />
              {authenticated ? (
                <>
                  <Route path="/" element={<ExecutionTable reports={reports} />} />
                  <Route path="/execution/:name" element={<ExecutionDetail reports={reports} />} />
                  <Route path="/testcase/:featureIndex/:testCaseIndex" element={<TestCaseDetail reports={reports} />} />
                  <Route path="/model-training" element={<ModelTrainingComponent />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
            </Routes>
          )}
        </main>
        <footer>
          <p>Footer content here</p>
        </footer>
        <LogoutModal
          show={showLogoutModal}
          handleClose={handleCloseLogoutModal}
          handleConfirm={handleConfirmLogout}
        />
      </div>
    </Router>
  );
};

export default App;
