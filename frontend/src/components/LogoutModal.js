// src/components/LogoutModal.js
import React from 'react';
import './LogoutModal.css';
import { useNavigate } from 'react-router-dom';

const LogoutModal = ({ show, handleClose, handleConfirm }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        handleConfirm();
        navigate('/logout');
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Are you sure you want to logout?</h2>
                <div className="modal-buttons">
                    <button onClick={handleLogout} className="confirm-button">Yes</button>
                    <button onClick={handleClose} className="cancel-button">No</button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
