import React from 'react';
import { useLocation } from 'react-router-dom';
import './ResultAnalysis.css';

const ResultAnalysis = () => {
    const location = useLocation();
    const { feedbackData } = location.state || { feedbackData: [] };

    return (
        <div className="result-analysis-container">
            <h2>Result Analysis</h2>
            {feedbackData.length === 0 ? (
                <p>No data available for analysis.</p>
            ) : (
                <table className="result-analysis-table">
                    <thead>
                        <tr>
                            <th>Execution Name</th>
                            <th>Total Test Cases</th>
                            <th>Passed</th>
                            <th>Failed</th>
                            <th>Common Error</th>
                            <th>Common XPath Failure</th>
                            <th>Common Step Failure</th>
                            <th>Common Exception</th>
                            <th>Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbackData.map((execution, index) => (
                            <tr key={index}>
                                <td>{execution.executionName}</td>
                                <td>{execution.totalTestCases}</td>
                                <td>{execution.passed}</td>
                                <td>{execution.failed}</td>
                                <td>{execution.commonError}</td>
                                <td>{execution.commonXPathFailure}</td>
                                <td>{execution.commonStepFailure}</td>
                                <td>{execution.commonException}</td>
                                <td>{execution.feedback}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ResultAnalysis;
