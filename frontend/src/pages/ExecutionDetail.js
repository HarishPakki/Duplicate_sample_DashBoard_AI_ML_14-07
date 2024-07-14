// src/pages/ExecutionDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { predictNextValue } from '../utils/predictiveModel';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ExecutionDetail = ({ reports }) => {
  const { name } = useParams();
  const report = reports.find(r => r.name === name);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const getPrediction = async () => {
      // const nextValue = await predictNextValue(5); // Example input
      // setPrediction(nextValue);
    };

    getPrediction();
  }, []);

  if (!report || !report.data) {
    return <div>Report not found</div>;
  }

  const featureData = (report.data || []).map(feature => ({
    label: feature.name,
    total: feature.elements.length,
    passed: feature.elements.filter(e => e.steps.every(s => s.result.status === 'passed')).length,
    failed: feature.elements.filter(e => e.steps.some(s => s.result.status === 'failed')).length,
  }));

  const totalPassed = featureData.reduce((acc, fd) => acc + fd.passed, 0);
  const totalFailed = featureData.reduce((acc, fd) => acc + fd.failed, 0);

  const pieData = {
    labels: ['Passed', 'Failed'],
    datasets: [{
      data: [totalPassed, totalFailed],
      backgroundColor: ['#4CAF50', '#FF0000'],
      borderColor: '#000',
      borderWidth: 1
    }],
  };

  return (
    <div className="execution-detail">
      <h2>Execution Detail</h2>
      <h3>{name}</h3>
      <div className="summary-section">
        <div className="summary-left">
          <h3>Feature Files</h3>
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Total</th>
                  <th>Passed</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {featureData.map((feature, index) => (
                  <tr key={index}>
                    <td>{feature.label}</td>
                    <td>{feature.total}</td>
                    <td>{feature.passed}</td>
                    <td>{feature.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="summary-right">
          <h3>Test Cases Overview</h3>
          <div className="pie-chart-container">
            <Pie data={pieData} />
          </div>
        </div>
      </div>
      {prediction !== null && (
        <div className="prediction">
          <h3>Next Predicted Value: {prediction}</h3>
        </div>
      )}
      <div className="testcase-section">
        <h3>Test Cases</h3>
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {(report.data[0].elements || []).map((testCase, testCaseIndex) => (
                <tr key={`${testCaseIndex}`}>
                  <td>
                    <Link to={`/testcase/0/${testCaseIndex}`}>
                      {testCase.name}
                    </Link>
                  </td>
                  <td style={{ color: (testCase.steps || []).every(s => s.result?.status === 'passed') ? 'green' : (testCase.steps || []).some(s => s.result?.status === 'failed') ? 'red' : 'gray' }}>
                    {(testCase.steps || []).every(s => s.result?.status === 'passed') ? 'Passed' : (testCase.steps || []).some(s => s.result?.status === 'failed') ? 'Failed' : 'Skipped'}
                  </td>
                  <td>{testCase.start_timestamp || 'N/A'}</td>
                  <td>{testCase.end_timestamp || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Link to="/" className="home-button">Home</Link>
    </div>
  );
};

export default ExecutionDetail;
