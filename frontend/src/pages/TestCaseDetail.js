// src/pages/TestCaseDetail.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './TestCaseDetail.css';

const TestCaseDetail = ({ reports }) => {
    const { featureIndex, testCaseIndex } = useParams();
    const featureIdx = parseInt(featureIndex, 10);
    const testCaseIdx = parseInt(testCaseIndex, 10);

    if (!reports || reports.length === 0) {
        return <div>No reports available</div>;
    }

    const report = reports[0]; // Assuming the report to be the first one in the array
    const feature = report.data[featureIdx];
    const testCase = feature.elements[testCaseIdx];

    if (!testCase) {
        return <div>Test case not found</div>;
    }

    return (
        <div className="testcase-detail">
            <h2>Test Case Detail</h2>
            <h3>{testCase.name}</h3>
            <div className="table-container">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Step</th>
                            <th>Status</th>
                            <th>Testing Reference Screenshot</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testCase.steps.map((step, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{step.name}</td>
                                <td style={{ color: step.result.status === 'passed' ? 'green' : 'red' }}>
                                    {step.result.status}
                                </td>
                                <td>
                                    {step.embeddings && step.embeddings.length > 0 ? (
                                        <a href={`data:image/${step.embeddings[0].mime_type};base64,${step.embeddings[0].data}`} target="_blank" rel="noopener noreferrer">
                                            View Screenshot
                                        </a>
                                    ) : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Link to="/" className="home-button">Home</Link>
        </div>
    );
};

export default TestCaseDetail;
