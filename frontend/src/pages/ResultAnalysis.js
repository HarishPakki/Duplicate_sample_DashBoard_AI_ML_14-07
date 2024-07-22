import React from 'react';
import { useLocation } from 'react-router-dom';
import { analyzeResults } from '../utils/frontendUtils';
import './ResultAnalysis.css'; // Ensure this CSS file exists for styling

const ResultAnalysis = () => {
    const location = useLocation();
    const { feedbackData } = location.state || {};

    if (!feedbackData || feedbackData.length === 0) {
        return <div>No feedback data available for analysis</div>;
    }

    const analysisResults = analyzeResults(feedbackData);

    return (
        <div className="result-analysis-container">
            <h2>Result Analysis</h2>
            {analysisResults.map((result, index) => (
                <div key={index} className="analysis-result">
                    <h3>Execution: {result.executionName}</h3>
                    <p>Total Test Cases: {result.totalTestCases}</p>
                    <p>Passed: {result.passed}</p>
                    <p>Failed: {result.failed}</p>
                    <p>Most Frequent Error: {result.commonError}</p>
                    <p>Most Frequent Error Step: {result.commonXPathFailure}</p>
                    {/* <p>Feedback: {result.feedback}</p> Comment out for now */}
                </div>
            ))}
        </div>
    );
};

export default ResultAnalysis;
