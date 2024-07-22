import React from 'react';
import './ErrorPopup.css';

const ErrorPopup = ({ error, stepName, onClose }) => {
    return (
        <div className="error-popup-overlay">
            <div className="error-popup">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Error Details</h2>
                <h3>{stepName}</h3>
                <p className="error-intro">In the below failed step, we encountered the following error:</p>
                <div className="error-details">{formatErrorMessage(error)}</div>
            </div>
        </div>
    );
};

const formatErrorMessage = (message) => {
    return message.split('\n').map((line, index) => (
        <span key={index}>
            {line}
            <br />
        </span>
    ));
};

export default ErrorPopup;
