import React from 'react';
import './ErrorAnalysisPopup.css';

const ErrorAnalysisPopup = ({ errors, onClose }) => {
    return (
        <div className="error-analysis-popup-overlay">
            <div className="error-analysis-popup">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Error Analysis</h2>
                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Step Name</th>
                                <th>Test Case(s)</th>
                                <th>Error Message</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errors.map((error, index) => (
                                <tr key={index}>
                                    <td>{error.stepName}</td>
                                    <td>{error.testCaseNames.join(', ')}</td>
                                    <td>{error.message}</td>
                                    <td>{error.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ErrorAnalysisPopup;
